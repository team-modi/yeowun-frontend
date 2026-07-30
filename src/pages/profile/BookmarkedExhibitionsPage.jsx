import { useCallback, useState } from "react";

// components
import Header from "@components/common/Header";
import SortDropdown from "@components/layout/SortDropdown";
import ExhibitCard from "@components/exhibition/ExhibitCard";

// api
import { getUserBookmarks } from "@api/user";

// utils
import { formatShortDateRange } from "@utils/common";
import useCursorList from "@utils/useCursorList";

// styles
import "@styles/profile/exhibitionListPage.css";

const PAGE_SIZE = 20;
const SORT_OPTIONS = [
  { value: "latest", label: "담은순" },
  { value: "ending", label: "종료 임박순" },
];

export default function BookmarkedExhibitionsPage() {
  const [sort, setSort] = useState("latest");

  const fetchPage = useCallback(
    async ({ size, cursor }) => {
      const response = await getUserBookmarks({ sort, size, cursor });
      return response.data.data;
    },
    [sort],
  );

  const { items, setItems, totalCount, setTotalCount, isLoading, isLoadingMore, sentinelRef } = useCursorList(
    fetchPage,
    {
      pageSize: PAGE_SIZE,
    },
  );

  const handleUnbookmark = useCallback(
    (exhibitionId) => {
      setItems((prev) => prev.filter((exhibition) => exhibition.exhibitionId !== exhibitionId));
      setTotalCount((prev) => Math.max(0, prev - 1));
    },
    [setItems, setTotalCount],
  );

  return (
    <div className="app-shell">
      <Header type="back" title="관심 전시" />
      <div className="app-content">
        <div className="app-content-pad exhibit-list-body">
          <div className="exhibit-list-sort-row">
            {/* 담은 전시 개수는 불러온 만큼이 아니라 전체 건수(totalCount)다. */}
            <span className="exhibit-list-count text-body-2-regular">전시 {totalCount}</span>
            <SortDropdown value={sort} onChange={setSort} options={SORT_OPTIONS} />
          </div>
          {isLoading ? (
            <p className="exhibit-list-loading text-body-1-regular">불러오는 중...</p>
          ) : items.length === 0 ? (
            <p className="exhibit-list-empty text-body-1-regular">아직 관심 등록한 전시가 없어요</p>
          ) : (
            <>
              <div className="exhibit-list-items">
                {items.map((exhibition) => (
                  <ExhibitCard
                    key={exhibition.exhibitionId}
                    type="list"
                    exhibitionId={exhibition.exhibitionId}
                    thumbnail={exhibition.posterUrl}
                    title={exhibition.title}
                    artistSummary={exhibition.artistSummary}
                    place={exhibition.place}
                    region={exhibition.region}
                    startDate={exhibition.startDate}
                    endDate={exhibition.endDate}
                    dateRange={formatShortDateRange(exhibition.startDate, exhibition.endDate)}
                    bookmarked
                    onUnbookmark={handleUnbookmark}
                  />
                ))}
              </div>
              <div ref={sentinelRef} className="exhibit-list-sentinel" />
              {isLoadingMore && <p className="exhibit-list-loading-more text-body-2-regular">불러오는 중...</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
