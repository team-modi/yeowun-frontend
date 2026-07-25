// 다른화면에 있을시: 리마인드 배너
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// api
import { getRemindCandidate } from "@api/remind";
import { getUserInfo } from "@api/user";

// utils
import { isRemindCompletedToday } from "@utils/common";

// styles
import "@styles/exhibition/RemindEntry.css";

// icons
import chevronRightIcon from "@images/icons/Action/Chevron Right.svg";

export default function RemindEntryBanner() {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const [candidateRes, userRes] = await Promise.all([getRemindCandidate(), getUserInfo()]);
        if (ignore) return;
        setCandidate(candidateRes.data.data ?? null);
        setNickname(userRes.data.data?.nickname ?? "");
      } catch (err) {
        console.log(err);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  if (!candidate || isRemindCompletedToday()) return null;

  return (
    <button type="button" className="remind-entry-banner" onClick={() => navigate("/remind")}>
      <div
        className="remind-entry-banner-thumb"
        style={candidate.posterUrl ? { backgroundImage: `url(${candidate.posterUrl})` } : undefined}
      />
      <div className="remind-entry-banner-body">
        <span className="remind-entry-banner-badge text-caption-1">오늘의 여운</span>
        <p className="remind-entry-banner-text text-body-1-medium">
          {nickname && `${nickname}님, `}
          {candidate.elapsedLabel} 기록한 전시가 있어요!
        </p>
      </div>
      <img src={chevronRightIcon} alt="" width={18} height={18} />
    </button>
  );
}
