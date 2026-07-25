// 기록 수정 — 기록 상세의 ⋯ 메뉴에서 진입. content·감정 키워드·미디어·관람일을 교체 저장한다.
// PUT /records/{id}는 전체 교체라 기존 미디어를 다시 실어 보존한다(안 보내면 사진이 다 지워짐).
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// components
import Header from "@components/common/Header";
import SingleDateSheet from "@components/record/SingleDateSheet";
import EmotionKeywordSheet from "@components/record/EmotionKeywordSheet";
import MediaAttachSheet from "@components/record/MediaAttachSheet";

// api
import { getDetailRecord, updateRecord } from "@api/record";

// styles — 작성 입력 화면 스타일을 재사용하고 편집 전용 요소만 덧붙인다.
import "@styles/record/RecordDetailInputPage.css";
import "@styles/record/RecordEditPage.css";

// icons
import calendarIcon from "@images/icons/Info/Calendar.svg";
import plusIcon from "@images/icons/Action/Add.svg";
import imageAddIcon from "@images/icons/Action/Image Add.svg";

const MAX_MEDIA = 5;
const CONTENT_MAX_LENGTH = 300;

function formatDateLabel(dateKey) {
  if (!dateKey) return "";
  const [year, month, day] = dateKey.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

export default function RecordEditPage() {
  const { recordId } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null); // 전시 요약(읽기 전용)
  const [viewedAt, setViewedAt] = useState("");
  const [emotionCodes, setEmotionCodes] = useState([]);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState([]);

  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);
  const [isEmotionSheetOpen, setIsEmotionSheetOpen] = useState(false);
  const [isMediaSheetOpen, setIsMediaSheetOpen] = useState(false);
  const [mediaLoadErrors, setMediaLoadErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const response = await getDetailRecord(recordId);
        if (ignore) return;
        const detail = response.data.data;
        setSummary({
          title: detail.exhibitionTitle,
          posterUrl: detail.exhibitionPosterUrl,
          artistLine: detail.exhibitionArtist,
        });
        setViewedAt(detail.viewedAt ?? "");
        setEmotionCodes(detail.emotionCodes ?? []);
        setContent(detail.content ?? "");
        setMedia(
          (detail.media ?? []).map((item, index) => ({
            type: item.type,
            url: item.url,
            sizeBytes: item.sizeBytes ?? 0,
            sortOrder: index,
          })),
        );
      } catch (err) {
        console.log(err);
        if (!ignore) setLoadError(true);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [recordId]);

  const handleAddMedia = (items) => {
    const next = [...media, ...items].slice(0, MAX_MEDIA).map((item, index) => ({ ...item, sortOrder: index }));
    setMedia(next);
  };

  const handleRemoveMedia = (index) => {
    const next = media.filter((_, i) => i !== index).map((item, i) => ({ ...item, sortOrder: i }));
    setMedia(next);
  };

  // 백엔드 계약: content 필수(@NotBlank), emotionCodes 최소 1개(@NotEmpty).
  const isReady = content.trim().length > 0 && emotionCodes.length > 0;

  const handleSave = async () => {
    if (!isReady || isSaving) return;
    setIsSaving(true);
    setError("");
    try {
      await updateRecord(recordId, {
        viewedAt: viewedAt || null,
        content: content.trim(),
        emotionCodes,
        media: media.map(({ type, url, sortOrder, sizeBytes }) => ({ type, url, sortOrder, sizeBytes: sizeBytes ?? 0 })),
      });
      navigate(`/record/${recordId}`, { replace: true });
    } catch (err) {
      console.log(err);
      setError("저장에 실패했어요. 다시 시도해 주세요.");
      setIsSaving(false);
    }
  };

  if (isLoading || loadError) {
    return (
      <div className="app-shell">
        <Header type="back" title="기록 수정" onBack={() => navigate(-1)} />
        <div className="app-content">
          <p className="record-edit-loading text-body-1-regular">
            {loadError ? "기록을 불러오지 못했어요." : "불러오는 중..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header type="back" title="기록 수정" onBack={() => navigate(-1)} />
      <div className="app-content">
        <div className="app-content-pad record-edit">
          {summary && (
            <div className="record-detail-summary">
              <div
                className="record-detail-summary-thumb"
                style={summary.posterUrl ? { backgroundImage: `url(${summary.posterUrl})` } : undefined}
              >
                {!summary.posterUrl && <span className="text-caption-1">Poster</span>}
              </div>
              <div className="record-detail-summary-content">
                <p className="record-detail-summary-title text-heading-2">{summary.title}</p>
                {summary.artistLine && (
                  <p className="record-detail-summary-artist text-body-2-regular">{summary.artistLine}</p>
                )}
              </div>
            </div>
          )}

          <section className="record-detail-section">
            <h2 className="record-detail-section-title text-heading-2">관람일</h2>
            <button type="button" className="record-detail-date-select" onClick={() => setIsDateSheetOpen(true)}>
              <span className={`text-body-1-regular ${viewedAt ? "" : "is-placeholder"}`}>
                {viewedAt ? formatDateLabel(viewedAt) : "관람 날짜를 선택해 주세요"}
              </span>
              <img src={calendarIcon} alt="" width={20} height={20} />
            </button>
          </section>

          <section className="record-detail-section">
            <h2 className="record-detail-section-title text-heading-2">감정 키워드</h2>
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
                  <img src={plusIcon} alt="" width={16} height={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="record-detail-emotion-add"
                onClick={() => setIsEmotionSheetOpen(true)}
                aria-label="감정 키워드 추가"
              >
                <img src={plusIcon} alt="" width={16} height={16} />
              </button>
            )}
          </section>

          <section className="record-detail-section">
            <h2 className="record-detail-section-title text-heading-2">그날의 감상</h2>
            <div className="record-edit-box">
              <textarea
                className="record-edit-textarea text-body-2-regular"
                value={content}
                maxLength={CONTENT_MAX_LENGTH}
                onChange={(event) => setContent(event.target.value)}
                placeholder="그날의 감상을 남겨보세요"
              />
              <span className="record-edit-count text-caption-1">
                {content.length}/{CONTENT_MAX_LENGTH}
              </span>
            </div>
          </section>

          <section className="record-detail-section">
            <h2 className="record-detail-section-title text-heading-2">기억에 남은 장면</h2>
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
                    <video
                      src={item.url}
                      className="record-detail-media-thumb-media"
                      muted
                      onError={() => setMediaLoadErrors((prev) => ({ ...prev, [item.url]: true }))}
                    />
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

          {error && <p className="record-edit-error text-caption-1">{error}</p>}
        </div>
      </div>

      <div className="record-detail-footer">
        <button
          type="button"
          className="record-detail-submit text-body-1-medium"
          disabled={!isReady || isSaving}
          onClick={handleSave}
        >
          {isSaving ? "저장 중…" : "저장하기"}
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
