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
import closeIcon from "@images/icons/Action/Close.svg";
import chevronDownIcon from "@images/icons/Action/Chevron Down.svg";
import chevronUpIcon from "@images/icons/Action/Chevron Up.svg";

const CUSTOM_MIN_LENGTH = 2;
const CUSTOM_MAX_LENGTH = 10;
const RECENT_VISIBLE_COUNT = 8;

export default function EmotionKeywordSheet({ isOpen, onClose, value = [], onApply }) {
  const [selected, setSelected] = useState(value);
  const [customInput, setCustomInput] = useState("");
  const [recentKeywords, setRecentKeywords] = useState(getRecentEmotionKeywords);
  const [isRecentExpanded, setIsRecentExpanded] = useState(false);

  // 시트가 열릴 때마다 부모의 최신 선택값·최근 키워드로 동기화한다 — effect 대신 렌더 중
  // 이전 isOpen과 비교해서 처리한다(BottomSheet.jsx의 prevIsOpen 패턴과 동일).
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSelected(value);
      setCustomInput("");
      setRecentKeywords(getRecentEmotionKeywords());
    }
  }

  const toggleOption = (keyword) => {
    setSelected((prev) => (prev.includes(keyword) ? prev.filter((item) => item !== keyword) : [...prev, keyword]));
  };

  const handleAddCustom = () => {
    const keyword = customInput.trim();
    if (keyword.length < CUSTOM_MIN_LENGTH || selected.includes(keyword)) return;
    setSelected((prev) => [...prev, keyword]);
    pushRecentEmotionKeyword(keyword);
    setRecentKeywords(getRecentEmotionKeywords());
    setCustomInput("");
  };

  const handleRemoveCustom = (keyword) => {
    setSelected((prev) => prev.filter((item) => item !== keyword));
  };

  const handleApply = () => {
    onApply?.(selected);
    onClose?.();
  };

  // 추천 목록에 이미 있는 키워드는 "나만의 키워드" 목록에 다시 안 보이게 걸러낸다.
  const customKeywords = selected.filter((item) => !RECOMMENDED_EMOTIONS.has(item));
  const visibleRecent = isRecentExpanded ? recentKeywords : recentKeywords.slice(0, RECENT_VISIBLE_COUNT);
  const hiddenRecentCount = Math.max(recentKeywords.length - RECENT_VISIBLE_COUNT, 0);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="emotion-keyword-sheet">
      <div className="emotion-sheet-header">
        <h2 className="emotion-sheet-title text-title-3">감정 키워드</h2>
        <button type="button" className="emotion-sheet-close" onClick={onClose} aria-label="닫기">
          <img src={closeIcon} alt="" width={18} height={18} />
        </button>
      </div>

      <div className="emotion-sheet-body">
        <div className="emotion-sheet-custom">
          <h3 className="emotion-sheet-section-title text-heading-2">나만의 키워드</h3>
          <p className="emotion-sheet-section-desc text-body-2-regular">목록에 없는 감정은 직접 입력해 보세요</p>
          <div className="emotion-sheet-custom-input-row">
            <input
              type="text"
              className="emotion-sheet-custom-input text-body-1-regular"
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
              <img src={addIcon} alt="" width={16} height={16} />
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

        {recentKeywords.length > 0 && (
          <div className="emotion-sheet-recent">
            <h3 className="emotion-sheet-section-title text-heading-2">
              최근 만든 키워드{" "}
              <span className="emotion-sheet-recent-count text-body-2-regular">{recentKeywords.length}</span>
            </h3>
            <div className="emotion-sheet-chips">
              {visibleRecent.map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  className={`emotion-chip text-label-2 ${selected.includes(keyword) ? "is-selected" : ""}`}
                  onClick={() => toggleOption(keyword)}
                >
                  {keyword}
                </button>
              ))}
              {hiddenRecentCount > 0 && (
                <button
                  type="button"
                  className="emotion-chip emotion-chip--toggle text-label-2"
                  onClick={() => setIsRecentExpanded((prev) => !prev)}
                >
                  {isRecentExpanded ? "접기" : `+${hiddenRecentCount}`}
                  <img src={isRecentExpanded ? chevronUpIcon : chevronDownIcon} alt="" width={12} height={12} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="emotion-sheet-recommend">
          <h3 className="emotion-sheet-section-title text-heading-2">추천 키워드</h3>
          <p className="emotion-sheet-section-desc text-body-2-regular">전시를 보고 마음에 남은 감정을 골라보세요</p>

          {RECOMMENDED_EMOTION_GROUPS.map((group) => (
            <div key={group.category} className="emotion-sheet-group">
              <h4 className="emotion-sheet-group-title text-label-1">{group.category}</h4>
              <div className="emotion-sheet-chips">
                {group.keywords.map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    className={`emotion-chip text-label-2 ${selected.includes(keyword) ? "is-selected" : ""}`}
                    onClick={() => toggleOption(keyword)}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button type="button" className="emotion-sheet-submit text-body-1-medium" onClick={handleApply}>
        완료
      </button>
    </BottomSheet>
  );
}
