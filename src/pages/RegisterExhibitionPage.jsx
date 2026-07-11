import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// api
import { addPersonalExhibition } from "@api/exhibition";
import { uploadMedia, validateMediaFile } from "@api/media";

// 백엔드 CustomCreateRequest 의 enum 코드 ↔ 한글 라벨.
// (코드만 보내야 하고, 정의되지 않은 코드는 400 INVALID_INPUT 이 난다)
const FORMAT_OPTIONS = [
  { code: "SOLO", label: "개인전" },
  { code: "GROUP", label: "단체전" },
  { code: "CURATED", label: "기획전" },
  { code: "ART_FAIR", label: "아트페어" },
];

const CATEGORY_OPTIONS = [
  { code: "PAINTING", label: "회화" },
  { code: "PHOTO", label: "사진" },
  { code: "MEDIA", label: "미디어" },
  { code: "SCULPTURE", label: "조각" },
  { code: "DESIGN", label: "디자인" },
  { code: "CRAFT", label: "공예" },
  { code: "ARCHITECTURE", label: "건축" },
  { code: "PERFORMANCE", label: "퍼포먼스" },
  { code: "ETC", label: "기타" },
];

const REGION_OPTIONS = [
  { code: "SEOUL", label: "서울" },
  { code: "GYEONGGI", label: "경기" },
  { code: "INCHEON", label: "인천" },
  { code: "BUSAN", label: "부산" },
  { code: "DAEGU", label: "대구" },
  { code: "ULSAN", label: "울산" },
  { code: "SEJONG", label: "세종" },
  { code: "GYEONGBUK", label: "경북" },
  { code: "GYEONGNAM", label: "경남" },
  { code: "JEONBUK", label: "전북" },
  { code: "JEONNAM", label: "전남" },
  { code: "CHUNGBUK", label: "충북" },
  { code: "CHUNGNAM", label: "충남" },
  { code: "JEJU", label: "제주" },
  { code: "ETC", label: "기타" },
];

/**
 * RegisterExhibitionPage — 직접 전시 등록.
 *
 * 핵심은 "포스터"다. 사용자가 파일을 고르면 곧바로 R2 로 업로드하고(=uploadMedia),
 * 돌려받은 영구 URL(posterUrl)만 폼 상태에 담아 둔다. 최종 제출 때 백엔드로 가는 건
 * 파일 바이트가 아니라 그 URL 문자열 하나뿐이다.
 */
const RegisterExhibitionPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 폼 상태
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState("");
  const [artist, setArtist] = useState("");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("");

  // 포스터(업로드 결과 URL) + 진행/에러 상태
  const [posterUrl, setPosterUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 포스터 파일 선택 → 클라 검증 → R2 업로드 → posterUrl 확정.
  const onPosterSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일을 다시 고를 수 있게 항상 비운다
    if (!file) return;

    const invalid = validateMediaFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError("");
    setUploading(true);
    try {
      const { url } = await uploadMedia(file); // presign → R2 PUT → 영구 URL
      setPosterUrl(url);
    } catch (err) {
      setError(err?.message || "업로드에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!title.trim()) {
      setError("전시명을 입력해 주세요.");
      return;
    }
    if (format === "SOLO" && !artist.trim()) {
      setError("개인전은 작가 이름이 필요해요.");
      return;
    }
    setError("");

    // 백엔드로 보내는 건 파일이 아니라 posterUrl(문자열) 하나뿐이다.
    const body = {
      title: title.trim(),
      posterUrl: posterUrl || null,
      place: place.trim() || null,
      startDate: startDate || null,
      endDate: endDate || startDate || null,
      format: format || null,
      artist: artist.trim() || null,
      region: region || null,
      category: category || null,
    };

    setSubmitting(true);
    try {
      const res = await addPersonalExhibition(body);
      if (res.data.meta.result === "SUCCESS") {
        const exhibitionId = res.data.data?.exhibitionId;
        alert("전시를 등록했어요.");
        // 상세로 이동(라우트가 준비돼 있으면). 없으면 목록으로.
        navigate(exhibitionId ? `/exhibition/${exhibitionId}` : "/exhibition");
      } else {
        setError("전시 등록에 실패했어요.");
      }
    } catch (err) {
      // 로그인이 필요한 API 라 비로그인 시 401 → 로그인 페이지로.
      if (err?.response?.status === 401) {
        setError("로그인이 필요해요. 로그인 후 다시 시도해 주세요.");
      } else {
        setError(err?.response?.data?.meta?.message || "전시 등록에 실패했어요.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell register-page">
      <h1 className="register-title">전시 등록</h1>
      <p className="register-desc">전시 정보를 입력하고 포스터를 첨부해 주세요.</p>

      {/* 포스터 첨부 — 클릭하면 파일 선택창이 열리고, 선택 즉시 업로드된다 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onPosterSelected}
      />
      <button
        type="button"
        className="register-poster"
        onClick={() => !uploading && fileInputRef.current?.click()}
        disabled={uploading}
        aria-label="전시 포스터 첨부"
      >
        {posterUrl ? (
          <img className="register-poster__img" src={posterUrl} alt="전시 포스터 미리보기" />
        ) : (
          <span className="register-poster__ph">
            {uploading ? "업로드 중…" : "＋ 포스터 이미지 첨부"}
          </span>
        )}
      </button>

      <div className="register-field">
        <label htmlFor="rx-title">
          전시명<span className="register-req">*</span>
        </label>
        <input
          id="rx-title"
          value={title}
          maxLength={100}
          placeholder="전시명을 입력해 주세요"
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="register-field">
        <label htmlFor="rx-place">전시 장소</label>
        <input
          id="rx-place"
          value={place}
          maxLength={200}
          placeholder="예) 성수 갤러리"
          onChange={(e) => setPlace(e.target.value)}
        />
      </div>

      <div className="register-row">
        <div className="register-field">
          <label htmlFor="rx-start">시작일</label>
          <input
            id="rx-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="register-field">
          <label htmlFor="rx-end">종료일</label>
          <input
            id="rx-end"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="register-field">
        <label htmlFor="rx-format">전시 형태</label>
        <select id="rx-format" value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="">선택 안 함</option>
          {FORMAT_OPTIONS.map((f) => (
            <option key={f.code} value={f.code}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {format === "SOLO" && (
        <div className="register-field">
          <label htmlFor="rx-artist">
            작가<span className="register-req">*</span>
          </label>
          <input
            id="rx-artist"
            value={artist}
            maxLength={100}
            placeholder="작가 이름을 입력해 주세요"
            onChange={(e) => setArtist(e.target.value)}
          />
        </div>
      )}

      <div className="register-row">
        <div className="register-field">
          <label htmlFor="rx-region">지역</label>
          <select id="rx-region" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">선택 안 함</option>
            {REGION_OPTIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="register-field">
          <label htmlFor="rx-category">장르</label>
          <select
            id="rx-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">선택 안 함</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="register-error">{error}</p>}

      <button
        type="button"
        className="register-submit"
        onClick={submit}
        disabled={submitting || uploading}
      >
        {submitting ? "등록 중…" : "전시 등록하기"}
      </button>
    </div>
  );
};

export default RegisterExhibitionPage;
