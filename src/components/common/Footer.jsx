import { NavLink } from "react-router-dom";

// styles
import "@styles/common/Footer.css";

const TABS = [
  { key: "home", label: "홈", path: "/yeowun", icon: HomeIcon },
  { key: "exhibit", label: "전시정보", path: "/exhibition", icon: ListIcon },
  { key: "center", label: "", path: "/scan", icon: CenterIcon, isCenter: true },
  { key: "archive", label: "아카이브", path: "/archive", icon: ArchiveIcon },
  { key: "profile", label: "프로필", path: "/profile", icon: ProfileIcon },
];

const Footer = () => {
  return (
    <nav className="app-footer">
      {TABS.map(({ key, label, path, icon: Icon, isCenter }) =>
        isCenter ? (
          <NavLink key={key} to={path} className="footer-center-btn" aria-label="바로가기">
            <Icon />
          </NavLink>
        ) : (
          <NavLink
            key={key}
            to={path}
            end={path === "/"}
            className={({ isActive }) => `footer-tab${isActive ? " footer-tab--active" : ""}`}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ),
      )}
    </nav>
  );
};

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-9z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function ArchiveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 8v10a1 1 0 001 1h12a1 1 0 001-1V8M10 13h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 20c1.2-3.4 4-5 7-5s5.8 1.6 7 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function CenterIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default Footer;
