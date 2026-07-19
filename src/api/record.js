import axiosInstance from "@utils/axiosInstance";

// 내 기록 목록 조회
export const getRecordList = async (params) => {
  const data = await axiosInstance.get("/records", { params });
  return data;
};

// 기록 상세 조회
export const getDetailRecord = async (recordId) => {
  const data = await axiosInstance.get(`/records/${recordId}`);
  return data;
};

// 기록 작성
export const addRecord = async (params) => {
  const data = await axiosInstance.post("/records", params);
  return data;
};

// 기록 수정
// PUT은 부분 patch가 아니라 완전 교체라 media를 안 보내면 기존 사진/영상이 다 지워짐 => 사진을 유지하기위해 호출부가 현재 media를 다시 조회해서 그대로 같이 실어보냄
export const updateRecord = async (recordId, params) => {
  const data = await axiosInstance.put(`/records/${recordId}`, params);
  return data;
};

// 기록 삭제
export const deleteRecord = async (recordId) => {
  const data = await axiosInstance.delete(`/records/${recordId}`);
  return data;
};

// 기록 북마크
export const addBookmark = async (recordId) => {
  const data = await axiosInstance.post(`/records/${recordId}/bookmark`);
  return data;
};

// 기록 북마크 해제
export const deleteBookmark = async (recordId) => {
  const data = await axiosInstance.delete(`/records/${recordId}/bookmark`);
  return data;
};

// 내가 다녀온 전시 목록
export const getVisitedExhibitions = async (params) => {
  const data = await axiosInstance.get("/records/exhibitions/visited", { params });
  return data;
};

// Q&A 답변 기반 감상문 본문 생성 (AI)
export const composeRecord = async (exhibitionId, answers) => {
  const data = await axiosInstance.post("/records/ai/compose", { exhibitionId, answers });
  return data;
};

// 전시 정보 기반 감상 질문 3개 생성 (AI)
export const getRecordQuestions = async (exhibitionId) => {
  const data = await axiosInstance.post("/records/ai/questions", { exhibitionId });
  return data;
};
