import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";

// components
import Footer from "@components/common/Footer";
import BottomSheet from "@components/common/BottomSheet";
import PhotoLightbox from "@components/record/PhotoLightbox";

// api
import { getDetailRecord, deleteRecord } from "@api/record";

// styles
import "@styles/record/DetailRecordPage.css";

// util
import { formatDateDot } from "@utils/common.js";

// icons
import chevronLeftIcon from "@images/icons/Action/Chevron Left.svg";

const DetailRecordPage = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const response = await getDetailRecord(recordId);
        if (!ignore) setData(response.data.data);
      } catch (error) {
        console.log(error);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [recordId]);

  const onSelect = useCallback((api) => setSlideIndex(api.selectedScrollSnap()), []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteRecord(recordId);
      navigate("/archive", { replace: true });
    } catch (error) {
      console.log(error);
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  if (!data) {
    return (
      <div className="app-shell">
        <div className="app-content">
          <p className="detail-record-loading text-body-1-regular">로딩중...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const title = data.exhibitionTitle;
  const posterUrl = data.exhibitionPosterUrl;
  const artistLine = data.exhibitionArtist ?? data.artistLine;
  const emotionCodes = data.emotionCodes ?? [];
  const media = data.media ?? [];
  // 사진/영상이 있으면 상단 캐러셀에 쓰고, 없으면 포스터 한 장으로 대신 채운다.
  const slides = media.length > 0 ? media : posterUrl ? [{ type: "PHOTO", url: posterUrl }] : [];

  return (
    <div className="app-shell">
      <div className="app-content detail-record-content-area">
        <div className="detail-record-hero">
          {slides.length > 0 ? (
            <div className="detail-record-hero-viewport" ref={emblaRef}>
              <div className="detail-record-hero-container">
                {slides.map((item, index) => (
                  <button
                    type="button"
                    className="detail-record-hero-slide"
                    key={item.url ?? index}
                    onClick={() => media.length > 0 && setLightboxIndex(index)}
                  >
                    {item.type === "VIDEO" ? (
                      <video src={item.url} className="detail-record-hero-media" muted playsInline />
                    ) : (
                      <img src={item.url} alt="" className="detail-record-hero-media" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="detail-record-hero-empty" />
          )}

          <button
            type="button"
            className="detail-record-hero-btn detail-record-hero-back"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
          >
            <img src={chevronLeftIcon} alt="" width={22} height={22} />
          </button>

          <button
            type="button"
            className="detail-record-hero-btn detail-record-hero-more"
            onClick={() => setIsActionOpen(true)}
            aria-label="더보기"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
              <circle cx="5" cy="11" r="1.6" fill="currentColor" />
              <circle cx="11" cy="11" r="1.6" fill="currentColor" />
              <circle cx="17" cy="11" r="1.6" fill="currentColor" />
            </svg>
          </button>

          {slides.length > 1 && (
            <span className="detail-record-hero-counter text-caption-1">
              {slideIndex + 1}/{slides.length}
            </span>
          )}
        </div>

        <div className="app-content-pad detail-record">
          {posterUrl && (
            <div
              className="detail-record-poster"
              style={{ backgroundImage: `url(${posterUrl})` }}
            />
          )}

          <div className="detail-record-head">
            <h1 className="detail-record-title text-title-3">{title}</h1>
            {artistLine && <p className="detail-record-artist text-body-2-regular">{artistLine}</p>}
            <p className="detail-record-date text-body-2-regular">{formatDateDot(data.viewedAt)}</p>
          </div>

          <div className="detail-record-divider" />

          {emotionCodes.length > 0 && (
            <section className="detail-record-section">
              <h2 className="detail-record-section-title text-heading-2">감정 키워드</h2>
              <div className="detail-record-emotion-chips">
                {emotionCodes.map((keyword) => (
                  <span key={keyword} className="detail-record-emotion-chip text-label-2">
                    {keyword}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="detail-record-section">
            <h2 className="detail-record-section-title text-heading-2">그날의 감상</h2>
            <p className="detail-record-content text-body-2-regular">{data.content}</p>
          </section>
        </div>
      </div>
      <Footer />

      <BottomSheet isOpen={isActionOpen} onClose={() => setIsActionOpen(false)} className="detail-record-action-sheet">
        <ul className="detail-record-actions">
          <li>
            <button
              type="button"
              className="detail-record-action text-body-1-regular"
              onClick={() => {
                setIsActionOpen(false);
                navigate(`/record/${recordId}/edit`);
              }}
            >
              <EditIcon />
              기록 수정
            </button>
          </li>
          <li>
            <button
              type="button"
              className="detail-record-action text-body-1-regular"
              onClick={() => {
                setIsActionOpen(false);
                navigate("/remind/write", {
                  state: {
                    candidate: {
                      recordId: Number(recordId),
                      exhibitionId: data.exhibitionId,
                      exhibitionTitle: title,
                      posterUrl,
                      place: data.exhibitionPlace,
                      viewedAt: data.viewedAt,
                      originalContent: data.content,
                      originalEmotionCodes: emotionCodes,
                    },
                  },
                });
              }}
            >
              <RemindIcon />
              리마인드 남기기
            </button>
          </li>
          {data.exhibitionId != null && (
            <li>
              <button
                type="button"
                className="detail-record-action text-body-1-regular"
                onClick={() => {
                  setIsActionOpen(false);
                  navigate(`/exhibition/${data.exhibitionId}`);
                }}
              >
                <InfoIcon />
                전시 정보 보기
              </button>
            </li>
          )}
          <li>
            <button
              type="button"
              className="detail-record-action detail-record-action--danger text-body-1-regular"
              onClick={() => {
                setIsActionOpen(false);
                setIsDeleteOpen(true);
              }}
            >
              <TrashIcon />
              기록 삭제
            </button>
          </li>
        </ul>
      </BottomSheet>

      <BottomSheet isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <h2 className="detail-record-delete-title text-title-3">기록을 삭제할까요?</h2>
        <p className="detail-record-delete-desc text-body-2-regular">
          삭제한 기록은 다시 볼 수 없어요.
        </p>
        <button
          type="button"
          className="detail-record-delete-confirm text-body-1-medium"
          disabled={isDeleting}
          onClick={handleDelete}
        >
          {isDeleting ? "삭제 중..." : "삭제할게요"}
        </button>
        <button
          type="button"
          className="detail-record-delete-cancel text-body-1-medium"
          onClick={() => setIsDeleteOpen(false)}
        >
          취소
        </button>
      </BottomSheet>

      {lightboxIndex !== null && (
        <PhotoLightbox media={media} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </div>
  );
};

function EditIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.83l-1.17-1.17a2 2 0 0 0-2.83 0L4 16v4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M13.5 6.5l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function RemindIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 9v4l2.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 4L2.5 6.5M19 4l2.5 2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default DetailRecordPage;
