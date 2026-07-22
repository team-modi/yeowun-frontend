import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";

// store
import { useRecordDraftStore } from "@store/useRecordDraftStore";

// styles
import "@styles/record/RecordCompletePage.css";

export default function RecordCompletePage() {
  const navigate = useNavigate();
  const exhibitionDraft = useRecordDraftStore((state) => state.exhibitionDraft);
  const recordId = useRecordDraftStore((state) => state.recordId);
  const reset = useRecordDraftStore((state) => state.reset);

  const handleGoToRecord = () => {
    const targetId = recordId;
    reset();
    navigate(targetId ? `/record/${targetId}` : "/yeowun");
  };

  const handleGoHome = () => {
    reset();
    navigate("/yeowun");
  };

  return (
    <div className="app-shell">
      <Header type="sub" title="기록 작성" onBack={handleGoHome} />
      <div className="app-content">
        <div className="app-content-pad record-complete">
          <div className="record-complete-thumb">
            {exhibitionDraft?.posterPreviewUrl && (
              <img src={exhibitionDraft.posterPreviewUrl} alt="" className="record-complete-thumb-img" />
            )}
          </div>
          <h1 className="record-complete-title text-title-3">기록이 저장되었어요</h1>
          <p className="record-complete-subtitle text-body-2-regular">아카이브에서 언제든 다시 꺼내볼 수 있어요</p>
        </div>
      </div>

      <div className="record-complete-footer">
        <button type="button" className="record-complete-primary text-body-1-medium" onClick={handleGoToRecord}>
          기록 보러 가기
        </button>
        <button type="button" className="record-complete-secondary text-body-1-medium" onClick={handleGoHome}>
          홈으로
        </button>
      </div>
    </div>
  );
}
