import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = "http://localhost/eduschedulepro/backend/api";

export default function DashboardDeleguePage() {
  const { utilisateur, token, deconnecter } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]             = useState(null);
  const [dark, setDark]               = useState(false);
  const [notifs, setNotifs]           = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const bg     = dark ? "#0d1117" : "#f0faf6";
  const bg2    = dark ? "#161b22" : "#ffffff";
  const bg3    = dark ? "#21262d" : "#e8f5ee";
  const txt    = dark ? "#e6edf3" : "#04342C";
  const txt2   = dark ? "#8b949e" : "#5F5E5A";
  const brd    = dark ? "rgba(255,255,255,0.08)" : "rgba(4,52,44,0.08)";
  const shadow = dark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 12px rgba(4,52,44,0.06)";

  useEffect(() => {
    axios.get(`${API}/dashboard.php`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.succes) setStats(res.data.data);
    }).catch(console.error);
  }, [token]);

  const handleLogout = () => { deconnecter(); navigate("/login"); };

  const getStatutCahier = (statut) => {
    const cfg = {
      brouillon:     { bg: "#F1EFE8", color: "#5F5E5A", label: "Brouillon", icon: "📄" },
      signe_delegue: { bg: "#FAEEDA", color: "#633806", label: "Signé",     icon: "✍️" },
      cloture:       { bg: "#E1F5EE", color: "#085041", label: "Clôturé",   icon: "✅" },
    };
    return cfg[statut] || cfg.brouillon;
  };

  const COULEURS_MATIERES = {
    "Réseaux Informatiques":        { bg: "#E1F5EE", border: "#0F6E56", txt: "#085041" },
    "Programmation Orientée Objet": { bg: "#EEEDFE", border: "#534AB7", txt: "#3C3489" },
    "Développement Web":            { bg: "#FAEEDA", border: "#BA7517", txt: "#633806" },
    "Bases de Données Avancées":    { bg: "#E6F1FB", border: "#185FA5", txt: "#0C447C" },
    "Systèmes d exploitation":      { bg: "#FAECE7", border: "#993C1D", txt: "#712B13" },
  };

  const getCouleur = (matiere) =>
    COULEURS_MATIERES[matiere] || { bg: "#F1EFE8", border: "#888780", txt: "#5F5E5A" };

  const menuItems = [
    { label: "Tableau de bord", icon: "⊞", route: "/dashboard/delegue", active: true },
    { label: "Emploi du temps", icon: "📅", route: "/emploi-temps" },
    { label: "Mes cahiers",     icon: "📝", route: "/cahiers" },
  ];

  const cahiersEnAttente = stats?.mes_cahiers?.filter(c => c.statut === "brouillon") || [];
  const cahiersSignes    = stats?.mes_cahiers?.filter(c => c.statut !== "brouillon") || [];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg, fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ===== SIDEBAR ===== */}
      <div style={{ width: sidebarOpen ? "240px" : "64px", background: "linear-gradient(180deg, #04342C 0%, #062E26 100%)", transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden", boxShadow: "2px 0 20px rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(29,158,117,0.4)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#E1F5EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {sidebarOpen && (
            <div>
              <p style={{ color: "#E1F5EE", fontWeight: "700", fontSize: "15px", margin: 0 }}>EduTrack Pro</p>
              <p style={{ color: "#5DCAA5", fontSize: "10px", margin: 0 }}>Gestion pédagogique</p>
            </div>
          )}
        </div>

        {/* Badge rôle */}
        {sidebarOpen && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ background: "rgba(83,74,183,0.2)", border: "1px solid rgba(83,74,183,0.4)", color: "#A89CF5", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "600", textAlign: "center", letterSpacing: "0.5px" }}>
              📝 DÉLÉGUÉ DE CLASSE
            </div>
          </div>
        )}

        <div style={{ flex: 1, padding: "12px 8px" }}>
          {menuItems.map(item => (
            <div key={item.label} onClick={() => navigate(item.route)} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: sidebarOpen ? "10px 12px" : "10px", borderRadius: "10px", cursor: "pointer", marginBottom: "2px",
              background: item.active ? "linear-gradient(135deg, rgba(29,158,117,0.25), rgba(15,110,86,0.15))" : "transparent",
              border: item.active ? "1px solid rgba(29,158,117,0.3)" : "1px solid transparent",
            }}>
              <span style={{ fontSize: "17px", flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ color: item.active ? "#E1F5EE" : "#9FE1CB", fontSize: "13px", fontWeight: item.active ? "600" : "400", whiteSpace: "nowrap" }}>{item.label}</span>}
              {sidebarOpen && item.active && <div style={{ marginLeft: "auto", width: "4px", height: "16px", background: "#1D9E75", borderRadius: "2px" }}/>}
            </div>
          ))}
        </div>

        <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: "16px", cursor: "pointer", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", color: "#5DCAA5", fontSize: "16px" }}>
          {sidebarOpen ? "◀" : "▶"}
        </div>
      </div>

      {/* ===== MAIN ===== */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* TOPBAR */}
        <div style={{ background: bg2, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${brd}`, boxShadow: shadow }}>
          <div>
            <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: txt }}>
              Bonjour, {utilisateur?.email?.split("@")[0]} 👋
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {/* Notif */}
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setNotifs(!notifs)}>
              <div style={{ width: "38px", height: "38px", background: bg3, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${brd}` }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={txt2} strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={txt2} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              {cahiersEnAttente.length > 0 && (
                <div style={{ position: "absolute", top: "-4px", right: "-4px", background: "#E24B4A", color: "white", fontSize: "9px", width: "17px", height: "17px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                  {cahiersEnAttente.length}
                </div>
              )}
            </div>

            {/* Dark mode */}
            <div onClick={() => setDark(!dark)} style={{ width: "38px", height: "38px", background: bg3, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", border: `1px solid ${brd}` }}>
              {dark ? "☀️" : "🌙"}
            </div>

            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: bg3, padding: "6px 12px 6px 6px", borderRadius: "12px", border: `1px solid ${brd}` }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #6B5CE7, #534AB7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: "700" }}>
                {utilisateur?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: "600", color: txt }}>Délégué</p>
                <p style={{ margin: 0, fontSize: "10px", color: txt2 }}>{utilisateur?.email}</p>
              </div>
            </div>

            <button onClick={handleLogout} style={{ background: "#FCEBEB", color: "#791F1F", border: "1px solid #F09595", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
              Déconnexion
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        {notifs && (
          <div style={{ position: "absolute", top: "65px", right: "20px", width: "300px", background: bg2, border: `1px solid ${brd}`, borderRadius: "14px", zIndex: 100, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${brd}`, fontSize: "13px", fontWeight: "600", color: txt }}>
              Notifications ({cahiersEnAttente.length})
            </div>
            {cahiersEnAttente.length > 0 ? cahiersEnAttente.map((c, i) => (
              <div key={i} style={{ padding: "12px 16px", borderBottom: `1px solid ${brd}`, display: "flex", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#E24B4A", marginTop: "5px", flexShrink: 0 }}/>
                <div>
                  <p style={{ fontSize: "12px", color: txt, margin: "0 0 2px" }}>Cahier à remplir — {c.matiere}</p>
                  <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>{c.classe}</p>
                </div>
              </div>
            )) : (
              <div style={{ padding: "20px", textAlign: "center", color: txt2, fontSize: "13px" }}>
                <p style={{ fontSize: "24px", margin: "0 0 8px" }}>✅</p>
                Aucune notification
              </div>
            )}
          </div>
        )}

        {/* CONTENU */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "1.5rem" }}>
            {[
              { label: "Cahiers à remplir",   val: cahiersEnAttente.length,          color: "#E24B4A", bg: "#FCEBEB", icon: "📝", sub: "en attente" },
              { label: "Cahiers signés",       val: cahiersSignes.length,             color: "#0F6E56", bg: "#E1F5EE", icon: "✅", sub: "validés" },
              { label: "Total cahiers",        val: stats?.mes_cahiers?.length || 0,  color: "#534AB7", bg: "#EEEDFE", icon: "📚", sub: "ce mois" },
              { label: "Séances aujourd'hui",  val: 3,                                color: "#BA7517", bg: "#FAEEDA", icon: "📅", sub: "planifiées" },
            ].map((kpi, i) => (
              <div key={i} style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.1rem", boxShadow: shadow }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <p style={{ fontSize: "11px", color: txt2, margin: "0 0 6px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>{kpi.label}</p>
                    <p style={{ fontSize: "30px", fontWeight: "700", margin: "0 0 4px", color: kpi.color, lineHeight: 1 }}>{kpi.val}</p>
                    <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>{kpi.sub}</p>
                  </div>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{kpi.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CAHIERS + EMPLOI DU TEMPS */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "14px", marginBottom: "1.5rem" }}>

            {/* Cahiers à remplir */}
            <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.25rem", boxShadow: shadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: 0 }}>📝 Cahiers à remplir</p>
                <button onClick={() => navigate("/cahiers")} style={{ padding: "6px 14px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>
                  Voir tout →
                </button>
              </div>
              {cahiersEnAttente.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <p style={{ fontSize: "40px", margin: "0 0 12px" }}>🎉</p>
                  <p style={{ color: txt2, fontSize: "13px" }}>Tous les cahiers sont à jour !</p>
                </div>
              ) : (
                cahiersEnAttente.map((c, i) => (
                  <div key={i} onClick={() => navigate("/cahiers")} style={{
                    background: "#FFF5F5", borderRadius: "10px",
                    borderLeft: "4px solid #E24B4A", padding: "14px",
                    marginBottom: "8px", cursor: "pointer", transition: "opacity 0.2s",
                    border: "1px solid #F09595", borderLeftWidth: "4px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <p style={{ fontSize: "13px", fontWeight: "700", color: "#791F1F", margin: 0 }}>{c.matiere}</p>
                      <span style={{ fontSize: "10px", background: "#FCEBEB", color: "#791F1F", padding: "3px 8px", borderRadius: "20px", fontWeight: "600" }}>⚠️ À remplir</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#A32D2D", margin: "0 0 4px" }}>{c.classe}</p>
                    <p style={{ fontSize: "11px", color: "#A32D2D", margin: 0 }}>
                      {c.date_creation ? new Date(c.date_creation).toLocaleDateString("fr-FR") : ""}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Emploi du temps du jour */}
            <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.25rem", boxShadow: shadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: 0 }}>📅 Aujourd'hui</p>
                <button onClick={() => navigate("/emploi-temps")} style={{ padding: "6px 12px", background: bg3, color: txt, border: `1px solid ${brd}`, borderRadius: "8px", fontSize: "11px", cursor: "pointer", fontWeight: "500" }}>
                  Planning →
                </button>
              </div>
              {[
                { heure: "08:00", matiere: "Réseaux Informatiques",        enseignant: "M. Béré",   salle: "A01" },
                { heure: "10:30", matiere: "Programmation Orientée Objet", enseignant: "M. Kaboré", salle: "LABO-1" },
                { heure: "14:00", matiere: "Bases de Données Avancées",    enseignant: "Mme Traoré",salle: "A02" },
              ].map((s, i) => {
                const c = getCouleur(s.matiere);
                return (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? `1px solid ${brd}` : "none" }}>
                    <div style={{ minWidth: "48px", textAlign: "center" }}>
                      <p style={{ fontSize: "12px", fontWeight: "700", color: txt, margin: 0 }}>{s.heure}</p>
                    </div>
                    <div style={{ flex: 1, background: c.bg, borderRadius: "8px", borderLeft: `3px solid ${c.border}`, padding: "8px 10px" }}>
                      <p style={{ fontSize: "11px", fontWeight: "700", color: c.txt, margin: "0 0 3px" }}>{s.matiere.split(" ").slice(0, 2).join(" ")}</p>
                      <p style={{ fontSize: "10px", color: c.txt, margin: 0, opacity: 0.8 }}>{s.enseignant} — {s.salle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EMPLOI DU TEMPS SEMAINE */}
          <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.25rem", boxShadow: shadow, marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: 0 }}>📅 Emploi du temps — Semaine en cours</p>
              <button onClick={() => navigate("/emploi-temps")} style={{ padding: "6px 14px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>
                Voir complet →
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" }}>
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((jour, i) => (
                <div key={jour} style={{ textAlign: "center" }}>
                  <div style={{
                    background: i === new Date().getDay() - 1 ? "linear-gradient(135deg, #1D9E75, #0F6E56)" : bg3,
                    color: i === new Date().getDay() - 1 ? "#fff" : txt2,
                    borderRadius: "8px", padding: "6px 4px", fontSize: "11px", fontWeight: "700",
                    marginBottom: "6px", boxShadow: i === new Date().getDay() - 1 ? "0 2px 8px rgba(15,110,86,0.3)" : "none"
                  }}>
                    {jour}
                  </div>
                  {[
                    [{ m: "Réseaux", c: "#E1F5EE", b: "#0F6E56" }, { m: "POO", c: "#EEEDFE", b: "#534AB7" }],
                    [{ m: "Dev Web", c: "#FAEEDA", b: "#BA7517" }],
                    [{ m: "BDD",     c: "#E6F1FB", b: "#185FA5" }],
                    [{ m: "Sys.",    c: "#FAECE7", b: "#993C1D" }],
                    [],
                    [],
                  ][i].map((s, j) => (
                    <div key={j} style={{ background: s.c, borderLeft: `3px solid ${s.b}`, borderRadius: "6px", padding: "4px 6px", marginBottom: "4px" }}>
                      <p style={{ fontSize: "9px", fontWeight: "700", color: s.b, margin: 0 }}>{s.m}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* HISTORIQUE CAHIERS */}
          <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.25rem", boxShadow: shadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: 0 }}>📚 Historique des cahiers</p>
            </div>
            {stats?.mes_cahiers?.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {stats.mes_cahiers.slice(0, 6).map((c, i) => {
                  const s = getStatutCahier(c.statut);
                  const col = getCouleur(c.matiere);
                  return (
                    <div key={i} onClick={() => navigate("/cahiers")} style={{
                      background: bg3, borderRadius: "12px", padding: "14px",
                      borderLeft: `4px solid ${col.border}`, cursor: "pointer",
                      border: `1px solid ${brd}`, borderLeftWidth: "4px",
                      transition: "opacity 0.2s", boxShadow: shadow
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <p style={{ fontSize: "12px", fontWeight: "700", color: col.border, margin: 0 }}>
                          {c.matiere?.split(" ").slice(0, 2).join(" ")}
                        </p>
                        <span style={{ fontSize: "11px", background: s.bg, color: s.color, padding: "2px 8px", borderRadius: "20px", fontWeight: "600" }}>
                          {s.icon} {s.label}
                        </span>
                      </div>
                      <p style={{ fontSize: "11px", color: txt2, margin: "0 0 4px" }}>{c.classe}</p>
                      <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>
                        {c.date_creation ? new Date(c.date_creation).toLocaleDateString("fr-FR") : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ fontSize: "40px", margin: "0 0 12px" }}>📖</p>
                <p style={{ color: txt2, fontSize: "13px" }}>Aucun historique de cahiers</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
