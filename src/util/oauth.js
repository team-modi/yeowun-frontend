/**
 * 소셜 로그인(카카오·네이버) 시작 헬퍼.
 *
 * 흐름: startKakaoLogin()/startNaverLogin() 이 각 소셜 authorize 로 리다이렉트 →
 *   소셜이 redirect_uri(= 현재 오리진 + /login)로 인가 code 를 되돌려줌 →
 *   LoginPage 가 code 를 읽어 백엔드에 로그인 요청(auth.login(provider, code, state)) → 쿠키(access/refresh) 세팅.
 *
 * redirect_uri 는 카카오·네이버 모두 동일하게 "현재 오리진 + /login" 으로 통일한다.
 *   로컬  : http://localhost:3000/login
 *   배포  : https://yeowun.vercel.app/login
 * ⚠️ 이 값은 각 소셜 콘솔의 [리다이렉트/Callback URL] 및 백엔드 app.oauth.allowed-redirect-uris
 *    화이트리스트와 정확히 일치해야 한다(두 오리진 모두 양쪽에 등록되어 있어야 함).
 */

// 카카오 REST API 키 — authorize URL 에 그대로 노출되는 공개성 값이라 기본값을 코드에 둔다.
// 테스트앱 "여운-TEST"(앱ID 1500036). 운영 앱으로 교체 시 env(VITE_KAKAO_CLIENT_ID)로 오버라이드.
const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID || "bba3e1d954ec548062bc3c13fd9f72bc";

// 네이버 OAuth 클라이언트 ID — authorize URL 에 그대로 노출되는 공개성 값이라 기본값을 코드에 둔다(카카오와 동일).
// 백엔드 app.oauth.naver.client-id 와 동일해야 한다. 운영 앱 교체 시 env(VITE_NAVER_CLIENT_ID)로 오버라이드.
const NAVER_CLIENT_ID = "x5SSFHxy06Npeieb9JlA";

const PROVIDER_KEY = "yeowun.oauth.provider";
const STATE_KEY = "yeowun.oauth.state";

/**
 * 백엔드/소셜 콘솔에 등록된 값과 일치해야 하는 redirect_uri. 카카오·네이버 모두 현재 오리진 + /login 으로 통일한다.
 * (콜백에서 어떤 provider 인지는 sessionStorage 에 저장한 값으로 구분한다.)
 */
export const oauthRedirectUri = () =>
  import.meta.env.VITE_OAUTH_REDIRECT_URI ||
  import.meta.env.VITE_KAKAO_REDIRECT_URI ||
  `${window.location.origin}/login`;

/** 콜백에서 읽을 로그인 provider 를 저장/조회한다(kakao | naver). */
export const rememberProvider = (provider) => {
  try {
    sessionStorage.setItem(PROVIDER_KEY, provider);
  } catch {
    // sessionStorage 불가 환경은 무시(콜백에서 기본 kakao 로 폴백)
  }
};

/** 저장해 둔 provider 를 꺼내고 지운다. 없으면 하위호환으로 "kakao". */
export const takeProvider = () => {
  try {
    const p = sessionStorage.getItem(PROVIDER_KEY);
    sessionStorage.removeItem(PROVIDER_KEY);
    return p || "kakao";
  } catch {
    return "kakao";
  }
};

/** CSRF 방지용 state 생성(네이버 authorize 필수). */
const generateState = () => {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

const rememberState = (state) => {
  try {
    sessionStorage.setItem(STATE_KEY, state);
  } catch {
    // 무시
  }
};

/**
 * 콜백으로 돌아온 state 가 authorize 때 보낸 값과 같은지 검증하고 저장값을 소비한다(CSRF).
 * 일치하면 검증된 state 문자열을, 아니면 null 을 반환한다.
 */
export const consumeState = (returnedState) => {
  try {
    const saved = sessionStorage.getItem(STATE_KEY);
    sessionStorage.removeItem(STATE_KEY);
    return saved && returnedState && saved === returnedState ? returnedState : null;
  } catch {
    return null;
  }
};

/** 카카오 인가 페이지로 이동한다. 성공 시 redirect_uri 로 ?code= 를 달고 돌아온다. */
export const startKakaoLogin = () => {
  rememberProvider("kakao");
  const params = new URLSearchParams({
    client_id: KAKAO_CLIENT_ID,
    redirect_uri: oauthRedirectUri(),
    response_type: "code",
  });
  window.location.href = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
};

/**
 * 네이버 인가 페이지로 이동한다. state(CSRF)를 생성해 저장하고 authorize 에 실어 보낸다.
 * 성공 시 redirect_uri 로 ?code=&state= 를 달고 돌아온다.
 */
export const startNaverLogin = () => {
  rememberProvider("naver");
  const state = generateState();
  rememberState(state);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: NAVER_CLIENT_ID,
    redirect_uri: oauthRedirectUri(),
    state,
  });
  window.location.href = `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
};

/** 네이버 로그인 사용 가능 여부(클라이언트 ID 설정 시에만 버튼 활성). */
export const isNaverConfigured = () => !!NAVER_CLIENT_ID;
