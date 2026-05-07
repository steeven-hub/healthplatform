import { createBrowserRouter, Navigate } from "react-router";
import { Landing } from "./components/Landing";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { DMP } from "./components/DMP";
import { AIAssistant } from "./components/AIAssistant";
import { Admissions } from "./components/Admissions";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem("afrihealth_authenticated") === "true";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },
      { path: "dmp", Component: DMP },
      { path: "dmp/:patientId", Component: DMP },
      { path: "assistant", Component: AIAssistant },
      { path: "admissions", Component: Admissions },
    ],
  },
]);
