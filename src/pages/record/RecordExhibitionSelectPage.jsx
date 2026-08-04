import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import SearchBox from "@components/layout/SearchBox";
import ExhibitionConfirmSheet from "@components/record/ExhibitionConfirmSheet";

// api
import { getExhibitionList } from "@api/exhibition";

// store
import { useRecordDraftStore } from "@store/useRecordDraftStore";
import { useSearchHistoryStore } from "@store/useSearchHistoryStore";
import { useRecentlyViewedStore } from "@store/useRecentlyViewedStore";

// util
import useCursorList from "@utils/useCursorList";

// styles
import "@styles/record/RecordExhibitionSelectPage.css";

// images
import imgSearchEmpty from "@images/img_search_empty.png";
import chevronRightIcon from "@images/icons/Action/Chevron Right.svg";
import closeIcon from "@images/icons/Action/Close.svg";

const SEARCH_DEBOUNCE_MS = 250;
const PAGE_SIZE = 20;

export default function RecordExhibitionSelectPage() {
  const navigate = useNavigate();
  const setExhibitionDraft = useRecordDraftStore((state) => state.setExhibitionDraft);
  const setExhibitionId = useRecordDraftStore((state) => state.setExhibitionId);

  const [keyword, setKeyword] = useState("");
  // 처음 들어왔을 때는 인트로 화면 — 검색창을 처음 누르면 칩+최근 살펴본 전시가 먼저 나오고,
  // 그 상태에서 검색창을 한 번 더 눌러 커서를 두면 최근 검색어가 세로 목록으로 바뀐다.
  const [hasEnteredSearch, setHasEnteredSearch] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const trimmedKeyword = keyword.trim();
  const hasQuery = trimmedKeyword.length > 0;

  const searchHistory = useSearchHistoryStore((state) => state.history);
  const addSearchTerm = useSearchHistoryStore((state) => state.addSearchTerm);
  const removeSearchTerm = useSearchHistoryStore((state) => state.removeSearchTerm);
  const clearSearchHistory = useSearchHistoryStore((state) => state.clearSearchHistory);

  const recentlyViewed = useRecentlyViewedStore((state) => state.items);

  const handleSearchSubmit = (value) => {
    setKeyword(value);
    addSearchTerm(value);
  };

  const handleHistoryClick = (term) => {
    setKeyword(term);
    addSearchTerm(term);
  };

  const handleSearchFocus = (event) => {
    if (!hasEnteredSearch) {
      setHasEnteredSearch(true);
      const inputEl = event.target;
      setTimeout(() => inputEl.blur(), 0);
      return;
    }
    setIsInputFocused(true);
  };

  const handleSearchBlur = () => {
    setIsInputFocused(false);
  };

  // 타이핑마다 요청하지 않도록 확정된 검색어를 따로 둔다 — 목록은 이 값이 바뀔 때만 다시 부른다.
  const [searchTerm, setSearchTerm] = useState(trimmedKeyword);

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(trimmedKeyword), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [trimmedKeyword]);

  const fetchPage = useCallback(
    async ({ size, cursor }) => {
      const response = await getExhibitionList({ keyword: searchTerm, size, cursor });
      return response.data.data;
    },
    [searchTerm],
  );

  const {
    items: exhibitions,
    isLoadingMore,
    sentinelRef,
  } = useCursorList(fetchPage, {
    enabled: searchTerm.length > 0,
    pageSize: PAGE_SIZE,
  });

  const handleGoToAddExhibition = () => navigate("/record/new");

  const handleConfirm = () => {
    if (!confirmTarget) return;
    setExhibitionDraft({
      title: confirmTarget.title,
      artistLine: confirmTarget.artistSummary ?? confirmTarget.artistName ?? confirmTarget.artist ?? "",
      venueLine: confirmTarget.place ?? "",
      posterUrl: confirmTarget.posterUrl,
      startDate: confirmTarget.startDate,
      endDate: confirmTarget.endDate,
    });
    setExhibitionId(confirmTarget.exhibitionId);
    setConfirmTarget(null);
    navigate("/record/detail");
  };

  return (
    <div className="app-shell">
      <Header type="back" title="관람한 전시 선택" onBack={() => navigate(-1)} />
      <div className="app-content">
        <div className="app-content-pad record-select-body">
          {!hasEnteredSearch && (
            <div className="record-select-intro">
              <h1 className="record-select-intro-title text-title-3">어떤 전시를 관람하셨나요?</h1>
              <button type="button" className="record-select-add-link" onClick={handleGoToAddExhibition}>
                전시 직접 추가하기
                <img src={chevronRightIcon} alt="" width={16} height={16} />
              </button>
            </div>
          )}

          <SearchBox
            value={keyword}
            onChange={setKeyword}
            onSubmit={handleSearchSubmit}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            placeholder="전시명, 작가명, 장소를 검색해보세요"
          />

          {/* 검색창에 커서가 있는 상태 — 최근 검색어를 세로 목록으로 보여준다. */}
          {hasEnteredSearch && !hasQuery && isInputFocused && searchHistory.length > 0 && (
            <section className="record-select-history">
              <div className="record-select-history-head">
                <h2 className="record-select-history-title text-body-1-medium">최근 검색어</h2>
                <button
                  type="button"
                  className="record-select-history-clear text-body-2-regular"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={clearSearchHistory}
                >
                  전체 삭제
                </button>
              </div>
              <ul className="record-select-history-list">
                {searchHistory.map((term) => (
                  <li key={term} className="record-select-history-item">
                    <button
                      type="button"
                      className="record-select-history-item-label text-body-1-regular"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleHistoryClick(term)}
                    >
                      {term}
                    </button>
                    <button
                      type="button"
                      className="record-select-history-item-remove"
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
          )}

          {hasEnteredSearch && !hasQuery && !isInputFocused && (
            <>
              {searchHistory.length > 0 && (
                <section className="record-select-history">
                  <div className="record-select-history-head">
                    <h2 className="record-select-history-title text-body-1-medium">최근 검색어</h2>
                    <button
                      type="button"
                      className="record-select-history-clear text-body-2-regular"
                      onClick={clearSearchHistory}
                    >
                      전체 삭제
                    </button>
                  </div>
                  <div className="record-select-history-chips">
                    {searchHistory.map((term) => (
                      <span key={term} className="record-select-history-chip">
                        <button
                          type="button"
                          className="record-select-history-chip-label text-body-2-regular"
                          onClick={() => handleHistoryClick(term)}
                        >
                          {term}
                        </button>
                        <button
                          type="button"
                          className="record-select-history-chip-remove"
                          onClick={() => removeSearchTerm(term)}
                          aria-label={`${term} 삭제`}
                        >
                          <img src={closeIcon} alt="" width={12} height={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {recentlyViewed.length > 0 && (
                <section className="record-select-recent-viewed">
                  <h2 className="record-select-recent-viewed-title text-body-1-medium">최근 살펴본 전시</h2>
                  <div className="home-section-row-scroll record-select-recent-viewed-scroll">
                    {recentlyViewed.map((exhibit) => (
                      <button
                        key={exhibit.exhibitionId}
                        type="button"
                        className="record-select-recent-viewed-item"
                        onClick={() => navigate(`/exhibition/${exhibit.exhibitionId}`)}
                      >
                        <div
                          className="record-select-recent-viewed-thumb"
                          style={exhibit.posterUrl ? { backgroundImage: `url(${exhibit.posterUrl})` } : undefined}
                        />
                        <p className="record-select-recent-viewed-item-title text-body-2-regular">{exhibit.title}</p>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {hasQuery && exhibitions.length === 0 && (
            <div className="record-select-empty">
              <img src={imgSearchEmpty} alt="" width={70} height={70} />
              <p className="record-select-empty-title text-body-1-medium">찾는 전시가 없어요</p>
              <p className="record-select-empty-desc text-body-2-regular">
                검색어를 다시 확인하거나 직접 추가해 주세요
              </p>
              <button type="button" className="record-select-add-btn " onClick={handleGoToAddExhibition}>
                전시 직접 추가하기
                <img src={chevronRightIcon} alt="" width={16} height={16} />
              </button>
            </div>
          )}

          {hasQuery && exhibitions.length > 0 && (
            <div className="record-select-list">
              {exhibitions.map((exhibit) => (
                <button
                  key={exhibit.exhibitionId}
                  type="button"
                  className="record-select-item"
                  onClick={() => setConfirmTarget(exhibit)}
                >
                  <div
                    className="record-select-item-thumb"
                    style={exhibit.posterUrl ? { backgroundImage: `url(${exhibit.posterUrl})` } : undefined}
                  />
                  <div className="record-select-item-content">
                    <p className="record-select-item-title text-body-1-medium">{exhibit.title}</p>
                    {(exhibit.artistSummary ?? exhibit.artistName ?? exhibit.artist) && (
                      <p className="record-select-item-artist text-body-2-regular">
                        {exhibit.artistSummary ?? exhibit.artistName ?? exhibit.artist}
                      </p>
                    )}
                    <p className="record-select-item-place text-body-2-regular">{exhibit.place}</p>
                    <p className="record-select-item-date text-caption-1">
                      {exhibit.startDate} ~ {exhibit.endDate}
                    </p>
                  </div>
                </button>
              ))}
              <div ref={sentinelRef} className="record-select-sentinel" />
              {isLoadingMore && <p className="record-select-loading-more text-body-2-regular">불러오는 중...</p>}
            </div>
          )}
        </div>
      </div>

      <ExhibitionConfirmSheet
        exhibition={confirmTarget}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
