import { useState } from "react";

// components
import BottomSheet from "@components/common/BottomSheet";

// utils
import { GENRE_OPTIONS } from "@utils/filterCodes";

// styles
import "@styles/record/GenreSheet.css";

const SELECTABLE_GENRES = GENRE_OPTIONS.filter((option) => option.value !== "all");

export default function GenreSheet({ isOpen, onClose, value = [], onApply }) {
  const [selected, setSelected] = useState(value.map((item) => item.value));

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setSelected(value.map((item) => item.value));
  }

  const toggleOption = (optionValue) => {
    setSelected((prev) =>
      prev.includes(optionValue) ? prev.filter((item) => item !== optionValue) : [...prev, optionValue],
    );
  };

  const handleApply = () => {
    const options = SELECTABLE_GENRES.filter((item) => selected.includes(item.value));
    onApply?.(options);
    onClose?.();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h2 className="genre-sheet-title text-title-3">장르</h2>
      <p className="genre-sheet-desc text-body-2-regular">해당되는 장르를 모두 선택해 주세요</p>
      <div className="genre-sheet-chips">
        {SELECTABLE_GENRES.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`genre-chip text-label-2 ${selected.includes(option.value) ? "is-selected" : ""}`}
            onClick={() => toggleOption(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <button type="button" className="genre-sheet-submit text-body-1-medium" onClick={handleApply}>
        확인
      </button>
    </BottomSheet>
  );
}
