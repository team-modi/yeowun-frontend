import "@styles/exhibition/RecentSearchList.css";

// icons
import closeIcon from "@images/icons/Action/Close.svg";

/**
 * 최근 검색어 목록. 검색창이 비어 있을 때만 노출한다 — 검색어를 입력하는 순간부터는
 * 결과가 그 자리를 차지해야 하기 때문이다.
 *
 * 회원 전용 기능이라 비로그인이면 아예 렌더하지 않는다(호출부에서 판단).
 */
export default function RecentSearchList({ items, onSelect, onRemove, onClearAll }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="recent-search">
      <div className="recent-search-header">
        <span className="recent-search-title text-body-2-medium">최근 검색어</span>
        <button type="button" className="recent-search-clear text-caption-1" onClick={onClearAll}>
          전체 삭제
        </button>
      </div>

      <ul className="recent-search-list">
        {items.map((item) => (
          <li key={item.searchHistoryId} className="recent-search-item">
            <button
              type="button"
              className="recent-search-keyword text-body-2-regular"
              onClick={() => onSelect(item.keyword)}
            >
              {item.keyword}
            </button>
            <button
              type="button"
              className="recent-search-remove"
              onClick={() => onRemove(item.searchHistoryId)}
              aria-label={`${item.keyword} 검색 기록 삭제`}
            >
              <img src={closeIcon} alt="" width={12} height={12} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
