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

// 관람일(단일 날짜) 선택 시트 — DateRangeSheet(전시 기간, mode="range")와 같은 커스텀 nav/DayButton
// 패턴을 쓰되 mode="single"이라 range 관련 modifier가 없어 별도 컴포넌트로 분리함.
export default function SingleDateSheet({ isOpen, onClose, value, onApply }) {
  const [selected, setSelected] = useState(toDate(value));
  const [month, setMonth] = useState(() => toDate(value) ?? new Date());

  const handleSubmit = () => {
    if (!selected) return;
    onApply?.(toDateKey(selected));
    onClose?.();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h2 className="single-date-sheet-title text-title-3">관람 날짜를 선택해주세요</h2>

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
        완료
      </button>
    </BottomSheet>
  );
}
