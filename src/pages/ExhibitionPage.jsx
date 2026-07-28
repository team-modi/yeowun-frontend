// 전시탐색 페이지
import { useCallback, useEffect, useRef, useState } from "react";

// components
import Header from "@components/common/Header";
import Footer from "@components/common/Footer";
import ExhibitionList from "@components/layout/ExhibitionList";
import SearchBox from "@components/layout/SearchBox";
import RecentSearchList from "@components/exhibition/RecentSearchList";
import RemindEntryBanner from "@components/remind/RemindEntryBanner";

// api
import { getSearchHistory, recordSearchHistory, deleteSearchHistory, deleteAllSearchHistory } from "@api/search";

// utils
import { useIsLoggedIn } from "@utils/useIsLoggedIn";

const ExhibitionPage = () => {
  const isLoggedIn = useIsLoggedIn();
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchAreaRef = useRef(null);

  // 최근 검색어는 회원 전용이다. 비로그인은 목록을 부르지도, 보여주지도 않는다.
  const loadRecentSearches = useCallback(async () => {
    if (!isLoggedIn) {
      setRecentSearches([]);
      return;
    }
    try {
      const response = await getSearchHistory();
      setRecentSearches(response.data.data.content ?? []);
    } catch (error) {
      console.log(error);
    }
  }, [isLoggedIn]);

  // 최초 진입·로그인 상태 변화 시 목록을 채운다. setState는 async 안에서만 일어나게 둔다
  // (effect 본문에서 동기적으로 부르면 연쇄 렌더를 만든다).
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!isLoggedIn) {
        if (!ignore) setRecentSearches([]);
        return;
      }
      try {
        const response = await getSearchHistory();
        if (!ignore) setRecentSearches(response.data.data.content ?? []);
      } catch (error) {
        console.log(error);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [isLoggedIn]);

  /**
   * 검색 확정(엔터·검색 버튼) 시점에만 기록한다. 목록 조회 API는 기록을 남기지 않으므로
   * 타이핑 중간 입력("전", "전시")이 쌓이지 않는다.
   */
  const handleSearch = async (value) => {
    const trimmed = (value ?? "").trim();
    setSearchKeyword(trimmed);
    if (!isLoggedIn || trimmed.length < 2) return;

    try {
      await recordSearchHistory(trimmed);
      await loadRecentSearches(); // 방금 검색어가 맨 위로 온다
    } catch (error) {
      console.log(error); // 기록 실패가 검색을 막지는 않는다
    }
  };

  const handleSelectRecent = (selected) => {
    setKeyword(selected);
    setIsSearchFocused(false); // 고른 순간 검색이 실행되니 목록은 닫는다
    handleSearch(selected);
  };

  const handleRemoveRecent = async (searchHistoryId) => {
    setRecentSearches((prev) => prev.filter((item) => item.searchHistoryId !== searchHistoryId));
    try {
      await deleteSearchHistory(searchHistoryId);
    } catch (error) {
      console.log(error);
      loadRecentSearches(); // 실패하면 서버 상태로 되돌린다
    }
  };

  const handleClearRecent = async () => {
    const snapshot = recentSearches;
    setRecentSearches([]);
    try {
      await deleteAllSearchHistory();
    } catch (error) {
      console.log(error);
      setRecentSearches(snapshot);
    }
  };

  /**
   * 바깥 클릭으로 닫는다.
   *
   * blur(focusout)로 닫으면 <b>포커스가 이미 없는 상태</b>를 놓친다. 검색 후 지우기(×) 버튼을 누르면
   * 그 버튼이 곧바로 사라지면서 포커스가 body로 빠지는데, 그 뒤 다른 곳을 눌러도 blur가 다시 오지 않아
   * 목록이 그대로 남았다. 포인터가 영역 밖에 떨어졌는지를 직접 보는 편이 포커스 이동에 의존하지 않아 정확하다.
   */
  useEffect(() => {
    if (!isSearchFocused) return undefined;
    const closeOnOutside = (event) => {
      if (!searchAreaRef.current?.contains(event.target)) setIsSearchFocused(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsSearchFocused(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isSearchFocused]);

  // 검색하려고 검색창을 눌렀을 때만 띄운다. 입력이 시작되면 결과가 그 자리를 차지해야 하므로 다시 감춘다.
  const showRecentSearches = isLoggedIn && isSearchFocused && keyword.trim().length === 0;

  return (
    <div className="app-shell">
      <Header type="bookmark" title="전시탐색" />
      <div className="app-content">
        <div className="app-content-pad exhibition-body">
          {/*
            검색창과 최근 검색어를 한 컨테이너로 묶는다. 열기는 포커스로, 닫기는 바깥 클릭으로 본다
            (위 effect 참고). 목록 항목·지우기 버튼도 이 안에 있어 눌러도 닫히지 않는다.
          */}
          <div className="exhibition-search-area" ref={searchAreaRef} onFocus={() => setIsSearchFocused(true)}>
            <SearchBox
              value={keyword}
              onChange={setKeyword}
              onSubmit={handleSearch}
              onFocus={() => setIsSearchFocused(true)}
              onClear={() => {
                setKeyword("");
                setSearchKeyword("");
                setIsSearchFocused(false); // 지우기는 "검색을 접는" 동작 — 최근 검색어를 다시 펼치지 않는다
              }}
              placeholder="전시명, 작가명, 장소를 검색해보세요"
            />
            {showRecentSearches && (
              <RecentSearchList
                items={recentSearches}
                onSelect={handleSelectRecent}
                onRemove={handleRemoveRecent}
                onClearAll={handleClearRecent}
              />
            )}
          </div>
          {isLoggedIn && <RemindEntryBanner />}
          <ExhibitionList data={{ keyword: searchKeyword }} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ExhibitionPage;
