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

// util
import useCursorList from "@utils/useCursorList";

// styles
import "@styles/record/RecordExhibitionSelectPage.css";

// images
import imgSearchEmpty from "@images/img_search_empty.png";
import chevronRightIcon from "@images/icons/Action/Chevron Right.svg";

const SEARCH_DEBOUNCE_MS = 250;
const PAGE_SIZE = 20;

export default function RecordExhibitionSelectPage() {
  const navigate = useNavigate();
  const setExhibitionDraft = useRecordDraftStore((state) => state.setExhibitionDraft);
  const setExhibitionId = useRecordDraftStore((state) => state.setExhibitionId);

  const [keyword, setKeyword] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const trimmedKeyword = keyword.trim();
  const hasQuery = trimmedKeyword.length > 0;

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

  // 검색 결과도 커서로 이어 받는다 — 예전엔 첫 20건에서 멈춰 그 뒤 전시는 고를 수 없었다.
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
          {!isSearchActive && (
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
            onSubmit={setKeyword}
            onFocus={() => setIsSearchActive(true)}
            placeholder="전시명, 작가명, 장소를 검색해보세요"
          />

          {isSearchActive && hasQuery && exhibitions.length === 0 && (
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

          {isSearchActive && hasQuery && exhibitions.length > 0 && (
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
              {/* 이 빈 div가 화면에 들어오면 다음 페이지를 당겨온다(무한 스크롤). */}
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
