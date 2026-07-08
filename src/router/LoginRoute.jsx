import { createBrowserRouter, Navigate } from "react-router-dom";

// pages
import LoginPage from "@pages/LoginPage";
import HomePage from "@pages/HomePage";
import ProfilePage from "@pages/ProfilePage";
import ExhibitionPage from "@pages/ExhibitionPage";
import DetailExhibitionPage from "@pages/DetailExhibitionPage";
import RecordPage from "@pages/RecordPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/yeowun" replace /> },
  { path: "/yeowun", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/profile", element: <ProfilePage /> },
  { path: "/exhibition", element: <ExhibitionPage /> },
  { path: "/exhibition/:exhibitionId", element: <DetailExhibitionPage /> },
  { path: "/record", element: <RecordPage /> },
]);
