import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <button
        type="button"
        className="btn-kakao"
        onClick={() => {
          navigate("/user");
        }}
      >
        프로필
      </button>
      <button
        type="button"
        className="btn-kakao"
        onClick={() => {
          navigate("/exhibition");
        }}
      >
        전시목록
      </button>
    </div>
  );
};

export default HomePage;
