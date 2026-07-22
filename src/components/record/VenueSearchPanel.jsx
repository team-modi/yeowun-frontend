import { useEffect, useState } from "react";

// components
import Header from "@components/common/Header";
import SearchBox from "@components/layout/SearchBox";

// api
import { searchVenues } from "@api/venue";

// styles
import "@styles/record/VenueSearchPanel.css";

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
      <Header type="back" title="전시관 선택" onBack={onClose} />
      <div className="venue-search-panel-body">
        <SearchBox
          value={keyword}
          onChange={setKeyword}
          onClear={() => setKeyword("")}
          placeholder="전시관명 검색"
          autoFocus
        />
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
