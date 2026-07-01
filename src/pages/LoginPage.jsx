import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// api
import { login } from "@api/auth";

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
        await login("kakao", code);
        navigate("/yeowun");
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
    <main className="login-page">
      <h1>여운</h1>
      {status === "error" && <p role="alert">로그인에 실패했어요. 다시 시도해 주세요.</p>}
      <button type="button" className="btn-kakao" onClick={handleLogin}>
        로그인
      </button>
    </main>
  );
}
