// AI 호출 실패를 사용자에게 보여줄 메시지로 바꾼다.
//
// 백엔드는 실패 시 { code, message } 를 내려준다(AiErrorCode):
//   - AI_RATE_LIMITED  (429) "잠시 후 다시 시도해 주세요."   ← "다른 질문 보기"/"다시 다듬기" 연타 쿨다운
//   - AI_GENERATION_FAILED (502) "AI 응답 생성에 실패했습니다."
//   - AI_DISABLED (503) "AI 기능이 설정되지 않았습니다."
// 서버 메시지가 이미 사용자용 한국어라 그대로 노출하고, 없으면(네트워크 단절 등) 기본 문구로 대체한다.
const FALLBACK = "문제가 생겼어요. 잠시 후 다시 시도해 주세요.";

export function aiErrorMessage(error) {
  // axios(JSON) 응답 · SSE 스트림 에러(userMessage) 둘 다 지원.
  return error?.response?.data?.message ?? error?.userMessage ?? FALLBACK;
}

/** rate limit(429) 인지 여부 — 필요하면 UI에서 따로 처리(예: 버튼 쿨다운). */
export function isRateLimited(error) {
  return error?.response?.status === 429 || error?.response?.data?.code === "AI_RATE_LIMITED";
}
