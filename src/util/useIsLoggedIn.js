// 로그인 여부 확인
import { useEffect, useState } from "react";

// api
import { getUserInfo } from "@api/user";

export function useIsLoggedIn() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        await getUserInfo();
        if (!ignore) setIsLoggedIn(true);
      } catch {
        if (!ignore) setIsLoggedIn(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  return isLoggedIn;
}
