// 필터 (조건 칩)
import "@styles/common/ChipGroup.css";

export default function ChipGroup({
  title,
  titleAs = "h3",
  titleClassName = "",
  options,
  selected,
  onToggle,
  chipClassName = "chip-group-option",
  groupClassName = "",
  chipsClassName = "",
}) {
  const TitleTag = titleAs;

  return (
    <div className={groupClassName}>
      {title && <TitleTag className={titleClassName}>{title}</TitleTag>}
      <div className={chipsClassName}>
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          const isSelected = selected.includes(value);

          return (
            <button
              key={value}
              type="button"
              className={`${chipClassName} ${isSelected ? "is-selected" : ""}`}
              onClick={() => onToggle(value)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
