import { useEffect, useState } from "react";

// components
import ExhibitCard from "@components/exhibition/ExhibitCard";
import ExhibitListHeader from "@components/common/ExhibitListHeader";
import FilterSheet from "@components/common/FilterSheet";

// styles
import "@styles/common/ExhibitionList.css";

// api
import { getExhibitionList } from "@api/exhibition";

// util
import { REGION_CODE_MAP, GENRE_CODE_MAP, toCodeParam } from "@utils/exhibitionFilterCodes";

const ExhibitionList = ({ type, data }) => {
  const [exhibitionData, setExhibitionData] = useState([]);
  const [sort, setSort] = useState("latest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [region, setRegion] = useState(undefined);
  const [category, setCategory] = useState(undefined);

  const exhibitionList = async () => {
    try {
      const response = await getExhibitionList({
        sort,
        size: 20,
        region,
        category,
        ...data,
      });
      setExhibitionData(response.data.data.content);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await exhibitionList();
    })();
  }, [sort, region, category, JSON.stringify(data)]);

  const handleApplyFilter = ({ regions, genres }) => {
    setRegion(toCodeParam(regions, REGION_CODE_MAP));
    setCategory(toCodeParam(genres, GENRE_CODE_MAP));
  };

  return (
    <div>
      <ExhibitListHeader
        total={exhibitionData.length}
        sort={sort}
        onSortChange={setSort}
        onFilterClick={() => setIsFilterOpen(true)}
      />
      <FilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        totalCount={exhibitionData.length}
        onApply={handleApplyFilter}
      />
      <div className="exhibitionList-body">
        {type === "row" ? (
          <div className="home-section-row">
            {exhibitionData.map((exhibit) => (
              <ExhibitCard
                key={exhibit.exhibitionId}
                type="vertical"
                thumbnail={exhibit.posterUrl}
                title={exhibit.title}
                place={exhibit.place}
                startDate={exhibit.startDate}
              />
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default ExhibitionList;
