import { useState, useEffect } from "react";
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
  const [heure, setHeure]           = useState(new Date());
  const [salutation, setSalutation] = useState("");

  const { connecter } = useAuth();
  const navigate      = useNavigate();

  // Heure en temps réel
  useEffect(() => {
    const timer = setInterval(() => setHeure(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Message de bienvenue selon l'heure
  useEffect(() => {
    const h = heure.getHours();
    if (h >= 5 && h < 12)       setSalutation("☀️ Bonjour !");
    else if (h >= 12 && h < 18) setSalutation("🌤️ Bon après-midi !");
    else if (h >= 18 && h < 22) setSalutation("🌆 Bonsoir !");
    else                         setSalutation("🌙 Bonne nuit !");
  }, [heure]);

  const joursSemaine = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

  const formatDate = () => {
    return `${joursSemaine[heure.getDay()]} ${heure.getDate()} ${mois[heure.getMonth()]} ${heure.getFullYear()}`;
  };

  const formatHeure = () => {
    return heure.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

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
    { label: "Étudiant",       color: "#085041", bg: "#E1F5EE", icon: "🎓",  email: "etudiant@isge.bf" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#f0faf6" }}>

      {/* Panneau gauche */}
      <div style={{
        flex: 1, background: "linear-gradient(135deg, #04342C 0%, #085041 50%, #0F6E56 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "3rem", position: "relative", overflow: "hidden"
      }}>
        {/* Cercles décoratifs */}
        <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", top: "-150px", left: "-150px" }}/>
        <div style={{ position: "absolute", width: "350px", height: "350px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", bottom: "-80px", right: "-80px" }}/>
        <div style={{ position: "absolute", width: "250px", height: "250px", borderRadius: "50%", background: "rgba(29,158,117,0.08)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}/>

        {/* Heure en temps réel */}
        <div style={{
          position: "absolute", top: "24px", right: "24px",
          background: "rgba(255,255,255,0.08)", borderRadius: "12px",
          padding: "10px 16px", textAlign: "center",
          border: "0.5px solid rgba(255,255,255,0.1)"
        }}>
          <p style={{ color: "#E1F5EE", fontSize: "20px", fontWeight: "700", margin: 0, fontFamily: "monospace", letterSpacing: "2px" }}>
            {formatHeure()}
          </p>
          <p style={{ color: "#9FE1CB", fontSize: "11px", margin: "3px 0 0" }}>
            {formatDate()}
          </p>
        </div>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem", position: "relative", zIndex: 1 }}>
          <div style={{
            width: "80px", height: "80px", background: "#1D9E75",
            borderRadius: "22px", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 1.5rem",
            boxShadow: "0 8px 32px rgba(29,158,117,0.4)"
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#E1F5EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ color: "#E1F5EE", fontSize: "30px", fontWeight: "700", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
            EduTrack Pro
          </h1>
          <p style={{ color: "#9FE1CB", fontSize: "14px", margin: 0 }}>
            Système de gestion pédagogique
          </p>
        </div>

        {/* Features */}
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "380px" }}>
          {[
            { icon: "📅", title: "Emploi du temps",  desc: "Planification et gestion des créneaux" },
            { icon: "📱", title: "Pointage QR-Code", desc: "Validation numérique des présences" },
            { icon: "📝", title: "Cahier de texte",  desc: "Suivi pédagogique en temps réel" },
            { icon: "💰", title: "Fiches vacation",  desc: "Calcul automatique des paiements" },
          ].map((f, i) => (
            <div key={i} style={{
              display: "flex", gap: "14px", alignItems: "center",
              padding: "12px 16px", borderRadius: "12px",
              background: "rgba(255,255,255,0.06)", marginBottom: "8px",
              border: "0.5px solid rgba(255,255,255,0.08)",
              transition: "all 0.2s"
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "rgba(29,158,117,0.25)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "20px", flexShrink: 0
              }}>{f.icon}</div>
              <div>
                <p style={{ color: "#E1F5EE", fontSize: "13px", fontWeight: "500", margin: "0 0 2px" }}>{f.title}</p>
                <p style={{ color: "#9FE1CB", fontSize: "11px", margin: 0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer gauche */}
        <p style={{ color: "#5DCAA5", fontSize: "11px", marginTop: "2rem", position: "relative", zIndex: 1 }}>
          ISGE — Institut Supérieur de Génie Électrique • 2025-2026
        </p>
      </div>

      {/* Panneau droit */}
      <div style={{
        width: "500px", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "3rem", background: "#f0faf6"
      }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>

          {/* Salutation + heure */}
          <div style={{
            background: "linear-gradient(135deg, #E1F5EE, #f0faf6)",
            borderRadius: "14px", padding: "16px 20px",
            marginBottom: "2rem", border: "0.5px solid #9FE1CB",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div>
              <p style={{ fontSize: "18px", fontWeight: "700", color: "#04342C", margin: "0 0 3px" }}>
                {salutation}
              </p>
              <p style={{ fontSize: "12px", color: "#5F5E5A", margin: 0 }}>
                {formatDate()}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "22px", fontWeight: "700", color: "#0F6E56", margin: 0, fontFamily: "monospace" }}>
                {heure.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p style={{ fontSize: "11px", color: "#5F5E5A", margin: "2px 0 0" }}>
                Heure locale
              </p>
            </div>
          </div>

          {/* Titre */}
          <div style={{ marginBottom: "1.75rem" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#04342C", margin: "0 0 6px" }}>
              Connexion
            </h2>
            <p style={{ fontSize: "13px", color: "#5F5E5A", margin: 0 }}>
              Connectez-vous à votre espace EduTrack Pro
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleLogin}>

            {/* Email */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#04342C", display: "block", marginBottom: "7px" }}>
                Adresse email
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>📧</div>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com" required
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "13px 13px 13px 42px",
                    borderRadius: "10px",
                    border: erreur ? "1.5px solid #E24B4A" : "1.5px solid rgba(0,0,0,0.12)",
                    fontSize: "14px", background: "#fff",
                    outline: "none", color: "#04342C"
                  }}
                  onFocus={e => e.target.style.border = "1.5px solid #0F6E56"}
                  onBlur={e => e.target.style.border = erreur ? "1.5px solid #E24B4A" : "1.5px solid rgba(0,0,0,0.12)"}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#04342C", display: "block", marginBottom: "7px" }}>
                Mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>🔒</div>
                <input
                  type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "13px 42px 13px 42px",
                    borderRadius: "10px",
                    border: erreur ? "1.5px solid #E24B4A" : "1.5px solid rgba(0,0,0,0.12)",
                    fontSize: "14px", background: "#fff",
                    outline: "none", color: "#04342C"
                  }}
                  onFocus={e => e.target.style.border = "1.5px solid #0F6E56"}
                  onBlur={e => e.target.style.border = erreur ? "1.5px solid #E24B4A" : "1.5px solid rgba(0,0,0,0.12)"}
                />
                <div onClick={() => setShowPass(!showPass)} style={{
                  position: "absolute", right: "13px", top: "50%",
                  transform: "translateY(-50%)", cursor: "pointer", fontSize: "16px"
                }}>{showPass ? "🙈" : "👁️"}</div>
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
                <span>⚠️</span><span>{erreur}</span>
              </div>
            )}

            {/* Bouton */}
            <button type="submit" disabled={chargement} style={{
              width: "100%", padding: "14px",
              background: chargement ? "#9FE1CB" : "linear-gradient(135deg, #0F6E56, #1D9E75)",
              color: "#fff", border: "none", borderRadius: "10px",
              fontSize: "14px", fontWeight: "600",
              cursor: chargement ? "not-allowed" : "pointer",
              marginBottom: "1.5rem",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: chargement ? "none" : "0 4px 15px rgba(15,110,86,0.3)"
            }}>
              {chargement ? <><span>⏳</span> Connexion en cours...</> : <><span>🔐</span> Se connecter</>}
            </button>
          </form>

          {/* Séparateur */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.25rem" }}>
            <div style={{ flex: 1, height: "0.5px", background: "rgba(0,0,0,0.1)" }}/>
            <span style={{ fontSize: "12px", color: "#5F5E5A", fontWeight: "500" }}>Accès selon votre rôle</span>
            <div style={{ flex: 1, height: "0.5px", background: "rgba(0,0,0,0.1)" }}/>
          </div>

          {/* Badges rôles */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "1.5rem" }}>
            {roles.map(role => (
              <div key={role.label} onClick={() => { setEmail(role.email); setPassword("password"); }} style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: role.bg, color: role.color,
                padding: "8px 10px", borderRadius: "10px",
                fontSize: "11px", fontWeight: "600",
                cursor: "pointer", border: `0.5px solid ${role.color}22`,
                transition: "all 0.2s",
                justifyContent: "center"
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                <span style={{ fontSize: "14px" }}>{role.icon}</span>
                <span>{role.label}</span>
              </div>
            ))}
          </div>

          {/* Info */}
          <div style={{
            background: "#E1F5EE", borderRadius: "10px",
            padding: "10px 14px", display: "flex", gap: "8px",
            alignItems: "center", marginBottom: "1.5rem"
          }}>
            <span style={{ fontSize: "14px" }}>💡</span>
            <p style={{ fontSize: "11px", color: "#085041", margin: 0 }}>
              Cliquez sur un rôle pour remplir automatiquement les identifiants de démonstration.
            </p>
          </div>

          {/* Footer */}
          <p style={{ textAlign: "center", fontSize: "11px", color: "#5F5E5A", margin: 0 }}>
            EduTrack Pro © 2025-2026 — ISGE
          </p>
        </div>
      </div>
    </div>
  );
}
