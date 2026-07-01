import axiosInstance from "@utils/axiosInstance";

// 전시 목록/탐색
export const getExhibitionList = async () => {
  const data = await axiosInstance.get("/exhibitions");
  return data;
};

// 전시 상세
export const getDetailExhibition = async (exhibitionId) => {
  const data = await axiosInstance.get(`/exhibitions/${exhibitionId}`);
  return data;
};
