// 전역 토스트 렌더러. App 루트에 한 번 마운트해 두고, showToast()로 메시지를 띄운다.
import { useToastStore } from "@store/useToastStore";

// styles
import "@styles/common/Toast.css";

export default function Toast() {
  const message = useToastStore((state) => state.message);
  const visible = useToastStore((state) => state.visible);

  return (
    <div className={`toast${visible ? " is-visible" : ""}`} role="status" aria-live="polite">
      <span className="toast-message text-body-2-medium">{message}</span>
    </div>
  );
}
