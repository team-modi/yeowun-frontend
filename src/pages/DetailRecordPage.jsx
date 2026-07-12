import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// components
import Header from "@components/common/Header";

// api
import { getDetailRecord } from "@api/record";

// "기록 보러가기" 눌렀을 때 도착하는 아카이브 상세 화면.
// 아직 디자인이 없어서 DetailExhibitionPage.jsx와 동일한 최소 형태(제목만 표시)로 우선 만들어둠 — 디자인 나오면 교체
const DetailRecordPage = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await getDetailRecord(recordId);
        setData(response.data.data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [recordId]);

  return (
    <div className="app-shell">
      <Header type="sub" title="아카이브 상세" onBack={() => navigate("/yeowun")} />
      <div className="app-content">
        <div className="app-content-pad">{data ? data.title : "로딩중..."}</div>
      </div>
    </div>
  );
};

export default DetailRecordPage;
