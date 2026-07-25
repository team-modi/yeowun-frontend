import { useNavigate } from "react-router-dom";

// styles
import "@styles/common/Header.css";

// images
import chevronLeftIcon from "@images/icons/Action/Chevron Left.svg";
import settingsIcon from "@images/icons/Action/Settings.svg";
import bellIcon from "@images/icons/Action/Bell.svg";
import bookmarkDefaultIcon from "@images/icons/Action/Bookmark_Default.svg";

const Header = ({ type, title, onBack }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) return onBack();
    navigate(-1);
  };

  // 이전 페이지로 되돌아가기
  if (type === "back") {
    return (
      <header className="app-header app-header--sub">
        <button type="button" className="header-icon-btn" onClick={handleBack} aria-label="뒤로가기">
          <img src={chevronLeftIcon} alt="" width={20} height={20} />
        </button>
        <h1 className="header-title">{title}</h1>
      </header>
    );
  }

  // title + icon
  if (type === "notification" || type === "profile" || type === "bookmark") {
    return (
      <header className="app-header app-header--archive">
        <h1 className="header-title-left text-heading-1">{title}</h1>
        <div className="header-right-slot">
          {type === "notification" && (
            <button
              type="button"
              className="header-icon-btn"
              onClick={() => navigate("/notifications")}
              aria-label="알림"
            >
              <img src={bellIcon} alt="" width={20} height={20} />
            </button>
          )}
          {type === "profile" && (
            <button
              type="button"
              className="header-icon-btn"
              onClick={() => navigate("/profile/settings")}
              aria-label="설정"
            >
              <img src={settingsIcon} alt="" width={20} height={20} />
            </button>
          )}
          {type === "bookmark" && (
            <button
              type="button"
              className="header-icon-btn"
              onClick={() => navigate("/profile/bookmarked-exhibitions")}
              aria-label="북마크"
            >
              <img src={bookmarkDefaultIcon} alt="" width={20} height={20} />
            </button>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="app-header app-header--main">
      <div className="header-logo">Logo</div>
      <button type="button" className="header-icon-btn" onClick={() => navigate("/notifications")} aria-label="알림">
        <img src={bellIcon} alt="" width={20} height={20} />
      </button>
    </header>
  );
};

export default Header;
