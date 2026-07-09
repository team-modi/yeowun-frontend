import { useState, useRef, useEffect } from "react";

// styles
import "@styles/common/SortDropdown.css";

const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "ending", label: "종료순" },
  { value: "popular", label: "인기순" },
  { value: "distance", label: "거리순" },
];

export default function SortDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selected = SORT_OPTIONS.find((option) => option.value === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="sort-dropdown" ref={wrapperRef}>
      <button type="button" className="sort-dropdown-trigger text-label-2" onClick={() => setIsOpen((prev) => !prev)}>
        {selected.label}
        <ChevronDownIcon isOpen={isOpen} />
      </button>

      {isOpen && (
        <ul className="sort-dropdown-menu">
          {SORT_OPTIONS.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={`sort-dropdown-item text-label-2 ${option.value === value ? "is-selected" : ""}`}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChevronDownIcon({ isOpen }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.15s ease",
      }}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
