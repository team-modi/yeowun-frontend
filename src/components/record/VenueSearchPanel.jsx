import { useEffect, useState } from "react";

// components
import Header from "@components/common/Header";

// api
import { searchVenues } from "@api/venue";

export default function VenueSearchPanel({ isOpen, onClose, onSelect }) {
  const [keyword, setKeyword] = useState("");
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    if (!isOpen || keyword.trim().length === 0) return;

    let ignore = false;

    (async () => {
      try {
        const response = await searchVenues({ keyword });
        const list = response.data.data.venues ?? response.data.data.venues ?? [];
        if (!ignore) setVenues(list);
      } catch (error) {
        console.log(error);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [isOpen, keyword]);

  const visibleVenues = keyword.trim().length === 0 ? [] : venues;

  if (!isOpen) return null;

  const handleSelect = (venue) => {
    onSelect?.(venue);
    onClose?.();
  };

  return (
    <div className="venue-search-panel">
      <Header type="sub" title="전시관 검색" onBack={onClose} />
      <div className="venue-search-panel-body">
        <div className="venue-search-input-box">
          <input
            type="search"
            inputMode="search"
            className="venue-search-input text-body-1-regular"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="전시관명 검색"
            autoFocus
          />
        </div>
        <ul className="venue-search-list">
          {visibleVenues.map((venue) => (
            <li key={venue.venueId ?? venue.id ?? venue.name}>
              <button
                type="button"
                className="venue-search-item text-body-1-regular"
                onClick={() => handleSelect(venue)}
              >
                {venue.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
