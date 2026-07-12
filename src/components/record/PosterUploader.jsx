import { useRef, useState } from "react";

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
          <ImageIcon />
          <span className="poster-uploader-label text-label-2">전시 포스터 추가</span>
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

function ImageIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="10" r="1.6" fill="currentColor" />
      <path
        d="M21 15l-5-5-4 4-2-2-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 3v5M14.5 5.5H19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
