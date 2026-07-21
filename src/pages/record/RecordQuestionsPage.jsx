import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import StepDots from "@components/record/StepDots";

// api
import { getRecordQuestions, composeRecord, getRecordDraft, saveRecordDraft } from "@api/record";

// store
import { useRecordDraftStore } from "@store/useRecordDraftStore";
import { showToast } from "@store/useToastStore";

// util
import { aiErrorMessage } from "@utils/aiError";

// styles
import "@styles/record/RecordQuestionsPage.css";

// icons
import refreshIcon from "@images/icons/Action/Refresh.svg";

const MAX_LENGTH = 300;
const TOTAL_STEPS = 3;

export default function RecordQuestionsPage() {
  const navigate = useNavigate();
  const exhibitionId = useRecordDraftStore((state) => state.exhibitionId);
  const questions = useRecordDraftStore((state) => state.questions);
  const setQuestions = useRecordDraftStore((state) => state.setQuestions);
  const answers = useRecordDraftStore((state) => state.answers);
  const setAnswer = useRecordDraftStore((state) => state.setAnswer);
  const setContent = useRecordDraftStore((state) => state.setContent);

  const [step, setStep] = useState(0);
  const [isComposing, setIsComposing] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  useEffect(() => {
    let ignore = false;

    (async () => {
      setIsLoadingQuestions(true);
      try {
        const draftResponse = await getRecordDraft(exhibitionId);
        const draft = draftResponse.data.data;

        if (!ignore && draft?.exists && draft.questions?.length > 0) {
          setQuestions(draft.questions);
          const answerByQuestion = new Map((draft.answers ?? []).map((item) => [item.question, item.answer]));
          draft.questions.forEach((question, index) => {
            setAnswer(index, answerByQuestion.get(question) ?? "");
          });
          if (draft.content) setContent(draft.content);
          return;
        }

        const response = await getRecordQuestions(exhibitionId);
        if (!ignore) setQuestions(response.data.data.questions ?? response.data.data ?? []);
      } catch (error) {
        console.log(error);
        if (!ignore) showToast(aiErrorMessage(error));
      } finally {
        if (!ignore) setIsLoadingQuestions(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [exhibitionId, questions.length, setQuestions, setAnswer, setContent]);

  useEffect(() => {
    if (!exhibitionId || questions.length === 0) return;

    const timer = setTimeout(() => {
      saveRecordDraft({
        exhibitionId,
        questions,
        answers: questions.map((question, index) => ({ question, answer: answers[index] ?? "" })),
      }).catch((error) => console.log(error));
    }, 600);

    return () => clearTimeout(timer);
  }, [exhibitionId, questions, answers]);

  const handleShuffleQuestion = async () => {
    if (isShuffling) return; // 연타 방지 — 매 호출이 rate-limit 걸리는 유료 AI 요청
    setIsShuffling(true);
    try {
      const response = await getRecordQuestions(exhibitionId);
      const nextQuestions = response.data.data.questions ?? response.data.data ?? [];
      const replacement = nextQuestions[step];
      if (!replacement) return;

      const updated = [...questions];
      updated[step] = replacement;
      setQuestions(updated);
    } catch (error) {
      console.log(error);
      showToast(aiErrorMessage(error));
    } finally {
      setIsShuffling(false);
    }
  };

  const handlePrev = () => {
    if (step === 0) {
      navigate(-1);
      return;
    }
    setStep((prev) => prev - 1);
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((prev) => prev + 1);
      return;
    }

    setIsComposing(true);
    try {
      const response = await composeRecord(
        exhibitionId,
        questions.map((question, index) => ({ question, answer: answers[index] })),
      );
      const composedText = response.data.data.content ?? response.data.data.text ?? "";
      setContent(composedText);
      saveRecordDraft({
        exhibitionId,
        questions,
        answers: questions.map((question, index) => ({ question, answer: answers[index] ?? "" })),
        content: composedText,
      }).catch((error) => console.log(error));
      navigate("/record/compose");
    } catch (error) {
      console.log(error);
      showToast(aiErrorMessage(error));
    } finally {
      setIsComposing(false);
    }
  };

  const currentAnswer = answers[step] ?? "";
  const currentQuestion = questions[step];
  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <div className="app-shell">
      <Header type="back" title="질문으로 작성" onBack={() => navigate(-1)} />
      <div className="app-content">
        <div className="app-content-pad record-questions">
          <StepDots total={TOTAL_STEPS} current={step} />

          {!currentQuestion ? (
            <p className="record-questions-loading text-body-1-regular">
              {isLoadingQuestions ? "질문을 준비하고 있어요…" : "질문을 불러오지 못했어요. 다시 시도해 주세요."}
            </p>
          ) : (
            <>
              <h1 className="record-questions-title text-title-3">
                Q{step + 1}.
                <br />
                {currentQuestion}
              </h1>

              <div className="record-questions-box">
                <textarea
                  className="record-questions-textarea text-body-1-regular"
                  value={currentAnswer}
                  maxLength={MAX_LENGTH}
                  onChange={(event) => setAnswer(step, event.target.value)}
                  placeholder="답변을 입력해 주세요"
                />
                <span className="record-questions-count text-caption-1">
                  {currentAnswer.length}/{MAX_LENGTH}
                </span>
              </div>

              <button
                type="button"
                className="record-questions-shuffle text-body-2-regular"
                onClick={handleShuffleQuestion}
                disabled={isShuffling}
              >
                {isShuffling ? "질문을 바꾸는 중…" : "다른 질문 보기"}{" "}
                <img src={refreshIcon} alt="" width={16} height={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="record-questions-footer">
        <button type="button" className="record-questions-prev text-body-1-medium" onClick={handlePrev}>
          이전
        </button>
        <button
          type="button"
          className="record-questions-next text-body-1-medium"
          disabled={!currentAnswer.trim() || isComposing}
          onClick={handleNext}
        >
          {isLastStep ? "감상문으로 다듬기" : "다음"}
        </button>
      </div>
    </div>
  );
}
