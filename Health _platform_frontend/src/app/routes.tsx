import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { DMP } from "./components/DMP";
import { AIAssistant } from "./components/AIAssistant";
import { Admissions } from "./components/Admissions";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Landing } from "./components/Landing";
import { Availability } from "./components/Availability";
import { BookAppointment } from "./components/BookAppointment";
import { Profile } from "./components/Profile";
import { Settings } from "./components/Settings";

// Composant pour protéger les routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
    errorElement: <div className="p-10 text-center">Une erreur critique est survenue. Veuillez rafraîchir la page.</div>
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
    path: "/app",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    errorElement: <div className="p-10 text-center">Erreur de navigation.</div>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", Component: Dashboard },
      { path: "dmp", Component: DMP },
      { path: "dmp/:patientId", Component: DMP },
      { path: "assistant", Component: AIAssistant },
      { path: "admissions", Component: Admissions },
      { path: "availability", Component: Availability },
      { path: "book-appointment", Component: BookAppointment },
      { path: "profile", Component: Profile },
      { path: "settings", Component: Settings },
    ],
  },
]);
