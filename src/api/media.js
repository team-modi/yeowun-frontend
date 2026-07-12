// 미디어(사진/영상) 업로드 — 파일 바이트는 백엔드로 보내지 않고 Cloudflare R2에 직접 올린 뒤,
// 그 결과 URL만 백엔드(POST /records의 media[])로 전달하는 프리사인(presigned) URL 패턴.
// (yeowun-demo에서 이미 쓰고 있는 방식을 그대로 가져옴)

const PRESIGN_URL =
  import.meta.env.VITE_MEDIA_PRESIGN_URL || "https://yeowun-media-presign.yeowun-tjtfy.workers.dev/presign";

export const IMAGE_MAX_BYTES = 15 * 1024 * 1024; // 15MB
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024; // 50MB

export function mediaKind(contentType = "") {
  if (contentType.startsWith("image/")) return "PHOTO";
  if (contentType.startsWith("video/")) return "VIDEO";
  return null;
}

// 클라 단에서 먼저 걸러서 불필요한 presign 요청을 막는다.
export function validateMediaFile(file) {
  const kind = mediaKind(file.type);
  if (!kind) return "이미지 또는 영상 파일만 첨부할 수 있어요.";
  if (kind === "PHOTO" && file.size > IMAGE_MAX_BYTES) return "이미지는 15MB까지 첨부할 수 있어요.";
  if (kind === "VIDEO" && file.size > VIDEO_MAX_BYTES) return "영상은 50MB까지 첨부할 수 있어요.";
  return null;
}

// Worker에 "이런 파일 올릴게" 하고 물어보면 uploadUrl(1회용 서명 주소)·fileUrl(영구 주소)을 받는다.
export async function presignMedia({ contentType, size }) {
  const res = await fetch(PRESIGN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType, size }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || `프리사인 발급 실패(${res.status})`);
  return json; // { uploadUrl, fileUrl, key, type, contentType }
}

// 받은 서명 URL로 파일 바이트를 R2에 직접 올린다. (백엔드를 거치지 않음)
export async function uploadToR2(uploadUrl, file) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type }, // 서명에 포함된 타입과 반드시 동일해야 함
    body: file,
  });
  if (!res.ok) throw new Error(`R2 업로드 실패(${res.status})`);
}

// 위 과정을 하나로 묶은 공개 함수 — 기록/전시 등록 어디서든 이거 하나만 호출하면 됨.
export async function uploadMedia(file) {
  const invalid = validateMediaFile(file);
  if (invalid) throw new Error(invalid);

  const { uploadUrl, fileUrl, type } = await presignMedia({ contentType: file.type, size: file.size });
  await uploadToR2(uploadUrl, file);

  return { type: type || mediaKind(file.type), url: fileUrl, sizeBytes: file.size };
}
