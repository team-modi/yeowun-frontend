import { useNavigate } from "react-router-dom";

// utils
import { getDday, formatMonthDay, formatMonthDayDot } from "@utils/common";

const ExhibitCard = ({
  thumbnail,
  title,
  place,
  startDate,
  endDate,
  exhibitionId,
  type,
  recordId,
  viewedAt,
  emotionCodes,
  artistSummary,
  dateRange,
}) => {
  const navigate = useNavigate();
  const dday = getDday(endDate);
  const openDate = formatMonthDay(startDate);
  const isRecord = recordId != null;
  const handleClick = () => navigate(isRecord ? `/record/${recordId}` : `/exhibition/${exhibitionId}`);

  if (type === "vertical") {
    const codes = emotionCodes ?? [];

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
                  {codes.map((keyword) => (
                    <span key={keyword} className="exhibit-card-emotion-chip text-label-3">
                      {keyword}
                    </span>
                  ))}
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
