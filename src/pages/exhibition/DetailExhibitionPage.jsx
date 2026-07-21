import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// components
import LocationSheet from "@components/exhibition/LocationSheet";

// api
import { getDetailExhibition, addExhibitionBookmark, deleteExhibitionBookmark } from "@api/exhibition";

// store
import { useRecordDraftStore } from "@store/useRecordDraftStore";

// utils
import { GENRE_LABEL_BY_CODE } from "@utils/filterCodes";

// styles
import "@styles/detailExhibition.css";

// icons
import chevronLeftIcon from "@images/icons/Action/Chevron Left.svg";
import chevronRightIcon from "@images/icons/Action/Chevron Right.svg";
import bookmarkDefaultIcon from "@images/icons/Action/Bookmark_Default.svg";
import bookmarkSelectedIcon from "@images/icons/Action/Bookmark_Selected.svg";
import calendarIcon from "@images/icons/Info/Calendar.svg";
import locationIcon from "@images/icons/Info/Location.svg";
import clockIcon from "@images/icons/Info/Clock.svg";
import ticketIcon from "@images/icons/Info/Ticket.svg";

function formatDateDot(dateString) {
  return dateString ? dateString.replaceAll("-", ".") : "";
}

function OperatingHours({ operatingHours }) {
  if (!operatingHours) return null;

  if (typeof operatingHours === "string") {
    const lines = operatingHours.split("\n").filter(Boolean);
    return (
      <div className="detail-exhibition-hours-list">
        {lines.map((line, index) => (
          <p
            key={index}
            className={`detail-exhibition-info-value text-body-1-regular${
              line.includes("휴무") ? " detail-exhibition-hours-closed" : ""
            }`}
          >
            {line}
          </p>
        ))}
      </div>
    );
  }

  if (Array.isArray(operatingHours)) {
    return (
      <div className="detail-exhibition-hours-list">
        {operatingHours.map((row, index) => (
          <p key={index} className="detail-exhibition-info-value text-body-1-regular">
            <span className="detail-exhibition-hours-days">
              {Array.isArray(row.days) ? row.days.join(" / ") : row.days}
            </span>
            <span className="detail-exhibition-hours-time">
              {row.open ?? row.startTime} - {row.close ?? row.endTime}
            </span>
          </p>
        ))}
      </div>
    );
  }

  return null;
}

