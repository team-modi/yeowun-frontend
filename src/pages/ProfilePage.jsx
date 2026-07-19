// 프로필 페이지
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";
import Footer from "@components/common/Footer";

// api
import { getUserInfo } from "@api/user";

// styles
import "@styles/profile/profilePage.css";

const KEYWORD_PREVIEW_COUNT = 6;

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
            <button type="button" className="profile-edit-btn text-label-2" onClick={() => navigate("/profile/edit")}>
              프로필 수정
            </button>
          </div>

          <section className="profile-section">
            <h2 className="profile-section-title text-heading-2">내 전시 보관함</h2>
            <div className="profile-stat-row">
              <button
                type="button"
                className="profile-stat-card"
                onClick={() => navigate("/profile/visited-exhibitions")}
              >
                <span className="profile-stat-count text-title-2">{userInfo.stats?.exhibitionCount ?? 0}</span>
                <span className="profile-stat-label text-body-2-regular">기록한 전시</span>
              </button>
              <button
                type="button"
                className="profile-stat-card"
                onClick={() => navigate("/profile/bookmarked-exhibitions")}
              >
                <span className="profile-stat-count text-title-2">{userInfo.stats?.bookmarkCount ?? 0}</span>
                <span className="profile-stat-label text-body-2-regular">관심 전시</span>
              </button>
            </div>
          </section>

          <section className="profile-section">
            <h2 className="profile-section-title text-heading-2">나의 감정 키워드</h2>
            {keywords.length === 0 ? (
              <p className="profile-keyword-empty text-body-2-regular">아직 쌓인 감정 키워드가 없어요</p>
            ) : (
              <>
                <div className="profile-keyword-chips">
                  {visibleKeywords.map((keyword) => (
                    <span key={keyword} className="profile-keyword-chip text-label-3">
                      {keyword}
                    </span>
                  ))}
                </div>
                {keywords.length > KEYWORD_PREVIEW_COUNT && (
                  <button
                    type="button"
                    className="profile-keyword-more text-label-2"
                    onClick={() => setShowAllKeywords((prev) => !prev)}
                  >
                    {showAllKeywords ? "접기" : "더보기"}
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
