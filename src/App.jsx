import { RouterProvider } from "react-router-dom";

// router
import { router } from "@router/RouteList";

// styles
import "@styles/base.css";
import "@styles/home.css";
import "@styles/exhibition.css";
import "@styles/login.css";
import "@styles/register.css";
import "@styles/record.css";
import "@styles/archivePage.css";
import "@styles/notificationPage.css";
import "@styles/profile/profilePage.css";
import "@styles/profile/profileEditPage.css";
import "@styles/profile/settingsPage.css";
import "@styles/profile/exhibitionListPage.css";

export default function App() {
  return <RouterProvider router={router} />;
}
