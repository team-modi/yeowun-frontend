// 감정 키워드 — 추천(카테고리별)·최근 만든 키워드.
// 백엔드에 감정 키워드 목록 엔드포인트가 없어(자유 문자열 저장) 추천값은 프론트 상수로 둔다.

/** 추천 키워드: 카테고리 → 키워드 배열. 감상 시 마음에 가까운 감정을 고르게 한다. */
export const RECOMMENDED_EMOTION_GROUPS = [
  { category: "즐거움과 설렘", keywords: ["즐거운", "유쾌한", "설레는", "신나는", "벅찬", "만족스러운"] },
  { category: "평온과 여유", keywords: ["평온한", "편안한", "잔잔한", "따뜻한", "포근한", "나른한"] },
  { category: "놀라움과 영감", keywords: ["새로운", "경이로운", "강렬한", "인상적인", "몽환적인", "신비로운"] },
  { category: "사색과 그리움", keywords: ["서정적인", "그리운", "아련한", "뭉클한", "여운이 남는", "사색적인"] },
  { category: "슬픔과 먹먹함", keywords: ["슬픈", "먹먹한", "쓸쓸한", "공허한", "씁쓸한", "애틋한"] },
  { category: "불편과 혼란", keywords: ["답답한", "혼란스러운", "불편한", "낯선", "지루한", "어려운"] },
];

/** 추천 키워드 전체를 평탄화한 집합(커스텀 여부 판별용). */
export const RECOMMENDED_EMOTIONS = new Set(RECOMMENDED_EMOTION_GROUPS.flatMap((group) => group.keywords));

const RECENT_KEY = "modi:recentEmotionKeywords";
const RECENT_MAX = 10;

/** 최근 만든(직접 입력한) 키워드 목록을 최신순으로 반환. */
export function getRecentEmotionKeywords() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

/** 직접 입력한 키워드를 최근 목록 맨 앞에 추가(중복 제거, 최대 10개). */
export function pushRecentEmotionKeyword(keyword) {
  const trimmed = keyword.trim();
  if (!trimmed) return;
  try {
    const next = [trimmed, ...getRecentEmotionKeywords().filter((item) => item !== trimmed)].slice(0, RECENT_MAX);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // localStorage 접근 실패는 무시 — 최근 키워드는 부가 기능.
  }
}
