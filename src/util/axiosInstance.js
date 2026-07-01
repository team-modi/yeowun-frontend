import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

// api 호출시 에러코드(미확인) 발생하면 '/refresh' api호출 후 이전 실패한 api 재호출하기

export default axiosInstance;
