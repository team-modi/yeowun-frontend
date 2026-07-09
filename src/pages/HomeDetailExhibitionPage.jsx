import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// components
import Header from "@components/common/Header";
import ExhibitCard from "@components/exhibition/ExhibitCard";
import ExhibitListHeader from "@components/common/ExhibitListHeader";

// api
import { getExhibitionList } from "@api/exhibition";

const HomeDetailExhibitionPage = () => {
  const [exhibitionData, setExhibitionData] = useState([]);
  const [sort, setSort] = useState("latest");

  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");

  const exhibitionList = async () => {
    let response;
    try {
      if (type === "soon") {
        response = await getExhibitionList({
          section: "ending-soon",
          sort,
        });
      } else if (type === "free") {
        response = await getExhibitionList({
          section: "free",
          sort,
        });
      } else {
        response = await getExhibitionList({
          section: "opening-this-month",
          sort,
        });
      }

      setExhibitionData(response.data.data.content);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await exhibitionList();
    })();
  }, [type, sort]);

  return (
    <div className="app-shell">
      <Header
        type="sub"
        title={
          type === "soon"
            ? "곧 끝나기 전에 봐야할 전시"
            : type === "new"
              ? "이번 달 새로 열리는 전시"
              : "무료로 볼 수 있는 전시"
        }
      />
      <div className="app-content">
        <ExhibitListHeader
          total={exhibitionData.length}
          sort={sort}
          onSortChange={setSort}
          onFilterClick={() => {
            // 필터 모달/바텀시트 열기
          }}
        />

        <div className="home-section-vertical">
          {exhibitionData.map((exhibit) => (
            <ExhibitCard
              key={exhibit.exhibitionId}
              thumbnail={exhibit.posterUrl}
              title={exhibit.title}
              place={exhibit.place}
              startDate={exhibit.startDate}
              endDate={exhibit.endDate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeDetailExhibitionPage;
