import { useRef, useState } from "react";

// styles
import "@styles/common/BottomSheet.css";

const CLOSE_DRAG_THRESHOLD = 120;

export default function BottomSheet({ isOpen, onClose, children, className = "" }) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef(0);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setDragY(0);
      setIsDragging(false);
    }
  }

  if (!isOpen) return null;

  const handleDragStart = (event) => {
    dragStartYRef.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (event) => {
    if (!isDragging) return;
    const delta = event.clientY - dragStartYRef.current;
    setDragY(Math.max(0, delta));
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY > CLOSE_DRAG_THRESHOLD) onClose?.();
    setDragY(0);
  };

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose}>
      <div
        className={`bottom-sheet ${isDragging ? "is-dragging" : ""} ${className}`}
        style={{ transform: `translateY(${dragY}px)` }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="bottom-sheet-handle-area"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        >
          <div className="bottom-sheet-handle" />
        </div>
        {children}
      </div>
    </div>
  );
}
