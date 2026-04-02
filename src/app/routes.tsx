import { createBrowserRouter } from "react-router";
import { AuthPage } from "./pages/AuthPage";
import { GoogleCallback } from "./pages/GoogleCallback";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { Journal } from "./pages/Journal";
import { Analytics } from "./pages/Analytics";
import { CalendarView } from "./pages/CalendarView";

export const router = createBrowserRouter([
  { path: "/", element: <AuthPage /> },
  { path: "/auth/callback", element: <GoogleCallback /> },
  {
    path: "/app",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "journal", element: <Journal /> },
      { path: "analytics", element: <Analytics /> },
      { path: "calendar", element: <CalendarView /> },
    ],
  },
]);
