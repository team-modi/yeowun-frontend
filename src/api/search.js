import axiosInstance from "@utils/axiosInstance";

// 최근 검색어 목록(최신순 최대 10). 회원 전용.
export const getSearchHistory = async () => {
  const data = await axiosInstance.get("/users/me/search-history");
  return data;
};

// 검색어 기록. 검색이 확정된 시점(엔터·검색 버튼)에만 호출한다 —
// 목록 조회 API는 기록을 남기지 않으므로 타이핑 중간 입력이 쌓이지 않는다.
export const recordSearchHistory = async (keyword) => {
  const data = await axiosInstance.post("/users/me/search-history", { keyword });
  return data;
};

// 검색어 개별 삭제
export const deleteSearchHistory = async (searchHistoryId) => {
  const data = await axiosInstance.delete(`/users/me/search-history/${searchHistoryId}`);
  return data;
};

// 검색어 전체 삭제
export const deleteAllSearchHistory = async () => {
  const data = await axiosInstance.delete("/users/me/search-history");
  return data;
};
