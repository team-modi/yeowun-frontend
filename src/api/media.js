/**
 * 미디어 업로드 — Cloudflare Worker 프리사인 + R2 직접 PUT.
 *
 * 스프링 백엔드는 R2(Cloudflare 오브젝트 스토리지)를 전혀 모른다.
 * 대신 아래 3단계로 나눠서 파일을 저장하고, 백엔드에는 "영구 URL(fileUrl)" 문자열만 넘긴다.
 *
 *   1) presign : 브라우저 → Worker(/presign) 에 "이런 파일 올릴게" 하고 물어보면
 *                Worker 가 R2 로 바로 올릴 수 있는 1회용 서명 PUT URL(uploadUrl)과,
 *                업로드가 끝난 뒤 그 파일을 가리킬 영구 URL(fileUrl)을 함께 내려준다.
 *   2) PUT R2  : 브라우저가 그 uploadUrl 로 파일 바이트를 R2 에 직접 올린다.
 *                (백엔드를 거치지 않는다 → 큰 영상도 서버 부하 없이 바로 감)
 *   3) 저장     : 업로드가 200 이면 fileUrl 이 확정된다. 이 URL 만 백엔드 요청 body 에 담는다.
 *
 * 프리사인 엔드포인트는 공개값(비밀 아님)이라 하드코딩 기본값을 두고, 필요하면 env 로 덮어쓴다.
 */

const PRESIGN_URL =
  import.meta.env.VITE_MEDIA_PRESIGN_URL ||
  "https://yeowun-media-presign.yeowun-tjtfy.workers.dev/presign";

// 클라이언트 사이드 용량 제한(서버도 강제하지만 UX 를 위해 먼저 막는다).
export const IMAGE_MAX_BYTES = 15 * 1024 * 1024; // 15MB
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024; // 50MB

/** file.type 으로 미디어 종류 판별. 이미지/영상 외에는 null. */
export function mediaKind(contentType = "") {
  if (contentType.startsWith("image/")) return "PHOTO";
  if (contentType.startsWith("video/")) return "VIDEO";
  return null;
}

/** 업로드 전 클라 검증 — 통과하면 null, 아니면 사용자용 에러 메시지 반환. */
export function validateMediaFile(file) {
  const kind = mediaKind(file?.type || "");
  if (!kind) return "이미지 또는 영상 파일만 올릴 수 있어요.";
  const limit = kind === "VIDEO" ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES;
  if (file.size > limit) {
    const mb = Math.round(limit / (1024 * 1024));
    const label = kind === "VIDEO" ? "영상" : "사진";
    return `${label}은 ${mb}MB 이하만 올릴 수 있어요.`;
  }
  return null;
}

/**
 * 1단계 — Worker 에 프리사인 요청. 로그인 쿠키가 필요 없는 순수 fetch 다.
 * 200 → { uploadUrl, fileUrl, key, type, contentType }. 비 2xx 는 서버 메시지로 throw.
 */
export async function presignMedia({ contentType, size }) {
  const res = await fetch(PRESIGN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType, size }),
  });
  let json;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (!res.ok) {
    throw new Error(json?.message || `프리사인 발급 실패(${res.status})`);
  }
  return json;
}

/**
 * 2단계 — R2 서명 PUT URL 로 파일 바이트를 직접 업로드(로그인 쿠키 없이).
 * Content-Type 은 프리사인 때 서명에 포함되므로 반드시 file.type 과 동일하게 보낸다.
 */
export async function uploadToR2(uploadUrl, file) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("R2 업로드 실패(" + res.status + ")");
}

/**
 * 프리사인 → R2 PUT 을 한 번에 처리하고, 백엔드에 그대로 넘길 수 있는 미디어 정보를 반환한다.
 * 반환: { type: "PHOTO"|"VIDEO", url: 영구 fileUrl, sizeBytes }
 *
 * - 전시 등록: 여기서 받은 url 을 CustomCreateRequest.posterUrl 에 넣는다(이미지).
 * - 감상 기록: 여기서 받은 { type, url, sizeBytes } 배열을 RecordCreateRequest.media 에 넣는다(이미지·영상).
 */
export async function uploadMedia(file) {
  const invalid = validateMediaFile(file);
  if (invalid) throw new Error(invalid);
  const { uploadUrl, fileUrl, type } = await presignMedia({
    contentType: file.type,
    size: file.size,
  });
  await uploadToR2(uploadUrl, file);
  return { type: type || mediaKind(file.type), url: fileUrl, sizeBytes: file.size };
}
