import SortDropdown from "@components/layout/SortDropdown";
import "@styles/common/ExhibitListHeader.css";

export default function ExhibitListHeader({ total, sort, onSortChange, onFilterClick }) {
  return (
    <div className="exhibit-list-header">
      <span className="exhibit-list-header-count text-body-2-regular">총 {total}개</span>

      <div className="exhibit-list-header-actions">
        <SortDropdown value={sort} onChange={onSortChange} />
        <button type="button" className="exhibit-list-header-filter" onClick={onFilterClick} aria-label="필터">
          <FilterIcon />
        </button>
      </div>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
