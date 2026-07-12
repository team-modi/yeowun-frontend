import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import ModeOptionCard from "@components/record/ModeOptionCard";

// store
import { useRecordDraftStore } from "@store/useRecordDraftStore";

// styles
import "@styles/record/RecordModePage.css";

export default function RecordModePage() {
  const navigate = useNavigate();
  const mode = useRecordDraftStore((state) => state.mode);
  const setMode = useRecordDraftStore((state) => state.setMode);

  const handleNext = () => {
    if (!mode) return;
    navigate(mode === "direct" ? "/record/write" : "/record/questions");
  };

  return (
    <div className="app-shell">
      <Header type="sub" title="기록 작성" onBack={() => navigate(-1)} />
      <div className="app-content">
        <div className="app-content-pad record-mode">
          <h1 className="record-mode-title text-title-3">어떻게 기록할까요?</h1>

          <ModeOptionCard
            title="직접 작성"
            description={"내 감상을 바로 글로 남겨요\n빠르게 기록하고 싶은 분께 추천해요"}
            isSelected={mode === "direct"}
            onClick={() => setMode("direct")}
          />

          <ModeOptionCard
            title="질문으로 작성"
            description={"질문에 답하면 AI가 감상문으로 정리해줘요\n글 작성이 어려운 분께 추천해요"}
            isSelected={mode === "ai"}
            onClick={() => setMode("ai")}
          />
        </div>
      </div>

      <div className="record-mode-footer">
        <button type="button" className="record-mode-submit text-body-1-medium" disabled={!mode} onClick={handleNext}>
          다음
        </button>
      </div>
    </div>
  );
}
