import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";

// api
import { addRecord, composeRecordStream, deleteRecordDraft } from "@api/record";

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

  const [isStreaming, setIsStreaming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const abortRef = useRef(null);

  // 편집 중인 초안은 스토어(sessionStorage)로 유지된다 — 새로고침에도 복원. 키 입력마다 서버 저장하지 않는다.
  // 서버 draft는 백엔드 compose 스트림이 완료 시 자동 저장한다.

  // 감상문을 스트리밍으로 생성해 토큰이 오는 대로 본문에 이어 붙인다.
  const runCompose = useCallback(async () => {
    if (!exhibitionId || questions.length === 0) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsStreaming(true);
    // 기존 본문은 첫 델타가 올 때 교체한다 — 델타 전에 실패(429 등)하면 초안이 지워지지 않게.
    let streamed = "";
    try {
      await composeRecordStream(
        exhibitionId,
        questions.map((question, index) => ({ question, answer: answers[index] })),
        {
          signal: controller.signal,
          onDelta: (delta) => {
            streamed = (streamed + delta).slice(0, MAX_LENGTH);
            setContent(streamed);
          },
        },
      );
    } catch (error) {
      if (error?.name === "AbortError" || controller.signal.aborted) return; // 언마운트/재요청으로 취소 — 무시
      console.log(error);
      showToast(aiErrorMessage(error));
    } finally {
      if (abortRef.current === controller) {
        setIsStreaming(false);
        abortRef.current = null;
      }
    }
  }, [exhibitionId, questions, answers, setContent]);

  // 질문 플로우에서 막 넘어와 본문이 비어 있으면 최초 스트리밍을 시작한다.
  // 새로고침/뒤로가기로 재진입해 이미 본문이 있으면 재생성하지 않는다.
  // 스토어 복원(전시·질문 준비)이 끝나고 본문이 비어 있으면 최초 스트리밍을 시작한다.
  // - sessionStorage 복원은 비동기라 exhibitionId가 채워진 뒤에 발화한다.
  // - 새로고침/뒤로가기로 이미 본문이 있으면(content 존재) 재생성하지 않는다.
  // - cleanup에서 진행 중 스트림을 중단한다. StrictMode 이중 실행 시 첫 스트림은 취소되고 두 번째가 완주한다.
  useEffect(() => {
    if (!exhibitionId || questions.length === 0 || content.trim()) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runCompose();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exhibitionId, questions.length]);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting || isStreaming) return;

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

          <div className={`record-compose-box${isStreaming ? " is-streaming" : ""}`}>
            <textarea
              className="record-compose-textarea text-body-1-regular"
              value={content}
              maxLength={MAX_LENGTH}
              readOnly={isStreaming}
              placeholder={isStreaming ? "감상문을 쓰는 중…" : ""}
              onChange={(event) => setContent(event.target.value)}
            />
            <span className="record-compose-count text-caption-1">
              {content.length}/{MAX_LENGTH}
            </span>
          </div>

          <button
            type="button"
            className="record-compose-refine text-body-2-regular"
            disabled={isStreaming}
            onClick={runCompose}
          >
            <img src={refreshIcon} alt="" width={16} height={16} /> {isStreaming ? "다듬는 중…" : "다시 다듬기"}
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
          disabled={!content.trim() || isSubmitting || isStreaming}
          onClick={handleSubmit}
        >
          작성 완료
        </button>
      </div>
    </div>
  );
}
