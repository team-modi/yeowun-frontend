import { useEffect, useRef, useState } from "react";

// styles
import "@styles/common/FilterSheet.css";

// api
import { getExhibitionList } from "@api/exhibition";

// util
import {
  REGION_OPTIONS,
  GENRE_OPTIONS,
  REGION_CODE_MAP,
  GENRE_CODE_MAP,
  toCodeParam,
} from "@utils/exhibitionFilterCodes";

const CLOSE_DRAG_THRESHOLD = 120;

function toggleChip(selected, value) {
  if (value === "all") return ["all"];
  const withoutAll = selected.filter((item) => item !== "all");
  const isSelected = withoutAll.includes(value);
  const next = isSelected ? withoutAll.filter((item) => item !== value) : [...withoutAll, value];
  return next.length === 0 ? ["all"] : next;
}

export default function FilterSheet({ isOpen, onClose, totalCount = 0, onApply }) {
  const [selectedRegions, setSelectedRegions] = useState(["all"]);
  const [selectedGenres, setSelectedGenres] = useState(["all"]);

  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef(0);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setDragY(0);
      setIsDragging(false);
    }
  }

  const [previewCount, setPreviewCount] = useState(totalCount);

  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;

    (async () => {
      try {
        const response = await getExhibitionList({
          region: toCodeParam(selectedRegions, REGION_CODE_MAP),
          category: toCodeParam(selectedGenres, GENRE_CODE_MAP),
          size: 1,
        });
        if (!ignore) {
          setPreviewCount(response.data.data.totalCount);
        }
      } catch (error) {
        console.log(error);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [isOpen, JSON.stringify(selectedRegions), JSON.stringify(selectedGenres)]);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedRegions(["all"]);
    setSelectedGenres(["all"]);
  };

  const handleApply = () => {
    onApply?.({ regions: selectedRegions, genres: selectedGenres });
    onClose?.();
  };

  const handleDragStart = (event) => {
    dragStartYRef.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (event) => {
    if (!isDragging) return;
    const delta = event.clientY - dragStartYRef.current;
    setDragY(Math.max(0, delta));
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragY > CLOSE_DRAG_THRESHOLD) {
      onClose?.();
    }
    setDragY(0);
  };

  return (
    <div className="filter-sheet-backdrop" onClick={onClose}>
      <div
        className={`filter-sheet ${isDragging ? "is-dragging" : ""}`}
        style={{ transform: `translateY(${dragY}px)` }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="filter-sheet-handle-area"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        >
          <div className="filter-sheet-handle" />
        </div>

        <h2 className="filter-sheet-title text-title-3">필터</h2>

        <ChipGroup
          label="지역"
          options={REGION_OPTIONS}
          selected={selectedRegions}
          onToggle={(value) => setSelectedRegions((prev) => toggleChip(prev, value))}
        />

        <ChipGroup
          label="장르"
          options={GENRE_OPTIONS}
          selected={selectedGenres}
          onToggle={(value) => setSelectedGenres((prev) => toggleChip(prev, value))}
        />

        <div className="filter-sheet-footer">
          <button type="button" className="filter-sheet-reset text-body-1-medium" onClick={handleReset}>
            초기화
          </button>
          <button type="button" className="filter-sheet-apply text-body-1-medium" onClick={handleApply}>
            {previewCount}개 전시 보기
          </button>
        </div>
      </div>
    </div>
  );
}

function ChipGroup({ label, options, selected, onToggle }) {
  return (
    <div className="filter-sheet-group">
      <h3 className="filter-sheet-group-title text-heading-2">{label}</h3>
      <div className="filter-sheet-chips">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`filter-chip text-label-2 ${selected.includes(option.value) ? "is-selected" : ""}`}
            onClick={() => onToggle(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