const DetailExhibitionPage = () => {
  const { exhibitionId } = useParams();
  const navigate = useNavigate();
  const setExhibitionDraft = useRecordDraftStore((state) => state.setExhibitionDraft);
  const setExhibitionId = useRecordDraftStore((state) => state.setExhibitionId);

  const [data, setData] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);
  const [isAddressCopied, setIsAddressCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await getDetailExhibition(exhibitionId);
        if (response.data.meta.result === "SUCCESS") {
          const detail = response.data.data;
          setData(detail);
          setIsBookmarked(Boolean(detail.isBookmarked ?? detail.bookmarked));
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [exhibitionId]);

  const handleToggleBookmark = async () => {
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

  const handleCopyAddress = async (address) => {
    try {
      await navigator.clipboard.writeText(address);
      setIsAddressCopied(true);
      setTimeout(() => setIsAddressCopied(false), 1000);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGoRecord = () => {
    if (!data) return;
    setExhibitionDraft({
      title: data.title,
      artistLine: data.artistName ?? data.artist ?? "",
      venueLine: data.place ?? "",
      posterUrl: data.posterUrl,
      startDate: data.startDate,
      endDate: data.endDate,
    });
    setExhibitionId(data.exhibitionId ?? Number(exhibitionId));
    navigate("/record/detail");
  };

  if (!data) {
    return (
      <div className="app-shell">
        <div className="detail-exhibition-loading text-body-1-regular">로딩중...</div>
      </div>
    );
  }

  const genreLabel = GENRE_LABEL_BY_CODE[data.genre] ?? data.genre;
  const periodLabel = data.startDate
    ? `${formatDateDot(data.startDate)} ~ ${formatDateDot(data.endDate ?? data.startDate)}`
    : "";

  return (
    <div className="app-shell">
      <div className="detail-exhibition-topbar">
        <button type="button" className="detail-exhibition-icon-btn" onClick={() => navigate(-1)} aria-label="뒤로가기">
          <img src={chevronLeftIcon} alt="" width={20} height={20} />
        </button>
        <button
          type="button"
          className="detail-exhibition-icon-btn"
          onClick={handleToggleBookmark}
          aria-label={isBookmarked ? "관심 전시 해제" : "관심 전시 등록"}
        >
          <img src={isBookmarked ? bookmarkSelectedIcon : bookmarkDefaultIcon} alt="" width={20} height={20} />
        </button>
      </div>

      <div className="app-content detail-exhibition-content">
        <div className="app-content-pad">
          <div
            className="detail-exhibition-poster"
            style={data.posterUrl ? { backgroundImage: `url(${data.posterUrl})` } : undefined}
          >
            {!data.posterUrl && <span className="text-caption-1">Poster</span>}
          </div>

          <h1 className="detail-exhibition-title text-title-3">{data.title}</h1>
          {(data.artistName ?? data.artist) && (
            <p className="detail-exhibition-artist text-body-2-regular">{data.artistName ?? data.artist}</p>
          )}
          {genreLabel && <span className="detail-exhibition-genre-chip text-label-2">{genreLabel}</span>}

          <div className="detail-exhibition-info">
            {periodLabel && (
              <div className="detail-exhibition-info-row">
                <img src={calendarIcon} alt="" width={20} height={20} className="detail-exhibition-info-icon" />
                <p className="detail-exhibition-info-value text-body-1-regular">{periodLabel}</p>
              </div>
            )}

            {data.place && (
              <div className="detail-exhibition-info-row">
                <img src={locationIcon} alt="" width={20} height={20} className="detail-exhibition-info-icon" />
                <div className="detail-exhibition-place">
                  <button
                    type="button"
                    className="detail-exhibition-place-name-btn"
                    onClick={() => setIsLocationSheetOpen(true)}
                  >
                    <span className="detail-exhibition-place-name text-body-1-regular">{data.place}</span>
                    <img src={chevronRightIcon} alt="" width={16} height={16} />
                  </button>
                  {data.address && (
                    <p className="detail-exhibition-place-address text-body-2-regular">
                      <span>{data.address}</span>
                      <span className="detail-exhibition-copy-wrap">
                        <button
                          type="button"
                          className="detail-exhibition-copy-btn"
                          onClick={() => handleCopyAddress(data.address)}
                          aria-label="주소 복사"
                        >
                          <CopyIcon />
                        </button>
                        {isAddressCopied && (
                          <span className="detail-exhibition-copy-tooltip text-caption-1" role="status">
                            복사됨
                          </span>
                        )}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {data.operatingHours && (
              <div className="detail-exhibition-info-row">
                <img src={clockIcon} alt="" width={20} height={20} className="detail-exhibition-info-icon" />
                <OperatingHours operatingHours={data.operatingHours} />
              </div>
            )}

            {(data.admissionFee ?? data.price) && (
              <div className="detail-exhibition-info-row">
                <img src={ticketIcon} alt="" width={20} height={20} className="detail-exhibition-info-icon" />
                <p className="detail-exhibition-info-value text-body-1-regular">{data.admissionFee ?? data.price}</p>
              </div>
            )}
          </div>

          {data.detailUrl && (
            <div className="detail-exhibition-official-section">
              <a
                href={data.detailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="detail-exhibition-official-link"
              >
                공식 전시 페이지
                <ExternalLinkIcon />
              </a>
            </div>
          )}

          {(data.description ?? data.introduction) && (
            <div className="detail-exhibition-intro">
              <h2 className="detail-exhibition-intro-title text-title-3">전시 소개</h2>
              <p className="detail-exhibition-description text-body-1-regular">
                {data.description ?? data.introduction}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="detail-exhibition-footer">
        <button type="button" className="detail-exhibition-record-btn text-body-1-medium" onClick={handleGoRecord}>
          기록하기
        </button>
      </div>

      <LocationSheet
        isOpen={isLocationSheetOpen}
        onClose={() => setIsLocationSheetOpen(false)}
        venueLine={data.place}
        address={data.address}
        gpsX={data.gpsX}
        gpsY={data.gpsY}
      />
    </div>
  );
};

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 15V5a2 2 0 012-2h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 17L17 7M17 7H9M17 7V15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default DetailExhibitionPage;
