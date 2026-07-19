import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import SearchBox from "@components/layout/SearchBox";
import ExhibitListHeader from "@components/common/ExhibitListHeader";
import FilterSheet from "@components/common/FilterSheet";

// api
import { getExhibitionList } from "@api/exhibition";

// store
import { useRecordDraftStore } from "@store/useRecordDraftStore";

// utils
import { REGION_CODE_MAP, GENRE_CODE_MAP, toCodeParam } from "@utils/filterCodes";

// styles
import "@styles/record/RecordExhibitionSelectPage.css";

// icons
import chevronRightIcon from "@images/icons/Action/Chevron Right.svg";

export default function RecordExhibitionSelectPage() {
  const navigate = useNavigate();
  const setExhibitionDraft = useRecordDraftStore((state) => state.setExhibitionDraft);
  const setExhibitionId = useRecordDraftStore((state) => state.setExhibitionId);

  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sort, setSort] = useState("latest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [region, setRegion] = useState(undefined);
  const [category, setCategory] = useState(undefined);
  const [exhibitions, setExhibitions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await getExhibitionList({
          sort,
          size: 20,
          region,
          category,
          keyword: searchKeyword || undefined,
        });
        const content = response.data.data.content ?? [];
        setExhibitions(content);
        setTotalCount(response.data.data.totalElements ?? response.data.data.totalCount ?? content.length);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [sort, region, category, searchKeyword]);

  const handleApplyFilter = ({ regions, genres }) => {
    setRegion(toCodeParam(regions, REGION_CODE_MAP));
    setCategory(toCodeParam(genres, GENRE_CODE_MAP));
  };

  const selectedExhibition = exhibitions.find((item) => item.exhibitionId === selectedId);

  const handleNext = () => {
    if (!selectedExhibition) return;
    setExhibitionDraft({
      title: selectedExhibition.title,
      artistLine: selectedExhibition.artistName ?? selectedExhibition.artist ?? "",
      venueLine: selectedExhibition.place ?? "",
      posterUrl: selectedExhibition.posterUrl,
      startDate: selectedExhibition.startDate,
      endDate: selectedExhibition.endDate,
    });
    setExhibitionId(selectedExhibition.exhibitionId);
    navigate("/record/detail");
  };

  return (
    <div className="app-shell">
      <Header type="sub" title="기록 작성" onBack={() => navigate(-1)} />
      <div className="app-content">
        <div className="app-content-pad record-select-body">
          <h1 className="record-select-guide text-title-3">관람한 전시를 선택해주세요</h1>

          <SearchBox
            value={keyword}
            onChange={setKeyword}
            onSubmit={setSearchKeyword}
            placeholder="전시명을 검색해보세요"
          />

          <ExhibitListHeader
            total={totalCount}
            sort={sort}
            onSortChange={setSort}
            onFilterClick={() => setIsFilterOpen(true)}
          />

          <FilterSheet
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            totalCount={totalCount}
            onApply={handleApplyFilter}
          />

          <div className="record-select-list">
            {exhibitions.map((exhibit) => (
              <button
                key={exhibit.exhibitionId}
                type="button"
                className={`record-select-item ${selectedId === exhibit.exhibitionId ? "is-selected" : ""}`}
                onClick={() => setSelectedId(exhibit.exhibitionId)}
              >
                <div
                  className="record-select-item-thumb"
                  style={exhibit.posterUrl ? { backgroundImage: `url(${exhibit.posterUrl})` } : undefined}
                />
                <div className="record-select-item-content">
                  <p className="record-select-item-title text-body-1-medium">{exhibit.title}</p>
                  {(exhibit.artistName ?? exhibit.artist) && (
                    <p className="record-select-item-artist text-body-2-regular">
                      {exhibit.artistName ?? exhibit.artist}
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
        </div>
      </div>

      <div className="record-select-banner">
        <span className="text-body-2-regular">찾으시는 전시가 없거나 종료 되었나요?</span>
        <button
          type="button"
          className="record-select-banner-link text-body-1-medium"
          onClick={() => navigate("/record/new")}
        >
          전시 직접 추가하기
          <img src={chevronRightIcon} alt="" width={16} height={16} />
        </button>
      </div>

      <div className="record-select-footer">
        <button
          type="button"
          className="record-select-submit text-body-1-medium"
          disabled={!selectedExhibition}
          onClick={handleNext}
        >
          다음
        </button>
      </div>
    </div>
  );
}
