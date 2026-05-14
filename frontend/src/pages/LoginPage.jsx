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
  const [selectedRole, setSelectedRole] = useState(null);

  const { connecter } = useAuth();
  const navigate      = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setHeure(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const h = heure.getHours();
    if (h >= 5 && h < 12)       setSalutation("☀️ Bonjour !");
    else if (h >= 12 && h < 18) setSalutation("🌤️ Bon après-midi !");
    else if (h >= 18 && h < 22) setSalutation("🌆 Bonsoir !");
    else                         setSalutation("🌙 Bonne nuit !");
  }, [heure]);

  const joursSemaine = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
  const mois = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  const formatDate  = () => `${joursSemaine[heure.getDay()]} ${heure.getDate()} ${mois[heure.getMonth()]} ${heure.getFullYear()}`;
  const formatHeure = () => heure.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const handleLogin = async (e) => {
    e.preventDefault();
    setErreur(""); setChargement(true);
    try {
      const reponse = await axios.post(`${API}/auth.php?action=login`, { email, password });
      if (reponse.data.succes) { connecter(reponse.data.token, reponse.data.utilisateur); navigate("/"); }
    } catch (err) {
      setErreur(err.response?.data?.message || "Email ou mot de passe incorrect.");
    } finally { setChargement(false); }
  };

  const roles = [
    { label: "Administrateur", color: "#0F6E56", bg: "#E1F5EE", border: "#9FE1CB", icon: "⊞",  email: "admin@isge.bf" },
    { label: "Enseignant",     color: "#534AB7", bg: "#EEEDFE", border: "#CECBF6", icon: "👨‍🏫", email: "cbere@isge.bf" },
    { label: "Délégué",        color: "#BA7517", bg: "#FAEEDA", border: "#E8C97A", icon: "📝",  email: "delegue.l1@isge.bf" },
    { label: "Surveillant",    color: "#185FA5", bg: "#E6F1FB", border: "#A8CBF0", icon: "👁️",  email: "surveillant@isge.bf" },
    { label: "Comptable",      color: "#993C1D", bg: "#FAECE7", border: "#E8B89A", icon: "💰",  email: "comptable@isge.bf" },
    { label: "Étudiant",       color: "#085041", bg: "#E1F5EE", border: "#9FE1CB", icon: "🎓",  email: "etudiant@isge.bf" },
  ];

  const features = [
    { icon: "📅", title: "Emploi du temps",  desc: "Planification et gestion des créneaux" },
    { icon: "📱", title: "Pointage QR-Code", desc: "Validation numérique des présences" },
    { icon: "📝", title: "Cahier de texte",  desc: "Suivi pédagogique en temps réel" },
    { icon: "💰", title: "Fiches vacation",  desc: "Calcul automatique des paiements" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ===== PANNEAU GAUCHE ===== */}
      <div style={{
        flex: 1, background: "linear-gradient(135deg, #04342C 0%, #062E26 60%, #085041 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "3rem", position: "relative", overflow: "hidden"
      }}>
        {/* Cercles décoratifs */}
        <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", top: "-200px", left: "-200px" }}/>
        <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", bottom: "-100px", right: "-100px" }}/>
        <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(29,158,117,0.06)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}/>

        {/* Horloge */}
        <div style={{
          position: "absolute", top: "24px", right: "24px",
          background: "rgba(255,255,255,0.07)", borderRadius: "14px",
          padding: "12px 18px", textAlign: "center",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)"
        }}>
          <p style={{ color: "#E1F5EE", fontSize: "22px", fontWeight: "700", margin: 0, fontFamily: "monospace", letterSpacing: "2px" }}>
            {formatHeure()}
          </p>
          <p style={{ color: "#9FE1CB", fontSize: "11px", margin: "4px 0 0" }}>{formatDate()}</p>
        </div>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "3rem", position: "relative", zIndex: 1 }}>
          <div style={{
            width: "90px", height: "90px",
            background: "linear-gradient(135deg, #1D9E75, #0F6E56)",
            borderRadius: "24px", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 1.5rem",
            boxShadow: "0 12px 40px rgba(29,158,117,0.5)"
          }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#E1F5EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ color: "#E1F5EE", fontSize: "32px", fontWeight: "800", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
            EduTrack Pro
          </h1>
          <p style={{ color: "#5DCAA5", fontSize: "14px", margin: 0, fontWeight: "400" }}>
            Système de gestion pédagogique
          </p>
        </div>

        {/* Features */}
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "400px" }}>
          {features.map((f, i) => (
            <div key={i} style={{
              display: "flex", gap: "14px", alignItems: "center",
              padding: "14px 18px", borderRadius: "14px",
              background: "rgba(255,255,255,0.05)",
              marginBottom: "8px",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(4px)"
            }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(29,158,117,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <p style={{ color: "#E1F5EE", fontSize: "13px", fontWeight: "600", margin: "0 0 2px" }}>{f.title}</p>
                <p style={{ color: "#9FE1CB", fontSize: "11px", margin: 0 }}>{f.desc}</p>
              </div>
              <div style={{ marginLeft: "auto", color: "#5DCAA5", fontSize: "16px" }}>→</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p style={{ color: "#5DCAA5", fontSize: "11px", marginTop: "2rem", position: "relative", zIndex: 1, opacity: 0.7 }}>
          ISGE — Institut Supérieur de Génie Électrique • 2025-2026
        </p>
      </div>

      {/* ===== PANNEAU DROIT ===== */}
      <div style={{
        width: "520px", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "3rem", background: "#f0faf6", overflowY: "auto"
      }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>

          {/* Salutation */}
          <div style={{
            background: "linear-gradient(135deg, #E1F5EE, #f5fdf8)",
            borderRadius: "16px", padding: "16px 20px",
            marginBottom: "2rem", border: "1px solid #9FE1CB",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            boxShadow: "0 2px 12px rgba(4,52,44,0.06)"
          }}>
            <div>
              <p style={{ fontSize: "18px", fontWeight: "700", color: "#04342C", margin: "0 0 3px" }}>{salutation}</p>
              <p style={{ fontSize: "12px", color: "#5F5E5A", margin: 0 }}>{formatDate()}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "24px", fontWeight: "800", color: "#0F6E56", margin: 0, fontFamily: "monospace", letterSpacing: "1px" }}>
                {heure.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p style={{ fontSize: "10px", color: "#5F5E5A", margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Heure locale</p>
            </div>
          </div>

          {/* Titre */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#04342C", margin: "0 0 6px", letterSpacing: "-0.3px" }}>Connexion</h2>
            <p style={{ fontSize: "13px", color: "#5F5E5A", margin: 0 }}>Connectez-vous à votre espace EduTrack Pro</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleLogin}>

            {/* Email */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#04342C", display: "block", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Adresse email
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>📧</div>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com" required
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "13px 14px 13px 44px",
                    borderRadius: "12px",
                    border: erreur ? "2px solid #E24B4A" : "1.5px solid rgba(4,52,44,0.12)",
                    fontSize: "14px", background: "#fff", outline: "none", color: "#04342C",
                    boxShadow: "0 2px 8px rgba(4,52,44,0.04)", transition: "border 0.2s"
                  }}
                  onFocus={e => { e.target.style.border = "2px solid #0F6E56"; e.target.style.boxShadow = "0 0 0 4px rgba(15,110,86,0.1)"; }}
                  onBlur={e => { e.target.style.border = erreur ? "2px solid #E24B4A" : "1.5px solid rgba(4,52,44,0.12)"; e.target.style.boxShadow = "0 2px 8px rgba(4,52,44,0.04)"; }}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: "1.75rem" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#04342C", display: "block", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>🔒</div>
                <input
                  type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "13px 44px 13px 44px",
                    borderRadius: "12px",
                    border: erreur ? "2px solid #E24B4A" : "1.5px solid rgba(4,52,44,0.12)",
                    fontSize: "14px", background: "#fff", outline: "none", color: "#04342C",
                    boxShadow: "0 2px 8px rgba(4,52,44,0.04)", transition: "border 0.2s"
                  }}
                  onFocus={e => { e.target.style.border = "2px solid #0F6E56"; e.target.style.boxShadow = "0 0 0 4px rgba(15,110,86,0.1)"; }}
                  onBlur={e => { e.target.style.border = erreur ? "2px solid #E24B4A" : "1.5px solid rgba(4,52,44,0.12)"; e.target.style.boxShadow = "0 2px 8px rgba(4,52,44,0.04)"; }}
                />
                <div onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: "16px", opacity: 0.6 }}>
                  {showPass ? "🙈" : "👁️"}
                </div>
              </div>
            </div>

            {/* Erreur */}
            {erreur && (
              <div style={{ background: "#FCEBEB", color: "#791F1F", padding: "12px 16px", borderRadius: "12px", fontSize: "13px", marginBottom: "1.25rem", display: "flex", gap: "8px", alignItems: "center", border: "1px solid #F09595" }}>
                <span>⚠️</span><span>{erreur}</span>
              </div>
            )}

            {/* Bouton connexion */}
            <button type="submit" disabled={chargement} style={{
              width: "100%", padding: "15px",
              background: chargement ? "#9FE1CB" : "linear-gradient(135deg, #1D9E75, #0F6E56)",
              color: "#fff", border: "none", borderRadius: "12px",
              fontSize: "15px", fontWeight: "700",
              cursor: chargement ? "not-allowed" : "pointer",
              marginBottom: "1.75rem",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: chargement ? "none" : "0 6px 20px rgba(15,110,86,0.35)",
              transition: "all 0.2s", letterSpacing: "0.3px"
            }}>
              {chargement ? <><span>⏳</span> Connexion en cours...</> : <><span>🔐</span> Se connecter</>}
            </button>
          </form>

          {/* Séparateur */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.25rem" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(4,52,44,0.08)" }}/>
            <span style={{ fontSize: "11px", color: "#5F5E5A", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Accès selon votre rôle</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(4,52,44,0.08)" }}/>
          </div>

          {/* Badges rôles */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "1.25rem" }}>
            {roles.map(role => (
              <div key={role.label} onClick={() => { setEmail(role.email); setPassword("password"); setSelectedRole(role.label); setErreur(""); }} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                background: selectedRole === role.label ? role.bg : "#fff",
                color: role.color, padding: "10px 8px", borderRadius: "12px",
                fontSize: "11px", fontWeight: "600", cursor: "pointer",
                border: selectedRole === role.label ? `2px solid ${role.color}` : `1px solid ${role.border}`,
                transition: "all 0.2s",
                boxShadow: selectedRole === role.label ? `0 4px 12px ${role.color}25` : "none"
              }}>
                <span style={{ fontSize: "20px" }}>{role.icon}</span>
                <span style={{ textAlign: "center", lineHeight: 1.2 }}>{role.label}</span>
              </div>
            ))}
          </div>

          {/* Info */}
          <div style={{ background: "#E1F5EE", borderRadius: "12px", padding: "12px 16px", display: "flex", gap: "10px", alignItems: "center", marginBottom: "1.5rem", border: "1px solid #9FE1CB" }}>
            <span style={{ fontSize: "16px" }}>💡</span>
            <p style={{ fontSize: "11px", color: "#085041", margin: 0, lineHeight: 1.5 }}>
              Cliquez sur un rôle pour remplir automatiquement les identifiants de démonstration.
            </p>
          </div>

          {/* Footer */}
          <p style={{ textAlign: "center", fontSize: "11px", color: "#5F5E5A", margin: 0, opacity: 0.7 }}>
            EduTrack Pro © 2025-2026 — ISGE
          </p>
        </div>
      </div>
    </div>
  );
}
