// 로그인 여부 확인
import { useEffect } from "react";

import { useAuthStore } from "@store/useAuthStore";

export function useIsLoggedIn() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return isLoggedIn;
}
