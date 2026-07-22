import { useState } from "react";

// components
import BottomSheet from "@components/common/BottomSheet";

// utils
import {
  RECOMMENDED_EMOTION_GROUPS,
  RECOMMENDED_EMOTIONS,
  getRecentEmotionKeywords,
  pushRecentEmotionKeyword,
} from "@utils/emotionKeywords";

// styles
import "@styles/record/EmotionKeywordSheet.css";

// icons
import addIcon from "@images/icons/Action/Add.svg";

const CUSTOM_MIN_LENGTH = 2;
const CUSTOM_MAX_LENGTH = 10;

export default function EmotionKeywordSheet({ isOpen, onClose, value = [], onApply }) {
  const [selected, setSelected] = useState(value);
  const [customInput, setCustomInput] = useState("");
  const [recent, setRecent] = useState(getRecentEmotionKeywords);

  // 시트가 열릴 때마다 부모의 최신 선택값·최근 키워드로 동기화한다.
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setSelected(value);
      setCustomInput("");
      setRecent(getRecentEmotionKeywords());
    }
  }

  const toggle = (keyword) => {
    setSelected((prev) => (prev.includes(keyword) ? prev.filter((item) => item !== keyword) : [...prev, keyword]));
  };

  const handleAddCustom = () => {
    const keyword = customInput.trim();
    if (keyword.length < CUSTOM_MIN_LENGTH) return;
    if (!selected.includes(keyword)) setSelected((prev) => [...prev, keyword]);
    pushRecentEmotionKeyword(keyword);
    setRecent(getRecentEmotionKeywords());
    setCustomInput("");
  };

  const handleApply = () => {
    onApply?.(selected);
    onClose?.();
  };

  // 최근 키워드 중 추천에 이미 있는 건 추천 섹션에서 보이므로 중복 제거.
  const recentOnly = recent.filter((keyword) => !RECOMMENDED_EMOTIONS.has(keyword));

  const chip = (keyword) => (
    <button
      key={keyword}
      type="button"
      className={`emotion-chip text-label-2${selected.includes(keyword) ? " is-selected" : ""}`}
      onClick={() => toggle(keyword)}
    >
      {keyword}
    </button>
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="emotion-sheet">
      <div className="emotion-sheet-head">
        <h2 className="emotion-sheet-title text-title-3">감정 키워드 추가</h2>
        <button type="button" className="emotion-sheet-close" onClick={onClose} aria-label="닫기">
          ×
        </button>
      </div>

      <div className="emotion-sheet-scroll">
        <section className="emotion-sheet-section">
          <h3 className="emotion-sheet-section-title text-heading-2">나만의 키워드</h3>
          <p className="emotion-sheet-section-desc text-caption-1">목록에 없는 감정은 직접 입력해 보세요</p>
          <div className="emotion-sheet-custom-input-row">
            <input
              type="text"
              className="emotion-sheet-custom-input text-body-2-regular"
              value={customInput}
              maxLength={CUSTOM_MAX_LENGTH}
              onChange={(event) => setCustomInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAddCustom();
                }
              }}
              placeholder="두 글자 이상 입력해 주세요"
            />
            <button
              type="button"
              className="emotion-sheet-custom-add"
              disabled={customInput.trim().length < CUSTOM_MIN_LENGTH}
              onClick={handleAddCustom}
              aria-label="키워드 추가"
            >
              <img src={addIcon} alt="" width={18} height={18} />
            </button>
          </div>
        </section>

        {recentOnly.length > 0 && (
          <section className="emotion-sheet-section">
            <h3 className="emotion-sheet-section-title text-heading-2">
              최근 만든 키워드 <span className="emotion-sheet-count">{recentOnly.length}</span>
            </h3>
            <div className="emotion-sheet-chips">{recentOnly.map(chip)}</div>
          </section>
        )}

        <section className="emotion-sheet-section">
          <h3 className="emotion-sheet-section-title text-heading-2">추천 키워드</h3>
          <p className="emotion-sheet-section-desc text-caption-1">
            전시를 다시 떠올렸을 때 마음에 가까운 감정을 골라보세요
          </p>
          {RECOMMENDED_EMOTION_GROUPS.map((group) => (
            <div key={group.category} className="emotion-sheet-group">
              <p className="emotion-sheet-group-title text-label-2">{group.category}</p>
              <div className="emotion-sheet-chips">{group.keywords.map(chip)}</div>
            </div>
          ))}
        </section>
      </div>

      <button type="button" className="emotion-sheet-submit text-body-1-medium" onClick={handleApply}>
        완료
      </button>
    </BottomSheet>
  );
}
