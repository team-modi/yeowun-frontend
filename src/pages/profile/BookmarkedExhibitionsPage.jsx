import { useCallback, useEffect, useRef, useState } from "react";

// components
import Header from "@components/common/Header";
import SortDropdown from "@components/layout/SortDropdown";
import ExhibitCard from "@components/exhibition/ExhibitCard";

// api
import { getUserBookmarks } from "@api/user";

// utils
import { formatDateRange } from "@utils/common";

// styles
import "@styles/profile/exhibitionListPage.css";

const PAGE_SIZE = 20;
const SORT_OPTIONS = [
  { value: "latest", label: "담은 순" },
  { value: "ending", label: "종료임박순" },
];

export default function BookmarkedExhibitionsPage() {
  const [sort, setSort] = useState("latest");
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    let ignore = false;

    (async () => {
      setIsLoading(true);
      try {
        const response = await getUserBookmarks({ sort, size: PAGE_SIZE });
        if (ignore) return;
        const data = response.data.data;
        setItems(data.content ?? []);
        setCursor(data.nextCursor ?? null);
        setHasNext(!!data.hasNext);
      } catch (error) {
        console.log(error);
        if (!ignore) {
          setItems([]);
          setCursor(null);
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
    if (!hasNext || isLoadingMore || !cursor) return;
    setIsLoadingMore(true);
    try {
      const response = await getUserBookmarks({ sort, size: PAGE_SIZE, cursor });
      const data = response.data.data;
      setItems((prev) => [...prev, ...(data.content ?? [])]);
      setCursor(data.nextCursor ?? null);
      setHasNext(!!data.hasNext);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [sort, cursor, hasNext, isLoadingMore]);

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
      <Header type="sub" title="관심 전시" />
      <div className="app-content">
        <div className="app-content-pad exhibit-list-body">
          <div className="exhibit-list-sort-row">
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
                    exhibitionId={exhibition.exhibitionId}
                    thumbnail={exhibition.posterUrl}
                    title={exhibition.title}
                    place={exhibition.place}
                    startDate={exhibition.startDate}
                    endDate={exhibition.endDate}
                    dateRange={formatDateRange(exhibition.startDate, exhibition.endDate)}
                    artistSummary={exhibition.artistSummary}
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
