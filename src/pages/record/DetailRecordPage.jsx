import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";

// components
import Header from "@components/common/Header";
import HeaderMenuButton from "@components/common/HeaderMenuButton";
import Footer from "@components/common/Footer";
import { EditIcon, RemindIcon, InfoIcon, TrashIcon } from "@components/common/ActionSheet";
import DeleteConfirmSheet from "@components/common/DeleteConfirmSheet";
import PhotoLightbox from "@components/record/PhotoLightbox";

// api
import { getDetailRecord, deleteRecord } from "@api/record";

// styles
import "@styles/record/DetailRecordPage.css";

// util
import { formatDateDot } from "@utils/common.js";

const DetailRecordPage = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
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
        {/* <Header type="menu" /> */}
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
      <Header type="back" title="" onBack={() => navigate(-1)} />
      <HeaderMenuButton
        actions={[
          {
            label: "기록 수정",
            icon: <EditIcon />,
            onClick: () => navigate(`/record/${recordId}/edit`),
          },
          {
            label: "리마인드 남기기",
            icon: <RemindIcon />,
            onClick: () =>
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
              }),
          },
          data.exhibitionId != null && {
            label: "전시 정보 보기",
            icon: <InfoIcon />,
            onClick: () => navigate(`/exhibition/${data.exhibitionId}`),
          },
          {
            label: "기록 삭제",
            icon: <TrashIcon />,
            danger: true,
            onClick: () => setIsDeleteOpen(true),
          },
        ]}
      />
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

          {slides.length > 1 && (
            <span className="detail-record-hero-counter text-caption-1">
              {slideIndex + 1}/{slides.length}
            </span>
          )}
        </div>

        <div className="app-content-pad detail-record">
          {posterUrl && <div className="detail-record-poster" style={{ backgroundImage: `url(${posterUrl})` }} />}

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

      <DeleteConfirmSheet
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      {lightboxIndex !== null && (
        <PhotoLightbox media={media} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </div>
  );
};

export default DetailRecordPage;
