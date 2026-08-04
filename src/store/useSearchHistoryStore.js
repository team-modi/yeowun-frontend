import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 전시 탐색 페이지의 "최근 검색어" 상태.
// 로그인 여부와 무관하게 기기에 남아야 하는 값이라 localStorage에 persist한다
// (세션이 끝나도 유지 — sessionStorage를 쓰는 record-draft와는 다름).
// 최신 검색어가 배열 맨 앞에 오고, 최대 10개까지만 유지한다.
const MAX_HISTORY = 10;

export const useSearchHistoryStore = create(
  persist(
    (set) => ({
      history: [], // 최근 검색어 문자열 배열(최신순, 앞이 최신)

      // 검색어 추가: 이미 있던 동일 검색어는 지우고 맨 앞에 다시 추가(중복 방지 + 최신화).
      // 10개를 넘기면 가장 오래된(맨 뒤) 검색어부터 빠진다.
      addSearchTerm: (term) =>
        set((state) => {
          const trimmed = term?.trim();
          if (!trimmed) return state;
          const withoutDuplicate = state.history.filter((item) => item !== trimmed);
          return { history: [trimmed, ...withoutDuplicate].slice(0, MAX_HISTORY) };
        }),

      // 검색어 하나만 삭제
      removeSearchTerm: (term) =>
        set((state) => ({ history: state.history.filter((item) => item !== term) })),

      // 전체 삭제
      clearSearchHistory: () => set({ history: [] }),
    }),
    {
      name: "exhibition-search-history",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
