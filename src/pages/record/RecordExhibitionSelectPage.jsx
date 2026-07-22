import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import SearchBox from "@components/layout/SearchBox";
import ExhibitionConfirmSheet from "@components/record/ExhibitionConfirmSheet";

// api
import { getExhibitionList } from "@api/exhibition";

// store
import { useRecordDraftStore } from "@store/useRecordDraftStore";

// styles
import "@styles/record/RecordExhibitionSelectPage.css";

// icons
import chevronRightIcon from "@images/icons/Action/Chevron Right.svg";

const SEARCH_DEBOUNCE_MS = 250;

export default function RecordExhibitionSelectPage() {
  const navigate = useNavigate();
  const setExhibitionDraft = useRecordDraftStore((state) => state.setExhibitionDraft);
  const setExhibitionId = useRecordDraftStore((state) => state.setExhibitionId);

  const [keyword, setKeyword] = useState("");
  const [exhibitions, setExhibitions] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const trimmedKeyword = keyword.trim();
  const hasQuery = trimmedKeyword.length > 0;

  const [prevHasQuery, setPrevHasQuery] = useState(hasQuery);
  if (hasQuery !== prevHasQuery) {
    setPrevHasQuery(hasQuery);
    if (!hasQuery) setExhibitions([]);
  }

  useEffect(() => {
    if (!hasQuery) return;

    let ignore = false;
    const timer = setTimeout(async () => {
      try {
        const response = await getExhibitionList({ keyword: trimmedKeyword, size: 20 });
        if (ignore) return;
        setExhibitions(response.data.data.content ?? []);
      } catch (error) {
        console.log(error);
        if (!ignore) setExhibitions([]);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [trimmedKeyword, hasQuery]);

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
              <button
                type="button"
                className="record-select-add-link text-body-1-medium"
                onClick={handleGoToAddExhibition}
              >
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
              <div className="record-select-empty-icon" aria-hidden="true" />
              <p className="record-select-empty-title text-body-1-medium">찾는 전시가 없어요</p>
              <p className="record-select-empty-desc text-body-2-regular">
                검색어를 다시 확인하거나 직접 추가해 주세요
              </p>
              <button
                type="button"
                className="record-select-add-btn text-body-1-medium"
                onClick={handleGoToAddExhibition}
              >
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
