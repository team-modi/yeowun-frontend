// 홈: 리마인드 모달

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
import closeIcon from "@images/icons/Action/Close.svg";

export default function RemindEntryModal() {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [nickname, setNickname] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const [candidateRes, userRes] = await Promise.all([getRemindCandidate(), getUserInfo()]);
        if (ignore) return;
        const data = candidateRes.data.data ?? null;
        setCandidate(data);
        setNickname(userRes.data.data?.nickname ?? "");
        if (data && !isRemindCompletedToday()) {
          setIsOpen(true);
        }
      } catch (err) {
        console.log(err);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  if (!isOpen || !candidate) return null;

  const handleGoRemind = () => {
    setIsOpen(false);
    navigate("/remind");
  };

  return (
    <div className="remind-entry-modal-overlay">
      <div className="remind-entry-modal">
        <div
          className="remind-entry-modal-poster"
          style={candidate.posterUrl ? { backgroundImage: `url(${candidate.posterUrl})` } : undefined}
        >
          <button type="button" className="remind-entry-modal-close" onClick={() => setIsOpen(false)} aria-label="닫기">
            <img src={closeIcon} alt="" width={18} height={18} />
          </button>
        </div>
        <div className="remind-entry-modal-body">
          <span className="remind-entry-modal-badge text-label-3">{candidate.elapsedLabel} 기록</span>
          <h2 className="remind-entry-modal-title text-title-3">{candidate.exhibitionTitle}</h2>
          <p className="remind-entry-modal-subtitle text-body-2-regular">
            {nickname && `${nickname}님, `}
            그날 남긴 기록을
            <br />
            다시 떠올려보세요
          </p>
          <button type="button" className="remind-entry-modal-btn text-body-1-medium" onClick={handleGoRemind}>
            리마인드 보기
          </button>
        </div>
      </div>
    </div>
  );
}

