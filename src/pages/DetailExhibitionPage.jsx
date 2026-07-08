import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import { getDetailExhibition } from "@api/exhibition";

const DetailExhibitionPage = () => {
  const { exhibitionId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await getDetailExhibition(exhibitionId);
        if (response.data.meta.result === "SUCCESS") {
          setData(response.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [exhibitionId]);

  if (!data) return <div>로딩중...</div>;

  return <div className="app-shell">{data.title}</div>;
};

export default DetailExhibitionPage;
