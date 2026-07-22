// 전시 직접 추가 페이지
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import PosterUploader from "@components/record/PosterUploader";
import VenueSearchPanel from "@components/record/VenueSearchPanel";
import SingleDateSheet from "@components/record/SingleDateSheet";
import GenreSheet from "@components/record/GenreSheet";

// api
import { addPersonalExhibition } from "@api/exhibition";
import { uploadMedia } from "@api/media";

// store
import { useRecordDraftStore } from "@store/useRecordDraftStore";

// utils
import { WEEKDAYS } from "@utils/filterCodes";

// styles
import "@styles/record/RecordPage.css";

// icons
import chevronDownIcon from "@images/icons/Action/Chevron Down.svg";
import calendarIcon from "@images/icons/Info/Calendar.svg";
import writeIcon from "@images/icons/Action/Write.svg";

const PERIOD_TYPE_OPTIONS = [
  { value: "RANGE", label: "기간 전시" },
  { value: "PERMANENT", label: "상설 전시" },
  { value: "UNKNOWN_END", label: "종료일 미정" },
];

// "YYYY-MM-DD" -> "YY.MM.DD(요일)"
function formatShortDateWithWeekday(dateKey) {
  if (!dateKey) return "";
  const [year, month, day] = dateKey.split("-");
  const weekday = WEEKDAYS[new Date(Number(year), Number(month) - 1, Number(day)).getDay()];
  return `${year.slice(2)}.${month}.${day}(${weekday})`;
}

