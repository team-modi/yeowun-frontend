import { useCallback, useEffect, useRef, useState } from "react";

// components
import Header from "@components/common/Header";
import SortDropdown from "@components/layout/SortDropdown";
import ExhibitCard from "@components/exhibition/ExhibitCard";

// api
import { getVisitedExhibitions } from "@api/record";

// utils
import { formatShortDateRange } from "@utils/common";

// styles
import "@styles/profile/exhibitionListPage.css";

const PAGE_SIZE = 20;
const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된 순" },
];
const SORT_PARAM = { latest: "viewedAt,desc", oldest: "viewedAt,asc" };

export default function VisitedExhibitionsPage() {
  const [sort, setSort] = useState("latest");
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    let ignore = false;

    (async () => {
      setIsLoading(true);
      try {
        const response = await getVisitedExhibitions({ sort: SORT_PARAM[sort], size: PAGE_SIZE, page: 0 });
        if (ignore) return;
        const data = response.data.data;
        setRecords(data.content ?? []);
        setPage(0);
        setHasNext(!!data.hasNext);
      } catch (error) {
        console.log(error);
        if (!ignore) {
          setRecords([]);
          setHasNext(false);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [sort]);

  const loadMore = useCallback(async () => {
    if (!hasNext || isLoadingMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const response = await getVisitedExhibitions({ sort: SORT_PARAM[sort], size: PAGE_SIZE, page: nextPage });
      const data = response.data.data;
      setRecords((prev) => [...prev, ...(data.content ?? [])]);
      setPage(nextPage);
      setHasNext(!!data.hasNext);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [sort, page, hasNext, isLoadingMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="app-shell">
      <Header type="sub" title="기록한 전시" />
      <div className="app-content">
        <div className="app-content-pad exhibit-list-body">
          <div className="exhibit-list-sort-row">
            <span className="exhibit-list-count text-body-2-regular">전시 {records.length}</span>
            <SortDropdown value={sort} onChange={setSort} options={SORT_OPTIONS} />
          </div>
          {isLoading ? (
            <p className="exhibit-list-loading text-body-1-regular">불러오는 중...</p>
          ) : records.length === 0 ? (
            <p className="exhibit-list-empty text-body-1-regular">아직 기록한 전시가 없어요</p>
          ) : (
            <>
              <div className="exhibit-list-items">
                {records.map((record) => (
                  <ExhibitCard
                    key={record.recordId}
                    type="list"
                    exhibitionId={record.exhibitionId}
                    thumbnail={record.exhibitionPosterUrl}
                    title={record.exhibitionTitle}
                    artistSummary={record.exhibitionArtist ?? record.artistSummary}
                    place={record.exhibitionPlace}
                    region={record.exhibitionRegion}
                    startDate={record.exhibitionStartDate}
                    endDate={record.exhibitionEndDate}
                    dateRange={formatShortDateRange(record.exhibitionStartDate, record.exhibitionEndDate)}
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
