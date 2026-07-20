import { useNavigate } from "react-router-dom";

// utils
import { getDday, formatMonthDay, formatMonthDayDot } from "@utils/common";

const MAX_VISIBLE_EMOTIONS = 2;

const ExhibitCard = ({
  thumbnail,
  title,
  place,
  region,
  startDate,
  endDate,
  exhibitionId,
  type,
  recordId,
  viewedAt,
  emotionCodes,
  artistSummary,
  dateRange,
  bookmarked,
}) => {
  const navigate = useNavigate();
  const dday = getDday(endDate);
  const openDate = formatMonthDay(startDate);
  const isRecord = recordId != null;
  const handleClick = () => navigate(isRecord ? `/record/${recordId}` : `/exhibition/${exhibitionId}`);

  if (type === "vertical") {
    const codes = emotionCodes ?? [];
    const visibleCodes = codes.slice(0, MAX_VISIBLE_EMOTIONS);
    const hiddenCount = codes.length - visibleCodes.length;

    return (
      <button type="button" className="exhibit-card-v" onClick={handleClick}>
        <div
          className={`exhibit-card-v-thumb${isRecord ? " exhibit-card-v-thumb--fluid" : ""}`}
          style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : undefined}
        >
          {isRecord && !thumbnail && <span className="text-caption-1">Poster</span>}
        </div>
        <div className="exhibit-card-v-content-box">
          {isRecord ? (
            <>
              <p className="exhibit-card-date">{formatMonthDayDot(viewedAt)}</p>
              <p className="exhibit-card-title exhibit-card-title--clamp">{title}</p>
              {codes.length > 0 && (
                <div className="exhibit-card-emotion-chips">
                  {visibleCodes.map((keyword) => (
                    <span key={keyword} className="exhibit-card-emotion-chip text-label-3">
                      {keyword}
                    </span>
                  ))}
                  {hiddenCount > 0 && (
                    <span className="exhibit-card-emotion-chip exhibit-card-emotion-chip--more text-label-3">
                      +{hiddenCount}
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="exhibit-card-title">{title}</p>
              <div className="exhibit-card-v-content">
                <p className="exhibit-card-place">{place}</p>
                <span className="exhibit-card-openDate">{openDate} 오픈</span>
              </div>
            </>
          )}
        </div>
      </button>
    );
  }

  // 프로필 > 기록한 전시 / 관심 전시 목록의 행. D-day 없이 작가·장소·기간만 보여준다.
  if (type === "list") {
    return (
      <button type="button" className="exhibit-row" onClick={handleClick}>
        <div className="exhibit-row-thumb" style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : undefined} />
        <div className="exhibit-row-body">
          <p className="exhibit-row-title text-body-1-medium">{title}</p>
          {artistSummary && <p className="exhibit-row-artist text-body-2-regular">{artistSummary}</p>}
          <div className="exhibit-row-meta">
            <p className="exhibit-row-place text-caption-1">{[place, region].filter(Boolean).join(" · ")}</p>
            <p className="exhibit-row-date text-caption-1">{dateRange}</p>
          </div>
        </div>
        {/* 아이콘 원본이 검정 고정이라, 마스크로 액센트 색을 입힌다. */}
        {bookmarked && <span className="exhibit-row-bookmark" role="img" aria-label="저장한 전시" />}
      </button>
    );
  }

  return (
    <button type="button" className="exhibit-card" onClick={handleClick}>
      <div className="exhibit-card-thumb" style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : undefined} />
      <div className="exhibit-card-content-box">
        {dday && <span className="exhibit-card-dday">{dday}</span>}
        <div className="exhibit-card-content1">
          <p className="exhibit-card-title">{title}</p>
          {artistSummary && <p className="exhibit-card-artist text-caption-1">{artistSummary}</p>}
          <div className="exhibit-card-content2">
            <p className="exhibit-card-place">{place}</p>
            <p className="exhibit-card-date">{dateRange ?? startDate}</p>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ExhibitCard;
