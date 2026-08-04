import { create } from "zustand";

import { getUserInfo } from "@api/user";

// 로그아웃 상태에서는 401/refresh 요청이 아예 나가지 않는다.
const AUTH_HINT_KEY = "yeowun:hasSession";

const hasAuthHint = () => {
  try {
    return localStorage.getItem(AUTH_HINT_KEY) === "1";
  } catch {
    return false;
  }
};

const writeAuthHint = (value) => {
  try {
    if (value) localStorage.setItem(AUTH_HINT_KEY, "1");
    else localStorage.removeItem(AUTH_HINT_KEY);
  } catch {
    // 시크릿 모드 등 localStrage를 못 쓰는 환경
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

    if (!hasAuthHint()) {
      set({ isLoggedIn: false, isChecked: true, _checkPromise: null });
      return Promise.resolve(false);
    }

    const promise = (async () => {
      try {
        await getUserInfo();
        set({ isLoggedIn: true, isChecked: true, _checkPromise: null });
        return true;
      } catch {
        writeAuthHint(false);
        set({ isLoggedIn: false, isChecked: true, _checkPromise: null });
        return false;
      }
    })();

    set({ _checkPromise: promise });
    return promise;
  },

  setLoggedIn: (value) => {
    writeAuthHint(value);
    set({ isLoggedIn: value, isChecked: true, _checkPromise: null });
  },
}));
