// components
import BottomSheet from "@components/common/BottomSheet";

const MAP_DELTA = 0.004;

function buildOsmEmbedSrc(lat, lon) {
  const minLon = lon - MAP_DELTA;
  const maxLon = lon + MAP_DELTA;
  const minLat = lat - MAP_DELTA;
  const maxLat = lat + MAP_DELTA;
  const bbox = `${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
}

function buildKakaoMapUrl(placeName, lat, lon) {
  return `https://map.kakao.com/link/map/${encodeURIComponent(placeName || "")},${lat},${lon}`;
}

export default function LocationSheet({ isOpen, onClose, venueLine, address, gpsX, gpsY }) {
  const lat = gpsY;
  const lon = gpsX;
  const hasCoords = typeof lat === "number" && typeof lon === "number";

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h2 className="venue-location-title text-body-1-medium">{venueLine}</h2>
      {address && <p className="venue-location-address text-body-2-regular">{address}</p>}

      {hasCoords ? (
        <>
          <div className="venue-location-map">
            <iframe className="venue-location-map-frame" title="지도" src={buildOsmEmbedSrc(lat, lon)} loading="lazy" />
          </div>
          <a
            className="venue-location-kakao-btn text-body-1-medium"
            href={buildKakaoMapUrl(venueLine, lat, lon)}
            target="_blank"
            rel="noreferrer"
          >
            카카오맵에서 열기
          </a>
        </>
      ) : (
        <div className="venue-location-map venue-location-map--empty">
          <span className="text-caption-1">위치 정보가 없어요</span>
        </div>
      )}
    </BottomSheet>
  );
}
