import { useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";

// api
import { addRecord } from "@api/record";

// store
import { useRecordDraftStore } from "@store/useRecordDraftStore";

// styles
import "@styles/record/RecordWritePage.css";

const MAX_LENGTH = 300;

export default function RecordWritePage() {
  const navigate = useNavigate();
  const exhibitionId = useRecordDraftStore((state) => state.exhibitionId);
  const content = useRecordDraftStore((state) => state.content);
  const setContent = useRecordDraftStore((state) => state.setContent);
  const setRecordId = useRecordDraftStore((state) => state.setRecordId);
  const viewedAt = useRecordDraftStore((state) => state.viewedAt);
  const emotionCodes = useRecordDraftStore((state) => state.emotionCodes);
  const media = useRecordDraftStore((state) => state.media);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await addRecord({
        exhibitionId,
        writeMode: "DIRECT",
        viewedAt,
        content,
        emotionCodes,
        media,
      });
      setRecordId(response.data.data?.recordId ?? null);
      navigate("/record/complete");
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <Header type="sub" title="기록 작성" onBack={() => navigate(-1)} />
      <div className="app-content">
        <div className="app-content-pad record-write">
          <h1 className="record-write-title text-title-3">
            전시에 대한 감상을
            <br />
            자유롭게 남겨보세요
          </h1>

          <div className="record-write-box">
            <textarea
              className="record-write-textarea text-body-1-regular"
              value={content}
              maxLength={MAX_LENGTH}
              onChange={(event) => setContent(event.target.value)}
              placeholder="답변을 입력해 주세요"
            />
            <span className="record-write-count text-caption-1">
              {content.length}/{MAX_LENGTH}
            </span>
          </div>
        </div>
      </div>

      <div className="record-write-footer">
        <button type="button" className="record-write-prev text-body-1-medium" onClick={() => navigate(-1)}>
          이전
        </button>
        <button
          type="button"
          className="record-write-submit text-body-1-medium"
          disabled={!content.trim() || isSubmitting}
          onClick={handleSubmit}
        >
          작성 완료
        </button>
      </div>
    </div>
  );
}
