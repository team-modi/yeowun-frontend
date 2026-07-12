import { useState } from "react";

// components
import BottomSheet from "@components/common/BottomSheet";

// utils
import { GENRE_OPTIONS } from "@utils/filterCodes";

const SELECTABLE_GENRES = GENRE_OPTIONS.filter((option) => option.value !== "all");

export default function GenreSheet({ isOpen, onClose, value, onApply }) {
  const [selected, setSelected] = useState(value ?? null);

  const handleApply = () => {
    const option = SELECTABLE_GENRES.find((item) => item.value === selected);
    onApply?.(option ?? null);
    onClose?.();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h2 className="genre-sheet-title text-title-3">장르</h2>
      <div className="genre-sheet-chips">
        {SELECTABLE_GENRES.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`genre-chip text-label-2 ${selected === option.value ? "is-selected" : ""}`}
            onClick={() => setSelected(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="genre-sheet-submit text-body-1-medium"
        disabled={!selected}
        onClick={handleApply}
      >
        완료
      </button>
    </BottomSheet>
  );
}
