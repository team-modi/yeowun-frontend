import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import BottomSheet from "@components/common/BottomSheet";

// api
import { getUserInfo, updateUserInfo } from "@api/user";
import { uploadMedia } from "@api/media";

// utils
import { AGE_GROUP_OPTIONS, AGE_GROUP_LABEL_BY_CODE, RESIDENCE_REGION_LABEL_BY_CODE } from "@utils/filterCodes";

// styles
import "@styles/profile/profileEditPage.css";

// icons
import chevronDownIcon from "@images/icons/Action/Chevron Down.svg";

// 시트에는 실제 연령대만 노출한다. "선택 안 함"은 초기값일 뿐 고를 수 있는 값이 아니다.
const AGE_SHEET_OPTIONS = AGE_GROUP_OPTIONS.filter((option) => option.value !== "UNSPECIFIED");

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // 지역 선택 화면에서 돌아온 경우 편집 중이던 폼을 그대로 이어받는다.
  const restoredForm = location.state?.form ?? null;

  const [form, setForm] = useState(
    restoredForm ?? {
      nickname: "",
      profileImageUrl: "",
      ageGroup: "UNSPECIFIED",
      residenceRegion: null,
      residenceDistrict: "",
    },
  );
  const [isLoading, setIsLoading] = useState(!restoredForm);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isAgeSheetOpen, setIsAgeSheetOpen] = useState(false);
  const [pendingAgeGroup, setPendingAgeGroup] = useState(form.ageGroup);

  useEffect(() => {
    if (restoredForm) return;
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
  }, [restoredForm]);

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

  const handleOpenAgeSheet = () => {
    setPendingAgeGroup(form.ageGroup);
    setIsAgeSheetOpen(true);
  };

  const handleConfirmAge = () => {
    setForm((prev) => ({ ...prev, ageGroup: pendingAgeGroup }));
    setIsAgeSheetOpen(false);
  };

  const handleSave = async () => {
    const nickname = form.nickname.trim();
    if (!nickname) {
      setError("이름을 입력해주세요.");
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
      navigate("/profile", { replace: true });
    } catch (err) {
      console.log(err);
      setError("저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const regionLabel = form.residenceRegion
    ? `${RESIDENCE_REGION_LABEL_BY_CODE[form.residenceRegion]} ${form.residenceDistrict}`.trim()
    : "";

  return (
    <div className="app-shell">
      <Header type="sub" title="내 정보 수정" />
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
                  aria-label="프로필 사진 변경"
                />
                <p className="profile-edit-nickname text-title-3">{form.nickname}</p>
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
                <label className="profile-edit-label text-label-2">이름</label>
                <input
                  type="text"
                  className="profile-edit-input text-body-1-regular"
                  value={form.nickname}
                  maxLength={20}
                  placeholder="이름을 입력해주세요"
                  onChange={(event) => setForm((prev) => ({ ...prev, nickname: event.target.value }))}
                />
              </div>

              <div className="profile-edit-field">
                <label className="profile-edit-label text-label-2">연령대</label>
                <button type="button" className="profile-edit-select text-body-1-regular" onClick={handleOpenAgeSheet}>
                  <span className={form.ageGroup === "UNSPECIFIED" ? "profile-edit-select-placeholder" : ""}>
                    {form.ageGroup === "UNSPECIFIED" ? "연령대를 선택해주세요" : AGE_GROUP_LABEL_BY_CODE[form.ageGroup]}
                  </span>
                  <img src={chevronDownIcon} alt="" width={16} height={16} />
                </button>
              </div>

              <div className="profile-edit-field">
                <label className="profile-edit-label text-label-2">지역</label>
                <button
                  type="button"
                  className="profile-edit-select text-body-1-regular"
                  onClick={() => navigate("/profile/edit/region", { state: { form } })}
                >
                  <span className={regionLabel ? "" : "profile-edit-select-placeholder"}>
                    {regionLabel || "지역을 선택해주세요"}
                  </span>
                  <img src={chevronDownIcon} alt="" width={16} height={16} />
                </button>
              </div>

              {error && <p className="profile-edit-error text-caption-1">{error}</p>}
            </>
          )}
        </div>
      </div>

      {!isLoading && (
        <div className="profile-edit-footer">
          <button
            type="button"
            className="profile-edit-submit text-body-1-medium"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? "저장 중..." : "수정하기"}
          </button>
        </div>
      )}

      <BottomSheet isOpen={isAgeSheetOpen} onClose={() => setIsAgeSheetOpen(false)}>
        <h2 className="profile-edit-sheet-title text-title-3">연령대를 선택해 주세요</h2>
        <div className="profile-edit-age-chips">
          {AGE_SHEET_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`profile-edit-age-chip text-label-2${pendingAgeGroup === option.value ? " is-selected" : ""}`}
              onClick={() => setPendingAgeGroup(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button type="button" className="profile-edit-sheet-confirm text-body-1-medium" onClick={handleConfirmAge}>
          완료
        </button>
      </BottomSheet>
    </div>
  );
}
