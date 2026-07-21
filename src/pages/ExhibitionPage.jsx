// 전시탐색 페이지
import { useState } from "react";

// components
import Header from "@components/common/Header";
import Footer from "@components/common/Footer";
import ExhibitionList from "@components/layout/ExhibitionList";
import SearchBox from "@components/layout/SearchBox";
import RemindEntryBanner from "@components/common/RemindEntryBanner";

const ExhibitionPage = () => {
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const handleSearch = (value) => {
    setSearchKeyword(value);
  };

  return (
    <div className="app-shell">
      <Header type="bookmark" title="전시탐색" />
      <div className="app-content">
        <div className="app-content-pad exhibition-body">
          <SearchBox
            value={keyword}
            onChange={setKeyword}
            onSubmit={handleSearch}
            placeholder="전시명, 작가명, 장소를 검색해보세요"
          />
          <RemindEntryBanner />
          <ExhibitionList data={{ keyword: searchKeyword }} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ExhibitionPage;
