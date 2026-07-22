import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

// components
import BottomSheet from "@components/common/BottomSheet";

// styles
import "@styles/common/SingleDateSheet.css";

// utils
import { WEEKDAYS } from "@utils/filterCodes";

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDate(dateKey) {
  return dateKey ? new Date(dateKey) : undefined;
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function DayButton({ day, modifiers, className, ...buttonProps }) {
  void day;

  const stateClass = modifiers.selected ? "single-date-day--selected" : "";

  return <button type="button" className={`${className ?? ""} ${stateClass}`.trim()} {...buttonProps} />;
}

export default function SingleDateSheet({
  isOpen,
  onClose,
  value,
  onApply,
  title = "관람 날짜를 선택해주세요",
  placeholder = "날짜를 선택해 주세요",
}) {
  const [selected, setSelected] = useState(toDate(value));
  const [month, setMonth] = useState(() => toDate(value) ?? new Date());

  // 시트가 열릴 때마다 최신 값으로 리셋 — effect 대신 렌더 중 이전 isOpen과 비교해서 처리한다
  // (BottomSheet.jsx의 prevIsOpen 패턴과 동일. GenreSheet.jsx, EmotionKeywordSheet.jsx도 같은 방식).
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSelected(toDate(value));
      setMonth(toDate(value) ?? new Date());
    }
  }

  const handleSubmit = () => {
    if (!selected) return;
    onApply?.(toDateKey(selected));
    onClose?.();
  };

  const submitLabel = selected
    ? `${selected.getMonth() + 1}월 ${selected.getDate()}일(${WEEKDAYS[selected.getDay()]}) 선택`
    : placeholder;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h2 className="single-date-sheet-title text-title-3">{title}</h2>

      <div className="single-date-sheet-nav">
        <button
          type="button"
          className="single-date-sheet-nav-btn"
          onClick={() => setMonth((prev) => addMonths(prev, -1))}
          aria-label="이전 달"
        >
          ‹
        </button>
        <span className="single-date-sheet-month text-body-1-medium">
          {month.getFullYear()}년 {month.getMonth() + 1}월
        </span>
        <button
          type="button"
          className="single-date-sheet-nav-btn"
          onClick={() => setMonth((prev) => addMonths(prev, 1))}
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      <DayPicker
        mode="single"
        selected={selected}
        onSelect={setSelected}
        month={month}
        onMonthChange={setMonth}
        showOutsideDays={false}
        hideNavigation
        className="single-date-sheet-calendar"
        formatters={{
          formatWeekdayName: (date) => WEEKDAYS[date.getDay()],
        }}
        components={{ DayButton, MonthCaption: () => null }}
      />

      <button
        type="button"
        className="single-date-sheet-submit text-body-1-medium"
        disabled={!selected}
        onClick={handleSubmit}
      >
        {submitLabel}
      </button>
    </BottomSheet>
  );
}
