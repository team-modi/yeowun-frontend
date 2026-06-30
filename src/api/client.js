import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "@auth/session";

// 모든 호출은 상대경로 /api/* (로컬 vite 프록시 / 운영 Vercel rewrite가 백엔드로 same-origin 전달).
const BASE = "/api";

function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const token = getAccessToken();
  if (auth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: "include", // refresh HttpOnly 쿠키 송수신
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function toData(res) {
  // 백엔드 래퍼: { meta: {result, errorCode, message}, data }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      json?.meta?.message || `요청 실패 (${res.status})`;
    throw new Error(message);
  }
  return json?.data ?? null;
}

/**
 * API 호출. auth:true 인 요청이 401이면 1회 refresh 후 재시도한다.
 */
export async function apiFetch(path, opts = {}) {
  let res = await request(path, opts);

  if (res.status === 401 && opts.auth) {
    const refreshed = await request("/v1/auth/refresh", { method: "POST" });
    if (refreshed.ok) {
      const data = await toData(refreshed);
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
      }
      res = await request(path, opts);
    } else {
      clearAccessToken();
    }
  }

  return toData(res);
}
