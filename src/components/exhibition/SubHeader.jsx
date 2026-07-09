import { useNavigate } from "react-router-dom";

const SubHeader = ({ title, type }) => {
  const navigate = useNavigate();

  const handleMove = () => {
    navigate(`/home_detail_exhibition?type=${type}`);
  };

  return (
    <header className="sub-header-body">
      <p className="sub-header-title">{title}</p>
      <button type="button" className="sub-header-moveBtn" onClick={handleMove}>
        전체보기
      </button>
    </header>
  );
};

export default SubHeader;
