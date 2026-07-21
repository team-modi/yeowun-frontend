import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import StepDots from "@components/record/StepDots";

// api
import { getRecordQuestions, getRecordDraft } from "@api/record";

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
  const [isShuffling, setIsShuffling] = useState(false);
  // 로딩은 "질문이 없고, 생성할 전시가 있는" 경우에만 시작한다.
  // 새로고침 복원(질문 있음)·전시 없이 직접 진입(생성 불가)이면 처음부터 로딩 아님.
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(questions.length === 0 && Boolean(exhibitionId));

  useEffect(() => {
    // 이미 질문이 있으면(새로고침 복원 등) 재생성하지 않는다 — 느린 AI 재호출 방지.
    // 전시 선택 없이 직접 진입한 경우도 생성 불가 — 무한 로딩 방지.
    if (questions.length > 0 || !exhibitionId) return;

    let ignore = false;

    (async () => {
      setIsLoadingQuestions(true);
      try {
        // 다른 기기/세션에서 이어가는 경우 서버 draft(백엔드가 질문 생성 시 자동 저장)로 먼저 복원 시도.
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
    // 최초 1회만 — 이후 질문/답변은 스토어(sessionStorage)로 유지된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exhibitionId]);

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

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((prev) => prev + 1);
      return;
    }
    // 감상문 생성은 compose 페이지에서 스트리밍으로 처리한다(여기서 기다리지 않고 바로 이동).
    // 새 초안을 받도록 이전 본문은 비워둔다.
    setContent("");
    navigate("/record/compose");
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
          disabled={!currentAnswer.trim()}
          onClick={handleNext}
        >
          {isLastStep ? "감상문으로 다듬기" : "다음"}
        </button>
      </div>
    </div>
  );
}
