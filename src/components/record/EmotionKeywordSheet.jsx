import { useState } from "react";

// components
import BottomSheet from "@components/common/BottomSheet";

// styles
import "@styles/record/EmotionKeywordSheet.css";

// TODO: 목업 화면에는 "특별전", "콩"처럼 감정 키워드로 보기 어려운 항목이 섞여 있어(디자인 더미 텍스트로 추정)
// 실제 최종 감정 키워드 목록이 확정되면 이 배열을 교체해야 함 — 우선 의미가 통하는 감정 형용사 위주로 채워둠.
const EMOTION_OPTIONS = [
  "슬픈",
  "강렬한",
  "재미있는",
  "유쾌한",
  "서정적인",
  "화나는",
  "아름다운",
  "관심있는",
  "몽환적인",
  "평온한",
  "벅찬",
  "그리운",
];

const MAX_CUSTOM_LENGTH = 10;

export default function EmotionKeywordSheet({ isOpen, onClose, value = [], onApply }) {
  const [selected, setSelected] = useState(value);
  const [customInput, setCustomInput] = useState("");

  const toggleOption = (option) => {
    setSelected((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]));
  };

  const handleAddCustom = () => {
    const keyword = customInput.trim();
    if (!keyword || selected.includes(keyword)) return;
    setSelected((prev) => [...prev, keyword]);
    setCustomInput("");
  };

  const handleRemoveCustom = (keyword) => {
    setSelected((prev) => prev.filter((item) => item !== keyword));
  };

  const handleApply = () => {
    onApply?.(selected);
    onClose?.();
  };

  const customKeywords = selected.filter((item) => !EMOTION_OPTIONS.includes(item));

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h2 className="emotion-sheet-title text-title-3">감정 키워드를 선택해 주세요</h2>

      <div className="emotion-sheet-chips">
        {EMOTION_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`emotion-chip text-label-2 ${selected.includes(option) ? "is-selected" : ""}`}
            onClick={() => toggleOption(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="emotion-sheet-custom">
        <h3 className="emotion-sheet-custom-title text-heading-2">나만의 키워드</h3>
        <div className="emotion-sheet-custom-input-row">
          <input
            type="text"
            className="emotion-sheet-custom-input text-body-1-regular"
            value={customInput}
            maxLength={MAX_CUSTOM_LENGTH}
            onChange={(event) => setCustomInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddCustom();
              }
            }}
            placeholder={`${MAX_CUSTOM_LENGTH}자 이내로 작성해 주세요`}
          />
          <button
            type="button"
            className="emotion-sheet-custom-add"
            disabled={!customInput.trim()}
            onClick={handleAddCustom}
            aria-label="키워드 추가"
          >
            <PlusIcon />
          </button>
        </div>

        {customKeywords.length > 0 && (
          <div className="emotion-sheet-custom-list">
            {customKeywords.map((keyword) => (
              <span key={keyword} className="emotion-sheet-custom-pill text-label-2">
                {keyword}
                <button type="button" onClick={() => handleRemoveCustom(keyword)} aria-label={`${keyword} 삭제`}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button type="button" className="emotion-sheet-submit text-body-1-medium" onClick={handleApply}>
        완료
      </button>
    </BottomSheet>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
