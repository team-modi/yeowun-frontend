// 지역 선택 페이지 — 내 정보 수정에서 진입해, 고른 시군구를 다시 그쪽으로 돌려준다.
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// components
import Header from "@components/common/Header";

// utils
import { RESIDENCE_REGION_OPTIONS } from "@utils/filterCodes";
import { DISTRICTS_BY_REGION, REGION_SEARCH_ALIASES } from "@utils/regionDistricts";

// styles
import "@styles/profile/regionSelectPage.css";

// icons
import searchIcon from "@images/icons/Action/Search.svg";
import closeIcon from "@images/icons/Action/Close.svg";

// "서울 강남구" 처럼 시/도와 시군구를 한 줄로 합친 검색 대상 목록.
// haystack 에는 시/도 별칭까지 넣어 "서울시 강남" 같은 입력도 걸리게 한다.
const ALL_DISTRICTS = RESIDENCE_REGION_OPTIONS.flatMap((region) => {
  const aliases = REGION_SEARCH_ALIASES[region.value] ?? [region.label];
  return (DISTRICTS_BY_REGION[region.value] ?? []).map((district) => ({
    region: region.value,
    regionLabel: region.label,
    district,
    label: `${region.label} ${district}`,
    haystack: [...aliases, district].join(" "),
  }));
});

/** 공백으로 끊은 토큰이 모두 걸리면 통과. 붙여 쓴 입력("서울시강남")도 함께 본다. */
function matches(item, keyword) {
  const tokens = keyword.trim().split(/\s+/);
  if (tokens.every((token) => item.haystack.includes(token))) return true;

  const squashed = (item.haystack + item.label).replace(/\s+/g, "");
  return squashed.includes(keyword.replace(/\s+/g, ""));
}

export default function RegionSelectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // 편집 중이던 폼을 그대로 들고 왔다가, 지역만 갈아끼워 돌려준다.
  const form = location.state?.form ?? null;

  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState(
    form?.residenceRegion ? { region: form.residenceRegion, district: form.residenceDistrict ?? "" } : null,
  );

  const results = useMemo(() => {
    if (!keyword.trim()) return [];
    return ALL_DISTRICTS.filter((item) => matches(item, keyword)).slice(0, 50);
  }, [keyword]);

  const handleSubmit = () => {
    if (!selected) return;
    navigate("/profile/edit", {
      replace: true,
      state: {
        form: { ...form, residenceRegion: selected.region, residenceDistrict: selected.district },
      },
    });
  };

  return (
    <div className="app-shell">
      <Header type="sub" title="지역 선택" />
      <div className="app-content">
        <div className="app-content-pad region-select-body">
          <div className="region-select-search">
            <img src={searchIcon} alt="" width={18} height={18} />
            <input
              type="text"
              className="region-select-input text-body-2-regular"
              value={keyword}
              placeholder="지역명 검색 예) 서울시 강남구, 경기도 수원시"
              onChange={(event) => setKeyword(event.target.value)}
            />
            {keyword && (
              <button type="button" className="region-select-clear" onClick={() => setKeyword("")} aria-label="지우기">
                <img src={closeIcon} alt="" width={16} height={16} />
              </button>
            )}
          </div>

          {keyword.trim() && results.length === 0 ? (
            <p className="region-select-empty text-body-2-regular">검색 결과가 없어요</p>
          ) : (
            <ul className="region-select-list">
              {results.map((item) => {
                const isSelected = selected?.region === item.region && selected?.district === item.district;
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      className={`region-select-item text-body-1-regular${isSelected ? " is-selected" : ""}`}
                      onClick={() => setSelected({ region: item.region, district: item.district })}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="region-select-footer">
        <button
          type="button"
          className="region-select-submit text-body-1-medium"
          disabled={!selected}
          onClick={handleSubmit}
        >
          수정하기
        </button>
      </div>
    </div>
  );
}
