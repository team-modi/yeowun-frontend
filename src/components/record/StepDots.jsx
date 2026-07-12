import "@styles/record/StepDots.css";

export default function StepDots({ total, current }) {
  return (
    <div className="step-dots">
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className={`step-dot ${index === current ? "is-active" : ""}`} />
      ))}
    </div>
  );
}
