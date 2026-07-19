import { useNavigate } from "react-router-dom";

// styles
import "@styles/common/Header.css";

const Header = ({ type, title, onBack }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) return onBack();
    navigate(-1);
  };

  if (type === "sub") {
    return (
      <header className="app-header app-header--sub">
        <button type="button" className="header-icon-btn" onClick={handleBack} aria-label="뒤로가기">
          <ChevronLeftIcon />
        </button>
        <h1 className="header-title">{title}</h1>
      </header>
    );
  }

  if (type === "archive") {
    return (
      <header className="app-header app-header--archive">
        <h1 className="header-title-left text-heading-1">{title}</h1>
        <div className="header-right-slot">
          <div className="header-right-placeholder" />
        </div>
      </header>
    );
  }

  if (type === "profile") {
    return (
      <header className="app-header app-header--archive">
        <h1 className="header-title-left text-heading-1">{title}</h1>
        <div className="header-right-slot">
          <button
            type="button"
            className="header-icon-btn"
            onClick={() => navigate("/profile/settings")}
            aria-label="설정"
          >
            <GearIcon />
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="app-header app-header--main">
      <div className="header-logo">Logo</div>
      <button
        type="button"
        className="header-icon-btn"
        onClick={() => navigate("/notifications")}
        aria-label="알림"
      >
        <BellIcon />
      </button>
    </header>
  );
};

function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M19.4 13.5a1.7 1.7 0 000-3l1-1.7-1.7-1.7-1.7 1a1.7 1.7 0 01-2.6-1L14 5h-2.4l-.4 2a1.7 1.7 0 01-2.6 1l-1.7-1L5.2 8.7l1 1.7a1.7 1.7 0 010 3l-1 1.7 1.7 1.7 1.7-1a1.7 1.7 0 012.6 1l.4 2H14l.4-2a1.7 1.7 0 012.6-1l1.7 1 1.7-1.7-1-1.7z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 10a6 6 0 0112 0c0 3.4 1 5 1.8 6H4.2C5 15 6 13.4 6 10z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default Header;
