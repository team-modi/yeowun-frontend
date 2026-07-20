import { createBrowserRouter, Navigate } from "react-router-dom";

// pages
import LoginPage from "@pages/LoginPage";
import WelcomePage from "@pages/WelcomePage";
import HomePage from "@pages/HomePage";
import HomeDetailExhibitionPage from "@pages/home/HomeDetailExhibitionPage";
import ProfilePage from "@pages/ProfilePage";
import ProfileEditPage from "@pages/profile/ProfileEditPage";
import RegionSelectPage from "@pages/profile/RegionSelectPage";
import SettingsPage from "@pages/profile/SettingsPage";
import VisitedExhibitionsPage from "@pages/profile/VisitedExhibitionsPage";
import BookmarkedExhibitionsPage from "@pages/profile/BookmarkedExhibitionsPage";
import ExhibitionPage from "@pages/ExhibitionPage";
import DetailExhibitionPage from "@pages/exhibition/DetailExhibitionPage";
import DetailRecordPage from "@pages/record/DetailRecordPage";
import ArchivePage from "@pages/ArchivePage";
import NotificationPage from "@pages/home/NotificationPage";
import RecordPage from "@pages/RecordPage";
import RecordExhibitionSelectPage from "@pages/record/RecordExhibitionSelectPage";
import RecordDetailInputPage from "@pages/record/RecordDetailInputPage";
import RecordModePage from "@pages/record/RecordModePage";
import RecordWritePage from "@pages/record/RecordWritePage";
import RecordQuestionsPage from "@pages/record/RecordQuestionsPage";
import RecordComposePage from "@pages/record/RecordComposePage";
import RecordCompletePage from "@pages/record/RecordCompletePage";
import RemindPage from "@pages/remind/RemindPage";
import RemindCompletePage from "@pages/remind/RemindCompletePage";

// router
import RequireAuth from "@router/RootRedirect";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/yeowun" replace /> },
  { path: "/yeowun", element: <HomePage /> },
  { path: "/home_detail_exhibition", element: <HomeDetailExhibitionPage /> },
  { path: "/login", element: <LoginPage /> },
  {
    path: "/welcome",
    element: (
      <RequireAuth>
        <WelcomePage />
      </RequireAuth>
    ),
  },
  {
    path: "/profile",
    element: (
      <RequireAuth>
        <ProfilePage />
      </RequireAuth>
    ),
  },
  {
    path: "/profile/edit",
    element: (
      <RequireAuth>
        <ProfileEditPage />
      </RequireAuth>
    ),
  },
  {
    path: "/profile/edit/region",
    element: (
      <RequireAuth>
        <RegionSelectPage />
      </RequireAuth>
    ),
  },
  {
    path: "/profile/settings",
    element: (
      <RequireAuth>
        <SettingsPage />
      </RequireAuth>
    ),
  },
  {
    path: "/profile/visited-exhibitions",
    element: (
      <RequireAuth>
        <VisitedExhibitionsPage />
      </RequireAuth>
    ),
  },
  {
    path: "/profile/bookmarked-exhibitions",
    element: (
      <RequireAuth>
        <BookmarkedExhibitionsPage />
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
  {
    path: "/archive",
    element: (
      <RequireAuth>
        <ArchivePage />
      </RequireAuth>
    ),
  },
  {
    path: "/notifications",
    element: (
      <RequireAuth>
        <NotificationPage />
      </RequireAuth>
    ),
  },
  {
    path: "/remind",
    element: (
      <RequireAuth>
        <RemindPage />
      </RequireAuth>
    ),
  },
  {
    path: "/remind/complete",
    element: (
      <RequireAuth>
        <RemindCompletePage />
      </RequireAuth>
    ),
  },
]);
