import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  fetch("/api/actuator/health").then((res) => res.json());

  return (
    <>
      <div>modi</div>
    </>
  );
}

export default App;
