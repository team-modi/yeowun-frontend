import { RouterProvider } from "react-router-dom";

// router
import { router } from "@router/LoginRoute";

import "@styles/index.css";

export default function App() {
  return <RouterProvider router={router} />;
}
