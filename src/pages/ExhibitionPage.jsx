import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// api
import { getExhibitionList } from "@api/exhibition";

const ExhibitionPage = () => {
  const navigate = useNavigate();

  const [exhibitionList, setExhibitionList] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await getExhibitionList();
        if (response.data.meta.result === "SUCCESS") {
          setExhibitionList(response.data.data.content);
        }
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  //   const handleAddExhibition = async (params) => {
  //     try {
  //       const response = await addPersonalExhibition(params);

  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  return (
    <div className="app-shell">
      <div>
        {exhibitionList.map((item) => {
          return (
            <button key={item.exhibitionId} onClick={() => navigate(`/exhibition/${item.exhibitionId}`)}>
              {item.title}
            </button>
          );
        })}
        {/* <button
          onClick={() => {
            handleAddExhibition;
          }}
        >
          개인전시등록
        </button> */}
      </div>
    </div>
  );
};

export default ExhibitionPage;
