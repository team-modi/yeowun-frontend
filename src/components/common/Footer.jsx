import { NavLink } from "react-router-dom";

// styles
import "@styles/common/Footer.css";

// icons
import homeDefaultIcon from "@images/icons/Navigation/Home_Default.svg";
import homeSelectedIcon from "@images/icons/Navigation/Home_Selected.svg";
import exhibitionInfoDefaultIcon from "@images/icons/Navigation/Exhibition Info_Default.svg";
import exhibitionInfoSelectedIcon from "@images/icons/Navigation/Exhibition Info_Selected.svg";
import archiveDefaultIcon from "@images/icons/Navigation/Archive_Default.svg";
import archiveSelectedIcon from "@images/icons/Navigation/Archive_Selected.svg";
import profileDefaultIcon from "@images/icons/Navigation/Profile_Default.svg";
import profileSelectedIcon from "@images/icons/Navigation/Profile_Selected.svg";
import writeIcon from "@images/icons/Action/Write.svg";

const TABS = [
  { key: "home", label: "홈", path: "/yeowun", defaultIcon: homeDefaultIcon, selectedIcon: homeSelectedIcon },
  {
    key: "exhibit",
    label: "전시탐색",
    path: "/exhibition",
    defaultIcon: exhibitionInfoDefaultIcon,
    selectedIcon: exhibitionInfoSelectedIcon,
  },
  { key: "record", label: "", path: "/record", isCenter: true },
  {
    key: "archive",
    label: "아카이브",
    path: "/archive",
    defaultIcon: archiveDefaultIcon,
    selectedIcon: archiveSelectedIcon,
  },
  {
    key: "profile",
    label: "프로필",
    path: "/profile",
    defaultIcon: profileDefaultIcon,
    selectedIcon: profileSelectedIcon,
  },
];

const Footer = () => {
  return (
    <nav className="app-footer">
      {TABS.map(({ key, label, path, defaultIcon, selectedIcon, isCenter }) =>
        isCenter ? (
          <NavLink key={key} to={path} className="footer-center-btn" aria-label="바로가기">
            <span className="footer-center-circle">
              <img src={writeIcon} alt="" width={24} height={24} />
            </span>
          </NavLink>
        ) : (
          <NavLink
            key={key}
            to={path}
            end={path === "/"}
            className={({ isActive }) => `footer-tab${isActive ? " footer-tab--active" : ""}`}
          >
            {({ isActive }) => (
              <>
                <img src={isActive ? selectedIcon : defaultIcon} alt="" width={20} height={20} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ),
      )}
    </nav>
  );
};

export default Footer;
