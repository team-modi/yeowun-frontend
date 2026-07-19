import { useRef, useState } from "react";

// components
import BottomSheet from "@components/common/BottomSheet";

// api
import { uploadMedia } from "@api/media";

// styles
import "@styles/record/MediaAttachSheet.css";

// icons
import imageIcon from "@images/icons/Action/Image.svg";
import videoIcon from "@images/icons/Action/Video.svg";

const MAX_MEDIA = 5;

// 사진/영상 선택 → 파일마다 R2 프리사인 업로드(uploadMedia) → 완료된 { type, url, sizeBytes }를 부모로 전달.
// 파일 바이트 자체는 이 컴포넌트가 아니라 media.js가 R2로 직접 올리고, 우리는 결과 URL만 다룸.
export default function MediaAttachSheet({ isOpen, onClose, remaining, onAdd }) {
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList ?? []).slice(0, remaining);
    if (files.length === 0) return;

    setIsUploading(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of files) {
        // R2 프리사인 발급 Worker의 동시 요청 제한이 확인되지 않아 우선 순차 업로드로 안전하게 처리함.
        const result = await uploadMedia(file);
        uploaded.push(result);
      }
      onAdd?.(uploaded);
      onClose?.();
    } catch (err) {
      console.log(err);
      setError(err?.message || "업로드에 실패했어요.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (event) => {
    const fileArray = Array.from(event.target.files ?? []);
    event.target.value = ""; // 같은 파일 다시 선택 가능하도록 비움
    handleFiles(fileArray);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h2 className="media-sheet-title text-title-3">사진 / 영상을 추가해주세요</h2>
      <p className="media-sheet-subtitle text-body-2-regular">최대 {MAX_MEDIA}개</p>

      {error && <p className="media-sheet-error text-caption-1">{error}</p>}

      <button
        type="button"
        className="media-sheet-option text-body-1-regular"
        disabled={isUploading || remaining <= 0}
        onClick={() => photoInputRef.current?.click()}
      >
        <img src={imageIcon} alt="" width={20} height={20} /> {isUploading ? "업로드 중…" : "사진선택"}
      </button>
      <button
        type="button"
        className="media-sheet-option text-body-1-regular"
        disabled={isUploading || remaining <= 0}
        onClick={() => videoInputRef.current?.click()}
      >
        <img src={videoIcon} alt="" width={20} height={20} /> {isUploading ? "업로드 중…" : "영상선택"}
      </button>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        className="media-sheet-input"
        onChange={handleInputChange}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        className="media-sheet-input"
        onChange={handleInputChange}
      />

      <button type="button" className="media-sheet-submit text-body-1-medium" onClick={onClose}>
        완료
      </button>
    </BottomSheet>
  );
}

