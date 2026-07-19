import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import Footer from "@components/common/Footer";
import BottomSheet from "@components/common/BottomSheet";

// api
import { logout } from "@api/auth";
import { getNotificationSettings, updateNotificationSettings, withdrawUser } from "@api/user";

// router
import { REDIRECT_AFTER_LOGIN_KEY } from "@router/RootRedirect";

// styles
import "@styles/profile/settingsPage.css";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ remindEnabled: true, noticeEnabled: true });
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    (async () => {
      setIsLoading(true);
      try {
        const response = await getNotificationSettings();
        if (!ignore) setSettings(response.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const handleToggle = async (key) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next); // 낙관적 업데이트 — 실패하면 원복
    try {
      await updateNotificationSettings(next);
    } catch (error) {
      console.log(error);
      setSettings(settings);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log(error);
    } finally {
      sessionStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
      navigate("/login");
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdrawUser();
      sessionStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
      navigate("/login");
    } catch (error) {
      console.log(error);
      setIsWithdrawOpen(false);
    }
  };

  return (
    <div className="app-shell">
      <Header type="sub" title="설정" />
      <div className="app-content">
        <div className="app-content-pad settings-body">
          <section className="settings-section">
            <h2 className="settings-section-title text-heading-2">알림</h2>
            <div className="settings-row">
              <span className="text-body-1-regular">리마인드 알림</span>
              <ToggleSwitch
                checked={!!settings.remindEnabled}
                disabled={isLoading}
                onChange={() => handleToggle("remindEnabled")}
              />
            </div>
            <div className="settings-row">
              <span className="text-body-1-regular">공지 알림</span>
              <ToggleSwitch
                checked={!!settings.noticeEnabled}
                disabled={isLoading}
                onChange={() => handleToggle("noticeEnabled")}
              />
            </div>
          </section>

          <section className="settings-section">
            <h2 className="settings-section-title text-heading-2">고객지원</h2>
            {/* 문의하기/이용약관 연결 URL이 아직 API 명세에 없어 임시로 비활성 처리해둠 */}
            <button type="button" className="settings-row settings-row--link text-body-1-regular" disabled>
              문의하기
              <ChevronRightIcon />
            </button>
            <button type="button" className="settings-row settings-row--link text-body-1-regular" disabled>
              이용약관
              <ChevronRightIcon />
            </button>
          </section>

          <section className="settings-section">
            <button type="button" className="settings-plain-btn text-body-1-regular" onClick={handleLogout}>
              로그아웃
            </button>
            <button
              type="button"
              className="settings-plain-btn settings-plain-btn--danger text-body-1-regular"
              onClick={() => setIsWithdrawOpen(true)}
            >
              회원 탈퇴
            </button>
          </section>
        </div>
      </div>
      <Footer />

      <BottomSheet isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)}>
        <h2 className="settings-withdraw-title text-title-3">정말 탈퇴하시겠어요?</h2>
        <p className="settings-withdraw-desc text-body-2-regular">
          탈퇴하면 기록과 관심 전시 등 모든 데이터가 더 이상 보이지 않아요.
        </p>
        <button type="button" className="settings-withdraw-confirm text-body-1-medium" onClick={handleWithdraw}>
          탈퇴할게요
        </button>
        <button
          type="button"
          className="settings-withdraw-cancel text-body-1-medium"
          onClick={() => setIsWithdrawOpen(false)}
        >
          취소
        </button>
      </BottomSheet>
    </div>
  );
}

function ToggleSwitch({ checked, disabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`toggle-switch${checked ? " is-on" : ""}`}
      onClick={onChange}
    >
      <span className="toggle-switch-knob" />
    </button>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
