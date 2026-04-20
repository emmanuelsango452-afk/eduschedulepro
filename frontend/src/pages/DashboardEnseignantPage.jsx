import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function DashboardEnseignantPage() {
  const { utilisateur, deconnecter } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#f0faf6" }}>
      <div style={{
        background: "#085041", padding: "12px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <span style={{ color: "#E1F5EE", fontWeight: "500" }}>EduTrack Pro</span>
        <button onClick={() => { deconnecter(); navigate("/login"); }} style={{
          background: "#0F6E56", color: "#E1F5EE", border: "none",
          borderRadius: "6px", padding: "6px 12px", fontSize: "12px", cursor: "pointer"
        }}>Déconnexion</button>
      </div>
      <div style={{ padding: "2rem" }}>
        <h2 style={{ color: "#04342C" }}>Tableau de bord — Enseignant</h2>
        <p style={{ color: "#5F5E5A" }}>Bienvenue {utilisateur?.email} !</p>
      </div>
    </div>
  );
}