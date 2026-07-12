import { create } from "zustand";

// RecordPage(전시 정보 입력) ~ RecordCompletePage(저장 완료)까지 이어지는
// "기록 작성" 멀티스텝 플로우 동안의 임시 상태를 들고 있는 스토어.
// 여러 페이지(라우트)를 오가며 값을 유지해야 해서 zustand로 관리함(props/location.state 릴레이 방지).
const initialState = {
  exhibitionDraft: null, // RecordPage에서 입력한 { title, venue, period, exhibitionType, genre, posterFile, posterPreviewUrl }
  exhibitionId: null, // addPersonalExhibition(POST /exhibitions/custom/) 응답으로 받은 실제 전시 id — POST /records의 exhibitionId로 사용
  mode: null, // "direct" | "ai"
  content: "", // 직접 작성 본문 또는 AI가 정리한 최종 본문
  questions: [], // 질문으로 작성 모드에서 사용하는 질문 3개
  answers: ["", "", ""],
  recordId: null, // 저장 완료 후 상세 페이지 이동용
  viewedAt: null, // 관람일 (YYYY-MM-DD)
  emotionCodes: [], // 선택한 감정 키워드 문자열 배열
  media: [], // [{ type: "PHOTO"|"VIDEO", url, sizeBytes, sortOrder }]
};

export const useRecordDraftStore = create((set) => ({
  ...initialState,

  setExhibitionDraft: (draft) => set({ exhibitionDraft: draft }),
  setExhibitionId: (exhibitionId) => set({ exhibitionId }),
  setMode: (mode) => set({ mode }),
  setContent: (content) => set({ content }),
  setQuestions: (questions) => set({ questions }),
  setAnswer: (index, answer) =>
    set((state) => {
      const nextAnswers = [...state.answers];
      nextAnswers[index] = answer;
      return { answers: nextAnswers };
    }),
  setRecordId: (recordId) => set({ recordId }),
  setViewedAt: (viewedAt) => set({ viewedAt }),
  setEmotionCodes: (emotionCodes) => set({ emotionCodes }),
  setMedia: (media) => set({ media }),
  reset: () => set(initialState),
}));
