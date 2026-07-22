// 아카이브 페이지 — 기록 / 리마인드 두 탭
import { useCallback, useEffect, useRef, useState } from "react";

// components
import Header from "@components/common/Header";
import Footer from "@components/common/Footer";
import SortDropdown from "@components/layout/SortDropdown";
import ExhibitCard from "@components/exhibition/ExhibitCard";

// api
import { getRecordList } from "@api/record";
import { getRemindList } from "@api/remind";

// utils
import { SORT_OPTIONS } from "@utils/filterCodes";

const PAGE_SIZE = 20;

// 탭마다 조회 함수와 정렬 키가 다르다. 나머지 페이지네이션 흐름은 공통.
const TABS = {
  record: {
    label: "기록",
    fetch: getRecordList,
    sortParam: { latest: "viewedAt,desc", oldest: "viewedAt,asc" },
    emptyText: "아직 남긴 기록이 없어요",
  },
  remind: {
    label: "리마인드",
    fetch: getRemindList,
    sortParam: { latest: "createdAt,desc", oldest: "createdAt,asc" },
    emptyText: "아직 남긴 리마인드가 없어요",
  },
};

export default function ArchivePage() {
  const [tab, setTab] = useState("record");
  const [sort, setSort] = useState("latest");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  const config = TABS[tab];

  useEffect(() => {
    let ignore = false;

    (async () => {
      setIsLoading(true);
      try {
        const response = await config.fetch({ sort: config.sortParam[sort], size: PAGE_SIZE, page: 0 });
        if (ignore) return;
        const data = response.data.data;
        const content = data.content ?? [];
        setItems(content);
        setPage(0);
        setTotalCount(data.totalElements ?? content.length);
        setHasNext(!!data.hasNext);
      } catch (error) {
        console.log(error);
        if (!ignore) {
          setItems([]);
          setTotalCount(0);
          setHasNext(false);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [config, sort]);

  const loadMore = useCallback(async () => {
    if (!hasNext || isLoadingMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const response = await config.fetch({ sort: config.sortParam[sort], size: PAGE_SIZE, page: nextPage });
      const data = response.data.data;
      setItems((prev) => [...prev, ...(data.content ?? [])]);
      setPage(nextPage);
      setHasNext(!!data.hasNext);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [config, sort, page, hasNext, isLoadingMore]);

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

  const handleTabChange = (nextTab) => {
    if (nextTab === tab) return;
    setTab(nextTab);
    setItems([]);
    setTotalCount(0);
  };

  return (
    <div className="app-shell">
      <Header type="notification" title="아카이브" />
      <div className="app-content">
        <div className="archive-tabs" role="tablist">
          {Object.entries(TABS).map(([key, value]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`archive-tab text-body-1-medium${tab === key ? " is-active" : ""}`}
              onClick={() => handleTabChange(key)}
            >
              {value.label}
            </button>
          ))}
        </div>

        <div className="app-content-pad archive-body">
          <div className="archive-sort-row">
            <span className="archive-count text-body-2-regular">
              {config.label} {totalCount}
            </span>
            <SortDropdown value={sort} onChange={setSort} options={SORT_OPTIONS} />
          </div>

          {isLoading ? (
            <p className="archive-loading text-body-1-regular">불러오는 중...</p>
          ) : items.length === 0 ? (
            <p className="archive-empty text-body-1-regular">{config.emptyText}</p>
          ) : (
            <>
              <div className="archive-grid">
                {tab === "record"
                  ? items.map((record) => (
                      <ExhibitCard
                        key={record.recordId}
                        type="vertical"
                        recordId={record.recordId}
                        thumbnail={record.exhibitionPosterUrl}
                        viewedAt={record.viewedAt}
                        title={record.exhibitionTitle}
                        emotionCodes={record.emotionCodes}
                      />
                    ))
                  : items.map((remind) => (
                      <ExhibitCard
                        key={remind.remindId}
                        type="vertical"
                        recordId={remind.recordId}
                        remindId={remind.remindId}
                        thumbnail={remind.posterUrl}
                        viewedAt={remind.viewedAt}
                        title={remind.exhibitionTitle}
                        emotionCodes={remind.emotionCodes}
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
