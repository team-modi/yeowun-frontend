// 온보딩 환영 페이지 — 소셜 로그인 직후 프로필이 아직 완성되지 않은 신규 가입자에게 보여준다.
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// api
import { getUserInfo } from "@api/user";

// styles
import "@styles/login/WelcomePage.css";

// images
import logo from "@images/Logo.svg";

export default function WelcomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  // 이름은 로그인 응답(TokenResponse.user.name)에만 있어 라우터 state로 넘겨받는다.
  // 새로고침 등으로 state가 날아가면 /users/me 의 nickname 으로 대체한다.
  const [name, setName] = useState(location.state?.name ?? "");

  useEffect(() => {
    if (name) return;
    let ignore = false;

    (async () => {
      try {
        const response = await getUserInfo();
        if (!ignore) setName(response.data.data.nickname ?? "");
      } catch (error) {
        console.log(error);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [name]);

  return (
    <div className="app-shell">
      <div className="app-content welcome-content">
        <img src={logo} alt="여운로고" />
        <p className="welcome-message text-title-3">
          반가워요{name && `, ${name}님`}
          <br />
          여운에 오신 것을 환영해요!
        </p>
      </div>

      <div className="welcome-footer">
        <button
          type="button"
          className="profile-edit-submit text-body-1-medium"
          onClick={() => navigate("/yeowun", { replace: true })}
        >
          여운 시작하기
        </button>
      </div>
    </div>
  );
}
