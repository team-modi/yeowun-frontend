import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import BottomSheet from "@components/common/BottomSheet";

// api
import { getUserInfo, updateUserInfo } from "@api/user";
import { uploadMedia } from "@api/media";

// utils
import {
  AGE_GROUP_OPTIONS,
  AGE_GROUP_LABEL_BY_CODE,
  RESIDENCE_REGION_OPTIONS,
  RESIDENCE_REGION_LABEL_BY_CODE,
} from "@utils/filterCodes";

// styles
import "@styles/profile/profileEditPage.css";

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    nickname: "",
    profileImageUrl: "",
    ageGroup: "UNSPECIFIED",
    residenceRegion: null,
    residenceDistrict: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isAgeSheetOpen, setIsAgeSheetOpen] = useState(false);
  const [isRegionSheetOpen, setIsRegionSheetOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    (async () => {
      setIsLoading(true);
      try {
        const response = await getUserInfo();
        if (ignore) return;
        const data = response.data.data;
        setForm({
          nickname: data.nickname ?? "",
          profileImageUrl: data.profileImageUrl ?? "",
          ageGroup: data.ageGroup ?? "UNSPECIFIED",
          residenceRegion: data.residenceRegion ?? null,
          residenceDistrict: data.residenceDistrict ?? "",
        });
      } catch (err) {
        console.log(err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const handlePickImage = () => fileInputRef.current?.click();

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setError("");
    try {
      const result = await uploadMedia(file);
      setForm((prev) => ({ ...prev, profileImageUrl: result.url }));
    } catch (err) {
      console.log(err);
      setError(err?.message || "이미지 업로드에 실패했어요.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    const nickname = form.nickname.trim();
    if (!nickname) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    // 지역 없이 상세주소만 있으면 백엔드 validateResidence()가 거부한다.
    if (form.residenceDistrict.trim() && !form.residenceRegion) {
      setError("상세 지역을 입력하려면 지역을 먼저 선택해주세요.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await updateUserInfo({
        nickname,
        profileImageUrl: form.profileImageUrl || null,
        ageGroup: form.ageGroup,
        residenceRegion: form.residenceRegion,
        residenceDistrict: form.residenceDistrict.trim() || null,
      });
      navigate("/profile");
    } catch (err) {
      console.log(err);
      setError("저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="app-shell">
      <Header type="sub" title="프로필 수정" />
      <div className="app-content">
        <div className="app-content-pad profile-edit-body">
          {isLoading ? (
            <p className="profile-edit-loading text-body-1-regular">불러오는 중...</p>
          ) : (
            <>
              <div className="profile-edit-avatar-row">
                <button
                  type="button"
                  className="profile-edit-avatar"
                  style={form.profileImageUrl ? { backgroundImage: `url(${form.profileImageUrl})` } : undefined}
                  onClick={handlePickImage}
                  disabled={isUploading}
                >
                  {!form.profileImageUrl && <span className="text-caption-1">사진 추가</span>}
                </button>
                <button
                  type="button"
                  className="profile-edit-avatar-edit-btn text-label-3"
                  onClick={handlePickImage}
                  disabled={isUploading}
                >
                  {isUploading ? "업로드 중..." : "사진 변경"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="profile-edit-file-input"
                  onChange={handleImageChange}
                />
              </div>

              <div className="profile-edit-field">
                <label className="profile-edit-label text-label-2">닉네임</label>
                <input
                  type="text"
                  className="profile-edit-input text-body-1-regular"
                  value={form.nickname}
                  maxLength={20}
                  placeholder="닉네임을 입력해주세요"
                  onChange={(event) => setForm((prev) => ({ ...prev, nickname: event.target.value }))}
                />
              </div>

              <div className="profile-edit-field">
                <label className="profile-edit-label text-label-2">연령대</label>
                <button
                  type="button"
                  className="profile-edit-select text-body-1-regular"
                  onClick={() => setIsAgeSheetOpen(true)}
                >
                  {AGE_GROUP_LABEL_BY_CODE[form.ageGroup] ?? "선택"}
                  <ChevronDownIcon />
                </button>
              </div>

              <div className="profile-edit-field">
                <label className="profile-edit-label text-label-2">지역</label>
                <button
                  type="button"
                  className="profile-edit-select text-body-1-regular"
                  onClick={() => setIsRegionSheetOpen(true)}
                >
                  {form.residenceRegion ? RESIDENCE_REGION_LABEL_BY_CODE[form.residenceRegion] : "지역을 선택해주세요"}
                  <ChevronDownIcon />
                </button>
                <input
                  type="text"
                  className="profile-edit-input text-body-1-regular"
                  value={form.residenceDistrict}
                  placeholder="상세 지역 (예: 강남구)"
                  onChange={(event) => setForm((prev) => ({ ...prev, residenceDistrict: event.target.value }))}
                />
              </div>

              {error && <p className="profile-edit-error text-caption-1">{error}</p>}

              <button
                type="button"
                className="profile-edit-submit text-body-1-medium"
                disabled={isSaving}
                onClick={handleSave}
              >
                {isSaving ? "저장 중..." : "저장하기"}
              </button>
            </>
          )}
        </div>
      </div>

      <BottomSheet isOpen={isAgeSheetOpen} onClose={() => setIsAgeSheetOpen(false)}>
        <h2 className="profile-edit-sheet-title text-title-3">연령대 선택</h2>
        <div className="profile-edit-option-list">
          {AGE_GROUP_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`profile-edit-option text-body-1-regular ${form.ageGroup === option.value ? "is-selected" : ""}`}
              onClick={() => {
                setForm((prev) => ({ ...prev, ageGroup: option.value }));
                setIsAgeSheetOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet isOpen={isRegionSheetOpen} onClose={() => setIsRegionSheetOpen(false)}>
        <h2 className="profile-edit-sheet-title text-title-3">지역 선택</h2>
        <div className="profile-edit-option-list profile-edit-option-list--grid">
          {RESIDENCE_REGION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`profile-edit-option text-body-1-regular ${form.residenceRegion === option.value ? "is-selected" : ""}`}
              onClick={() => {
                setForm((prev) => ({ ...prev, residenceRegion: option.value }));
                setIsRegionSheetOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
