import { useNavigate } from "react-router-dom";

// api
import { logout } from "@api/auth";

const Home = () => {
  const navigate = useNavigate();

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

  return (
    <div>
      <button type="button" className="btn-kakao" onClick={handleLogout}>
        로그아웃
      </button>
    </div>
  );
};

export default Home;
