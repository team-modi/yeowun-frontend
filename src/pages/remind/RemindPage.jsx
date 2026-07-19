import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import StepDots from "@components/record/StepDots";
import EmotionKeywordSheet from "@components/record/EmotionKeywordSheet";

// api
import { getRemindCandidate, addRemind } from "@api/remind";
import { getDetailRecord, updateRecord } from "@api/record";

// utils
import { formatDateDot, markRemindCompletedToday } from "@utils/common";

// styles
import "@styles/remind/RemindPage.css";

// icons
import calendarIcon from "@images/icons/Info/Calendar.svg";
import pinIcon from "@images/icons/Info/Location.svg";
import plusIcon from "@images/icons/Action/Add.svg";

const REFLECTION_MAX_LENGTH = 300;

export default function RemindPage() {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(undefined);
  const [step, setStep] = useState(0);
  const [emotionCodes, setEmotionCodes] = useState([]);
  const [reflection, setReflection] = useState("");
  const [isEmotionSheetOpen, setIsEmotionSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const response = await getRemindCandidate();
        if (!ignore) setCandidate(response.data.data ?? null);
      } catch (err) {
        console.log(err);
        if (!ignore) setCandidate(null);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const sceneImageUrl = candidate?.sceneImageUrl ?? null;
  const hasScene = !!sceneImageUrl;
  const steps = hasScene ? ["intro", "scene", "recall", "answer"] : ["intro", "recall", "answer"];
  const totalSteps = steps.length;
  const currentStepKey = steps[step];

  const handleExit = () => navigate("/yeowun");

  const handlePrev = () => {
    if (step === 0) {
      handleExit();
      return;
    }
    setStep((prev) => prev - 1);
  };

  const handleAdvance = () => setStep((prev) => Math.min(prev + 1, totalSteps - 1));

  const isSaveReady = reflection.trim().length > 0;

  const handleSave = async () => {
    if (!isSaveReady || isSaving || !candidate) return;

    setIsSaving(true);
    setError("");
    try {
      const response = await addRemind({
        recordId: candidate.recordId,
        emotionCodes,
        reflection: reflection.trim(),
      });
      const summary = response.data.data;

      markRemindCompletedToday();

      try {
        const detail = await getDetailRecord(candidate.recordId);
        const currentMedia = (detail.data.data.media ?? []).map((item) => ({
          type: item.type,
          url: item.url,
          sortOrder: item.sortOrder,
          sizeBytes: item.sizeBytes,
        }));
        await updateRecord(candidate.recordId, {
          viewedAt: candidate.viewedAt,
          content: reflection.trim(),
          emotionCodes,
          media: currentMedia,
        });
      } catch (syncErr) {
        console.log(syncErr);
      }

      navigate("/remind/complete", {
        state: {
          recordId: summary?.recordId ?? candidate.recordId,
          posterUrl: summary?.exhibition?.posterUrl ?? candidate.posterUrl,
          aiStatus: summary?.aiStatus,
          aiSummary: summary?.aiSummary,
        },
      });
    } catch (err) {
      console.log(err);
      setError(err?.response?.data?.meta?.message || "저장에 실패했어요.");
    } finally {
      setIsSaving(false);
    }
  };

  if (candidate === undefined) {
    return (
      <div className="app-shell">
        <Header type="sub" title="오늘의 여운" onBack={handleExit} />
        <div className="app-content">
          <p className="remind-loading text-body-1-regular">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (candidate === null) {
    return (
      <div className="app-shell">
        <Header type="sub" title="오늘의 여운" onBack={handleExit} />
        <div className="app-content">
          <div className="app-content-pad remind-empty">
            <p className="remind-empty-text text-body-1-regular">오늘은 확인할 여운이 없어요</p>
            <button type="button" className="remind-empty-btn text-body-1-medium" onClick={handleExit}>
              홈으로 가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const beforeEmotionCodes = candidate.originalEmotionCodes ?? [];

  return (
    <div className="app-shell">
      <Header type="sub" title="오늘의 여운" onBack={handlePrev} />
      <div className="app-content">
        <div className="app-content-pad remind">
          {currentStepKey !== "answer" && <StepDots total={totalSteps - 1} current={step} />}

          {currentStepKey === "intro" && (
            <button type="button" className="remind-tap-card" onClick={handleAdvance}>
              <p className="remind-lead text-title-3">{candidate.elapsedLabel}, 이 전시를 기록했어요</p>
              <div
                className="remind-poster"
                style={candidate.posterUrl ? { backgroundImage: `url(${candidate.posterUrl})` } : undefined}
              >
                {!candidate.posterUrl && <span className="text-caption-1">Poster</span>}
              </div>
              <h2 className="remind-exhibition-title text-heading-1">{candidate.exhibitionTitle}</h2>
              {candidate.artist && <p className="remind-exhibition-artist text-body-2-regular">{candidate.artist}</p>}
              <div className="remind-meta-row text-body-2-regular">
                <span className="remind-meta-item">
                  <img src={calendarIcon} alt="" width={16} height={16} />
                  {formatDateDot(candidate.viewedAt)}
                </span>
                {candidate.place && (
                  <span className="remind-meta-item">
                    <img src={pinIcon} alt="" width={16} height={16} />
                    {candidate.place}
                  </span>
                )}
              </div>
            </button>
          )}

          {currentStepKey === "scene" && (
            <button type="button" className="remind-tap-card" onClick={handleAdvance}>
              <p className="remind-lead text-title-3">전시 속, 그 장면</p>
              <div className="remind-scene-media">
                <img src={sceneImageUrl} alt="" className="remind-scene-media-img" />
              </div>
            </button>
          )}

          {currentStepKey === "recall" && (
            <div className="remind-recall">
              <p className="remind-lead text-title-3">그때 내가 기록한 여운이에요</p>
              <div className="remind-snapshot-box">
                <p className="remind-snapshot-label text-caption-1">그날의 감상</p>
                <p className="remind-snapshot-content text-body-1-regular">{candidate.originalContent}</p>
              </div>
              {beforeEmotionCodes.length > 0 && (
                <div className="remind-before-emotion-chips">
                  {beforeEmotionCodes.map((keyword, index) => (
                    <span key={`${keyword}-${index}`} className="remind-before-emotion-chip text-label-2">
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStepKey === "answer" && (
            <div className="remind-answer">
              <p className="remind-lead-multiline text-title-3">
                지금 다시 보니
                <br />
                어떤가요?
              </p>

              <section className="remind-section">
                <h2 className="remind-section-title text-heading-2">감정 다시 남기기</h2>
                {emotionCodes.length > 0 ? (
                  <div className="remind-emotion-chips">
                    {emotionCodes.map((keyword) => (
                      <span key={keyword} className="remind-emotion-chip text-label-2">
                        {keyword}
                      </span>
                    ))}
                    <button
                      type="button"
                      className="remind-emotion-edit"
                      onClick={() => setIsEmotionSheetOpen(true)}
                      aria-label="감정 키워드 수정"
                    >
                      <img src={plusIcon} alt="" width={16} height={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="remind-emotion-add"
                    onClick={() => setIsEmotionSheetOpen(true)}
                    aria-label="감정 키워드 추가"
                  >
                    <img src={plusIcon} alt="" width={16} height={16} />
                  </button>
                )}
              </section>

              <section className="remind-section">
                <h2 className="remind-section-title text-heading-2">한 줄로 남기고 싶은 문장</h2>
                <textarea
                  className="remind-sentence-input text-body-1-regular"
                  value={reflection}
                  maxLength={REFLECTION_MAX_LENGTH}
                  onChange={(event) => setReflection(event.target.value)}
                  placeholder="지금 떠오르는 생각을 적어보세요"
                />
              </section>

              {error && <p className="remind-error text-caption-1">{error}</p>}
            </div>
          )}
        </div>
      </div>

      {currentStepKey === "recall" && (
        <div className="remind-footer remind-footer--split">
          <button type="button" className="remind-footer-secondary text-body-1-medium" onClick={handleExit}>
            나가기
          </button>
          <button type="button" className="remind-footer-primary text-body-1-medium" onClick={handleAdvance}>
            감정 다시 남기기
          </button>
        </div>
      )}

      {currentStepKey === "answer" && (
        <div className="remind-footer">
          <button
            type="button"
            className="remind-footer-primary remind-footer-primary--full text-body-1-medium"
            disabled={!isSaveReady || isSaving}
            onClick={handleSave}
          >
            {isSaving ? "저장 중…" : "오늘의 여운 저장"}
          </button>
        </div>
      )}

      <EmotionKeywordSheet
        isOpen={isEmotionSheetOpen}
        onClose={() => setIsEmotionSheetOpen(false)}
        value={emotionCodes}
        onApply={setEmotionCodes}
      />
    </div>
  );
}
