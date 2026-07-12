import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import PosterUploader from "@components/record/PosterUploader";
import VenueSearchPanel from "@components/record/VenueSearchPanel";
import DateRangeSheet from "@components/record/DateRangeSheet";
import ExhibitionTypeSheet from "@components/record/ExhibitionTypeSheet";
import GenreSheet from "@components/record/GenreSheet";

function formatDateDot(dateString) {
  return dateString ? dateString.replaceAll("-", ".") : "";
}

const RecordPage = ({ pageTitle = "전시 추가", initialValues = null, onSubmit }) => {
  const navigate = useNavigate();

  const [posterFile, setPosterFile] = useState(null);
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

  const handleSubmit = () => {
    if (!isReady) return;
    onSubmit?.({ posterFile, title, venue, period, exhibitionType, genre });
  };

  return (
    <div className="app-shell">
      <Header type="sub" title={pageTitle} onBack={() => navigate(-1)} />
      <div className="app-content">
        <div className="app-content-pad record-form">
          <h1 className="record-form-guide text-title-3">전시 정보를 입력해 주세요</h1>

          <PosterUploader value={initialValues?.posterUrl ?? null} onChange={(file) => setPosterFile(file)} />

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
          disabled={!isReady}
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
        <ChevronDownIcon />
      </button>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default RecordPage;
