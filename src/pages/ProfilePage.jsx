import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// api
import { logout } from "@api/auth";
import { getUserInfo, updateUserInfo } from "@api/user";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState([]);

  const handleLogout = async () => {
    try {
      const response = await logout();
      if (response.data.meta.result === "SUCCESS") {
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserInfo = async () => {
    try {
      const params = {
        nickname: "test2",
      };
      const response = await updateUserInfo(params);
      if (response.data.meta.result === "SUCCESS") {
        getUserInfoList();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getUserInfoList = async () => {
    try {
      const response = await getUserInfo();
      if (response.data.meta.result === "SUCCESS") {
        setUserInfo(response.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    (async () => {
      await getUserInfoList();
    })();
  }, []);

  return (
    <div className="app-shell">
      <div>
        <p>{userInfo.userId}</p>
        <p>{userInfo.nickname}</p>
      </div>
      <button type="button" className="btn-kakao" onClick={handleUpdateUserInfo}>
        수정
      </button>
      <button type="button" className="btn-kakao" onClick={handleLogout}>
        로그아웃
      </button>
    </div>
  );
};

export default ProfilePage;
