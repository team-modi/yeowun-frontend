import "@styles/common/SearchBox.css";

// icons
import searchIcon from "@images/icons/Action/Search.svg";

export default function SearchBox({ value, onChange, onSubmit, placeholder }) {
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
          type="search"
          inputMode="search"
          enterKeyHint="search"
          className="search-box-input text-body-1-regular"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
      </form>
    </div>
  );
}

