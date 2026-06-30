# 여운 소셜 로그인 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 카카오·구글 FE 주도 OAuth 로그인을 로컬에서 완주하고 Vercel 배포 설정을 맞춘다.

**Architecture:** 모든 API는 상대경로 `/api/*`로 호출 → 로컬 vite 프록시, 운영 Vercel rewrite가 백엔드(`/api/v1/auth/*`)로 same-origin 전달 → refresh HttpOnly 쿠키 정상. access 토큰은 메모리, redirect_uri는 `window.location.origin + "/login"`로 도출. 라우터 없이 `LoginPage`가 콜백 감지.

**Tech Stack:** React 19, Vite 8, Playwright (mock E2E).

## Global Constraints
- API 호출은 절대 `http://3.35.111.143:8080` 직접 X — 상대경로 `/api/...`만.
- 로컬 vite dev 포트 = **3000**.
- redirect_uri = `window.location.origin + "/login"` (로컬 `localhost:3000/login`, 운영 `yeowun.vercel.app/login`).
- 백엔드 응답 래퍼: `{ meta: {result, errorCode, message}, data }`. 에러 메시지는 `meta.message`.
- state(CSRF)는 FE가 생성·검증(sessionStorage).
- 커밋 금지(사용자 지시).

---

### Task 1: 설정 교정 (vite/vercel)
**Files:** Modify `vite.config.js`, `vercel.json`
- vite: `server.port=3000`, `strictPort:true`, 프록시 `/api`→`http://localhost:8080` **rewrite 제거**, alias `@auth` 추가.
- vercel: `/api/(.*)`→`http://3.35.111.143:8080/api/$1`, SPA 폴백 `/(.*)`→`/index.html`.
- [ ] 수정 후 `npm run dev`가 3000에서 뜨는지 확인.

### Task 2: providers / oauth (authorize URL + state)
**Files:** Create `src/auth/providers.js`, `src/auth/oauth.js`
- providers: kakao/google client-id·authorize·scope·extraParams + `redirectUri()`.
- oauth: `startLogin(provider)`(state 생성·저장·authorize 이동), `consumeState(returned)`(검증·provider 반환).

### Task 3: api client + auth API
**Files:** Create `src/api/client.js`, `src/api/auth.js`
- client: `apiFetch(path,{method,body,auth})` — `credentials:"include"`, Bearer 부착, 401시 1회 refresh 재시도, `data` 추출, 에러는 `meta.message`.
- auth: `exchangeCode`, `restoreSession`, `fetchMe`, `logout`.

### Task 4: session + AuthContext
**Files:** Create `src/auth/session.js`, `src/auth/AuthContext.jsx`
- session: 메모리 access 토큰 get/set/clear.
- AuthContext: 로드시 `restoreSession`(한 번만), `useAuth()` 제공.

### Task 5: LoginPage + App
**Files:** Modify `src/pages/public/LoginPage.jsx`, `src/App.jsx`
- LoginPage: code 없으면 버튼, 있으면 state 검증→교환(이중호출 가드, URL 정리). 로그인 시 user·로그아웃.
- App: `AuthProvider`로 감싸고 `여운` 유지, loading 표시.

### Task 6: E2E 테스트
**Files:** Modify `tests/e2e/modi-smoke.spec.js`, Create `tests/e2e/social-login.spec.js`
- smoke: refresh 401 mock, `여운` + 로그인 버튼 렌더.
- social-login: addInitScript로 sessionStorage state 세팅 + `/login?code&state` 진입 + login mock → "로그인됨" 단언.

### Task 7: 검증
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npx playwright test`

## 배포 검증(별도, 배포 후): Vercel Set-Cookie 전달 실증 / 콘솔 `yeowun.vercel.app/login` 등록 / EC2 prod 프로파일.
