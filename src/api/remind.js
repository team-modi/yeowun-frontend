import axiosInstance from "@utils/axiosInstance";

// 리마인드 목록 조회
export const getRemindList = async (params) => {
  const data = await axiosInstance.get("/reminds", { params });
  return data;
};

// 리마인드 저장
export const addRemind = async (params) => {
  const data = await axiosInstance.post("/reminds", params);
  return data;
};

// 오늘의 소환 대상 조회
export const getRemindCandidate = async () => {
  const data = await axiosInstance.get("/reminds/candidate");
  return data;
};

// 리마인드 상세(감정 변화 요약) 조회
export const getDetailRemind = async (remindId) => {
  const data = await axiosInstance.get(`/reminds/${remindId}`);
  return data;
};

// 리마인드(여운) 삭제 — 원본 기록은 유지하고 이 여운만 지운다.
export const deleteRemind = async (remindId) => {
  const data = await axiosInstance.delete(`/reminds/${remindId}`);
  return data;
};
