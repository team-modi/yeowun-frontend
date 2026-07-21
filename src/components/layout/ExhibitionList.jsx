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
import { REGION_CODE_MAP, GENRE_CODE_MAP, toCodeParam } from "@utils/filterCodes";

const ExhibitionList = ({ type, data }) => {
  const [exhibitionData, setExhibitionData] = useState([]);
  const [sort, setSort] = useState("latest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [region, setRegion] = useState(undefined);
  const [category, setCategory] = useState(undefined);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const response = await getExhibitionList({
          sort,
          size: 20,
          region,
          category,
          ...data,
        });
        if (!ignore) {
          setExhibitionData(response.data.data.content);
          setHasLoaded(true);
        }
      } catch (error) {
        console.log(error);
        if (!ignore) setHasLoaded(true);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [sort, region, category, JSON.stringify(data)]);

  const isEmpty = hasLoaded && exhibitionData.length === 0;

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
        {isEmpty ? (
          <div className="exhibit-list-empty">
            <div className="exhibit-list-empty-thumb" />
            <p className="exhibit-list-empty-title text-heading-2">검색 결과가 없어요</p>
            <p className="exhibit-list-empty-desc text-body-2-regular">다른 키워드로 검색해 보세요</p>
          </div>
        ) : type === "row" ? (
          <div className="home-section-row">
            {exhibitionData.map((exhibit) => (
              <ExhibitCard
                key={exhibit.exhibitionId}
                type="vertical"
                thumbnail={exhibit.posterUrl}
                title={exhibit.title}
                place={exhibit.place}
                startDate={exhibit.startDate}
                endDate={exhibit.endDate}
                exhibitionId={exhibit.exhibitionId}
                bookmarked={exhibit.bookmarked}
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
                exhibitionId={exhibit.exhibitionId}
                bookmarked={exhibit.bookmarked}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExhibitionList;
