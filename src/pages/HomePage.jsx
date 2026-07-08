import { useEffect, useState } from "react";

// components
import Header from "@components/layout/Header";
import Footer from "@components/layout/Footer";
import SubHeader from "@components/exhibition/SubHeader";
import ExhibitCard from "@components/exhibition/ExhibitCard";
import BannerCarousel from "@components/home/BannerCarousel";

// api
import { getExhibitionList, getExhibitionBanners } from "@api/exhibition";

const HomePage = () => {
  const [endingSoonData, setEndingSoonData] = useState([]);
  const [freeData, setFreeData] = useState([]);
  const [openingThisData, setOpeningThisData] = useState([]);
  const [bannerData, setBannerData] = useState([]);

  const exhibitionList = async () => {
    try {
      const endingSoon = await getExhibitionList({
        section: "ending-soon",
        size: 2,
      });
      const free = await getExhibitionList({
        section: "free",
        size: 2,
      });
      const openingThis = await getExhibitionList({
        section: "opening-this-month",
        size: 5,
      });

      setEndingSoonData(endingSoon.data.data.content);
      setFreeData(free.data.data.content);
      setOpeningThisData(openingThis.data.data.content);
    } catch (error) {
      console.log(error);
    }
  };

  const exhibitionBanners = async () => {
    try {
      const response = await getExhibitionBanners();
      setBannerData(response.data.data.banners);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await exhibitionList();
      await exhibitionBanners();
    })();
  }, []);

  return (
    <div className="app-shell">
      <Header type="main" />
      <div className="app-content">
        <BannerCarousel banners={bannerData} />
        <div className="home-body">
          <div className="home-box-vertical">
            <SubHeader title="곧 끝나기 전에 봐야할 전시" type="soon" />
            <div className="home-section-vertical">
              {endingSoonData.map((exhibit) => (
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
          <div className="home-box-vertical">
            <SubHeader title="이번 달 새로 열리는 전시" type="new" />
            <div className="home-section-row">
              {openingThisData.map((exhibit) => (
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
          </div>
          <div className="home-box-vertical">
            <SubHeader title="무료로 볼 수 있는 전시" type="free" />
            <div className="home-section-vertical">
              {freeData.map((exhibit) => (
                <ExhibitCard
                  key={exhibit.exhibitionId}
                  thumbnail={exhibit.posterUrl}
                  title={exhibit.title}
                  place={exhibit.place}
                  startDate={exhibit.startDate}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
