import { createBrowserRouter, Navigate } from "react-router-dom";

// pages
import LoginPage from "@pages/LoginPage";
import HomePage from "@pages/HomePage";
import UserPage from "@pages/UserPage";
import ExhibitionPage from "@pages/ExhibitionPage";
import DetailExhibitionPage from "@pages/DetailExhibitionPage";
import RecordPage from "@pages/Record";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/yeowun", element: <HomePage /> },
  { path: "/user", element: <UserPage /> },
  { path: "/exhibition", element: <ExhibitionPage /> },
  { path: "/exhibition/:exhibitionId", element: <DetailExhibitionPage /> },
  { path: "/record", element: <RecordPage /> },
]);
