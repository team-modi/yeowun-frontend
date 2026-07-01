import axiosInstance from "@utils/axiosInstance";

// 내 프로필 조회
export const getUserInfo = async () => {
  const data = await axiosInstance.get("/users/me");
  return data;
};

// 내 프로필 수정
export const updateUserInfo = async (params) => {
  const data = await axiosInstance.put("/users/me/profile", params);
  return data;
};
