import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

// components
import BottomSheet from "@components/common/BottomSheet";

// styles
import "@styles/common/DateRangeSheet.css";

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

  const stateClass =
    modifiers.range_start || modifiers.range_end
      ? "date-range-day--endpoint"
      : modifiers.range_middle
        ? "date-range-day--in-range"
        : "";

  return <button type="button" className={`${className ?? ""} ${stateClass}`.trim()} {...buttonProps} />;
}

export default function DateRangeSheet({ isOpen, onClose, value, onApply }) {
  const [range, setRange] = useState({
    from: toDate(value?.startDate),
    to: toDate(value?.endDate),
  });
  const [month, setMonth] = useState(() => toDate(value?.startDate) ?? new Date());

  const handleSubmit = () => {
    if (!range?.from) return;
    onApply?.({
      startDate: toDateKey(range.from),
      endDate: toDateKey(range.to ?? range.from),
    });
    onClose?.();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h2 className="date-range-sheet-title text-title-3">전시 기간</h2>

      <div className="date-range-sheet-nav">
        <button
          type="button"
          className="date-range-sheet-nav-btn"
          onClick={() => setMonth((prev) => addMonths(prev, -1))}
          aria-label="이전 달"
        >
          ‹
        </button>
        <span className="date-range-sheet-month text-body-1-medium">
          {month.getFullYear()}년 {month.getMonth() + 1}월
        </span>
        <button
          type="button"
          className="date-range-sheet-nav-btn"
          onClick={() => setMonth((prev) => addMonths(prev, 1))}
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      <DayPicker
        mode="range"
        selected={range}
        onSelect={setRange}
        month={month}
        onMonthChange={setMonth}
        showOutsideDays={false}
        hideNavigation
        className="date-range-sheet-calendar"
        formatters={{
          formatWeekdayName: (date) => WEEKDAYS[date.getDay()],
        }}
        components={{ DayButton, MonthCaption: () => null }}
      />

      <button
        type="button"
        className="date-range-sheet-submit text-body-1-medium"
        disabled={!range?.from}
        onClick={handleSubmit}
      >
        완료
      </button>
    </BottomSheet>
  );
}
