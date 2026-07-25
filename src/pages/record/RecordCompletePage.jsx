import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";

// store
import { useRecordDraftStore } from "@store/useRecordDraftStore";

// styles
import "@styles/record/RecordCompletePage.css";

// images
import imgSaveSuccess from "@images/img_save_success.png";

export default function RecordCompletePage() {
  const navigate = useNavigate();
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
      <Header type="sub" />
      <div className="app-content">
        <div className="app-content-pad record-complete">
          <img src={imgSaveSuccess} alt="" width={120} height={120} />

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
