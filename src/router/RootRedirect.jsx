import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

// store
import { useAuthStore } from "@store/useAuthStore";

export const REDIRECT_AFTER_LOGIN_KEY = "modi:redirectAfterLogin";

// 로그인 여부 확인은 useAuthStore가 앱 전체에서 공유
export default function RequireAuth({ children }) {
  const location = useLocation();
  const isChecked = useAuthStore((state) => state.isChecked);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isChecked) return null;

  if (!isLoggedIn) {
    sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  return children;
}
