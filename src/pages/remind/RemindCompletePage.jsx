// 리마인드 저장 완료
import { useLocation, useNavigate } from "react-router-dom";

// styles
import "@styles/remind/RemindCompletePage.css";

export default function RemindCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { remindId } = location.state ?? {};

  const handleGoToSaved = () => {
    // 저장한 여운 상세(감정 변화 요약)로. remindId가 없으면 아카이브 리마인드 탭으로.
    navigate(remindId ? `/remind/summary/${remindId}` : "/archive");
  };

  return (
    <div className="app-shell">
      <div className="app-content">
        <div className="app-content-pad remind-complete">
          <div className="remind-complete-thumb" />
          <h1 className="remind-complete-title text-title-3">오늘의 여운이 저장되었어요</h1>
          <p className="remind-complete-subtitle text-body-2-regular">
            아카이브의 &apos;리마인드&apos;에서
            <br />
            확인해 보세요
          </p>
        </div>
      </div>

      <div className="remind-complete-footer">
        <button type="button" className="remind-complete-primary text-body-1-medium" onClick={handleGoToSaved}>
          저장한 여운 보기
        </button>
        <button
          type="button"
          className="remind-complete-secondary text-body-1-medium"
          onClick={() => navigate("/yeowun")}
        >
          홈으로
        </button>
      </div>
    </div>
  );
}
