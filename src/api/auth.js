import axiosInstance from "@utils/axiosInstance";

// 소셜 로그인 (가입 겸용)
export const login = async (provider, code) => {
  const data = await axiosInstance.post(`/auth/login/${provider}`, {
    code,
    redirectUri: import.meta.env.VITE_KAKAO_REDIRECT_URI,
  });
  return data;
};

// 로그아웃
export const logout = async () => {
  const data = await axiosInstance.post("/auth/logout");
  return data;
};

// 토큰 재발급 (공통처리예정)
export const refresh = async () => {
  const data = await axiosInstance.post("/auth/refresh");
  return data;
};
