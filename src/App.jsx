import { RouterProvider } from "react-router-dom";

// router
import { router } from "@router/LoginRoute";

// styles
import "@styles/base.css";
import "@styles/home.css";
import "@styles/exhibition.css";
import "@styles/login.css";
import "@styles/register.css";
import "@styles/record.css";
import "@styles/archivePage.css";
import "@styles/notificationPage.css";

export default function App() {
  return <RouterProvider router={router} />;
}
