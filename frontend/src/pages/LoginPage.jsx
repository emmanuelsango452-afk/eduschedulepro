import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur]     = useState("");
  const [chargement, setChargement] = useState(false);

  const { connecter } = useAuth();
  const navigate      = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    try {
      const reponse = await axios.post(
        "http://localhost/eduschedulepro/backend/api/auth.php?action=login",
        { email, password }
      );

      if (reponse.data.succes) {
        connecter(reponse.data.token, reponse.data.utilisateur);
        navigate("/");
      }
    } catch (err) {
      setErreur(
        err.response?.data?.message || "Erreur de connexion. Réessayez."
      );
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0faf6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        border: "0.5px solid rgba(0,0,0,0.08)",
        padding: "2rem",
        width: "100%",
        maxWidth: "400px"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "56px", height: "56px",
            background: "#E1F5EE",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem"
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                stroke="#0F6E56" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "600", margin: "0 0 4px" }}>
            EduTrack Pro
          </h2>
          <p style={{ fontSize: "13px", color: "#5F5E5A", margin: 0 }}>
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "13px", color: "#5F5E5A", display: "block", marginBottom: "6px" }}>
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "10px 12px", borderRadius: "8px",
                border: "0.5px solid rgba(0,0,0,0.15)",
                fontSize: "14px", outline: "none"
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontSize: "13px", color: "#5F5E5A", display: "block", marginBottom: "6px" }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "10px 12px", borderRadius: "8px",
                border: "0.5px solid rgba(0,0,0,0.15)",
                fontSize: "14px", outline: "none"
              }}
            />
          </div>

          {/* Message d'erreur */}
          {erreur && (
            <div style={{
              background: "#FCEBEB", color: "#791F1F",
              padding: "10px 12px", borderRadius: "8px",
              fontSize: "13px", marginBottom: "1rem"
            }}>
              {erreur}
            </div>
          )}

          <button
            type="submit"
            disabled={chargement}
            style={{
              width: "100%", padding: "11px",
              background: chargement ? "#9FE1CB" : "#0F6E56",
              color: "#fff", border: "none",
              borderRadius: "8px", fontSize: "14px",
              fontWeight: "500", cursor: chargement ? "not-allowed" : "pointer"
            }}
          >
            {chargement ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        {/* Badges rôles */}
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "#5F5E5A", marginBottom: "8px" }}>
            Accès selon votre rôle
          </p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
            {["Admin", "Enseignant", "Délégué", "Surveillant", "Comptable"].map(role => (
              <span key={role} style={{
                fontSize: "11px", background: "#E1F5EE",
                color: "#085041", padding: "3px 8px",
                borderRadius: "20px"
              }}>{role}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}