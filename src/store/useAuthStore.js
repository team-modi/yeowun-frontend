import { create } from "zustand";

import { getUserInfo } from "@api/user";

// 로그아웃 상태에서는 401/refresh 요청이 아예 나가지 않는다.
const LOGGED_OUT_HINT_KEY = "yeowun:loggedOut";

const hasLoggedOutHint = () => {
  try {
    return localStorage.getItem(LOGGED_OUT_HINT_KEY) === "1";
  } catch {
    return false;
  }
};

const writeLoggedOutHint = (isLoggedOut) => {
  try {
    if (isLoggedOut) localStorage.setItem(LOGGED_OUT_HINT_KEY, "1");
    else localStorage.removeItem(LOGGED_OUT_HINT_KEY);
  } catch {
    // 시크릿 모드 등 localStorage를 못 쓰는 환경
  }
};

// 로그인 여부를 앱 전체에서 공유
export const useAuthStore = create((set, get) => ({
  isLoggedIn: false,
  isChecked: false,
  _checkPromise: null,

  checkAuth: () => {
    const state = get();
    if (state.isChecked) return Promise.resolve(state.isLoggedIn);
    if (state._checkPromise) return state._checkPromise;

    if (hasLoggedOutHint()) {
      set({ isLoggedIn: false, isChecked: true, _checkPromise: null });
      return Promise.resolve(false);
    }

    const promise = (async () => {
      try {
        await getUserInfo();
        writeLoggedOutHint(false);
        set({ isLoggedIn: true, isChecked: true, _checkPromise: null });
        return true;
      } catch {
        writeLoggedOutHint(true);
        set({ isLoggedIn: false, isChecked: true, _checkPromise: null });
        return false;
      }
    })();

    set({ _checkPromise: promise });
    return promise;
  },

  setLoggedIn: (value) => {
    writeLoggedOutHint(!value);
    set({ isLoggedIn: value, isChecked: true, _checkPromise: null });
  },
}));
