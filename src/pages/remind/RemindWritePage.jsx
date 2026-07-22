// 여운 남기기 — 리마인드 상세에서 넘어와 감정 키워드 + 오늘의 감상을 남긴다.
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import EmotionKeywordSheet from "@components/record/EmotionKeywordSheet";

// api
import { getRemindCandidate, addRemind } from "@api/remind";

// utils
import { markRemindCompletedToday } from "@utils/common";

// styles
import "@styles/remind/RemindWritePage.css";

// icons
import addIcon from "@images/icons/Action/Add.svg";
import writeIcon from "@images/icons/Action/Write.svg";

const REFLECTION_MAX_LENGTH = 200;

export default function RemindWritePage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 상세에서 candidate를 넘겨받는다. 새로고침 등으로 유실되면 다시 조회한다.
  const [candidate, setCandidate] = useState(location.state?.candidate ?? null);
  const [emotionCodes, setEmotionCodes] = useState([]);
  const [reflection, setReflection] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (candidate) return;
    let ignore = false;
    (async () => {
      try {
        const response = await getRemindCandidate();
        if (!ignore) setCandidate(response.data.data ?? null);
      } catch (err) {
        console.log(err);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [candidate]);

  // 백엔드가 reflection 필수(@NotBlank)라 감상 입력을 저장 조건으로 둔다.
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
      navigate("/remind/complete", {
        state: { remindId: summary?.remindId ?? null, recordId: candidate.recordId },
      });
    } catch (err) {
      console.log(err);
      setError("저장에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="app-shell">
      <Header type="back" title="여운 남기기" onBack={() => navigate(-1)} />
      <div className="app-content">
        <div className="app-content-pad remind-write">
          <h1 className="remind-write-title text-title-3">지금 다시 보니 어떤가요?</h1>
          <p className="remind-write-subtitle text-body-2-regular">
            감정 키워드나 짧은 감상 중 하나만 남겨도 괜찮아요.
          </p>

          <section className="remind-write-section">
            <h2 className="remind-write-section-title text-heading-2">감정 키워드</h2>
            {emotionCodes.length > 0 ? (
              <div className="remind-write-emotions">
                {emotionCodes.map((keyword) => (
                  <span key={keyword} className="remind-write-emotion-chip text-label-2">
                    {keyword}
                  </span>
                ))}
                <button
                  type="button"
                  className="remind-write-emotion-edit text-label-3"
                  onClick={() => setIsSheetOpen(true)}
                >
                  키워드 편집하기
                  <img src={writeIcon} alt="" width={14} height={14} />
                </button>
              </div>
            ) : (
              <button type="button" className="remind-write-emotion-add text-body-2-regular" onClick={() => setIsSheetOpen(true)}>
                감정 키워드 추가하기
                <img src={addIcon} alt="" width={18} height={18} />
              </button>
            )}
          </section>

          <section className="remind-write-section">
            <h2 className="remind-write-section-title text-heading-2">지금 남기고 싶은 감상</h2>
            <div className="remind-write-box">
              <textarea
                className="remind-write-textarea text-body-2-regular"
                value={reflection}
                maxLength={REFLECTION_MAX_LENGTH}
                onChange={(event) => setReflection(event.target.value)}
                placeholder="지금 떠오르는 생각을 적어보세요"
              />
              <span className="remind-write-count text-caption-1">
                {reflection.length}/{REFLECTION_MAX_LENGTH}
              </span>
            </div>
          </section>

          {error && <p className="remind-write-error text-caption-1">{error}</p>}
        </div>
      </div>

      <div className="remind-write-footer">
        <button
          type="button"
          className="remind-write-submit text-body-1-medium"
          disabled={!isSaveReady || isSaving}
          onClick={handleSave}
        >
          {isSaving ? "저장 중…" : "저장하기"}
        </button>
      </div>

      <EmotionKeywordSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        value={emotionCodes}
        onApply={setEmotionCodes}
      />
    </div>
  );
}
