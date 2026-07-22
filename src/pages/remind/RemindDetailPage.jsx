// 리마인드 상세 — 오늘의 소환 대상(candidate)을 보여주고, 원본 보기 / 여운 남기기로 분기.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";

// api
import { getRemindCandidate } from "@api/remind";

// utils
import { formatDateDot } from "@utils/common";

// styles
import "@styles/remind/RemindDetailPage.css";

// icons
import calendarIcon from "@images/icons/Info/Calendar.svg";
import pinIcon from "@images/icons/Info/Location.svg";

const MAX_VISIBLE_EMOTIONS = 3;

export default function RemindDetailPage() {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(undefined); // undefined=로딩, null=대상없음

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const response = await getRemindCandidate();
        if (!ignore) setCandidate(response.data.data ?? null);
      } catch (error) {
        console.log(error);
        if (!ignore) setCandidate(null);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  if (candidate === undefined) {
    return (
      <div className="app-shell">
        <Header type="back" title="리마인드" onBack={() => navigate("/yeowun")} />
        <div className="app-content">
          <p className="remind-detail-loading text-body-1-regular">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (candidate === null) {
    return (
      <div className="app-shell">
        <Header type="back" title="리마인드" onBack={() => navigate("/yeowun")} />
        <div className="app-content">
          <div className="app-content-pad remind-detail-empty">
            <p className="remind-detail-empty-text text-body-1-regular">오늘은 다시 볼 여운이 없어요</p>
            <button
              type="button"
              className="remind-detail-empty-btn text-body-1-medium"
              onClick={() => navigate("/yeowun")}
            >
              홈으로 가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const emotions = candidate.originalEmotionCodes ?? [];
  const visibleEmotions = emotions.slice(0, MAX_VISIBLE_EMOTIONS);
  const hiddenCount = emotions.length - visibleEmotions.length;

  return (
    <div className="app-shell">
      <Header type="back" title="리마인드" onBack={() => navigate("/yeowun")} />
      <div className="app-content">
        <div className="app-content-pad remind-detail">
          <p className="remind-detail-lead text-heading-2">{candidate.elapsedLabel} 기록한 전시예요</p>

          <div className="remind-detail-card">
            <div
              className="remind-detail-poster"
              style={candidate.posterUrl ? { backgroundImage: `url(${candidate.posterUrl})` } : undefined}
            >
              {!candidate.posterUrl && <span className="text-caption-1">Poster</span>}
            </div>

            <h1 className="remind-detail-title text-title-3">{candidate.exhibitionTitle}</h1>
            <div className="remind-detail-meta text-body-2-regular">
              <span className="remind-detail-meta-item">
                <img src={calendarIcon} alt="" width={16} height={16} />
                {formatDateDot(candidate.viewedAt)}
              </span>
              {candidate.place && (
                <span className="remind-detail-meta-item">
                  <img src={pinIcon} alt="" width={16} height={16} />
                  {candidate.place}
                </span>
              )}
            </div>

            {candidate.originalContent && (
              <p className="remind-detail-content text-body-2-regular">{candidate.originalContent}</p>
            )}

            {emotions.length > 0 && (
              <div className="remind-detail-emotions">
                {visibleEmotions.map((keyword) => (
                  <span key={keyword} className="remind-detail-emotion-chip text-label-3">
                    {keyword}
                  </span>
                ))}
                {hiddenCount > 0 && (
                  <span className="remind-detail-emotion-chip remind-detail-emotion-chip--more text-label-3">
                    +{hiddenCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="remind-detail-footer">
        <button
          type="button"
          className="remind-detail-secondary text-body-1-medium"
          onClick={() => navigate(`/record/${candidate.recordId}`)}
        >
          원본 기록 보기
        </button>
        <button
          type="button"
          className="remind-detail-primary text-body-1-medium"
          onClick={() => navigate("/remind/write", { state: { candidate } })}
        >
          여운 남기기
        </button>
      </div>
    </div>
  );
}
