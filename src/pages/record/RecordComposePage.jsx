import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";

// api
import { addRecord, composeRecord, saveRecordDraft, deleteRecordDraft } from "@api/record";

// store
import { useRecordDraftStore } from "@store/useRecordDraftStore";
import { showToast } from "@store/useToastStore";

// util
import { aiErrorMessage } from "@utils/aiError";

// styles
import "@styles/record/RecordComposePage.css";

// icons
import refreshIcon from "@images/icons/Action/Refresh.svg";

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

  useEffect(() => {
    if (!exhibitionId || !content.trim()) return;

    const timer = setTimeout(() => {
      saveRecordDraft({
        exhibitionId,
        questions,
        answers: questions.map((question, index) => ({ question, answer: answers[index] ?? "" })),
        content,
      }).catch((error) => console.log(error));
    }, 600);

    return () => clearTimeout(timer);
  }, [exhibitionId, questions, answers, content]);

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
      showToast(aiErrorMessage(error));
    } finally {
      setIsRefining(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await addRecord({
        exhibitionId,
        writeMode: "AI",
        viewedAt,
        content,
        emotionCodes,
        media,
      });
      setRecordId(response.data.data?.recordId ?? null);
      deleteRecordDraft(exhibitionId).catch((error) => console.log(error));
      navigate("/record/complete");
    } catch (error) {
      console.log(error);
      showToast("기록 저장에 실패했어요. 다시 시도해 주세요.");
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
            <img src={refreshIcon} alt="" width={16} height={16} /> {isRefining ? "다듬는 중…" : "다시 다듬기"}
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
