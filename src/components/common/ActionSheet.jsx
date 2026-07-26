import BottomSheet from "@components/common/BottomSheet";

// styles
import "@styles/common/ActionSheet.css";

export default function ActionSheet({ isOpen, onClose, actions }) {
  const visibleActions = (actions ?? []).filter(Boolean);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="action-sheet">
      <ul className="action-sheet-list">
        {visibleActions.map((action) => (
          <li key={action.label}>
            <button
              type="button"
              className={`action-sheet-item text-body-1-regular${action.danger ? " action-sheet-item--danger" : ""}`}
              onClick={() => {
                onClose?.();
                action.onClick?.();
              }}
            >
              {action.icon}
              {action.label}
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}

export function EditIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.83l-1.17-1.17a2 2 0 0 0-2.83 0L4 16v4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M13.5 6.5l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function RemindIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 9v4l2.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 4L2.5 6.5M19 4l2.5 2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
