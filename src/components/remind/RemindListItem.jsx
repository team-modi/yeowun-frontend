// 아카이브 '리마인드' 탭의 리스트 행 — 썸네일 + 경과 배지 + 제목 + 여운 미리보기 + 날짜.
// 클릭 시 감정 변화 요약(리마인드 상세)으로 이동.
import { useNavigate } from "react-router-dom";

// utils
import { formatElapsedBetween, formatShortDateDot } from "@utils/common";

// styles
import "@styles/remind/RemindListItem.css";

function toDateKey(value) {
  if (!value) return "";
  // createdAt은 ZonedDateTime ISO(예: 2026-07-28T09:00:00+09:00) — 앞 10자리가 날짜.
  return typeof value === "string" ? value.slice(0, 10) : "";
}

export default function RemindListItem({ remind }) {
  const navigate = useNavigate();
  const elapsed = formatElapsedBetween(remind.viewedAt, remind.createdAt);

  return (
    <button
      type="button"
      className="remind-list-item"
      onClick={() => navigate(`/remind/summary/${remind.remindId}`)}
    >
      <div
        className="remind-list-thumb"
        style={remind.posterUrl ? { backgroundImage: `url(${remind.posterUrl})` } : undefined}
      />
      <div className="remind-list-body">
        {elapsed && <span className="remind-list-badge text-caption-1">{elapsed} 후 남긴 여운</span>}
        <p className="remind-list-title text-body-1-medium">{remind.exhibitionTitle}</p>
        {remind.reflectionPreview && (
          <p className="remind-list-preview text-body-2-regular">{remind.reflectionPreview}</p>
        )}
        <span className="remind-list-date text-caption-1">{formatShortDateDot(toDateKey(remind.createdAt))}</span>
      </div>
    </button>
  );
}
