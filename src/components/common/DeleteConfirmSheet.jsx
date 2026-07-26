// 기록 삭제 바텀시트

import BottomSheet from "@components/common/BottomSheet";
import "@styles/common/DeleteConfirmSheet.css";

export default function DeleteConfirmSheet({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  title = "기록을 삭제할까요?",
  description = "삭제한 기록은 다시 볼 수 없어요.",
}) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h2 className="delete-confirm-sheet-title text-title-3">{title}</h2>
      <p className="delete-confirm-sheet-desc text-body-2-regular">{description}</p>
      <button
        type="button"
        className="delete-confirm-sheet-confirm text-body-1-medium"
        disabled={isDeleting}
        onClick={onConfirm}
      >
        {isDeleting ? "삭제 중..." : "삭제할게요"}
      </button>
      <button type="button" className="delete-confirm-sheet-cancel text-body-1-medium" onClick={onClose}>
        취소
      </button>
    </BottomSheet>
  );
}