const RecordPage = ({ initialValues = null, onSubmit }) => {
  const navigate = useNavigate();
  const setExhibitionDraft = useRecordDraftStore((state) => state.setExhibitionDraft);
  const setExhibitionId = useRecordDraftStore((state) => state.setExhibitionId);

  const [posterFile, setPosterFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState(null);
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [venue, setVenue] = useState(initialValues?.venue ?? null);
  const [periodType, setPeriodType] = useState(initialValues?.periodType ?? "RANGE");
  const [startDate, setStartDate] = useState(initialValues?.period?.startDate ?? null);
  const [endDate, setEndDate] = useState(initialValues?.period?.endDate ?? null);
  const [artistName, setArtistName] = useState(initialValues?.artistName ?? "");
  const [genres, setGenres] = useState(initialValues?.genres ?? []);

  const [isVenueSearchOpen, setIsVenueSearchOpen] = useState(false);
  const [isStartSheetOpen, setIsStartSheetOpen] = useState(false);
  const [isEndSheetOpen, setIsEndSheetOpen] = useState(false);
  const [isGenreSheetOpen, setIsGenreSheetOpen] = useState(false);

  const handlePeriodTypeChange = (nextType) => {
    setPeriodType(nextType);
    if (nextType !== "RANGE") setEndDate(null);
  };

  const isPeriodReady =
    periodType === "PERMANENT"
      ? true
      : periodType === "UNKNOWN_END"
        ? Boolean(startDate)
        : Boolean(startDate && endDate);

  const isReady = title.trim().length > 0 && Boolean(venue) && isPeriodReady;

  const handleSubmit = async () => {
    if (!isReady || isSubmitting) return;

    const draft = {
      title,
      artistLine: artistName.trim(),
      venueLine: venue?.name ?? "",
      posterUrl: posterPreviewUrl,
      startDate: periodType === "PERMANENT" ? null : startDate,
      endDate: periodType === "RANGE" ? endDate : startDate,
    };

    setIsSubmitting(true);
    try {
      let posterUrl;
      if (posterFile) {
        const uploaded = await uploadMedia(posterFile);
        posterUrl = uploaded.url;
      }

      const venueId = venue?.venueId ?? venue?.id;

      const payload = {
        title,
        venueId,
        place: venue?.name,
        startDate: periodType === "PERMANENT" ? undefined : startDate,
        endDate: periodType === "RANGE" ? endDate : undefined,
        periodType,
        region: venue?.region,
        category: genres.length > 0 ? genres.flatMap((item) => item.codes).join(",") : undefined,
        artist: artistName.trim() || undefined,
        posterUrl,
        genreKeyword: genres.length > 0 ? genres.map((item) => item.label).join(", ") : undefined,
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
      <Header type="back" title="전시 직접 추가" onBack={() => navigate(-1)} />
      <div className="app-content">
        <div className="app-content-pad record-form">
          <FieldGroup label="전시 포스터">
            <PosterUploader
              value={initialValues?.posterUrl ?? null}
              onChange={(file, url) => {
                setPosterFile(file);
                setPosterPreviewUrl(url);
              }}
            />
          </FieldGroup>

          <FieldGroup label="전시명" required>
            <input
              id="record-title"
              type="text"
              className="record-form-input text-body-1-regular"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="전시명을 입력해 주세요"
            />
          </FieldGroup>

          <FieldGroup label="전시관" required>
            <button type="button" className="record-form-select" onClick={() => setIsVenueSearchOpen(true)}>
              <span className={`text-body-1-regular ${venue?.name ? "" : "is-placeholder"}`}>
                {venue?.name || "전시관을 선택해 주세요"}
              </span>
              <img src={chevronDownIcon} alt="" width={20} height={20} />
            </button>
          </FieldGroup>

          <FieldGroup label="전시 기간" required>
            <div className="record-form-period-toggle">
              {PERIOD_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`record-form-period-toggle-btn text-body-2-regular ${
                    periodType === option.value ? "is-selected" : ""
                  }`}
                  onClick={() => handlePeriodTypeChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {periodType === "PERMANENT" ? (
              <p className="record-form-period-banner text-body-2-regular">상설 전시로 등록됩니다.</p>
            ) : (
              <div className="record-form-period-box">
                <button type="button" className="record-form-period-field" onClick={() => setIsStartSheetOpen(true)}>
                  <span className={`text-body-1-regular ${startDate ? "" : "is-placeholder"}`}>
                    {startDate ? formatShortDateWithWeekday(startDate) : "시작일"}
                  </span>
                  <img src={calendarIcon} alt="" width={18} height={18} />
                </button>
                <span className="record-form-period-sep">—</span>
                {periodType === "UNKNOWN_END" ? (
                  <span className="record-form-period-field record-form-period-field--disabled text-body-1-regular">
                    종료일 미정
                  </span>
                ) : (
                  <button type="button" className="record-form-period-field" onClick={() => setIsEndSheetOpen(true)}>
                    <span className={`text-body-1-regular ${endDate ? "" : "is-placeholder"}`}>
                      {endDate ? formatShortDateWithWeekday(endDate) : "종료일"}
                    </span>
                    <img src={calendarIcon} alt="" width={18} height={18} />
                  </button>
                )}
              </div>
            )}
          </FieldGroup>

          <FieldGroup label="작가명">
            <input
              type="text"
              className="record-form-input text-body-1-regular"
              value={artistName}
              onChange={(event) => setArtistName(event.target.value)}
              placeholder="작가명을 입력해 주세요"
            />
          </FieldGroup>

          <FieldGroup label="장르">
            {genres.length > 0 ? (
              <>
                <div className="record-form-genre-chips">
                  {genres.map((item) => (
                    <span key={item.value} className="record-form-genre-chip text-label-2">
                      {item.label}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="record-form-genre-edit text-body-2-regular"
                  onClick={() => setIsGenreSheetOpen(true)}
                >
                  장르 수정하기
                  <img src={writeIcon} alt="" width={14} height={14} />
                </button>
              </>
            ) : (
              <button type="button" className="record-form-select" onClick={() => setIsGenreSheetOpen(true)}>
                <span className="text-body-1-regular is-placeholder">장르를 선택해 주세요</span>
                <img src={chevronDownIcon} alt="" width={20} height={20} />
              </button>
            )}
          </FieldGroup>
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

      <SingleDateSheet
        isOpen={isStartSheetOpen}
        onClose={() => setIsStartSheetOpen(false)}
        value={startDate}
        onApply={(date) => {
          setStartDate(date);
          if (periodType === "RANGE" && endDate && new Date(date) > new Date(endDate)) setEndDate(null);
        }}
        title="시작일 선택"
        placeholder="시작일을 선택해 주세요"
      />

      <SingleDateSheet
        isOpen={isEndSheetOpen}
        onClose={() => setIsEndSheetOpen(false)}
        value={endDate}
        onApply={setEndDate}
        title="종료일 선택"
        placeholder="종료일을 선택해 주세요"
      />

      <GenreSheet
        isOpen={isGenreSheetOpen}
        onClose={() => setIsGenreSheetOpen(false)}
        value={genres}
        onApply={setGenres}
      />
    </div>
  );
};

function FieldGroup({ label, required, children }) {
  return (
    <div className="record-form-field">
      <span className="record-form-label text-heading-2">
        {label}
        <span
          className={`record-form-badge text-label-3 ${
            required ? "record-form-badge--required" : "record-form-badge--optional"
          }`}
        >
          {required ? "필수" : "선택"}
        </span>
      </span>
      {children}
    </div>
  );
}

export default RecordPage;
