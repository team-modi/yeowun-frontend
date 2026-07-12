import { useState } from "react";

// components
import BottomSheet from "@components/common/BottomSheet";

// utils
import { TYPE_OPTIONS } from "@utils/filterCodes";

export default function ExhibitionTypeSheet({ isOpen, onClose, value, onApply }) {
  const [selectedType, setSelectedType] = useState(value?.type ?? null);
  const [step, setStep] = useState(value?.type === "solo" ? "artist" : "type");
  const [artistName, setArtistName] = useState(value?.artistName ?? "");

  const selectedLabel = TYPE_OPTIONS.find((option) => option.value === selectedType)?.label ?? "";

  const isPrimaryDisabled = step === "type" ? !selectedType : artistName.trim().length === 0;

  const handlePrimaryClick = () => {
    if (step === "type") {
      if (selectedType === "solo") {
        setStep("artist");
        return;
      }
      onApply?.({ type: selectedType, label: selectedLabel, artistName: "" });
      onClose?.();
      return;
    }

    onApply?.({ type: "solo", label: selectedLabel, artistName: artistName.trim() });
    onClose?.();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h2 className="exhibition-type-sheet-title text-title-3">전시 형태</h2>

      {step === "type" ? (
        <div className="exhibition-type-list">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`exhibition-type-item text-body-1-medium ${
                selectedType === option.value ? "is-selected" : ""
              }`}
              onClick={() => setSelectedType(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="exhibition-type-artist">
          <div className="exhibition-type-selected-tag text-body-1-medium">{selectedLabel}</div>
          <input
            type="text"
            className="exhibition-type-artist-input text-body-1-regular"
            value={artistName}
            onChange={(event) => setArtistName(event.target.value)}
            placeholder="작가이름을 입력해주세요"
          />
        </div>
      )}

      <button
        type="button"
        className="exhibition-type-submit text-body-1-medium"
        disabled={isPrimaryDisabled}
        onClick={handlePrimaryClick}
      >
        {step === "artist" ? "완료" : "다음"}
      </button>
    </BottomSheet>
  );
}
