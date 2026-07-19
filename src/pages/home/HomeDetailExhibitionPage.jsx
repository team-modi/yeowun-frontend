import { useSearchParams } from "react-router-dom";

// components
import Header from "@components/common/Header";
import ExhibitionList from "@components/layout/ExhibitionList";

const TYPE_CONFIG = {
  soon: { section: "ending-soon", title: "곧 끝나기 전에 봐야할 전시" },
  free: { section: "free", title: "무료로 볼 수 있는 전시" },
  new: { section: "opening-this-month", title: "이번 달 새로 열리는 전시" },
};

const HomeDetailExhibitionPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const { section, title } = TYPE_CONFIG[type] ?? {};

  return (
    <div className="app-shell">
      <Header type="sub" title={title} />
      <div className="app-content">
        <div className="app-content-pad">
          <ExhibitionList data={{ section }} type={type === "new" ? "row" : ""} />
        </div>
      </div>
    </div>
  );
};

export default HomeDetailExhibitionPage;
