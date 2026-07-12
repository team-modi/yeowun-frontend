import axiosInstance from "@utils/axiosInstance";

// 전시 목록/탐색
export const getExhibitionList = async (params) => {
  const data = await axiosInstance.get("/exhibitions", { params });
  return data;
};

// 홈 배너 조회
export const getExhibitionBanners = async () => {
  const data = await axiosInstance.get("/exhibitions/banners");
  return data;
};

// 전시 상세
export const getDetailExhibition = async (exhibitionId) => {
  const data = await axiosInstance.get(`/exhibitions/${exhibitionId}`);
  return data;
};

// 개인 전시 등록(직접 추가) — body: CustomCreateRequest
// (OpenAPI 경로는 뒤 슬래시 없는 `/exhibitions/custom`. 슬래시가 붙으면 백엔드에서 404 가 난다)
export const addPersonalExhibition = async (params) => {
  const data = await axiosInstance.post("/exhibitions/custom", params);
  return data;
};

// 관심 전시 등록
export const addExhibitionBookmark = async (exhibitionId) => {
  const data = await axiosInstance.post(`/exhibitions/${exhibitionId}/bookmark`);
  return data;
};

// 관심 전시 해제
export const deleteExhibitionBookmark = async (exhibitionId) => {
  const data = await axiosInstance.delete(`/exhibitions/${exhibitionId}/bookmark`);
  return data;
};
