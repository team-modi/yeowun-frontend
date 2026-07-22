// styles
import "@styles/record/ExhibitionConfirmSheet.css";

export default function ExhibitionConfirmSheet({ exhibition, onCancel, onConfirm }) {
  if (!exhibition) return null;

  const artistLabel = exhibition.artistSummary ?? exhibition.artistName ?? exhibition.artist ?? "";
  const dateLabel =
    exhibition.dateRange ??
    (exhibition.startDate && exhibition.endDate ? `${exhibition.startDate} ~ ${exhibition.endDate}` : "");
  const placeLabel = [exhibition.place, exhibition.region].filter(Boolean).join(" · ");

  return (
    <div className="exhibition-confirm-backdrop" onClick={onCancel}>
      <div className="exhibition-confirm-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="exhibition-confirm-handle" />
        <h2 className="exhibition-confirm-title text-title-3">이 전시로 기록하시겠어요?</h2>

        <div className="exhibition-confirm-preview">
          <div
            className="exhibition-confirm-thumb"
            style={exhibition.posterUrl ? { backgroundImage: `url(${exhibition.posterUrl})` } : undefined}
          />
          <div className="exhibition-confirm-info">
            <p className="exhibition-confirm-name text-body-1-medium">{exhibition.title}</p>
            {artistLabel && <p className="exhibition-confirm-artist text-body-2-regular">{artistLabel}</p>}
            {placeLabel && <p className="exhibition-confirm-place text-caption-1">{placeLabel}</p>}
            {dateLabel && <p className="exhibition-confirm-date text-caption-1">{dateLabel}</p>}
          </div>
        </div>

        <div className="exhibition-confirm-actions">
          <button type="button" className="exhibition-confirm-cancel text-body-1-medium" onClick={onCancel}>
            취소
          </button>
          <button type="button" className="exhibition-confirm-submit text-body-1-medium" onClick={onConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
