// 아카이브 페이지 — 기록 / 리마인드 두 탭
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

// components
import Header from "@components/common/Header";
import Footer from "@components/common/Footer";
import SortDropdown from "@components/layout/SortDropdown";
import ExhibitCard from "@components/exhibition/ExhibitCard";
import RemindListItem from "@components/remind/RemindListItem";

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
  // 탭을 URL 쿼리에 실어, 상세로 갔다가 뒤로가도 보던 탭이 복원되게 한다.
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "remind" ? "remind" : "record";
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
    setItems([]);
    setTotalCount(0);
    // replace로 바꿔 탭 전환이 히스토리를 늘리지 않게 한다(뒤로가기는 아카이브 이전 화면으로).
    setSearchParams(nextTab === "remind" ? { tab: "remind" } : {}, { replace: true });
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
            <span className="archive-count text-body-2-regular">전체 {totalCount}</span>
            <SortDropdown value={sort} onChange={setSort} options={SORT_OPTIONS} />
          </div>

          {isLoading ? (
            <p className="archive-loading text-body-1-regular">불러오는 중...</p>
          ) : items.length === 0 ? (
            <p className="archive-empty text-body-1-regular">{config.emptyText}</p>
          ) : (
            <>
              {tab === "record" ? (
                <div className="archive-grid">
                  {items.map((record) => (
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
              ) : (
                <div className="archive-list">
                  {items.map((remind) => (
                    <RemindListItem key={remind.remindId} remind={remind} />
                  ))}
                </div>
              )}
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
