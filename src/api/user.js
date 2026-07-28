import axiosInstance from "@utils/axiosInstance";

// 내 프로필 조회
export const getUserInfo = async () => {
  const data = await axiosInstance.get("/users/me");
  return data;
};

// 내 프로필 수정
export const updateUserInfo = async (params) => {
  const data = await axiosInstance.put("/users/me/profile", params);
  return data;
};

// 회원 탈퇴
export const withdrawUser = async () => {
  const data = await axiosInstance.delete("/users/me");
  return data;
};

// 내 관심 전시 목록 조회
export const getUserBookmarks = async (params) => {
  const data = await axiosInstance.get("/users/me/bookmarks", { params });
  return data;
};

// 알림 설정 조회
export const getNotificationSettings = async () => {
  const data = await axiosInstance.get("/users/me/notification-settings");
  return data;
};

// 알림 설정 수정
export const updateNotificationSettings = async (params) => {
  const data = await axiosInstance.put("/users/me/notification-settings", params);
  return data;
};

// 최근 검색어 목록 조회
export const getSearchHistory = async () => {
  const data = await axiosInstance.get("/users/me/search-history");
  return data;
};

// 검색어 기록
export const addSearchHistory = async (keyword) => {
  const data = await axiosInstance.post("/users/me/search-history", { keyword });
  return data;
};

// 검색어 전체 삭제
export const deleteAllSearchHistory = async () => {
  const data = await axiosInstance.delete("/users/me/search-history");
  return data;
};

// 검색 기록 하나 삭제
export const deleteSearchHistory = async (searchHistoryId) => {
  const data = await axiosInstance.delete(`/users/me/search-history/${searchHistoryId}`);
  return data;
};
