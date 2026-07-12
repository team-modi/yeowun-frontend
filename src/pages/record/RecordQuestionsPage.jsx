import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import StepDots from "@components/record/StepDots";

// api
import { getRecordQuestions, composeRecord } from "@api/record";

// store
import { useRecordDraftStore } from "@store/useRecordDraftStore";

// styles
import "@styles/record/RecordQuestionsPage.css";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    if (questions.length > 0) return;

    let ignore = false;
    setIsLoading(true);

    (async () => {
      try {
        const response = await getRecordQuestions(exhibitionId);
        if (!ignore) setQuestions(response.data.data.questions ?? response.data.data ?? []);
      } catch (error) {
        console.log(error);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [exhibitionId, questions.length, setQuestions]);

  const handleShuffleQuestion = async () => {
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
      // TODO: composeRecord의 answers 파라미터 실제 형태(질문 텍스트 포함 여부 등)는 백엔드와 확인 필요
      const response = await composeRecord(
        exhibitionId,
        questions.map((question, index) => ({ question, answer: answers[index] })),
      );
      const composedText = response.data.data.content ?? response.data.data.text ?? "";
      setContent(composedText);
      navigate("/record/compose");
    } catch (error) {
      console.log(error);
    } finally {
      setIsComposing(false);
    }
  };

  const currentAnswer = answers[step] ?? "";
  const currentQuestion = questions[step];
  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <div className="app-shell">
      <Header type="sub" title="기록 작성" onBack={() => navigate(-1)} />
      <div className="app-content">
        <div className="app-content-pad record-questions">
          <StepDots total={TOTAL_STEPS} current={step} />

          {isLoading || !currentQuestion ? (
            <p className="record-questions-loading text-body-1-regular">질문을 준비하고 있어요…</p>
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
              >
                <RefreshIcon /> 다른 질문 보기
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
