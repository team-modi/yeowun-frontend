import { useRef, useState } from "react";

// icons
import imageAddIcon from "@images/icons/Action/Image Add.svg";

export default function PosterUploader({ value = null, onChange }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(value);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onChange?.(file, url);
  };

  return (
    <div className="poster-uploader" onClick={handleClick} role="button" tabIndex={0}>
      {previewUrl ? (
        <img src={previewUrl} alt="전시 포스터 미리보기" className="poster-uploader-preview" />
      ) : (
        <div className="poster-uploader-placeholder">
          <img src={imageAddIcon} alt="" width={28} height={28} />
          <span className="poster-uploader-label text-label-2">포스터 사진 추가</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="poster-uploader-input"
        onChange={handleFileChange}
      />
    </div>
  );
}

