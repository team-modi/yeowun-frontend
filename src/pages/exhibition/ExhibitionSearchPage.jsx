import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import SearchBox from "@components/layout/SearchBox";
import ExhibitCard from "@components/exhibition/ExhibitCard";

// api
import { getExhibitionList } from "@api/exhibition";

// store
import { useSearchHistoryStore } from "@store/useSearchHistoryStore";

// util
import useCursorList from "@utils/useCursorList";

// styles
import "@styles/common/ExhibitionList.css"; // exhibit-card 스타일 재사용
import "@styles/exhibition/ExhibitionSearchPage.css";

// images
import chevronLeftIcon from "@images/icons/Action/Chevron Left.svg";
import chevronRightIcon from "@images/icons/Action/Chevron Right.svg";
import closeIcon from "@images/icons/Action/Close.svg";
import imgSearchEmpty from "@images/img_search_empty.png";

const SEARCH_DEBOUNCE_MS = 250;
const PAGE_SIZE = 20;

// 전시탐색 검색 페이지: 검색창 + 최근 검색어(최대 10개)
export default function ExhibitionSearchPage() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const trimmedKeyword = keyword.trim();
  const hasQuery = trimmedKeyword.length > 0;

  const [searchTerm, setSearchTerm] = useState(trimmedKeyword);
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(trimmedKeyword), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [trimmedKeyword]);

  const history = useSearchHistoryStore((state) => state.history);
  const addSearchTerm = useSearchHistoryStore((state) => state.addSearchTerm);
  const removeSearchTerm = useSearchHistoryStore((state) => state.removeSearchTerm);
  const clearSearchHistory = useSearchHistoryStore((state) => state.clearSearchHistory);

  const fetchPage = useCallback(
    async ({ size, cursor }) => {
      const response = await getExhibitionList({ keyword: searchTerm, size, cursor });
      return response.data.data;
    },
    [searchTerm],
  );

  const {
    items: exhibitions,
    isLoading,
    isLoadingMore,
    sentinelRef,
  } = useCursorList(fetchPage, {
    enabled: searchTerm.length > 0,
    pageSize: PAGE_SIZE,
  });

  // 검색하면 최근 검색어에 남긴다
  const commitToHistory = (term) => {
    const trimmed = term?.trim();
    if (!trimmed) return;
    addSearchTerm(trimmed);
  };

  const handleSubmit = (value) => commitToHistory(value);
  const handleHistoryClick = (term) => {
    setKeyword(term);
    setIsFocused(true);
  };

  const handleGoToAddExhibition = () => navigate("/record/new");

  return (
    <div className="app-shell exhibition-search-page">
      <div className="exhibition-search-header">
        <button type="button" className="header-icon-btn" onClick={() => navigate(-1)} aria-label="뒤로가기">
          <img src={chevronLeftIcon} alt="" width={20} height={20} />
        </button>
        <SearchBox
          value={keyword}
          onChange={setKeyword}
          onSubmit={handleSubmit}
          onFocus={() => setIsFocused(true)}
          onClear={() => setKeyword("")}
          placeholder="전시명, 작가명, 장소를 검색해보세요"
        />
      </div>

      <div className="exhibition-search-body">
        {!hasQuery && history.length > 0 && (
          <section className="exhibition-search-history">
            <div className="exhibition-search-history-head">
              <h2 className="exhibition-search-history-title text-body-1-medium">최근 검색어</h2>
              <button
                type="button"
                className="exhibition-search-history-clear text-body-2-regular"
                onClick={clearSearchHistory}
              >
                전체 삭제
              </button>
            </div>

            {isFocused ? (
              <div className="exhibition-search-history-chips">
                {history.map((term) => (
                  <span key={term} className="exhibition-search-history-chip">
                    <button
                      type="button"
                      className="exhibition-search-history-chip-label text-body-2-regular"
                      onClick={() => handleHistoryClick(term)}
                    >
                      {term}
                    </button>
                    <button
                      type="button"
                      className="exhibition-search-history-chip-remove"
                      onClick={() => removeSearchTerm(term)}
                      aria-label={`${term} 삭제`}
                    >
                      <img src={closeIcon} alt="" width={12} height={12} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <ul className="exhibition-search-history-list">
                {history.map((term) => (
                  <li key={term} className="exhibition-search-history-item">
                    <button
                      type="button"
                      className="exhibition-search-history-item-label text-body-1-regular"
                      onClick={() => handleHistoryClick(term)}
                    >
                      {term}
                    </button>
                    <button
                      type="button"
                      className="exhibition-search-history-item-remove"
                      onClick={() => removeSearchTerm(term)}
                      aria-label={`${term} 삭제`}
                    >
                      <img src={closeIcon} alt="" width={14} height={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {hasQuery && isLoading && <p className="exhibition-search-loading text-body-2-regular">불러오는 중...</p>}

        {hasQuery && !isLoading && exhibitions.length === 0 && (
          <div className="exhibition-search-empty">
            <img src={imgSearchEmpty} alt="" width={70} height={70} />
            <p className="exhibition-search-empty-title text-body-1-medium">찾는 전시가 없어요</p>
            <p className="exhibition-search-empty-desc text-body-2-regular">
              검색어를 다시 확인하거나 직접 추가해 주세요
            </p>
            <button
              type="button"
              className="exhibition-search-empty-btn text-body-1-medium"
              onClick={handleGoToAddExhibition}
            >
              전시 직접 추가하기
              <img src={chevronRightIcon} alt="" width={16} height={16} />
            </button>
          </div>
        )}

        {hasQuery && !isLoading && exhibitions.length > 0 && (
          <div className="exhibition-search-results">
            {exhibitions.map((exhibit) => (
              <ExhibitCard
                key={exhibit.exhibitionId}
                thumbnail={exhibit.posterUrl}
                title={exhibit.title}
                place={exhibit.place}
                artistSummary={exhibit.artistSummary}
                startDate={exhibit.startDate}
                endDate={exhibit.endDate}
                exhibitionId={exhibit.exhibitionId}
                bookmarked={exhibit.bookmarked}
              />
            ))}
            <div ref={sentinelRef} className="exhibition-search-sentinel" />
            {isLoadingMore && <p className="exhibition-search-loading text-body-2-regular">불러오는 중...</p>}
          </div>
        )}
      </div>
    </div>
  );
}
