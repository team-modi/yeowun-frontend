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

function formatDateDot(dateString) {
  return dateString ? dateString.replaceAll("-", ".") : "";
}

function OperatingHours({ operatingHours }) {
  if (!operatingHours) return null;

  if (typeof operatingHours === "string") {
    return <p className="detail-exhibition-info-value text-body-1-regular">{operatingHours}</p>;
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
          <ChevronLeftIcon />
        </button>
        <button
          type="button"
          className="detail-exhibition-icon-btn"
          onClick={handleToggleBookmark}
          aria-label={isBookmarked ? "관심 전시 해제" : "관심 전시 등록"}
        >
          <BookmarkIcon filled={isBookmarked} />
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
                <span className="detail-exhibition-info-label text-body-2-regular">전시 기간</span>
                <p className="detail-exhibition-info-value text-body-1-regular">{periodLabel}</p>
              </div>
            )}

            {data.place && (
              <div className="detail-exhibition-info-row">
                <span className="detail-exhibition-info-label text-body-2-regular">장소</span>
                <div className="detail-exhibition-place">
                  {/* 장소명(+화살표)만 누르면 위치확인 시트 오픈 — 주소는 이 버튼 밖으로 빼서 사용자가 그대로 드래그해서 복사할 수 있게 함 */}
                  <button
                    type="button"
                    className="detail-exhibition-place-name-btn"
                    onClick={() => setIsLocationSheetOpen(true)}
                  >
                    <span className="detail-exhibition-place-name text-body-1-regular">{data.place}</span>
                    <ChevronRightIcon />
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
                <span className="detail-exhibition-info-label text-body-2-regular">운영 시간</span>
                <OperatingHours operatingHours={data.operatingHours} />
              </div>
            )}

            {(data.admissionFee ?? data.price) && (
              <div className="detail-exhibition-info-row">
                <span className="detail-exhibition-info-label text-body-2-regular">관람료</span>
                <p className="detail-exhibition-info-value text-body-1-regular">{data.admissionFee ?? data.price}</p>
              </div>
            )}

            {(data.description ?? data.introduction) && (
              <div className="detail-exhibition-info-row">
                <span className="detail-exhibition-info-label text-body-2-regular">전시 소개</span>
                <p className="detail-exhibition-description text-body-1-regular">
                  {data.description ?? data.introduction}
                </p>
              </div>
            )}
          </div>
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

function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 15V5a2 2 0 012-2h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BookmarkIcon({ filled }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}>
      <path
        d="M6 3.5h12a1 1 0 011 1V21l-7-4-7 4V4.5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default DetailExhibitionPage;
