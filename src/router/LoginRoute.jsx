import { createBrowserRouter, Navigate } from "react-router-dom";

// pages
import LoginPage from "@pages/LoginPage";
import HomePage from "@pages/HomePage";
import HomeDetailExhibitionPage from "@pages/HomeDetailExhibitionPage";
import ProfilePage from "@pages/ProfilePage";
import ExhibitionPage from "@pages/ExhibitionPage";
import DetailExhibitionPage from "@pages/DetailExhibitionPage";
import RecordPage from "@pages/RecordPage";

// router
import RequireAuth from "@router/RootRedirect";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/yeowun" replace /> },
  { path: "/yeowun", element: <HomePage /> },
  { path: "/home_detail_exhibition", element: <HomeDetailExhibitionPage /> },
  { path: "/login", element: <LoginPage /> },
  {
    path: "/profile",
    element: (
      <RequireAuth>
        <ProfilePage />
      </RequireAuth>
    ),
  },
  { path: "/exhibition", element: <ExhibitionPage /> },
  { path: "/exhibition/:exhibitionId", element: <DetailExhibitionPage /> },
  {
    path: "/record",
    element: (
      <RequireAuth>
        <RecordPage />
      </RequireAuth>
    ),
  },
]);
