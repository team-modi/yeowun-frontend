import { useState, useRef, useEffect } from "react";

// icons
import chevronDownIcon from "@images/icons/Action/Chevron Down.svg";
import chevronUpIcon from "@images/icons/Action/Chevron Up.svg";

const DEFAULT_SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "ending", label: "종료순" },
  { value: "popular", label: "인기순" },
  { value: "distance", label: "거리순" },
];

export default function SortDropdown({ value, onChange, options = DEFAULT_SORT_OPTIONS }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selected = options.find((option) => option.value === value) ?? options[0];

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
        <img src={isOpen ? chevronUpIcon : chevronDownIcon} alt="" width={14} height={14} />
      </button>

      {isOpen && (
        <ul className="sort-dropdown-menu">
          {options.map((option) => (
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

