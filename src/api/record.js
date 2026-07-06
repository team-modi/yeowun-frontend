import axiosInstance from "@utils/axiosInstance";

// 내 기록 목록 조회
export const getRecordList = async () => {
  const data = await axiosInstance.get("/records");
  return data;
};

// 기록 상세 조회
export const getDetailRecord = async (recordId) => {
  const data = await axiosInstance.get(`/records/${recordId}`);
  return data;
};

// 기록 작성
export const addRecord = async () => {
  const data = await axiosInstance.post("/records");
  return data;
};

// 기록 수정
export const updateRecord = async (recordId) => {
  const data = await axiosInstance.put(`/records/${recordId}`);
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
  const data = await axiosInstance.get("/records/exhibitions/visited/", { params });
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
