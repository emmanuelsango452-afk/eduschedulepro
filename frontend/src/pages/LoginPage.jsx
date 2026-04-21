import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = "http://localhost/eduschedulepro/backend/api";

export default function LoginPage() {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [erreur, setErreur]         = useState("");
  const [chargement, setChargement] = useState(false);
  const [showPass, setShowPass]     = useState(false);

  const { connecter } = useAuth();
  const navigate      = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErreur("");
    setChargement(true);
    try {
      const reponse = await axios.post(
        `${API}/auth.php?action=login`,
        { email, password }
      );
      if (reponse.data.succes) {
        connecter(reponse.data.token, reponse.data.utilisateur);
        navigate("/");
      }
    } catch (err) {
      setErreur(err.response?.data?.message || "Email ou mot de passe incorrect.");
    } finally {
      setChargement(false);
    }
  };

 const roles = [
  { label: "Administrateur", color: "#0F6E56", bg: "#E1F5EE", icon: "⊞",  email: "admin@isge.bf" },
  { label: "Enseignant",     color: "#534AB7", bg: "#EEEDFE", icon: "👨‍🏫", email: "cbere@isge.bf" },
  { label: "Délégué",        color: "#BA7517", bg: "#FAEEDA", icon: "📝",  email: "delegue.l1@isge.bf" },
  { label: "Surveillant",    color: "#185FA5", bg: "#E6F1FB", icon: "👁️",  email: "surveillant@isge.bf" },
  { label: "Comptable",      color: "#993C1D", bg: "#FAECE7", icon: "💰",  email: "comptable@isge.bf" },
];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "#f0faf6",
    }}>

      {/* Panneau gauche — illustration */}
      <div style={{
        flex: 1,
        background: "#04342C",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Cercles décoratifs */}
        <div style={{
          position: "absolute", width: "400px", height: "400px",
          borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)",
          top: "-100px", left: "-100px"
        }}/>
        <div style={{
          position: "absolute", width: "300px", height: "300px",
          borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)",
          bottom: "-50px", right: "-50px"
        }}/>
        <div style={{
          position: "absolute", width: "200px", height: "200px",
          borderRadius: "50%", background: "rgba(29,158,117,0.1)",
          top: "50%", left: "50%", transform: "translate(-50%,-50%)"
        }}/>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "3rem", position: "relative", zIndex: 1 }}>
          <div style={{
            width: "72px", height: "72px", background: "#1D9E75",
            borderRadius: "20px", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 1.5rem"
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                stroke="#E1F5EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ color: "#E1F5EE", fontSize: "28px", fontWeight: "600", margin: "0 0 8px" }}>
            EduTrack Pro
          </h1>
          <p style={{ color: "#9FE1CB", fontSize: "15px", margin: 0 }}>
            Système de gestion pédagogique
          </p>
        </div>

        {/* Features */}
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "360px" }}>
          {[
            { icon: "📅", title: "Emploi du temps", desc: "Planification et gestion des créneaux" },
            { icon: "📱", title: "Pointage QR-Code", desc: "Validation numérique des présences" },
            { icon: "📝", title: "Cahier de texte", desc: "Suivi pédagogique en temps réel" },
            { icon: "💰", title: "Fiches vacation", desc: "Calcul automatique des paiements" },
          ].map((f, i) => (
            <div key={i} style={{
              display: "flex", gap: "14px", alignItems: "center",
              padding: "14px 16px", borderRadius: "12px",
              background: "rgba(255,255,255,0.05)", marginBottom: "10px",
              border: "0.5px solid rgba(255,255,255,0.08)"
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "rgba(29,158,117,0.2)", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: "20px",
                flexShrink: 0
              }}>{f.icon}</div>
              <div>
                <p style={{ color: "#E1F5EE", fontSize: "13px", fontWeight: "500", margin: "0 0 2px" }}>{f.title}</p>
                <p style={{ color: "#9FE1CB", fontSize: "12px", margin: 0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p style={{ color: "#5DCAA5", fontSize: "12px", marginTop: "2rem", position: "relative", zIndex: 1 }}>
          ISGE — Institut Supérieur de Génie Électrique • 2025-2026
        </p>
      </div>

      {/* Panneau droit — formulaire */}
      <div style={{
        width: "480px", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "3rem", background: "#f0faf6"
      }}>
        <div style={{ width: "100%", maxWidth: "380px" }}>

          {/* En-tête formulaire */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#04342C", margin: "0 0 8px" }}>
              Connexion
            </h2>
            <p style={{ fontSize: "14px", color: "#5F5E5A", margin: 0 }}>
              Connectez-vous à votre espace EduTrack Pro
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleLogin}>

            {/* Email */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#04342C", display: "block", marginBottom: "8px" }}>
                Adresse email
              </label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", left: "12px", top: "50%",
                  transform: "translateY(-50%)", fontSize: "16px"
                }}>📧</div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "12px 12px 12px 40px",
                    borderRadius: "10px",
                    border: erreur ? "1.5px solid #E24B4A" : "1.5px solid rgba(0,0,0,0.12)",
                    fontSize: "14px", background: "#fff",
                    outline: "none", color: "#04342C",
                    transition: "border 0.2s"
                  }}
                  onFocus={e => e.target.style.border = "1.5px solid #0F6E56"}
                  onBlur={e => e.target.style.border = erreur ? "1.5px solid #E24B4A" : "1.5px solid rgba(0,0,0,0.12)"}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#04342C", display: "block", marginBottom: "8px" }}>
                Mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", left: "12px", top: "50%",
                  transform: "translateY(-50%)", fontSize: "16px"
                }}>🔒</div>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "12px 40px 12px 40px",
                    borderRadius: "10px",
                    border: erreur ? "1.5px solid #E24B4A" : "1.5px solid rgba(0,0,0,0.12)",
                    fontSize: "14px", background: "#fff",
                    outline: "none", color: "#04342C",
                    transition: "border 0.2s"
                  }}
                  onFocus={e => e.target.style.border = "1.5px solid #0F6E56"}
                  onBlur={e => e.target.style.border = erreur ? "1.5px solid #E24B4A" : "1.5px solid rgba(0,0,0,0.12)"}
                />
                <div
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: "12px", top: "50%",
                    transform: "translateY(-50%)", cursor: "pointer",
                    fontSize: "16px", userSelect: "none"
                  }}>
                  {showPass ? "🙈" : "👁️"}
                </div>
              </div>
            </div>

            {/* Erreur */}
            {erreur && (
              <div style={{
                background: "#FCEBEB", color: "#791F1F",
                padding: "12px 14px", borderRadius: "10px",
                fontSize: "13px", marginBottom: "1.25rem",
                display: "flex", gap: "8px", alignItems: "center",
                border: "0.5px solid #F09595"
              }}>
                <span>⚠️</span>
                <span>{erreur}</span>
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={chargement}
              style={{
                width: "100%", padding: "13px",
                background: chargement ? "#9FE1CB" : "#0F6E56",
                color: "#fff", border: "none",
                borderRadius: "10px", fontSize: "14px",
                fontWeight: "600", cursor: chargement ? "not-allowed" : "pointer",
                transition: "background 0.2s", marginBottom: "1.5rem",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
              }}
            >
              {chargement ? (
                <>
                  <span style={{ fontSize: "16px" }}>⏳</span>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <span style={{ fontSize: "16px" }}>🔐</span>
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1, height: "0.5px", background: "rgba(0,0,0,0.1)" }}/>
            <span style={{ fontSize: "12px", color: "#5F5E5A" }}>Accès selon votre rôle</span>
            <div style={{ flex: 1, height: "0.5px", background: "rgba(0,0,0,0.1)" }}/>
          </div>

          {/* Badges rôles */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
            {roles.map(role => (
                <div key={role.label} onClick={() => {
                    setEmail(role.email);
                    setPassword("password");
            }} style={{
                   display: "flex", alignItems: "center", gap: "5px",
                   background: role.bg, color: role.color,
                   padding: "5px 10px", borderRadius: "20px",
                   fontSize: "11px", fontWeight: "500",
                   cursor: "pointer", transition: "opacity 0.2s"
            }}>
              <span style={{ fontSize: "12px" }}>{role.icon}</span>
              {role.label}
          </div>
            ))}
          </div>

          {/* Footer */}
          <p style={{ textAlign: "center", fontSize: "11px", color: "#5F5E5A", marginTop: "2rem" }}>
            EduTrack Pro © 2025-2026 — ISGE
          </p>
        </div>
      </div>
    </div>
  );
}