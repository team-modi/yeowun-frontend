import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "@pages/LoginPage";
import Home from "@pages/Home";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/yeowun", element: <Home /> },
]);
