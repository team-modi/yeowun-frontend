import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

// api
import { getUserInfo } from "@api/user";

// /users/me 호출 성공 여부로만 인증 상태를 알 수 있음(401이면 인터셉터가 refresh 1회 시도 후에도 실패).
// 로그인 상태면 children을 그대로 보여주고, 아니면 /login으로 리다이렉트.
export default function RequireAuth({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        await getUserInfo();
        if (!ignore) setStatus("authed");
      } catch {
        if (!ignore) setStatus("guest");
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  if (status === "checking") return null;
  if (status === "guest") return <Navigate to="/login" replace />;

  return children;
}
