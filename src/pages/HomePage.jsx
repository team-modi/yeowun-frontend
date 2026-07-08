// components
import Header from "@components/layout/Header";
import Footer from "@components/layout/Footer";
import SubHeader from "@components/exhibition/SubHeader";
import ExhibitCard from "@components/exhibition/ExhibitCard";
import BannerCarousel from "@components/home/BannerCarousel";

// mock -----
const exhibits1 = [
  {
    thumbnail: "/images/thin-air.jpg",
    dday: "D-5",
    title: "희박한 공기 Thin Air",
    place: "동작아트갤러리/서울",
    date: "2026.08.15",
  },
  {
    thumbnail: "/images/thin-air.jpg",
    dday: "D-5",
    title: "희박한 공기 Thin Air",
    place: "동작아트갤러리/서울",
    date: "2026.08.15",
  },
];

const exhibits2 = [
  {
    thumbnail: "/images/thin-air.jpg",
    dday: "D-5",
    title: "희박한 공기 Thin Air",
    place: "동작아트갤러리/서울",
    openDate: "3.12",
  },
  {
    thumbnail: "/images/thin-air.jpg",
    dday: "D-5",
    title: "희박한 공기 Thin Air",
    place: "동작아트갤러리/서울",
    openDate: "3.12",
  },
  {
    thumbnail: "/images/thin-air.jpg",
    dday: "D-5",
    title: "희박한 공기 Thin Air",
    place: "동작아트갤러리/서울",
    openDate: "3.12",
  },
  {
    thumbnail: "/images/thin-air.jpg",
    dday: "D-5",
    title: "희박한 공기 Thin Air",
    place: "동작아트갤러리/서울",
    openDate: "3.12",
  },
  {
    thumbnail: "/images/thin-air.jpg",
    dday: "D-5",
    title: "희박한 공기 Thin Air",
    place: "동작아트갤러리/서울",
    openDate: "3.12",
  },
];

const bannerList = [
  {
    exhibitionId: 244,
    title: "백수연 展 ⟪검은 회화: 슬도⟫",
    bannerImageUrl: "http://www.culture.go.kr/upload/ucms/oneCltInfo/2026/202607/12108efa01ef4d6bbc147cc18fd615ee.png",
    startDate: "2026-07-04",
    endDate: "2026-08-30",
    place: "슬도아트",
  },
  {
    exhibitionId: 242,
    title: "김대유 개인전 <미워하는 미워하는 미워하는 마음 없이 A Rose by Any Other Name>",
    bannerImageUrl: "http://www.culture.go.kr/upload/ucms/oneCltInfo/2026/202606/92ffb29b7d714eb8b381e39b5c3fe435.png",
    startDate: "2026-07-03",
    endDate: "2026-07-26",
    place: "16아카이브",
  },
  {
    exhibitionId: 243,
    title: "김해진 展 ⟪머무는 몸, 나아가는 맘⟫",
    bannerImageUrl: "http://www.culture.go.kr/upload/ucms/oneCltInfo/2026/202607/7fc57ffefa934de9bb04dd218f20c1ec.png",
    startDate: "2026-07-04",
    endDate: "2026-08-30",
    place: "슬도아트",
  },
];

// -------

const HomePage = () => {
  return (
    <div className="app-shell">
      <Header type="main" />
      <div className="app-content">
        <BannerCarousel banners={bannerList} />
        <div className="home-body">
          <div className="home-box-vertical">
            <SubHeader title="곧 끝나기 전에 봐야할 전시" type="soon" />
            <div className="home-section-vertical">
              {exhibits1.map((exhibit, index) => (
                <ExhibitCard
                  key={index}
                  thumbnail={exhibit.thumbnail}
                  dday={exhibit.dday}
                  title={exhibit.title}
                  place={exhibit.place}
                  date={exhibit.date}
                />
              ))}
            </div>
          </div>
          <div className="home-box-vertical">
            <SubHeader title="이번 달 새로 열리는 전시" type="new" />
            <div className="home-section-row">
              {exhibits2.map((exhibit, index) => (
                <ExhibitCard
                  key={index}
                  type="vertical"
                  thumbnail={exhibit.thumbnail}
                  dday={exhibit.dday}
                  title={exhibit.title}
                  place={exhibit.place}
                  openDate={exhibit.openDate}
                />
              ))}
            </div>
          </div>
          <div className="home-box-vertical">
            <SubHeader title="무료로 볼 수 있는 전시" type="free" />
            <div className="home-section-vertical">
              {exhibits1.map((exhibit, index) => (
                <ExhibitCard
                  key={index}
                  thumbnail={exhibit.thumbnail}
                  title={exhibit.title}
                  place={exhibit.place}
                  date={exhibit.date}
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
