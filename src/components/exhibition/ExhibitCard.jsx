import { useState } from "react";
import { useNavigate } from "react-router-dom";

// utils
import { getDaysUntil, formatMonthDayDot, formatDateRange } from "@utils/common";

// api
import { addExhibitionBookmark, deleteExhibitionBookmark } from "@api/exhibition";

// icons
import bookmarkDefaultIcon from "@images/icons/Action/Bookmark_Default.svg";
import bookmarkSelectedIcon from "@images/icons/Action/Bookmark_Selected.svg";

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
  remindId,
  viewedAt,
  emotionCodes,
  artistSummary,
  dateRange,
  bookmarked,
}) => {
  const navigate = useNavigate();
  const isRecord = recordId != null;

  const daysUntilEnd = getDaysUntil(endDate);
  const endBadge =
    daysUntilEnd == null || daysUntilEnd < 0 ? null : daysUntilEnd === 0 ? "오늘 종료" : `${daysUntilEnd}일 후 종료`;

  const daysUntilStart = getDaysUntil(startDate);
  const startBadge = daysUntilStart == null ? null : daysUntilStart <= 0 ? "오픈" : `${daysUntilStart}일 후 오픈`;
  // 리마인드 항목은 감정 변화 요약으로, 기록 항목은 기록 상세로, 그 외는 전시 상세로.
  const handleClick = () => {
    if (remindId != null) navigate(`/remind/summary/${remindId}`);
    else if (isRecord) navigate(`/record/${recordId}`);
    else navigate(`/exhibition/${exhibitionId}`);
  };

  const [prevBookmarkedKey, setPrevBookmarkedKey] = useState({ exhibitionId, bookmarked });
  const [isBookmarked, setIsBookmarked] = useState(Boolean(bookmarked));

  if (prevBookmarkedKey.exhibitionId !== exhibitionId || prevBookmarkedKey.bookmarked !== bookmarked) {
    setPrevBookmarkedKey({ exhibitionId, bookmarked });
    setIsBookmarked(Boolean(bookmarked));
  }

  const handleToggleBookmark = async (event) => {
    event.stopPropagation();
    const next = !isBookmarked;
    setIsBookmarked(next);
    try {
      if (next) {
        await addExhibitionBookmark(exhibitionId);
      } else {
        await deleteExhibitionBookmark(exhibitionId);
      }
    } catch (error) {
      console.log(error);
      setIsBookmarked(!next);
    }
  };

  if (type === "vertical") {
    const codes = emotionCodes ?? [];
    const visibleCodes = codes.slice(0, MAX_VISIBLE_EMOTIONS);
    const hiddenCount = codes.length - visibleCodes.length;

    return (
      <div className="exhibit-card-v" onClick={handleClick} role="button" tabIndex={0}>
        <div
          className={`exhibit-card-v-thumb${isRecord ? " exhibit-card-v-thumb--fluid" : ""}`}
          style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : undefined}
        >
          {isRecord && !thumbnail && <span className="text-caption-1">Poster</span>}
          {!isRecord && (
            <button
              type="button"
              className="exhibit-card-v-bookmark-btn"
              onClick={handleToggleBookmark}
              aria-label={isBookmarked ? "관심 전시 해제" : "관심 전시 등록"}
            >
              <img src={isBookmarked ? bookmarkSelectedIcon : bookmarkDefaultIcon} alt="" width={20} height={20} />
            </button>
          )}
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
                <p className="exhibit-card-date">{dateRange ?? formatDateRange(startDate, endDate)}</p>
                {startBadge && <span className="exhibit-card-openDate">{startBadge}</span>}
              </div>
            </>
          )}
        </div>
      </div>
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
    <div className="exhibit-card" onClick={handleClick} role="button" tabIndex={0}>
      <div className="exhibit-card-thumb" style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : undefined} />
      <div className="exhibit-card-content-box">
        <div className="exhibit-card-content1">
          <p className="exhibit-card-title">{title}</p>
          {artistSummary && <p className="exhibit-card-artist text-caption-1">{artistSummary}</p>}
          <div className="exhibit-card-content2">
            <p className="exhibit-card-place">{place}</p>
            <p className="exhibit-card-date">{dateRange ?? formatDateRange(startDate, endDate)}</p>
            {endBadge && <span className="exhibit-card-dday">{endBadge}</span>}
          </div>
        </div>
      </div>
      <button
        type="button"
        className="exhibit-card-bookmark-btn"
        onClick={handleToggleBookmark}
        aria-label={isBookmarked ? "관심 전시 해제" : "관심 전시 등록"}
      >
        <img src={isBookmarked ? bookmarkSelectedIcon : bookmarkDefaultIcon} alt="" width={20} height={20} />
      </button>
    </div>
  );
};

export default ExhibitCard;
