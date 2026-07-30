// 리마인드> 수정한 내용 저장 페이지
import { useLocation, useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";

// styles
import "@styles/remind/RemindCompletePage.css";

// images
import imgSaveSuccess from "@images/img_save_success.png";

export default function RemindCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { recordId } = location.state ?? {};

  const handleGoToArchive = () => {
    navigate(recordId ? `/record/${recordId}` : "/yeowun");
  };

  const handleGoHome = () => navigate("/yeowun");

  return (
    <div className="app-shell">
      <Header type="sub" title="" onBack={handleGoHome} />
      <div className="app-content">
        <div className="app-content-pad remind-complete">
          <img src={imgSaveSuccess} alt="" width={120} height={120} />
          <h1 className="remind-complete-title text-title-3">오늘의 여운이 저장되었어요</h1>
          <p className="remind-complete-subtitle text-body-2-regular">
            아카이브 &apos;리마인드&apos;에서
            <br />
            확인해 보세요
          </p>
        </div>
      </div>

      <div className="remind-complete-footer">
        <button type="button" className="remind-complete-primary text-body-1-medium" onClick={handleGoToArchive}>
          저장한 여운 보기
        </button>
        <button type="button" className="remind-complete-secondary text-body-1-medium" onClick={handleGoHome}>
          홈으로
        </button>
      </div>
    </div>
  );
}
