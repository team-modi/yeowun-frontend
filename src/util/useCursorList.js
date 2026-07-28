import { useCallback, useEffect, useRef, useState } from "react";

const EMPTY_ITEMS = [];

/**
 * 커서 페이지네이션 목록 훅.
 *
 * 서버의 커서 목록 API는 공통 봉투(CursorResponse)를 돌려준다.
 *
 *   { content, nextCursor, hasNext, totalCount }
 *
 * - content    이번 페이지 항목들
 * - nextCursor 다음 페이지를 요청할 때 그대로 되돌려 줄 opaque 토큰. 마지막 페이지면 null
 * - hasNext    다음 페이지 존재 여부
 * - totalCount 조건 기준 전체 건수("전시 N개" 표시용). 이번 페이지 길이가 아니다
 *
 * nextCursor를 이어 부르지 않으면 목록이 첫 페이지에서 멈추고, totalCount 대신 items.length를
 * 쓰면 "전시 20"처럼 실제보다 적은 수가 보인다. 그 둘을 이 훅이 한곳에서 처리한다.
 *
 * @param {(params: {size: number, cursor?: string}) => Promise<object>} fetchPage
 *        CursorResponse의 data 객체를 반환한다. <b>useCallback으로 감싸 넘긴다</b> —
 *        이 함수의 정체성이 곧 "언제 처음부터 다시 불러올지"다(정렬·필터·검색어가 바뀔 때).
 * @param {object}  options
 * @param {boolean} options.enabled  false면 호출하지 않고 빈 목록을 유지한다(검색어 입력 전 등)
 * @param {number}  options.pageSize 한 번에 가져올 개수
 */
export default function useCursorList(fetchPage, { enabled = true, pageSize = 20 } = {}) {
  const [items, setItems] = useState(EMPTY_ITEMS);
  const [cursor, setCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    let ignore = false;

    (async () => {
      if (!enabled) {
        if (ignore) return;
        setItems(EMPTY_ITEMS);
        setCursor(null);
        setHasNext(false);
        setTotalCount(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await fetchPage({ size: pageSize });
        if (ignore) return;
        setItems(data?.content ?? EMPTY_ITEMS);
        setCursor(data?.nextCursor ?? null);
        setHasNext(!!data?.hasNext);
        setTotalCount(data?.totalCount ?? 0);
      } catch (error) {
        console.log(error);
        if (ignore) return;
        setItems(EMPTY_ITEMS);
        setCursor(null);
        setHasNext(false);
        setTotalCount(0);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [fetchPage, enabled, pageSize]);

  const loadMore = useCallback(async () => {
    // 커서가 없으면 마지막 페이지다. 로딩 중 재진입은 같은 페이지를 두 번 붙이므로 막는다.
    if (!hasNext || isLoadingMore || !cursor) return;

    setIsLoadingMore(true);
    try {
      const data = await fetchPage({ size: pageSize, cursor });
      setItems((prev) => [...prev, ...(data?.content ?? EMPTY_ITEMS)]);
      setCursor(data?.nextCursor ?? null);
      setHasNext(!!data?.hasNext);
      if (typeof data?.totalCount === "number") setTotalCount(data.totalCount);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchPage, cursor, hasNext, isLoadingMore, pageSize]);

  // 목록 끝에 둔 빈 요소가 화면에 들어오면 다음 페이지를 부른다.
  // rootMargin으로 바닥에 닿기 전에 미리 당겨 스크롤이 끊기지 않게 한다.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loadMore]);

  return { items, setItems, totalCount, hasNext, isLoading, isLoadingMore, loadMore, sentinelRef };
}
