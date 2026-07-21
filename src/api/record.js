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

// 감상문 본문 생성(SSE 스트리밍) — 토큰이 생성되는 대로 onDelta 로 흘려 체감 지연을 줄인다.
// axios는 스트림 소비가 어려워 fetch + ReadableStream 으로 직접 SSE 를 파싱한다.
// 서버 이벤트: delta(생성 조각) 여러 번 → done(완료) | error(사용자 메시지).
export const composeRecordStream = async (exhibitionId, answers, { onDelta, signal } = {}) => {
  const response = await fetch("/api/v1/records/ai/compose/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    credentials: "include",
    body: JSON.stringify({ exhibitionId, answers }),
    signal,
  });

  // 스트림이 시작되기 전 실패(401/500 등) — 서버 메시지를 최대한 살려 에러를 던진다.
  if (!response.ok || !response.body) {
    let message;
    try {
      message = (await response.json())?.message;
    } catch {
      message = undefined;
    }
    const error = new Error(message ?? "AI 응답 생성에 실패했어요.");
    error.userMessage = message;
    error.response = { status: response.status, data: { message } };
    throw error;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let errorMessage = null;
  let finished = false;

  while (!finished) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary;
    // SSE 이벤트 경계는 빈 줄(\n\n).
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const { event, data } = parseSseEvent(rawEvent);
      if (event === "delta") onDelta?.(data);
      else if (event === "done") finished = true;
      else if (event === "error") errorMessage = data;
    }
  }

  if (errorMessage) {
    const error = new Error(errorMessage);
    error.userMessage = errorMessage;
    throw error;
  }
};

function parseSseEvent(raw) {
  let event = "message";
  const dataLines = [];
  for (const line of raw.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    // data 필드는 여러 줄일 수 있고, 각 줄의 선행 공백 1칸은 규격상 제거한다.
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).replace(/^ /, ""));
  }
  return { event, data: dataLines.join("\n") };
}

// 전시 정보 기반 감상 질문 3개 생성 (AI)
export const getRecordQuestions = async (exhibitionId) => {
  const data = await axiosInstance.post("/records/ai/questions", { exhibitionId });
  return data;
};

// 감상문 작성 임시저장(draft) 복원
export const getRecordDraft = async (exhibitionId) => {
  const data = await axiosInstance.get("/records/ai/draft", { params: { exhibitionId } });
  return data;
};

// 감상문 작성 임시저장(draft) 저장
export const saveRecordDraft = async (params) => {
  const data = await axiosInstance.put("/records/ai/draft", params);
  return data;
};

// 감상문 작성 임시저장(draft) 삭제
export const deleteRecordDraft = async (exhibitionId) => {
  const data = await axiosInstance.delete("/records/ai/draft", { params: { exhibitionId } });
  return data;
};
