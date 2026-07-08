const ExhibitCard = ({ thumbnail, dday, openDate, title, place, date, onClick, type }) => {
  if (type === "vertical") {
    return (
      <div className="exhibit-card-v" onClick={onClick} role={onClick ? "button" : undefined}>
        <div
          className="exhibit-card-v-thumb"
          style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : undefined}
        />
        <div className="exhibit-card-v-content-box">
          <p className="exhibit-card-title">{title}</p>
          <div className="exhibit-card-v-content">
            <p className="exhibit-card-place">{place}</p>
            <span className="exhibit-card-openDate">{openDate} 오픈</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exhibit-card" onClick={onClick}>
      <div className="exhibit-card-thumb" style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : undefined} />
      <div className="exhibit-card-content-box">
        {dday && <span className="exhibit-card-dday">{dday}</span>}
        <div className="exhibit-card-content1">
          <p className="exhibit-card-title">{title}</p>
          <div className="exhibit-card-content2">
            <p className="exhibit-card-place">{place}</p>
            <p className="exhibit-card-date">{date}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitCard;
