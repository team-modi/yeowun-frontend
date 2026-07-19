import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";

// api
import { getNotificationList, readNotification } from "@api/notification";

// utils
import { formatElapsed } from "@utils/common";

// styles
import "@styles/notificationPage.css";

const PAGE_SIZE = 20;
const TABS = [
  { key: "REMIND", label: "오늘의 여운" },
  { key: "EXHIBITION", label: "전시" },
];

export default function NotificationPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("REMIND");
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
        const response = await getNotificationList({ type: tab, size: PAGE_SIZE });
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
  }, [tab]);

  const loadMore = useCallback(async () => {
    if (!hasNext || isLoadingMore || !cursor) return;
    setIsLoadingMore(true);
    try {
      const response = await getNotificationList({ type: tab, size: PAGE_SIZE, cursor });
      const data = response.data.data;
      setItems((prev) => [...prev, ...(data.content ?? [])]);
      setCursor(data.nextCursor ?? null);
      setHasNext(!!data.hasNext);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [tab, cursor, hasNext, isLoadingMore]);

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

  const handleItemClick = async (item) => {
    if (!item.read) {
      setItems((prev) =>
        prev.map((row) => (row.notificationId === item.notificationId ? { ...row, read: true } : row)),
      );
      try {
        await readNotification(item.notificationId);
      } catch (error) {
        console.log(error);
      }
    }

    if (item.type === "REMIND" && item.targetId) {
      navigate(`/record/${item.targetId}`);
    } else if (item.type === "EXHIBITION" && item.targetId) {
      navigate(`/exhibition/${item.targetId}`);
    }
  };

  return (
    <div className="app-shell">
      <Header type="sub" title="알림" />
      <div className="app-content">
        <div className="notification-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`notification-tab text-body-1-medium${tab === t.key ? " is-active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="app-content-pad notification-body">
          {isLoading ? (
            <p className="notification-loading text-body-1-regular">불러오는 중...</p>
          ) : items.length === 0 ? (
            <p className="notification-empty text-body-1-regular">알림이 없어요</p>
          ) : (
            <>
              <div className="notification-list">
                {items.map((item) => (
                  <button
                    type="button"
                    key={item.notificationId}
                    className={`notification-card${item.read ? "" : " is-unread"}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div
                      className="notification-card-thumb"
                      style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined}
                    />
                    <div className="notification-card-body">
                      <div className="notification-card-head">
                        <span className="notification-card-title text-label-1">{item.title}</span>
                        <span className="notification-card-time text-caption-2">{formatElapsed(item.createdAt)}</span>
                      </div>
                      <p className="notification-card-message text-body-2-regular">{item.body}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div ref={sentinelRef} className="notification-sentinel" />
              {isLoadingMore && <p className="notification-loading-more text-body-2-regular">불러오는 중...</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
