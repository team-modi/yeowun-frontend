import { useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";

// api
import { addRecord, composeRecord } from "@api/record";

// store
import { useRecordDraftStore } from "@store/useRecordDraftStore";

// styles
import "@styles/record/RecordComposePage.css";

const MAX_LENGTH = 300;

export default function RecordComposePage() {
  const navigate = useNavigate();
  const exhibitionId = useRecordDraftStore((state) => state.exhibitionId);
  const questions = useRecordDraftStore((state) => state.questions);
  const answers = useRecordDraftStore((state) => state.answers);
  const content = useRecordDraftStore((state) => state.content);
  const setContent = useRecordDraftStore((state) => state.setContent);
  const setRecordId = useRecordDraftStore((state) => state.setRecordId);
  const viewedAt = useRecordDraftStore((state) => state.viewedAt);
  const emotionCodes = useRecordDraftStore((state) => state.emotionCodes);
  const media = useRecordDraftStore((state) => state.media);

  const [isRefining, setIsRefining] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRefine = async () => {
    setIsRefining(true);
    try {
      const response = await composeRecord(
        exhibitionId,
        questions.map((question, index) => ({ question, answer: answers[index] })),
      );
      const composedText = response.data.data.content ?? response.data.data.text ?? "";
      setContent(composedText);
    } catch (error) {
      console.log(error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 직접작성(RecordWritePage)과 대칭되는 writeMode 구분 (백엔드 확인 필요)
      const response = await addRecord({
        exhibitionId,
        writeMode: "AI",
        viewedAt,
        content,
        emotionCodes,
        media,
      });
      setRecordId(response.data.data?.recordId ?? null);
      navigate("/record/complete");
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <Header type="sub" title="기록 작성" onBack={() => navigate(-1)} />
      <div className="app-content">
        <div className="app-content-pad record-compose">
          <h1 className="record-compose-title text-title-3">
            AI가 당신의 답변을 바탕으로
            <br />
            감상문을 정리했어요
          </h1>
          <p className="record-compose-subtitle text-body-2-regular">
            AI에게 다시 정리를 요청하거나,
            <br />
            글을 눌러 직접 수정할 수 있어요
          </p>

          <div className="record-compose-box">
            <textarea
              className="record-compose-textarea text-body-1-regular"
              value={content}
              maxLength={MAX_LENGTH}
              onChange={(event) => setContent(event.target.value)}
            />
            <span className="record-compose-count text-caption-1">
              {content.length}/{MAX_LENGTH}
            </span>
          </div>

          <button
            type="button"
            className="record-compose-refine text-body-2-regular"
            disabled={isRefining}
            onClick={handleRefine}
          >
            <RefreshIcon /> {isRefining ? "다듬는 중…" : "다시 다듬기"}
          </button>
        </div>
      </div>

      <div className="record-compose-footer">
        <button type="button" className="record-compose-prev text-body-1-medium" onClick={() => navigate(-1)}>
          이전
        </button>
        <button
          type="button"
          className="record-compose-submit text-body-1-medium"
          disabled={!content.trim() || isSubmitting}
          onClick={handleSubmit}
        >
          작성 완료
        </button>
      </div>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 11A8 8 0 1 0 18.5 16M20 11V5M20 11H14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
