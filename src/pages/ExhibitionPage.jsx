// 전시탐색 페이지
import { useEffect, useState } from "react";

// components
import Footer from "@components/common/Footer";
import ExhibitionList from "@components/layout/ExhibitionList";
import SearchBox from "@components/layout/SearchBox";

// store
import { useSearchHistoryStore } from "@store/useSearchHistoryStore";

// icons
import closeIcon from "@images/icons/Action/Close.svg";

const SEARCH_DEBOUNCE_MS = 250;

const ExhibitionPage = () => {
  const [keyword, setKeyword] = useState("");
  // 검색창을 클릭했는지 여부
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const trimmedKeyword = keyword.trim();
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearchKeyword(trimmedKeyword), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [trimmedKeyword]);

  const searchHistory = useSearchHistoryStore((state) => state.history);
  const addSearchTerm = useSearchHistoryStore((state) => state.addSearchTerm);
  const removeSearchTerm = useSearchHistoryStore((state) => state.removeSearchTerm);
  const clearSearchHistory = useSearchHistoryStore((state) => state.clearSearchHistory);

  const handleSearchSubmit = (value) => {
    const trimmed = value.trim();
    setSearchKeyword(trimmed);
    addSearchTerm(trimmed);
  };

  const handleHistoryClick = (term) => {
    setKeyword(term);
    setSearchKeyword(term);
    addSearchTerm(term);
  };

  // 커서가 검색창에 있고 아직 아무것도 입력하지 않은 상태 — 이때는 전시 개수/정렬/필터 바를 숨긴다.
  const isBrowsingEmptyFocus = isSearchFocused && !trimmedKeyword;
  // 위 상태에서 최근 검색어가 있으면, 목록 대신 최근 검색어를 세로로 보여준다.
  const showHistory = isBrowsingEmptyFocus && searchHistory.length > 0;

  return (
    <div className="app-shell">
      <div className="app-content app-content--no-header">
        <div className="app-content-pad exhibition-body">
          <SearchBox
            value={keyword}
            onChange={setKeyword}
            onSubmit={handleSearchSubmit}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onClear={() => setKeyword("")}
            placeholder="전시명, 작가명, 장소를 검색해보세요"
          />

          {showHistory ? (
            /* 검색창에 커서가 있지만 아직 아무것도 입력하지 않은 상태 — 최근 검색어를 목록으로 보여준다. */
            <section className="exhibition-page-history">
              <div className="exhibition-page-history-head">
                <h2 className="exhibition-page-history-title text-body-1-medium">최근 검색어</h2>
                <button
                  type="button"
                  className="exhibition-page-history-clear text-body-2-regular"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={clearSearchHistory}
                >
                  전체 삭제
                </button>
              </div>
              <ul className="exhibition-page-history-list">
                {searchHistory.map((term) => (
                  <li key={term} className="exhibition-page-history-item">
                    <button
                      type="button"
                      className="exhibition-page-history-item-label text-body-1-regular"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleHistoryClick(term)}
                    >
                      {term}
                    </button>
                    <button
                      type="button"
                      className="exhibition-page-history-item-remove"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => removeSearchTerm(term)}
                      aria-label={`${term} 삭제`}
                    >
                      <img src={closeIcon} alt="" width={14} height={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <ExhibitionList data={{ keyword: searchKeyword }} hideHeader={isBrowsingEmptyFocus} hideEndBadge />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ExhibitionPage;
