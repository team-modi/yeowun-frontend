// 리마인드 상세(감정 변화) — 아카이브 리마인드 탭에서 진입.
// 타임라인: 전시 관람 → 그날의 기록 → 다시 떠오른 여운. 기록/여운 카드를 누르면 전문 바텀시트.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// components
import Header from "@components/common/Header";
import BottomSheet from "@components/common/BottomSheet";

// api
import { getDetailRemind } from "@api/remind";

// utils
import { formatElapsedBetween, formatShortDateDot } from "@utils/common";

// styles
import "@styles/remind/RemindSummaryPage.css";

// icons
import pinIcon from "@images/icons/Info/Location.svg";

const MAX_PREVIEW_EMOTIONS = 3;

function toDateKey(value) {
  if (!value) return "";
  // createdAt은 ZonedDateTime ISO — 앞 10자리가 날짜. viewedAt은 이미 "YYYY-MM-DD".
  return typeof value === "string" ? value.slice(0, 10) : "";
}

function EmotionChips({ codes, limit }) {
  if (!codes || codes.length === 0) return null;
  const visible = limit ? codes.slice(0, limit) : codes;
  const hidden = codes.length - visible.length;
  return (
    <div className="remind-summary-chips">
      {visible.map((keyword, index) => (
        <span key={`${keyword}-${index}`} className="remind-summary-chip text-label-3">
          {keyword}
        </span>
      ))}
      {hidden > 0 && <span className="remind-summary-chip remind-summary-chip--more text-label-3">+{hidden}</span>}
    </div>
  );
}

function ChevronRight() {
  return (
    <svg className="remind-timeline-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function RemindSummaryPage() {
  const { remindId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(undefined); // undefined=로딩, null=실패
  const [sheet, setSheet] = useState(null); // { title, label, text, emotionCodes }

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

  if (data === undefined || data === null) {
    return (
      <div className="app-shell">
        <Header type="back" title="" onBack={() => navigate(-1)} />
        <div className="app-content">
          <p className="remind-summary-loading text-body-1-regular">
            {data === null ? "불러오지 못했어요." : "불러오는 중..."}
          </p>
        </div>
      </div>
    );
  }

  const exhibition = data.exhibition ?? {};
  const before = data.before; // 원본 기록 삭제 시 null
  const after = data.after ?? {};
  const hasAiSummary = data.aiStatus === "DONE" && data.aiSummary;
  const elapsed = formatElapsedBetween(exhibition.viewedAt, data.createdAt);

  return (
    <div className="app-shell">
      <Header type="back" title="" onBack={() => navigate(-1)} />
      <div className="app-content">
        <div className="app-content-pad remind-summary">
          <h1 className="remind-summary-lead text-title-3">
            {elapsed && (
              <>
                첫 기록을 남긴 지 {elapsed} 뒤,
                <br />
              </>
            )}
            다시 떠오른 여운을 남겼어요
          </h1>

          <ol className="remind-timeline">
            <li className="remind-timeline-node">
              <div className="remind-timeline-rail">
                <span className="remind-timeline-dot" />
              </div>
              <div className="remind-timeline-content">
                <p className="remind-timeline-date text-caption-1">{formatShortDateDot(toDateKey(exhibition.viewedAt))}</p>
                <p className="remind-timeline-label text-heading-2">전시 관람</p>
                <div className="remind-timeline-exhibition">
                  <div
                    className="remind-timeline-poster"
                    style={exhibition.posterUrl ? { backgroundImage: `url(${exhibition.posterUrl})` } : undefined}
                  />
                  <div className="remind-timeline-ex-info">
                    <p className="remind-timeline-ex-title text-body-1-medium">{exhibition.title}</p>
                    {exhibition.place && (
                      <p className="remind-timeline-ex-place text-body-2-regular">
                        <img src={pinIcon} alt="" width={14} height={14} />
                        {exhibition.place}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>

            {before && (
              <li className="remind-timeline-node">
                <div className="remind-timeline-rail">
                  <span className="remind-timeline-dot" />
                </div>
                <div className="remind-timeline-content">
                  <p className="remind-timeline-label text-heading-2">그날의 기록</p>
                  <button
                    type="button"
                    className="remind-timeline-card"
                    onClick={() =>
                      setSheet({ title: "그날의 기록", label: "그날의 감상", text: before.text, emotionCodes: before.emotionCodes })
                    }
                  >
                    <div className="remind-timeline-card-main">
                      {before.text && <p className="remind-timeline-card-text text-body-2-regular">{before.text}</p>}
                      <EmotionChips codes={before.emotionCodes} limit={MAX_PREVIEW_EMOTIONS} />
                    </div>
                    <ChevronRight />
                  </button>
                </div>
              </li>
            )}

            <li className="remind-timeline-node">
              <div className="remind-timeline-rail">
                <span className="remind-timeline-dot" />
              </div>
              <div className="remind-timeline-content">
                <p className="remind-timeline-date text-caption-1">{formatShortDateDot(toDateKey(data.createdAt))}</p>
                <p className="remind-timeline-label text-heading-2">다시 떠오른 여운</p>
                <button
                  type="button"
                  className="remind-timeline-card"
                  onClick={() =>
                    setSheet({ title: "다시 떠오른 여운", label: "그날의 여운", text: after.text, emotionCodes: after.emotionCodes })
                  }
                >
                  <div className="remind-timeline-card-main">
                    {after.text && <p className="remind-timeline-card-text text-body-2-regular">{after.text}</p>}
                    <EmotionChips codes={after.emotionCodes} limit={MAX_PREVIEW_EMOTIONS} />
                  </div>
                  <ChevronRight />
                </button>
              </div>
            </li>
          </ol>

          {hasAiSummary && (
            <section className="remind-summary-ai">
              <h2 className="remind-summary-ai-title text-label-2">AI가 본 감정 변화</h2>
              <p className="remind-summary-ai-text text-body-2-regular">{data.aiSummary}</p>
            </section>
          )}
        </div>
      </div>

      <BottomSheet isOpen={sheet !== null} onClose={() => setSheet(null)} className="remind-summary-sheet">
        {sheet && (
          <div className="remind-summary-sheet-body">
            <h2 className="remind-summary-sheet-title text-title-3">{sheet.title}</h2>
            {sheet.emotionCodes?.length > 0 && (
              <section className="remind-summary-sheet-section">
                <h3 className="remind-summary-sheet-heading text-heading-2">감정 키워드</h3>
                <EmotionChips codes={sheet.emotionCodes} />
              </section>
            )}
            {sheet.text && (
              <section className="remind-summary-sheet-section">
                <h3 className="remind-summary-sheet-heading text-heading-2">{sheet.label}</h3>
                <p className="remind-summary-sheet-text text-body-2-regular">{sheet.text}</p>
              </section>
            )}
            <button type="button" className="remind-summary-sheet-close text-body-1-medium" onClick={() => setSheet(null)}>
              닫기
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
