import { createBrowserRouter, Navigate } from "react-router-dom";

// pages
import LoginPage from "@pages/LoginPage";
import HomePage from "@pages/HomePage";
import HomeDetailExhibitionPage from "@pages/HomeDetailExhibitionPage";
import ProfilePage from "@pages/ProfilePage";
import ExhibitionPage from "@pages/ExhibitionPage";
import DetailExhibitionPage from "@pages/DetailExhibitionPage";
import DetailRecordPage from "@pages/DetailRecordPage";
import RecordPage from "@pages/RecordPage";
import RecordExhibitionSelectPage from "@pages/record/RecordExhibitionSelectPage";
import RecordDetailInputPage from "@pages/record/RecordDetailInputPage";
import RecordModePage from "@pages/record/RecordModePage";
import RecordWritePage from "@pages/record/RecordWritePage";
import RecordQuestionsPage from "@pages/record/RecordQuestionsPage";
import RecordComposePage from "@pages/record/RecordComposePage";
import RecordCompletePage from "@pages/record/RecordCompletePage";

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
        <RecordExhibitionSelectPage />
      </RequireAuth>
    ),
  },
  {
    path: "/record/new",
    element: (
      <RequireAuth>
        <RecordPage />
      </RequireAuth>
    ),
  },
  {
    path: "/record/detail",
    element: (
      <RequireAuth>
        <RecordDetailInputPage />
      </RequireAuth>
    ),
  },
  {
    path: "/record/mode",
    element: (
      <RequireAuth>
        <RecordModePage />
      </RequireAuth>
    ),
  },
  {
    path: "/record/write",
    element: (
      <RequireAuth>
        <RecordWritePage />
      </RequireAuth>
    ),
  },
  {
    path: "/record/questions",
    element: (
      <RequireAuth>
        <RecordQuestionsPage />
      </RequireAuth>
    ),
  },
  {
    path: "/record/compose",
    element: (
      <RequireAuth>
        <RecordComposePage />
      </RequireAuth>
    ),
  },
  {
    path: "/record/complete",
    element: (
      <RequireAuth>
        <RecordCompletePage />
      </RequireAuth>
    ),
  },
  {
    path: "/record/:recordId",
    element: (
      <RequireAuth>
        <DetailRecordPage />
      </RequireAuth>
    ),
  },
]);
