import axiosInstance from "@utils/axiosInstance";

// 전시 목록/탐색
export const getExhibitionList = async (params) => {
  const data = await axiosInstance.get("/exhibitions", { params });
  return data;
};

// 전시 상세
export const getDetailExhibition = async (exhibitionId) => {
  const data = await axiosInstance.get(`/exhibitions/${exhibitionId}`);
  return data;
};

// 개인 전시 등록
export const addPersonalExhibition = async (params) => {
  const data = await axiosInstance.post("/exhibitions/custom/", params);
  return data;
};
