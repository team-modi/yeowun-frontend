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
