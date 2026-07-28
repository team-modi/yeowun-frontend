import { useCallback, useState } from "react";

/**
 * 브라우저 위치를 한 번 받아오는 훅.
 *
 * 웹에서는 `navigator.geolocation`으로 바로 받을 수 있지만 조건이 둘 있다.
 * - **보안 컨텍스트 전용**: HTTPS나 localhost에서만 동작한다(운영은 Vercel HTTPS라 충족)
 * - **사용자 허용 필요**: 브라우저가 권한 팝업을 띄우고, 거부하면 좌표를 받을 수 없다
 *
 * 그래서 화면 진입과 동시에 묻지 않는다. 거리순처럼 <b>위치가 실제로 필요한 순간</b>에만 request()를 부른다 —
 * 맥락 없이 뜨는 권한 팝업은 거부율이 높고, 한 번 거부되면 다시 묻기도 어렵다.
 *
 * 성공하면 좌표를 기억해 두고 다음 요청부터는 그대로 돌려준다(같은 화면에서 반복 요청하지 않도록).
 */
export default function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const request = useCallback(() => {
    if (coords) return Promise.resolve(coords);

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const unsupported = { code: "UNSUPPORTED", message: "이 브라우저에서는 위치를 사용할 수 없어요" };
      setError(unsupported);
      return Promise.resolve(null);
    }

    setIsRequesting(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const next = { lat: position.coords.latitude, lng: position.coords.longitude };
          setCoords(next);
          setError(null);
          setIsRequesting(false);
          resolve(next);
        },
        (positionError) => {
          // 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
          const message =
            positionError.code === 1
              ? "위치 권한이 필요해요. 브라우저 설정에서 허용해 주세요"
              : "위치를 가져오지 못했어요. 잠시 후 다시 시도해 주세요";
          setError({ code: positionError.code, message });
          setIsRequesting(false);
          resolve(null);
        },
        // 정확도보다 응답 속도가 중요하다(전시장 거리 정렬은 수십 m 오차가 의미 없다).
        // maximumAge로 최근에 받아 둔 값을 재사용해 팝업·측위를 줄인다.
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
      );
    });
  }, [coords]);

  const clearError = useCallback(() => setError(null), []);

  return { coords, error, isRequesting, request, clearError };
}
