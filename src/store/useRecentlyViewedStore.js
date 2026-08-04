import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// "최근 살펴본 전시" 목록. 로그인 여부와 무관하게 기기에 남아야 하므로 localStorage에 저장한다.
const MAX_RECENTLY_VIEWED = 10;

export const useRecentlyViewedStore = create(
  persist(
    (set) => ({
      items: [], // { exhibitionId, title, posterUrl, place, startDate, endDate }

      // 전시 상세를 볼 때마다 호출한다. 이미 있던 항목이면 맨 앞으로 다시 올린다.
      addRecentlyViewed: (exhibition) =>
        set((state) => {
          if (!exhibition?.exhibitionId) return state;
          const withoutDuplicate = state.items.filter((item) => item.exhibitionId !== exhibition.exhibitionId);
          return { items: [exhibition, ...withoutDuplicate].slice(0, MAX_RECENTLY_VIEWED) };
        }),

      clearRecentlyViewed: () => set({ items: [] }),
    }),
    {
      name: "exhibition-recently-viewed",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
