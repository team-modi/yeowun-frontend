// 프로필 페이지
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import Footer from "@components/common/Footer";

// api
import { getUserInfo } from "@api/user";

// icons
import chevronRightIcon from "@images/icons/Action/Chevron Right.svg";
import archiveIcon from "@images/icons/Navigation/Archive_Default.svg";
import bookmarkDefaultIcon from "@images/icons/Action/Bookmark_Default.svg";

const KEYWORD_PREVIEW_COUNT = 5;

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllKeywords, setShowAllKeywords] = useState(false);

  useEffect(() => {
    let ignore = false;

    (async () => {
      setIsLoading(true);
      try {
        const response = await getUserInfo();
        if (!ignore) setUserInfo(response.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  if (isLoading || !userInfo) {
    return (
      <div className="app-shell">
        <Header type="profile" title="프로필" />
        <div className="app-content">
          <p className="profile-loading text-body-1-regular">불러오는 중...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const keywords = userInfo.tasteKeywords ?? [];
  const visibleKeywords = showAllKeywords ? keywords : keywords.slice(0, KEYWORD_PREVIEW_COUNT);

  return (
    <div className="app-shell">
      <Header type="profile" title="프로필" />
      <div className="app-content">
        <div className="app-content-pad profile-body">
          <div className="profile-main-row">
            <div
              className="profile-avatar"
              style={userInfo.profileImageUrl ? { backgroundImage: `url(${userInfo.profileImageUrl})` } : undefined}
            />
            <p className="profile-nickname text-title-3">{userInfo.nickname}</p>
            <button type="button" className="profile-edit-btn text-label-3" onClick={() => navigate("/profile/edit")}>
              내 정보 수정
            </button>
          </div>

          <div className="profile-stat-card">
            <button
              type="button"
              className="profile-stat-item"
              onClick={() => navigate("/profile/bookmarked-exhibitions")}
            >
              <img src={bookmarkDefaultIcon} alt="" width={24} height={24} />
              <span className="profile-stat-text">
                <span className="profile-stat-label text-body-2-medium">저장한 전시</span>
                <span className="profile-stat-count text-body-2-medium">{userInfo.stats?.bookmarkCount ?? 0}</span>
              </span>
            </button>
            <span className="profile-stat-divider" />
            <button type="button" className="profile-stat-item" onClick={() => navigate("/profile/visited-exhibitions")}>
              <img src={archiveIcon} alt="" width={24} height={24} />
              <span className="profile-stat-text">
                <span className="profile-stat-label text-body-2-medium">기록한 전시</span>
                <span className="profile-stat-count text-body-2-medium">{userInfo.stats?.exhibitionCount ?? 0}</span>
              </span>
            </button>
          </div>

          <section className="profile-section">
            <button
              type="button"
              className="profile-keyword-header"
              onClick={() => setShowAllKeywords((prev) => !prev)}
              disabled={keywords.length <= KEYWORD_PREVIEW_COUNT}
            >
              <span className="profile-section-title text-heading-2">나의 감정 키워드</span>
              <span className="profile-keyword-count text-heading-2">{keywords.length}</span>
              {keywords.length > KEYWORD_PREVIEW_COUNT && (
                <img
                  src={chevronRightIcon}
                  alt=""
                  width={18}
                  height={18}
                  className={`profile-keyword-chevron${showAllKeywords ? " is-open" : ""}`}
                />
              )}
            </button>
            {keywords.length === 0 ? (
              <p className="profile-keyword-empty text-body-2-regular">아직 쌓인 감정 키워드가 없어요</p>
            ) : (
              <div className="profile-keyword-chips">
                {visibleKeywords.map((keyword) => (
                  <span key={keyword} className="profile-keyword-chip text-label-2">
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </section>

          <nav className="profile-menu">
            <button type="button" className="profile-menu-row" onClick={() => navigate("/profile/settings")}>
              <span className="text-body-1-regular">알림</span>
              <img src={chevronRightIcon} alt="" width={18} height={18} />
            </button>
            {/* 이용약관 연결 URL이 아직 API 명세에 없어 비활성 처리해둔다. */}
            <button type="button" className="profile-menu-row" disabled>
              <span className="text-body-1-regular">서비스 이용약관</span>
              <img src={chevronRightIcon} alt="" width={18} height={18} />
            </button>
            <button type="button" className="profile-menu-row" onClick={() => navigate("/profile/settings")}>
              <span className="text-body-1-regular">계정</span>
              <img src={chevronRightIcon} alt="" width={18} height={18} />
            </button>
          </nav>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
