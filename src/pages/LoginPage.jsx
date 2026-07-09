import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// api
import { login } from "@api/auth";

// components
import Header from "@components/common/Header";

const KAKAO_AUTH_URL =
  "https://kauth.kakao.com/oauth/authorize" +
  `?client_id=${import.meta.env.VITE_KAKAO_CLIENT_ID}` +
  `&redirect_uri=${import.meta.env.VITE_KAKAO_REDIRECT_URI}` +
  "&response_type=code";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("idle");
  const exchangedRef = useRef(false);
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code || exchangedRef.current) return;
    exchangedRef.current = true;
    setStatus("loading");

    (async () => {
      try {
        const response = await login("kakao", code);
        if (response.data.meta.result === "SUCCESS") {
          navigate("/yeowun");
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("카카오 로그인 실패:", err);
        setStatus("error");
      }
    })();
  }, [code, navigate]);

  const handleLogin = () => {
    window.location.href = KAKAO_AUTH_URL;
  };

  if (status === "loading")
    return (
      <main className="login-page">
        <p>로그인 처리 중…</p>
      </main>
    );

  return (
    <div className="app-shell">
      <Header type="sub" />
      <div className="app-content login-content">
        <div className="login-logo">Logo</div>
        <div className="text-title-3" style={{ textAlign: "center" }}>
          가입하고 나만의
          <br />
          여운을 남겨보세요
        </div>
        {status === "error" && <p role="alert">로그인에 실패했어요. 다시 시도해 주세요.</p>}
        <button type="button" className="login-button" onClick={handleLogin}>
          카카오로 로그인
        </button>
      </div>
    </div>
  );
}
