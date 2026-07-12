import { useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import SingleDateSheet from "@components/record/SingleDateSheet";
import EmotionKeywordSheet from "@components/record/EmotionKeywordSheet";
import MediaAttachSheet from "@components/record/MediaAttachSheet";

// store
import { useRecordDraftStore } from "@store/useRecordDraftStore";

// styles
import "@styles/record/RecordDetailInputPage.css";

const MAX_MEDIA = 5;

function formatDateDot(dateKey) {
  if (!dateKey) return "";
  const [year, month, day] = dateKey.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

// 전시 선택(RecordExhibitionSelectPage) 또는 전시 직접 추가(RecordPage) 다음 단계.
// 관람일 · 감정 키워드 · 미디어(사진/영상)를 입력받아 스토어에 채워 넣고, 이후 모드 선택(RecordModePage)으로 이어짐.
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

  const handleAddMedia = (items) => {
    const next = [...media, ...items].slice(0, MAX_MEDIA).map((item, index) => ({ ...item, sortOrder: index }));
    setMedia(next);
  };

  const handleRemoveMedia = (index) => {
    const next = media.filter((_, i) => i !== index).map((item, i) => ({ ...item, sortOrder: i }));
    setMedia(next);
  };

  // TODO: 감정 키워드/미디어는 화면 문구("있다면 추가해 주세요")상 선택 사항으로 보여 필수값에서 제외함 — 관람일만 필수로 처리.
  const isReady = Boolean(viewedAt);

  const handleNext = () => {
    if (!isReady) return;
    navigate("/record/mode");
  };

  return (
    <div className="app-shell">
      <Header type="sub" title="기록 작성" onBack={() => navigate(-1)} />
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
              <CalendarIcon />
            </button>
          </section>

          <section className="record-detail-section">
            <h2 className="record-detail-section-title text-heading-2">감정 키워드</h2>
            <p className="record-detail-section-desc text-body-2-regular">
              전시를 보고 마음에 남았던 감정을 선택해 보세요
            </p>
            {emotionCodes.length > 0 ? (
              <div className="record-detail-emotion-chips">
                {emotionCodes.map((keyword) => (
                  <span key={keyword} className="record-detail-emotion-chip text-label-2">
                    {keyword}
                  </span>
                ))}
                <button
                  type="button"
                  className="record-detail-emotion-edit"
                  onClick={() => setIsEmotionSheetOpen(true)}
                  aria-label="감정 키워드 수정"
                >
                  <PlusIcon />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="record-detail-emotion-add"
                onClick={() => setIsEmotionSheetOpen(true)}
                aria-label="감정 키워드 추가"
              >
                <PlusIcon />
              </button>
            )}
          </section>

          <section className="record-detail-section">
            <h2 className="record-detail-section-title text-heading-2">내가 바라본 전시</h2>
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
                <ImageIcon />
                <span className="text-label-2">
                  {media.length}/{MAX_MEDIA}
                </span>
              </button>
              {media.map((item, index) => (
                <div key={item.url} className="record-detail-media-thumb">
                  {item.type === "VIDEO" ? (
                    <>
                      <video src={item.url} className="record-detail-media-thumb-media" muted />
                      <span className="record-detail-media-play">
                        <PlayIcon />
                      </span>
                    </>
                  ) : (
                    <img src={item.url} alt="" className="record-detail-media-thumb-media" />
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

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="10" r="1.6" fill="currentColor" />
      <path
        d="M21 15l-5-5-4 4-2-2-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 3v5M14.5 5.5H19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  );
}
