import { useCallback, useState } from "react";

// components
import ExhibitCard from "@components/exhibition/ExhibitCard";
import ExhibitListHeader from "@components/common/ExhibitListHeader";
import FilterSheet from "@components/common/FilterSheet";

// styles
import "@styles/common/ExhibitionList.css";

// api
import { getExhibitionList } from "@api/exhibition";

// util
import { REGION_CODE_MAP, GENRE_CODE_MAP, toCodeParam } from "@utils/filterCodes";
import useCursorList from "@utils/useCursorList";
import useGeolocation from "@utils/useGeolocation";

// images
import imgSearchEmpty from "@images/img_search_empty.png";

const PAGE_SIZE = 20;

const ExhibitionList = ({ type, data }) => {
  const [sort, setSort] = useState("latest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [region, setRegion] = useState(undefined);
  const [category, setCategory] = useState(undefined);

  const { coords, error: geoError, isRequesting: isLocating, request: requestLocation } = useGeolocation();

  const dataKey = JSON.stringify(data ?? null);
  // 거리순은 좌표가 있어야 성립한다. 좌표를 못 받으면 서버가 400을 주므로 요청 자체를 하지 않는다.
  const isDistance = sort === "distance";
  const canQuery = !isDistance || !!coords;

  const fetchPage = useCallback(
    async ({ size, cursor }) => {
      const geo = isDistance && coords ? { lat: coords.lat, lng: coords.lng } : undefined;
      const response = await getExhibitionList({ sort, size, cursor, region, category, ...geo, ...data });
      return response.data.data;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort, region, category, dataKey, isDistance, coords],
  );

  const { items, totalCount, isLoading, isLoadingMore, sentinelRef } = useCursorList(fetchPage, {
    enabled: canQuery,
    pageSize: PAGE_SIZE,
  });

  // 거리순을 고른 순간에만 위치를 묻는다 — 화면 진입과 동시에 뜨는 권한 팝업은 거부율이 높다.
  const handleSortChange = async (nextSort) => {
    if (nextSort === "distance" && !coords) {
      const granted = await requestLocation();
      if (!granted) return; // 거부·실패면 정렬을 바꾸지 않는다(빈 목록을 보여주지 않기 위해)
    }
    setSort(nextSort);
  };

  const isEmpty = !isLoading && items.length === 0;

  const handleApplyFilter = ({ regions, genres }) => {
    setRegion(toCodeParam(regions, REGION_CODE_MAP));
    setCategory(toCodeParam(genres, GENRE_CODE_MAP));
  };

  return (
    <div className="exhibition-list-wrap">
      {/* 개수는 불러온 만큼이 아니라 조건 기준 전체 건수(totalCount)를 보여준다. */}
      <ExhibitListHeader
        total={totalCount}
        sort={sort}
        onSortChange={handleSortChange}
        onFilterClick={() => setIsFilterOpen(true)}
      />
      <FilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        totalCount={totalCount}
        onApply={handleApplyFilter}
      />
      <div className="exhibitionList-body">
        {geoError && (
          <p className="exhibit-list-geo-error text-body-2-regular" role="status">
            {geoError.message}
          </p>
        )}
        {isLocating ? (
          <p className="exhibit-list-loading-more text-body-2-regular">위치를 확인하는 중...</p>
        ) : isEmpty ? (
          <div className="exhibit-list-empty">
            <img src={imgSearchEmpty} alt="" width={70} height={70} />
            <p className="exhibit-list-empty-title text-heading-2">검색 결과가 없어요</p>
            <p className="exhibit-list-empty-desc text-body-2-regular">다른 키워드로 검색해 보세요</p>
          </div>
        ) : (
          <>
            <div className={type === "row" ? "home-section-row" : "home-section-vertical"}>
              {items.map((exhibit) => (
                <ExhibitCard
                  key={exhibit.exhibitionId}
                  type={type === "row" ? "vertical" : undefined}
                  thumbnail={exhibit.posterUrl}
                  title={exhibit.title}
                  place={exhibit.place}
                  startDate={exhibit.startDate}
                  endDate={exhibit.endDate}
                  exhibitionId={exhibit.exhibitionId}
                  bookmarked={exhibit.bookmarked}
                />
              ))}
            </div>
            {/* 이 빈 div가 화면에 들어오면 다음 페이지를 당겨온다(무한 스크롤). */}
            <div ref={sentinelRef} className="exhibit-list-sentinel" />
            {isLoadingMore && <p className="exhibit-list-loading-more text-body-2-regular">불러오는 중...</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default ExhibitionList;
