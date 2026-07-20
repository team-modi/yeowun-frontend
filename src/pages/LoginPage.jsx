// 로그인 페이지
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// api
import { login } from "@api/auth";

// util
import { startKakaoLogin, startNaverLogin, takeProvider, consumeState, isNaverConfigured } from "@utils/oauth";

// router
import { REDIRECT_AFTER_LOGIN_KEY } from "@router/RootRedirect";

// components
import Header from "@components/common/Header";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("idle");
  const exchangedRef = useRef(false);
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");

  useEffect(() => {
    if (!code || exchangedRef.current) return;
    exchangedRef.current = true;
    setStatus("loading");

    (async () => {
      // 콜백에서 어떤 소셜(kakao|naver)로 시작했는지는 sessionStorage 에 저장해 둔 값으로 구분한다.
      const provider = takeProvider();

      // 네이버는 state(CSRF) 검증 필수 — authorize 때 보낸 값과 콜백 state 가 일치해야 진행.
      let state;
      if (provider === "naver") {
        state = consumeState(returnedState);
        if (!state) {
          console.error("네이버 로그인 실패: state 불일치(CSRF)");
          setStatus("error");
          return;
        }
      }

      try {
        const response = await login(provider, code, state);
        if (response.data.meta.result === "SUCCESS") {
          // RequireAuth가 로그인으로 보내기 전 sessionStorage에 적어둔 원래 경로가 있으면 거기로, 없으면 /yeowun으로 이동
          const redirectTo = sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY);
          sessionStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);

          // 프로필이 아직 없는 신규 가입자는 환영 화면을 먼저 거친다.
          // 이름은 로그인 응답에만 있으므로 라우터 state로 넘긴다.
          const user = response.data.data?.user;
          if (user && !user.profileCompleted) {
            navigate("/welcome", { replace: true, state: { name: user.name ?? user.nickname } });
            return;
          }

          navigate(redirectTo || "/yeowun", { replace: true });
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error(`${provider} 로그인 실패:`, err);
        setStatus("error");
      }
    })();
  }, [code, returnedState, navigate]);

  if (status === "loading")
    return (
      <main className="login-page">
        <p>로그인 처리 중…</p>
      </main>
    );

  return (
    <div className="app-shell">
      <Header type="sub" title="여운" />
      <div className="app-content login-content">
        <div className="login-logo">Logo</div>
        <div className="text-title-3" style={{ textAlign: "center" }}>
          가입하고 나만의
          <br />
          여운을 남겨보세요
        </div>
        {status === "error" && <p role="alert">로그인에 실패했어요. 다시 시도해 주세요.</p>}
        <div className="login-buttons">
          <button type="button" className="login-button login-button--kakao" onClick={startKakaoLogin}>
            카카오로 로그인
          </button>
          {isNaverConfigured() && (
            <button type="button" className="login-button login-button--naver" onClick={startNaverLogin}>
              네이버로 로그인
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
