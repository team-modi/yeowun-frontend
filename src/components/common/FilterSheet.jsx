import { useEffect, useState } from "react";

// components
import BottomSheet from "@components/common/BottomSheet";

// styles
import "@styles/common/FilterSheet.css";

// api
import { getExhibitionList } from "@api/exhibition";

// util
import { REGION_OPTIONS, GENRE_OPTIONS, REGION_CODE_MAP, GENRE_CODE_MAP, toCodeParam } from "@utils/filterCodes";

// icons
import refreshIcon from "@images/icons/Action/Refresh.svg";

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
  }, [isOpen, selectedRegions, selectedGenres]);

  const handleReset = () => {
    setSelectedRegions(["all"]);
    setSelectedGenres(["all"]);
  };

  const handleApply = () => {
    onApply?.({ regions: selectedRegions, genres: selectedGenres });
    onClose?.();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
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
          <img src={refreshIcon} alt="" width={16} height={16} />
          초기화
        </button>
        <button type="button" className="filter-sheet-apply text-body-1-medium" onClick={handleApply}>
          {previewCount}개 전시 보기
        </button>
      </div>
    </BottomSheet>
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
