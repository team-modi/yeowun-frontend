import { useNavigate } from "react-router-dom";

// styles
import "@styles/common/Header.css";

// icons
import chevronLeftIcon from "@images/icons/Action/Chevron Left.svg";
import settingsIcon from "@images/icons/Action/Settings.svg";
import bellIcon from "@images/icons/Action/Bell.svg";

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
          <img src={chevronLeftIcon} alt="" width={20} height={20} />
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
            <img src={settingsIcon} alt="" width={20} height={20} />
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
        <img src={bellIcon} alt="" width={20} height={20} />
      </button>
    </header>
  );
};

export default Header;
