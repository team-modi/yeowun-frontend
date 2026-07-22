// 감정 변화 요약 — 저장된 리마인드 상세(아카이브 리마인드 탭에서 진입).
// 아직 전용 디자인이 없어 기능 위주로 구성한다(그때/지금 감정·감상 대비 + AI 요약).
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// components
import Header from "@components/common/Header";

// api
import { getDetailRemind } from "@api/remind";

// utils
import { formatDateDot } from "@utils/common";

// styles
import "@styles/remind/RemindSummaryPage.css";

function EmotionChips({ codes }) {
  if (!codes || codes.length === 0) return null;
  return (
    <div className="remind-summary-chips">
      {codes.map((keyword, index) => (
        <span key={`${keyword}-${index}`} className="remind-summary-chip text-label-3">
          {keyword}
        </span>
      ))}
    </div>
  );
}

export default function RemindSummaryPage() {
  const { remindId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(undefined);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const response = await getDetailRemind(remindId);
        if (!ignore) setData(response.data.data);
      } catch (error) {
        console.log(error);
        if (!ignore) setData(null);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [remindId]);

  if (data === undefined) {
    return (
      <div className="app-shell">
        <Header type="back" title="감정 변화" onBack={() => navigate(-1)} />
        <div className="app-content">
          <p className="remind-summary-loading text-body-1-regular">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="app-shell">
        <Header type="back" title="감정 변화" onBack={() => navigate(-1)} />
        <div className="app-content">
          <p className="remind-summary-loading text-body-1-regular">불러오지 못했어요.</p>
        </div>
      </div>
    );
  }

  const exhibition = data.exhibition ?? {};
  const before = data.before; // 원본 삭제 시 null 가능
  const after = data.after ?? {};
  const hasAiSummary = data.aiStatus === "DONE" && data.aiSummary;

  return (
    <div className="app-shell">
      <Header type="back" title="감정 변화" onBack={() => navigate(-1)} />
      <div className="app-content">
        <div className="app-content-pad remind-summary">
          <div className="remind-summary-exhibition">
            <div
              className="remind-summary-poster"
              style={exhibition.posterUrl ? { backgroundImage: `url(${exhibition.posterUrl})` } : undefined}
            />
            <div className="remind-summary-exhibition-info">
              <h1 className="remind-summary-title text-title-3">{exhibition.title}</h1>
              <p className="remind-summary-meta text-body-2-regular">
                {[formatDateDot(exhibition.viewedAt), exhibition.place].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          {hasAiSummary && (
            <section className="remind-summary-ai">
              <h2 className="remind-summary-ai-title text-label-2">AI가 본 감정 변화</h2>
              <p className="remind-summary-ai-text text-body-2-regular">{data.aiSummary}</p>
            </section>
          )}

          {before && (
            <section className="remind-summary-section">
              <h2 className="remind-summary-section-title text-heading-2">그때</h2>
              <EmotionChips codes={before.emotionCodes} />
              {before.text && <p className="remind-summary-text text-body-2-regular">{before.text}</p>}
            </section>
          )}

          <section className="remind-summary-section">
            <h2 className="remind-summary-section-title text-heading-2">지금</h2>
            <EmotionChips codes={after.emotionCodes} />
            {after.text && <p className="remind-summary-text text-body-2-regular">{after.text}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
