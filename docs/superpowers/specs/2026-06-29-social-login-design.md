# 여운 소셜 로그인(FE 주도 OAuth) 설계

작성일: 2026-06-29
대상: `yeowun-frontend` (React 19 + Vite 8)
연동 백엔드: `modi/backend` (PR #13 — 카카오·구글 OAuth + 자체 JWT)

## 1. 목표

카카오·구글 소셜 로그인을 **로컬에서 실제 로그인까지 완주**하고, **Vercel 배포 환경에서도 동작하도록 설정을 맞춘다**. 백엔드는 이미 FE 주도 플로우로 구현·머지되어 있으므로, 프론트엔드 구현과 프록시/쿠키/포트 설정이 작업 범위다.

## 2. 백엔드 계약 (이미 구현됨, 변경하지 않음)

| 엔드포인트 | 메서드 | 요청 | 응답 |
|---|---|---|---|
| `/api/v1/auth/login/{provider}` | POST | body `{code, redirectUri}` | 본문 `{accessToken, user}` + `Set-Cookie: refresh_token`(HttpOnly) |
| `/api/v1/auth/refresh` | POST | refresh 쿠키 | 새 access + refresh 쿠키 회전 |
| `/api/v1/auth/me` | GET | `Authorization: Bearer {access}` | `{userId, provider, nickname, profileCompleted}` |
| `/api/v1/auth/link/{provider}` | POST | Bearer + `{code, redirectUri}` | 연동 결과 (이번 범위 아님) |

- `provider` = `kakao` | `google`
- **redirectUri 화이트리스트**(백엔드): 로컬 `http://localhost:3000/login`·`:3005/login`·`:8080/login` / 운영(prod 프로파일) `https://yeowun.vercel.app/login`
- **refresh 쿠키**: `Path=/; HttpOnly; SameSite=Lax`. 로컬 `Secure` off, 운영 `Secure` on
- **CORS**: 로컬 localhost:3000/3005/8080, 운영 yeowun.vercel.app, `allowCredentials=true`
- 배포 백엔드: `http://3.35.111.143:8080` (평문 HTTP·IP, TLS·도메인 없음)
- provider 공개값(yaml 기본값과 동일하게 FE에서 미러):
  - 카카오: client-id `bd5949f0127dd8ae068263f6ec1b5edc`, scope `account_email`, authorize `https://kauth.kakao.com/oauth/authorize`
  - 구글: client-id `238940430553-ikggojb7ssr0knf6u3ga8f00npsuv0s3.apps.googleusercontent.com`, scope `openid email profile`, authorize `https://accounts.google.com/o/oauth2/v2/auth`, 추가 파라미터 `access_type=offline&prompt=consent`

## 3. 핵심 제약과 그 근거

1. **모든 API 호출은 상대경로 `/api/...`로** 한다. 절대 `http://3.35.111.143:8080`을 브라우저에서 직접 부르지 않는다.
   - 근거: refresh 쿠키가 `HttpOnly + SameSite=Lax`라 브라우저가 **same-origin**으로 인식해야 저장·재전송된다. 로컬은 vite 프록시, 운영은 Vercel rewrite가 백엔드로 넘겨 same-origin을 성립시킨다. 백엔드도 이 전제로 설계됨(`RefreshCookie` 주석).
2. **`redirect_uri`는 `window.location.origin + "/login"`로 도출**한다.
   - 로컬 → `http://localhost:3000/login`, 운영 → `https://yeowun.vercel.app/login`. 둘 다 백엔드 화이트리스트·콘솔 등록값과 일치. provider authorize에 보내는 값과 백엔드로 보내는 값이 **정확히 동일**해야 한다.
3. **로컬 vite dev 포트는 3000 고정**. (기본 5173은 화이트리스트에 없음 → 콜백이 화이트리스트 밖으로 떨어짐)
4. **state(CSRF) 검증은 FE 책임**. 백엔드 FE-주도 `login`은 state를 검증하지 않으므로(주석 명시), FE가 state를 생성·저장·검증한다.

## 4. 결정된 설정 변경

### vite.config.js
- `server.port = 3000`, `strictPort: true`
- 프록시:
  ```js
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true }
      // rewrite(strip) 제거 — 백엔드 인증 API가 그 자체로 /api/v1/... 이므로
    }
  }
  ```
  - 주의: 현재 코드의 `rewrite: (p) => p.replace(/^\/api/, "")`는 **제거**한다. 이게 `/api/v1/auth/login` → `/v1/auth/login`(404)을 만드는 현재 버그다.

### vercel.json
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "http://3.35.111.143:8080/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
- `/api` strip 제거(백엔드 경로가 `/api/v1/...`). SPA 폴백으로 `/login` 직접 진입 대응. (순서 중요: `/api`가 먼저)

### App.jsx
- 기존 `/api/actuator/health` 핑은 strip 제거로 깨지므로 제거하고, **앱 로드 시 `/api/v1/auth/refresh`로 세션 복원**(쿠키 있으면 access 재발급 → 로그인 상태 유지)으로 대체한다.

## 5. 프론트엔드 구성 (신규 파일, 모두 작게·단일 책임)

- `src/auth/providers.js` — 카카오/구글 공개 client-id·authorize 엔드포인트·scope·추가 파라미터를 백엔드와 동일하게 정의.
- `src/auth/oauth.js` — `startLogin(provider)`: `crypto.randomUUID()`로 state 생성 → `sessionStorage`에 저장 → authorize URL 구성 후 `window.location.assign`. `redirectUri = window.location.origin + "/login"`.
- `src/api/client.js` — fetch 래퍼. base `/api`, `credentials: "include"`, 메모리 access 토큰을 `Authorization: Bearer`로 부착, 401 응답 시 1회 `/api/v1/auth/refresh` 후 재시도. 백엔드 `ApiResponse`(meta/data) 구조에서 `data` 추출.
- `src/auth/session.js` — 메모리 access 토큰 보관(모듈 변수 + getter/setter). 새로고침 시 휘발(설계 의도: refresh 쿠키로 복원).
- `src/auth/AuthContext.jsx` — `useAuth()`: `{user, accessToken, setSession, logout}` 제공.
- `src/pages/public/LoginPage.jsx` — `window.location`에 `code` 없으면 카카오·구글 버튼 렌더, 있으면:
  1. `state`를 sessionStorage 값과 비교(불일치 시 에러)
  2. `POST /api/v1/auth/login/{provider}`로 교환 (`provider`는 sessionStorage에 함께 저장)
  3. 성공 시 세션 설정 + URL에서 `code/state` 제거(`history.replaceState`)
  4. **StrictMode 이중 호출 가드**(useRef 또는 모듈 플래그)로 code 중복 사용 방지
- `src/App.jsx` — 로드 시 세션 복원, 로그인 시 `user`(닉네임/이메일/provider)와 로그아웃 버튼 표시. `여운` 텍스트 유지(기존 smoke 테스트 호환).

## 6. 사용자 플로우 (로컬)

```
localhost:3000  ──①클릭──▶ kakao/google authorize (redirect_uri=localhost:3000/login)
       ▲                                   │
       │④세션·/me                          │②콜백 code,state
       │                                   ▼
   FE LoginPage ──③POST /api/v1/auth/login/{provider} {code, redirectUri}──▶ vite proxy ──▶ localhost:8080
                                            ◀── {accessToken,user} + Set-Cookie(refresh) ──
```

## 7. 테스트 전략

- **실제 OAuth 완주(수동/인터랙티브)**: 브라우저로 `localhost:3000`에서 카카오·구글 각각 로그인 → access 발급, `/me` 200, `/refresh` 동작, 새로고침 후 세션 복원 확인. (Claude-in-Chrome으로 동반 진행 가능. 단 provider 로그인 화면 입력은 사용자 수행)
- **자동 E2E(Playwright)**: 실제 provider 로그인은 mock. ① 기존 smoke(`여운` + 로그인 버튼 렌더) 유지·보강. ② 콜백 시나리오: `/login?code=...&state=...` 진입 + sessionStorage state 세팅 + `**/api/v1/auth/login/**` 목킹 → 로그인 성공 UI 전이 단언.
- 기존 `tests/e2e/modi-smoke.spec.js`의 actuator health 목킹은 새 동작에 맞게 갱신.

## 8. 배포(Vercel) 검증 체크리스트 — 코드로 미리 막을 수 없는 외부 요인

1. **[리스크] Vercel rewrite가 외부 http 백엔드의 `Set-Cookie`를 브라우저로 전달하는지** 배포 후 1회 실증. (정상 동작이 기대값이나, 외부 http 업스트림 프록시라 환경 의존) 실패 시 정공법은 백엔드에 도메인+TLS 부여 후 `SameSite=None; Secure` 또는 동일 프록시 유지 — 별도 작업.
2. **카카오·구글 콘솔에 `https://yeowun.vercel.app/login` 등록** (로컬 `localhost:3000/login`과 별개 항목).
3. 백엔드 EC2가 `SPRING_PROFILES_ACTIVE=prod`로 떠 있어 redirectUri 화이트리스트·쿠키 Secure가 운영값인지 확인.
4. prod 브라우저에서 로그인 → refresh 쿠키 저장 확인(DevTools Application > Cookies, `yeowun.vercel.app`, HttpOnly·Secure) → 새로고침 세션 유지.

## 9. 비범위(YAGNI)

- react-router·상태관리 라이브러리 도입(라우터 없이 `window.location` 기반으로 충분).
- `/link/{provider}` 계정 연동 UI.
- 로그아웃 서버 호출(현재 백엔드에 logout 엔드포인트 없음 — 클라이언트 메모리 토큰 폐기로 처리).

## 10. 전제(사용자 확인 완료)

- 로컬 백엔드를 `localhost:8080`에서 default 프로파일로 구동 가능(DB·`KAKAO_CLIENT_SECRET`·`GOOGLE_CLIENT_SECRET` 환경변수 보유).
- 카카오·구글 콘솔에 로컬 redirect URI 등록 완료, client secret 보유.
