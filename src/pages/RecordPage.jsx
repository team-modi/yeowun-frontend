// 전시 관람 기록 페이지
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import PosterUploader from "@components/record/PosterUploader";
import VenueSearchPanel from "@components/record/VenueSearchPanel";
import DateRangeSheet from "@components/record/DateRangeSheet";
import ExhibitionTypeSheet from "@components/record/ExhibitionTypeSheet";
import GenreSheet from "@components/record/GenreSheet";

// api
import { addPersonalExhibition } from "@api/exhibition";
import { uploadMedia } from "@api/media";

// store
import { useRecordDraftStore } from "@store/useRecordDraftStore";

// icons
import chevronDownIcon from "@images/icons/Action/Chevron Down.svg";

function formatDateDot(dateString) {
  return dateString ? dateString.replaceAll("-", ".") : "";
}

const RecordPage = ({ pageTitle = "전시 추가", initialValues = null, onSubmit }) => {
  const navigate = useNavigate();
  const setExhibitionDraft = useRecordDraftStore((state) => state.setExhibitionDraft);
  const setExhibitionId = useRecordDraftStore((state) => state.setExhibitionId);

  const [posterFile, setPosterFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState(null);
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [venue, setVenue] = useState(initialValues?.venue ?? null);
  const [period, setPeriod] = useState(initialValues?.period ?? null);
  const [exhibitionType, setExhibitionType] = useState(initialValues?.exhibitionType ?? null);
  const [genre, setGenre] = useState(initialValues?.genre ?? null);

  const [isVenueSearchOpen, setIsVenueSearchOpen] = useState(false);
  const [isPeriodSheetOpen, setIsPeriodSheetOpen] = useState(false);
  const [isTypeSheetOpen, setIsTypeSheetOpen] = useState(false);
  const [isGenreSheetOpen, setIsGenreSheetOpen] = useState(false);

  const periodLabel = useMemo(() => {
    if (!period?.startDate) return "";
    const start = formatDateDot(period.startDate);
    const end = period.endDate ? formatDateDot(period.endDate) : start;
    return `${start} ~ ${end}`;
  }, [period]);

  const typeLabel = useMemo(() => {
    if (!exhibitionType) return "";
    return exhibitionType.artistName ? `${exhibitionType.label} · ${exhibitionType.artistName}` : exhibitionType.label;
  }, [exhibitionType]);

  const isReady =
    title.trim().length > 0 &&
    Boolean(venue) &&
    Boolean(period?.startDate) &&
    Boolean(exhibitionType) &&
    Boolean(genre);

  const handleSubmit = async () => {
    if (!isReady || isSubmitting) return;

    const draft = {
      title,
      artistLine: exhibitionType.artistName
        ? `${exhibitionType.label} · ${exhibitionType.artistName}`
        : exhibitionType.label,
      venueLine: venue?.name ?? "",
      posterUrl: posterPreviewUrl,
      startDate: period.startDate,
      endDate: period.endDate ?? period.startDate,
    };

    setIsSubmitting(true);
    try {
      let posterUrl;
      if (posterFile) {
        const uploaded = await uploadMedia(posterFile);
        posterUrl = uploaded.url;
      }

      const venueId = venue?.venueId ?? venue?.id;
      const genreCode = genre?.codes?.[0];

      const payload = {
        title,
        venueId,
        place: venue?.name,
        startDate: period.startDate,
        endDate: period.endDate ?? period.startDate,
        region: venue?.region,
        category: genreCode,
        format: exhibitionType.type?.toUpperCase(),
        artist: exhibitionType.artistName || undefined,
        posterUrl,
        genreKeyword: genre?.label,
      };

      const response = await addPersonalExhibition(payload);
      const exhibitionId = response.data.data?.exhibitionId ?? null;

      setExhibitionDraft(draft);
      setExhibitionId(exhibitionId);
      onSubmit?.(draft);
      navigate("/record/detail");
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <Header type="sub" title={pageTitle} onBack={() => navigate(-1)} />
      <div className="app-content">
        <div className="app-content-pad record-form">
          <h1 className="record-form-guide text-title-3">전시 정보를 입력해 주세요</h1>

          <PosterUploader
            value={initialValues?.posterUrl ?? null}
            onChange={(file, url) => {
              setPosterFile(file);
              setPosterPreviewUrl(url);
            }}
          />

          <div className="record-form-field">
            <label className="record-form-label text-heading-2" htmlFor="record-title">
              전시명
            </label>
            <input
              id="record-title"
              type="text"
              className="record-form-input text-body-1-regular"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="전시명을 입력해 주세요"
            />
          </div>

          <SelectField
            label="전시관"
            value={venue?.name}
            placeholder="전시관을 선택해 주세요"
            onClick={() => setIsVenueSearchOpen(true)}
          />

          <SelectField
            label="전시 기간"
            value={periodLabel}
            placeholder="전시 기간을 선택해 주세요"
            onClick={() => setIsPeriodSheetOpen(true)}
          />

          <SelectField
            label="전시 형태"
            value={typeLabel}
            placeholder="전시 형태를 선택해 주세요"
            onClick={() => setIsTypeSheetOpen(true)}
          />

          <SelectField
            label="장르"
            value={genre?.label}
            placeholder="장르를 선택해 주세요"
            onClick={() => setIsGenreSheetOpen(true)}
          />
        </div>
      </div>

      <div className="record-form-footer">
        <button
          type="button"
          className="record-form-submit text-body-1-medium"
          disabled={!isReady || isSubmitting}
          onClick={handleSubmit}
        >
          다음
        </button>
      </div>

      <VenueSearchPanel isOpen={isVenueSearchOpen} onClose={() => setIsVenueSearchOpen(false)} onSelect={setVenue} />

      <DateRangeSheet
        isOpen={isPeriodSheetOpen}
        onClose={() => setIsPeriodSheetOpen(false)}
        value={period}
        onApply={setPeriod}
      />

      <ExhibitionTypeSheet
        isOpen={isTypeSheetOpen}
        onClose={() => setIsTypeSheetOpen(false)}
        value={exhibitionType}
        onApply={setExhibitionType}
      />

      <GenreSheet
        isOpen={isGenreSheetOpen}
        onClose={() => setIsGenreSheetOpen(false)}
        value={genre?.value}
        onApply={setGenre}
      />
    </div>
  );
};

function SelectField({ label, value, placeholder, onClick }) {
  return (
    <div className="record-form-field">
      <span className="record-form-label text-heading-2">{label}</span>
      <button type="button" className="record-form-select" onClick={onClick}>
        <span className={`text-body-1-regular ${value ? "" : "is-placeholder"}`}>{value || placeholder}</span>
        <img src={chevronDownIcon} alt="" width={20} height={20} />
      </button>
    </div>
  );
}

export default RecordPage;
