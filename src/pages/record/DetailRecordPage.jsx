import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// components
import Header from "@components/common/Header";
import Footer from "@components/common/Footer";

// api
import { getDetailRecord } from "@api/record";

// styles
import "@styles/record/DetailRecordPage.css";

// util
import { formatDateDot } from "@utils/common.js";

const DetailRecordPage = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const response = await getDetailRecord(recordId);
        if (!ignore) setData(response.data.data);
      } catch (error) {
        console.log(error);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [recordId]);

  if (!data) {
    return (
      <div className="app-shell">
        <Header type="sub" onBack={() => navigate(-1)} />
        <div className="app-content">
          <p className="detail-record-loading text-body-1-regular">로딩중...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const title = data.exhibitionTitle;
  const posterUrl = data.exhibitionPosterUrl;
  const artistLine = data.exhibitionArtist ?? data.artistLine;
  const emotionCodes = data.emotionCodes ?? [];
  const media = data.media ?? [];

  return (
    <div className="app-shell">
      <Header type="sub" onBack={() => navigate(-1)} />
      <div className="app-content">
        <div className="app-content-pad detail-record">
          <div
            className="detail-record-poster"
            style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
          >
            {!posterUrl && <span className="text-caption-1">Poster</span>}
          </div>

          <div className="detail-record-head">
            <h1 className="detail-record-title text-heading-1">{title}</h1>
            {artistLine && <p className="detail-record-artist text-body-2-regular">{artistLine}</p>}
            <p className="detail-record-date text-body-2-regular">{formatDateDot(data.viewedAt)}</p>
          </div>

          <section className="detail-record-section">
            <h2 className="detail-record-section-title text-heading-2">나의 감상 한 줄</h2>
            <p className="detail-record-content text-body-1-regular">{data.content}</p>
          </section>

          {emotionCodes.length > 0 && (
            <section className="detail-record-section">
              <h2 className="detail-record-section-title text-heading-2">감정 키워드</h2>
              <div className="detail-record-emotion-chips">
                {emotionCodes.map((keyword) => (
                  <span key={keyword} className="detail-record-emotion-chip text-label-2">
                    {keyword}
                  </span>
                ))}
              </div>
            </section>
          )}

          {media.length > 0 && (
            <section className="detail-record-section">
              <h2 className="detail-record-section-title text-heading-2">사진 / 영상</h2>
              <div className="detail-record-media-grid">
                {media.map((item) => (
                  <div key={item.url} className="detail-record-media-thumb">
                    {item.type === "VIDEO" ? (
                      <video src={item.url} className="detail-record-media-thumb-media" muted />
                    ) : (
                      <img src={item.url} alt="" className="detail-record-media-thumb-media" />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DetailRecordPage;
