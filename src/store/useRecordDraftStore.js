import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// RecordPage(전시 정보 입력) ~ RecordCompletePage(저장 완료)까지 이어지는
// "기록 작성" 멀티스텝 플로우 동안의 임시 상태를 들고 있는 스토어.
// 여러 페이지(라우트)를 오가며 값을 유지해야 해서 zustand로 관리함(props/location.state 릴레이 방지).
//
// sessionStorage에 persist 해서 새로고침에도 작성 중이던 값이 복원된다(탭을 닫으면 사라짐).
// 이 덕에 "임시저장 복원"을 서버 호출 없이 로컬에서 처리한다 — 키 입력마다 서버에 저장하지 않는다.
// reset()이 initialState를 쓰면 sessionStorage도 함께 비워진다(작성 완료 시).
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

export const useRecordDraftStore = create(
  persist(
    (set) => ({
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
    }),
    {
      name: "record-draft",
      storage: createJSONStorage(() => sessionStorage),
      // 데이터만 저장(액션 함수 제외).
      partialize: (state) => ({
        exhibitionDraft: state.exhibitionDraft,
        exhibitionId: state.exhibitionId,
        mode: state.mode,
        content: state.content,
        questions: state.questions,
        answers: state.answers,
        recordId: state.recordId,
        viewedAt: state.viewedAt,
        emotionCodes: state.emotionCodes,
        media: state.media,
      }),
    },
  ),
);
