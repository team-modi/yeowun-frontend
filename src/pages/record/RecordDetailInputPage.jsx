import { useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import SingleDateSheet from "@components/record/SingleDateSheet";
import EmotionKeywordSheet from "@components/record/EmotionKeywordSheet";
import MediaAttachSheet from "@components/record/MediaAttachSheet";

// store
import { useRecordDraftStore } from "@store/useRecordDraftStore";

// utils
import { WEEKDAYS } from "@utils/filterCodes";

// styles
import "@styles/record/RecordDetailInputPage.css";

// icons
import calendarIcon from "@images/icons/Info/Calendar.svg";
import plusIcon from "@images/icons/Action/Add.svg";
import writeIcon from "@images/icons/Action/Write.svg";
import imageAddIcon from "@images/icons/Action/Image Add.svg";

const MAX_MEDIA = 5;

// "YYYY-MM-DD" -> "YYYY년 MM월 D일(요일)"
function formatDateDot(dateKey) {
  if (!dateKey) return "";
  const [year, month, day] = dateKey.split("-");
  const weekday = WEEKDAYS[new Date(Number(year), Number(month) - 1, Number(day)).getDay()];
  return `${year}년 ${month}월 ${Number(day)}일(${weekday})`;
}

export default function RecordDetailInputPage() {
  const navigate = useNavigate();
  const exhibitionDraft = useRecordDraftStore((state) => state.exhibitionDraft);
  const viewedAt = useRecordDraftStore((state) => state.viewedAt);
  const setViewedAt = useRecordDraftStore((state) => state.setViewedAt);
  const emotionCodes = useRecordDraftStore((state) => state.emotionCodes);
  const setEmotionCodes = useRecordDraftStore((state) => state.setEmotionCodes);
  const media = useRecordDraftStore((state) => state.media);
  const setMedia = useRecordDraftStore((state) => state.setMedia);

  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);
  const [isEmotionSheetOpen, setIsEmotionSheetOpen] = useState(false);
  const [isMediaSheetOpen, setIsMediaSheetOpen] = useState(false);
  const [mediaLoadErrors, setMediaLoadErrors] = useState({});

  const handleAddMedia = (items) => {
    const next = [...media, ...items].slice(0, MAX_MEDIA).map((item, index) => ({ ...item, sortOrder: index }));
    setMedia(next);
  };

  const handleRemoveMedia = (index) => {
    const next = media.filter((_, i) => i !== index).map((item, i) => ({ ...item, sortOrder: i }));
    setMedia(next);
  };

  const isReady = Boolean(viewedAt) && emotionCodes.length > 0;

  const handleNext = () => {
    if (!isReady) return;
    navigate("/record/mode");
  };

  return (
    <div className="app-shell">
      <Header type="back" title="관람 정보 기록" onBack={() => navigate(-1)} />
      <div className="app-content">
        <div className="app-content-pad record-detail">
          <div className="record-detail-summary">
            <div
              className="record-detail-summary-thumb"
              style={exhibitionDraft?.posterUrl ? { backgroundImage: `url(${exhibitionDraft.posterUrl})` } : undefined}
            >
              {!exhibitionDraft?.posterUrl && <span className="text-caption-1">Poster</span>}
            </div>
            <div className="record-detail-summary-content">
              <p className="record-detail-summary-title text-heading-2">{exhibitionDraft?.title}</p>
              {exhibitionDraft?.artistLine && (
                <p className="record-detail-summary-artist text-body-2-regular">{exhibitionDraft.artistLine}</p>
              )}
              {exhibitionDraft?.venueLine && (
                <p className="record-detail-summary-venue text-body-2-regular">{exhibitionDraft.venueLine}</p>
              )}
            </div>
          </div>

          <section className="record-detail-section">
            <h2 className="record-detail-section-title text-heading-2">관람일</h2>
            <button type="button" className="record-detail-date-select" onClick={() => setIsDateSheetOpen(true)}>
              <span className={`text-body-1-regular ${viewedAt ? "" : "is-placeholder"}`}>
                {viewedAt ? formatDateDot(viewedAt) : "관람 날짜를 선택해 주세요"}
              </span>
              <img src={calendarIcon} alt="" width={20} height={20} />
            </button>
          </section>

          <section className="record-detail-section">
            <h2 className="record-detail-section-title text-heading-2">감정 키워드</h2>
            <p className="record-detail-section-desc text-body-2-regular">
              전시를 보고 마음에 남았던 감정을 선택해 보세요
            </p>
            {emotionCodes.length > 0 ? (
              <>
                <div className="record-detail-emotion-chips">
                  {emotionCodes.map((keyword) => (
                    <span key={keyword} className="record-detail-emotion-chip text-label-2">
                      {keyword}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="record-detail-emotion-edit text-body-2-regular"
                  onClick={() => setIsEmotionSheetOpen(true)}
                >
                  키워드 편집하기
                  <img src={writeIcon} alt="" width={14} height={14} />
                </button>
              </>
            ) : (
              <button
                type="button"
                className="record-detail-emotion-add text-body-1-regular"
                onClick={() => setIsEmotionSheetOpen(true)}
              >
                감정 키워드 추가하기
                <img src={plusIcon} alt="" width={18} height={18} />
              </button>
            )}
          </section>

          <section className="record-detail-section">
            <div className="record-detail-section-header">
              <h2 className="record-detail-section-title text-heading-2">기억에 남은 장면</h2>
              <span className="record-detail-section-hint text-caption-1">최대 {MAX_MEDIA}개 · 영상은 30초 이하</span>
            </div>
            <p className="record-detail-section-desc text-body-2-regular">
              전시를 떠올릴 수 있는 장면이 있다면 추가해 주세요
            </p>
            <div className="record-detail-media-grid">
              <button
                type="button"
                className="record-detail-media-add"
                onClick={() => setIsMediaSheetOpen(true)}
                disabled={media.length >= MAX_MEDIA}
              >
                <img src={imageAddIcon} alt="" width={24} height={24} />
                <span className="text-label-2">
                  {media.length}/{MAX_MEDIA}
                </span>
              </button>
              {media.map((item, index) => (
                <div key={item.url} className="record-detail-media-thumb">
                  {mediaLoadErrors[item.url] ? (
                    <span className="record-detail-media-error text-caption-1">불러오기 실패</span>
                  ) : item.type === "VIDEO" ? (
                    <>
                      <video
                        src={item.url}
                        className="record-detail-media-thumb-media"
                        muted
                        onError={() => setMediaLoadErrors((prev) => ({ ...prev, [item.url]: true }))}
                      />
                      <span className="record-detail-media-play">
                        <PlayIcon />
                      </span>
                    </>
                  ) : (
                    <img
                      src={item.url}
                      alt=""
                      className="record-detail-media-thumb-media"
                      onError={() => setMediaLoadErrors((prev) => ({ ...prev, [item.url]: true }))}
                    />
                  )}
                  <button
                    type="button"
                    className="record-detail-media-remove"
                    onClick={() => handleRemoveMedia(index)}
                    aria-label="미디어 삭제"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="record-detail-footer">
        <button
          type="button"
          className="record-detail-submit text-body-1-medium"
          disabled={!isReady}
          onClick={handleNext}
        >
          다음
        </button>
      </div>

      <SingleDateSheet
        isOpen={isDateSheetOpen}
        onClose={() => setIsDateSheetOpen(false)}
        value={viewedAt}
        onApply={setViewedAt}
      />

      <EmotionKeywordSheet
        isOpen={isEmotionSheetOpen}
        onClose={() => setIsEmotionSheetOpen(false)}
        value={emotionCodes}
        onApply={setEmotionCodes}
      />

      <MediaAttachSheet
        isOpen={isMediaSheetOpen}
        onClose={() => setIsMediaSheetOpen(false)}
        remaining={MAX_MEDIA - media.length}
        onAdd={handleAddMedia}
      />
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  );
}
