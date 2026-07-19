export const REGION_OPTIONS = [
  { value: "all", label: "전체", codes: [] },
  { value: "seoul", label: "서울", codes: ["SEOUL"] },
  { value: "gyeonggi-incheon", label: "경기·인천", codes: ["GYEONGGI", "INCHEON"] },
  { value: "gangwon", label: "강원", codes: ["GANGWON"] },
  { value: "daejeon-sejong-chungcheong", label: "대전·세종·충청", codes: ["SEJONG", "CHUNGNAM", "CHUNGBUK"] },
  { value: "gwangju-jeolla", label: "광주·전라", codes: ["JEONNAM", "JEONBUK"] },
  { value: "daegu-gyeongbuk", label: "대구·경북", codes: ["DAEGU", "GYEONGBUK"] },
  { value: "busan-ulsan-gyeongnam", label: "부산·울산·경남", codes: ["BUSAN", "ULSAN", "GYEONGNAM"] },
  { value: "jeju", label: "제주", codes: ["JEJU"] },
];

export const GENRE_OPTIONS = [
  { value: "all", label: "전체", codes: [] },
  { value: "painting", label: "회화·드로잉", codes: ["PAINTING"] },
  { value: "photo", label: "사진", codes: ["PHOTO"] },
  { value: "sculpture", label: "조각·설치", codes: ["SCULPTURE"] },
  { value: "media", label: "미디어아트", codes: ["MEDIA"] },
  { value: "design", label: "디자인", codes: ["DESIGN"] },
  { value: "craft", label: "공예", codes: ["CRAFT"] },
  { value: "architecture", label: "건축", codes: ["ARCHITECTURE"] },
  { value: "performance", label: "퍼포먼스", codes: ["PERFORMANCE"] },
  { value: "etc", label: "기타", codes: ["ETC"] },
];

function buildCodeMap(options) {
  return Object.fromEntries(options.map(({ value, codes }) => [value, codes]));
}

export const REGION_CODE_MAP = buildCodeMap(REGION_OPTIONS);
export const GENRE_CODE_MAP = buildCodeMap(GENRE_OPTIONS);

export const GENRE_LABEL_BY_CODE = Object.fromEntries(
  GENRE_OPTIONS.filter((option) => option.value !== "all").flatMap((option) =>
    option.codes.map((code) => [code, option.label]),
  ),
);

export function toCodeParam(selected, codeMap) {
  if (!selected || selected.includes("all")) return undefined;
  const codes = selected.flatMap((value) => codeMap[value] ?? []);
  return codes.length > 0 ? codes.join(",") : undefined;
}

export const AGE_GROUP_OPTIONS = [
  { value: "TEENS", label: "10대" },
  { value: "TWENTIES", label: "20대" },
  { value: "THIRTIES", label: "30대" },
  { value: "FORTIES", label: "40대" },
  { value: "FIFTIES_PLUS", label: "50대 이상" },
  { value: "UNSPECIFIED", label: "선택 안 함" },
];

export const AGE_GROUP_LABEL_BY_CODE = Object.fromEntries(
  AGE_GROUP_OPTIONS.map((option) => [option.value, option.label]),
);

export const RESIDENCE_REGION_OPTIONS = [
  { value: "SEOUL", label: "서울" },
  { value: "BUSAN", label: "부산" },
  { value: "DAEGU", label: "대구" },
  { value: "INCHEON", label: "인천" },
  { value: "GWANGJU", label: "광주" },
  { value: "DAEJEON", label: "대전" },
  { value: "ULSAN", label: "울산" },
  { value: "SEJONG", label: "세종" },
  { value: "GYEONGGI", label: "경기" },
  { value: "GANGWON", label: "강원" },
  { value: "CHUNGBUK", label: "충북" },
  { value: "CHUNGNAM", label: "충남" },
  { value: "JEONBUK", label: "전북" },
  { value: "JEONNAM", label: "전남" },
  { value: "GYEONGBUK", label: "경북" },
  { value: "GYEONGNAM", label: "경남" },
  { value: "JEJU", label: "제주" },
];

export const RESIDENCE_REGION_LABEL_BY_CODE = Object.fromEntries(
  RESIDENCE_REGION_OPTIONS.map((option) => [option.value, option.label]),
);

export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export const TYPE_OPTIONS = [
  { value: "solo", label: "개인전" },
  { value: "group", label: "단체전(2인 이상)" },
  { value: "curated", label: "기획전" },
  { value: "artfair", label: "아트페어" },
];
