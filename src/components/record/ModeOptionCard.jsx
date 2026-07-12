export default function ModeOptionCard({ title, description, isSelected, onClick }) {
  return (
    <button type="button" className={`mode-option-card ${isSelected ? "is-selected" : ""}`} onClick={onClick}>
      <div className="mode-option-card-icon" />
      <div className="mode-option-card-text">
        <p className="mode-option-card-title text-heading-2">{title}</p>
        <p className="mode-option-card-description text-body-2-regular">{description}</p>
      </div>
    </button>
  );
}
