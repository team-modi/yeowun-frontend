import { create } from "zustand";

// 전역 토스트 한 개를 관리하는 스토어. show()로 띄우고 일정 시간 뒤 자동으로 사라진다.
// AI 호출 실패(특히 rate limit)처럼 조용히 삼키면 안 되는 피드백을 사용자에게 보여주는 용도.
const AUTO_HIDE_MS = 2500;

let hideTimer = null;

export const useToastStore = create((set) => ({
  message: "",
  visible: false,

  show: (message) => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ message, visible: true });
    hideTimer = setTimeout(() => set({ visible: false }), AUTO_HIDE_MS);
  },

  hide: () => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ visible: false });
  },
}));

/** 컴포넌트 밖(이벤트 핸들러 등)에서도 바로 부를 수 있는 헬퍼. */
export const showToast = (message) => useToastStore.getState().show(message);
