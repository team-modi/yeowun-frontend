// components
import SortDropdown from "@components/layout/SortDropdown";

// icons
import filterIcon from "@images/icons/Action/Filter.svg";

export default function ExhibitListHeader({ total, sort, onSortChange, onFilterClick }) {
  return (
    <div className="exhibit-list-header">
      <span className="exhibit-list-header-count text-body-2-regular">총 {total}개</span>

      <div className="exhibit-list-header-actions">
        <SortDropdown value={sort} onChange={onSortChange} />
        <button type="button" className="exhibit-list-header-filter" onClick={onFilterClick} aria-label="필터">
          <img src={filterIcon} alt="" width={20} height={20} />
        </button>
      </div>
    </div>
  );
}

