import { apiFetch } from "@api/client";
import { setAccessToken, clearAccessToken } from "@auth/session";
import { redirectUri } from "@auth/providers";

/** 콜백 code를 자체 JWT로 교환. access는 메모리 저장, refresh는 쿠키로 자동 저장됨. */
export async function exchangeCode(provider, code) {
  const data = await apiFetch(`/v1/auth/login/${provider}`, {
    method: "POST",
    body: { code, redirectUri: redirectUri() },
  });
  setAccessToken(data.accessToken);
  return data.user;
}

/** 새로고침 후 세션 복원: refresh 쿠키로 access 재발급. 없으면 null. */
export async function restoreSession() {
  try {
    const data = await apiFetch(`/v1/auth/refresh`, { method: "POST" });
    setAccessToken(data.accessToken);
    return data.user;
  } catch {
    return null;
  }
}

/** 현재 로그인 사용자(Bearer). */
export function fetchMe() {
  return apiFetch(`/v1/auth/me`, { auth: true });
}

/** 로그아웃: 메모리 access 토큰 폐기(백엔드 logout 엔드포인트 없음). */
export function logout() {
  clearAccessToken();
}
