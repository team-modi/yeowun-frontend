// access 토큰은 메모리에만 보관한다(새로고침 시 휘발 → refresh 쿠키로 복원).
let accessToken = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (token) => {
  accessToken = token;
};
export const clearAccessToken = () => {
  accessToken = null;
};
