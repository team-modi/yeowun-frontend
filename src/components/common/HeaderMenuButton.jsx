import { useState } from "react";

// components
import ActionSheet from "@components/common/ActionSheet";

// styles
import "@styles/common/HeaderMenuButton.css";

// images
import menuIcon from "@images/icons/Action/Menu.svg";

export default function HeaderMenuButton({ actions }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!actions) return null;

  return (
    <>
      <div className="header-menu-button-slot">
        <button type="button" className="header-icon-btn" onClick={() => setIsOpen(true)} aria-label="더보기">
          <img src={menuIcon} alt="" width={20} height={20} />
        </button>
      </div>
      <ActionSheet isOpen={isOpen} onClose={() => setIsOpen(false)} actions={actions} />
    </>
  );
}
