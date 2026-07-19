// 아카이브 페이지
import { useCallback, useEffect, useRef, useState } from "react";

// components
import Header from "@components/common/Header";
import Footer from "@components/common/Footer";
import SortDropdown from "@components/layout/SortDropdown";
import ExhibitCard from "@components/exhibition/ExhibitCard";

// api
import { getRecordList } from "@api/record";

const PAGE_SIZE = 20;
const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
];

const SORT_PARAM = { latest: "viewedAt,desc", oldest: "viewedAt,asc" };

export default function ArchivePage() {
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
        const response = await getRecordList({ sort: SORT_PARAM[sort], size: PAGE_SIZE, page: 0 });
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
      const response = await getRecordList({ sort: SORT_PARAM[sort], size: PAGE_SIZE, page: nextPage });
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
      <Header type="archive" title="아카이브" />
      <div className="app-content">
        <div className="app-content-pad archive-body">
          <div className="archive-sort-row">
            <SortDropdown value={sort} onChange={setSort} options={SORT_OPTIONS} />
          </div>

          {isLoading ? (
            <p className="archive-loading text-body-1-regular">불러오는 중...</p>
          ) : records.length === 0 ? (
            <p className="archive-empty text-body-1-regular">아직 남긴 기록이 없어요</p>
          ) : (
            <>
              <div className="archive-grid">
                {records.map((record) => (
                  <ExhibitCard
                    key={record.recordId}
                    type="vertical"
                    recordId={record.recordId}
                    thumbnail={record.exhibitionPosterUrl}
                    viewedAt={record.viewedAt}
                    title={record.exhibitionTitle}
                    emotionCodes={record.emotionCodes}
                  />
                ))}
              </div>
              <div ref={sentinelRef} className="archive-sentinel" />
              {isLoadingMore && <p className="archive-loading-more text-body-2-regular">불러오는 중...</p>}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
