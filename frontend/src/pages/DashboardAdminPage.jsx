import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function DashboardAdminPage() {
  const { utilisateur, deconnecter } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    deconnecter();
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0faf6" }}>
      <div style={{
        background: "#085041", padding: "12px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <span style={{ color: "#E1F5EE", fontWeight: "500" }}>
          EduTrack Pro
        </span>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ color: "#9FE1CB", fontSize: "13px" }}>
            {utilisateur?.email}
          </span>
          <button onClick={handleLogout} style={{
            background: "#0F6E56", color: "#E1F5EE",
            border: "none", borderRadius: "6px",
            padding: "6px 12px", fontSize: "12px", cursor: "pointer"
          }}>
            Déconnexion
          </button>
        </div>
      </div>
      <div style={{ padding: "2rem" }}>
        <h2 style={{ color: "#04342C" }}>
          Tableau de bord — Administrateur
        </h2>
        <p style={{ color: "#5F5E5A" }}>
          Bienvenue {utilisateur?.email} !
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/emploi-temps")} style={{
            background: "#0F6E56", color: "#fff", border: "none",
            borderRadius: "8px", padding: "10px 20px", cursor: "pointer"
          }}>
            Emploi du temps
          </button>
          <button onClick={() => navigate("/cahiers")} style={{
            background: "#0F6E56", color: "#fff", border: "none",
            borderRadius: "8px", padding: "10px 20px", cursor: "pointer"
          }}>
            Cahiers de texte
          </button>
          <button onClick={() => navigate("/vacations")} style={{
            background: "#0F6E56", color: "#fff", border: "none",
            borderRadius: "8px", padding: "10px 20px", cursor: "pointer"
          }}>
            Vacations
          </button>
        </div>
      </div>
    </div>
  );
}