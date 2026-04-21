import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

// Pages
import EnseignantsPage from "./pages/EnseignantsPage";
import RapportsPage from "./pages/RapportsPage";
import DashboardComptablePage from "./pages/DashboardComptablePage";
import DashboardSurveillantPage from "./pages/DashboardSurveillantPage";
import LoginPage from "./pages/LoginPage";
import DashboardAdminPage from "./pages/DashboardAdminPage";
import DashboardEnseignantPage from "./pages/DashboardEnseignantPage";
import DashboardDeleguePage from "./pages/DashboardDeleguePage";
import EmploiTempsPage from "./pages/EmploiTempsPage";
import CahierTextePage from "./pages/CahierTextePage";
import VacationPage from "./pages/VacationPage";

// Route protégée par rôle
function PrivateRoute({ children, roles }) {
  const { utilisateur, chargement } = useAuth();

  if (chargement) return <div className="text-center mt-5">Chargement...</div>;

  if (!utilisateur) return <Navigate to="/login" />;

  if (roles && !roles.includes(utilisateur.role)) {
    return <Navigate to="/login" />;
  }

  return children;
}

// Redirection selon le rôle après connexion
function RedirectParRole() {
  const { utilisateur } = useAuth();

  if (!utilisateur) return <Navigate to="/login" />;

  switch (utilisateur.role) {
    case "administrateur": return <Navigate to="/dashboard/admin" />;
    case "enseignant":     return <Navigate to="/dashboard/enseignant" />;
    case "delegue":        return <Navigate to="/dashboard/delegue" />;
    case "surveillant": return <Navigate to="/dashboard/surveillant" />;
    case "comptable": return <Navigate to="/dashboard/comptable" />;
    default:               return <Navigate to="/login" />;
  }
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Page publique */}
          <Route path="/login" element={<LoginPage />} />

          {/* Redirection automatique */}
          <Route path="/" element={<RedirectParRole />} />

          {/* Dashboard Admin */}
          <Route path="/dashboard/admin" element={
            <PrivateRoute roles={["administrateur", "surveillant", "comptable"]}>
              <DashboardAdminPage />
            </PrivateRoute>
          }/>

          {/* Dashboard Surveillant */}
          <Route path="/dashboard/surveillant" element={
            <PrivateRoute roles={["surveillant"]}>
              <DashboardSurveillantPage />
          </PrivateRoute>
          }/>

          {/* Dashboard Enseignant */}
          <Route path="/dashboard/enseignant" element={
            <PrivateRoute roles={["enseignant"]}>
              <DashboardEnseignantPage />
            </PrivateRoute>
          }/>

          {/* Dashboard Comptable */}
          <Route path="/dashboard/comptable" element={
           <PrivateRoute roles={["comptable"]}>
              <DashboardComptablePage />
          </PrivateRoute>
          }/>

          {/* Dashboard Délégué */}
          <Route path="/dashboard/delegue" element={
            <PrivateRoute roles={["delegue"]}>
              <DashboardDeleguePage />
            </PrivateRoute>
          }/>

          {/* Emploi du temps */}
          <Route path="/emploi-temps" element={
            <PrivateRoute roles={["administrateur", "enseignant", "delegue", "etudiant"]}>
              <EmploiTempsPage />
            </PrivateRoute>
          }/>

          {/* Cahier de texte */}
          <Route path="/cahiers" element={
            <PrivateRoute roles={["administrateur", "delegue", "enseignant"]}>
              <CahierTextePage />
            </PrivateRoute>
          }/>

          {/* Vacations */}
          <Route path="/vacations" element={
            <PrivateRoute roles={["administrateur", "enseignant", "surveillant", "comptable"]}>
              <VacationPage />
            </PrivateRoute>
          }/>

          {/* Enseignants */}
          <Route path="/enseignants" element={
           <PrivateRoute roles={["administrateur"]}>
            <EnseignantsPage />
          </PrivateRoute>
          }/>

          {/* Rapports */}
          <Route path="/rapports" element={
            <PrivateRoute roles={["administrateur", "surveillant"]}>
              <RapportsPage />
          </PrivateRoute>
          }/>

          {/* Route inconnue */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;