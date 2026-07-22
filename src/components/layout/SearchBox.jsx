import "@styles/common/SearchBox.css";

// icons
import searchIcon from "@images/icons/Action/Search.svg";
import closeIcon from "@images/icons/Action/Close.svg";

export default function SearchBox({ value, onChange, onSubmit, onFocus, onClear, placeholder, autoFocus }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit?.(value);
    }
  };

  return (
    <div className="search-box-body">
      <form className="search-box" onSubmit={handleSubmit}>
        <img src={searchIcon} alt="" width={20} height={20} className="search-box-icon" />
        <input
          type="text"
          inputMode="search"
          enterKeyHint="search"
          className="search-box-input text-body-1-regular"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
        {onClear && value && (
          <button type="button" className="search-box-clear" onClick={onClear} aria-label="검색어 지우기">
            <img src={closeIcon} alt="" width={14} height={14} />
          </button>
        )}
      </form>
    </div>
  );
}
