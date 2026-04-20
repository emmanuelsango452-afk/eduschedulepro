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

  const bg   = dark ? "#0d1117" : "#f0faf6";
  const bg2  = dark ? "#161b22" : "#ffffff";
  const bg3  = dark ? "#21262d" : "#e1f5ee";
  const txt  = dark ? "#e6edf3" : "#04342C";
  const txt2 = dark ? "#8b949e" : "#5F5E5A";
  const brd  = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

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
    <div style={{ display: "flex", minHeight: "100vh", background: bg, transition: "all 0.3s" }}>

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? "220px" : "60px", background: "#04342C",
        transition: "width 0.3s", display: "flex", flexDirection: "column",
        flexShrink: 0, overflow: "hidden"
      }}>
        <div style={{ padding: "16px", borderBottom: "0.5px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "#1D9E75", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#E1F5EE" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          {sidebarOpen && <span style={{ color: "#E1F5EE", fontWeight: "500", fontSize: "14px", whiteSpace: "nowrap" }}>EduTrack Pro</span>}
        </div>
        <div style={{ flex: 1, padding: "8px" }}>
          {menuItems.map(item => (
            <div key={item.label} onClick={() => navigate(item.route)} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 8px", borderRadius: "8px", cursor: "pointer",
              background: item.active ? "#0F6E56" : "transparent", marginBottom: "4px"
            }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ color: item.active ? "#E1F5EE" : "#9FE1CB", fontSize: "13px", whiteSpace: "nowrap" }}>{item.label}</span>}
            </div>
          ))}
        </div>
        <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{
          padding: "16px", cursor: "pointer", textAlign: "center",
          borderTop: "0.5px solid rgba(255,255,255,0.1)", color: "#9FE1CB", fontSize: "18px"
        }}>{sidebarOpen ? "◀" : "▶"}</div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <div style={{
          background: bg2, padding: "10px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `0.5px solid ${brd}`
        }}>
          <div>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: "500", color: txt }}>
              Bonjour, {utilisateur?.email?.split("@")[0]} 👋
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setNotifs(!notifs)}>
              <div style={{ width: "36px", height: "36px", background: bg3, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", border: `0.5px solid ${brd}` }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={txt2} strokeWidth="1.5"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={txt2} strokeWidth="1.5"/>
                </svg>
              </div>
              {cahiersEnAttente.length > 0 && (
                <div style={{ position: "absolute", top: "-4px", right: "-4px", background: "#E24B4A", color: "white", fontSize: "9px", width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {cahiersEnAttente.length}
                </div>
              )}
            </div>
            <div onClick={() => setDark(!dark)} style={{ width: "36px", height: "36px", background: bg3, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", border: `0.5px solid ${brd}` }}>
              {dark ? "☀️" : "🌙"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#534AB7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: "500" }}>
                {utilisateur?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: "500", color: txt }}>Délégué</p>
                <p style={{ margin: 0, fontSize: "11px", color: txt2 }}>{utilisateur?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} style={{ background: "#FCEBEB", color: "#791F1F", border: "0.5px solid #F09595", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}>
              Déconnexion
            </button>
          </div>
        </div>

        {/* Notifications */}
        {notifs && (
          <div style={{ position: "absolute", top: "56px", right: "20px", width: "300px", background: bg2, border: `0.5px solid ${brd}`, borderRadius: "12px", zIndex: 100 }}>
            <div style={{ padding: "12px 16px", borderBottom: `0.5px solid ${brd}`, fontSize: "13px", fontWeight: "500", color: txt }}>
              Notifications ({cahiersEnAttente.length})
            </div>
            {cahiersEnAttente.length > 0 ? cahiersEnAttente.map((c, i) => (
              <div key={i} style={{ padding: "12px 16px", borderBottom: `0.5px solid ${brd}`, display: "flex", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#E24B4A", marginTop: "5px", flexShrink: 0 }}/>
                <div>
                  <div style={{ fontSize: "12px", color: txt }}>Cahier à remplir — {c.matiere}</div>
                  <div style={{ fontSize: "11px", color: txt2, marginTop: "2px" }}>{c.classe}</div>
                </div>
              </div>
            )) : (
              <div style={{ padding: "16px", textAlign: "center", color: txt2, fontSize: "13px" }}>
                Aucune notification
              </div>
            )}
          </div>
        )}

        {/* Contenu */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "1.25rem" }}>
            {[
              { label: "Cahiers à remplir", val: cahiersEnAttente.length, color: "#E24B4A", bg: "#FCEBEB", icon: "📝", sub: "en attente" },
              { label: "Cahiers signés",    val: cahiersSignes.length,    color: "#0F6E56", bg: "#E1F5EE", icon: "✅", sub: "validés" },
              { label: "Total cahiers",     val: stats?.mes_cahiers?.length || 0, color: "#534AB7", bg: "#EEEDFE", icon: "📚", sub: "ce mois" },
              { label: "Séances aujourd'hui", val: 3, color: "#BA7517", bg: "#FAEEDA", icon: "📅", sub: "planifiées" },
            ].map((kpi, i) => (
              <div key={i} style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: txt2, margin: "0 0 8px" }}>{kpi.label}</p>
                    <p style={{ fontSize: "28px", fontWeight: "500", margin: "0 0 4px", color: kpi.color }}>{kpi.val}</p>
                    <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>{kpi.sub}</p>
                  </div>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{kpi.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "12px", marginBottom: "1.25rem" }}>

            {/* Cahiers à remplir */}
            <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>
                  📝 Cahiers à remplir
                </p>
                <button onClick={() => navigate("/cahiers")} style={{ padding: "5px 12px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>
                  Voir tout →
                </button>
              </div>
              {cahiersEnAttente.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <p style={{ fontSize: "32px" }}>🎉</p>
                  <p style={{ color: txt2, fontSize: "13px" }}>Tous les cahiers sont à jour !</p>
                </div>
              ) : (
                cahiersEnAttente.map((c, i) => (
                  <div key={i} onClick={() => navigate("/cahiers")} style={{
                    background: "#FCEBEB", borderRadius: "10px",
                    borderLeft: "3px solid #E24B4A", padding: "12px",
                    marginBottom: "8px", cursor: "pointer"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <p style={{ fontSize: "13px", fontWeight: "500", color: "#791F1F", margin: 0 }}>{c.matiere}</p>
                      <span style={{ fontSize: "10px", background: "#FCEBEB", color: "#791F1F", padding: "2px 7px", borderRadius: "20px", fontWeight: "500" }}>⚠️ À remplir</span>
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
            <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>📅 Aujourd'hui</p>
                <button onClick={() => navigate("/emploi-temps")} style={{ padding: "5px 12px", background: bg3, color: txt, border: `0.5px solid ${brd}`, borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>
                  Planning complet →
                </button>
              </div>
              {[
                { heure: "08:00", matiere: "Réseaux Informatiques", enseignant: "M. Béré", salle: "A01" },
                { heure: "10:30", matiere: "Programmation Orientée Objet", enseignant: "M. Kaboré", salle: "LABO-1" },
                { heure: "14:00", matiere: "Bases de Données Avancées", enseignant: "Mme Traoré", salle: "A02" },
              ].map((s, i) => {
                const c = getCouleur(s.matiere);
                return (
                  <div key={i} style={{
                    display: "flex", gap: "10px", alignItems: "center",
                    padding: "8px 0", borderBottom: i < 2 ? `0.5px solid ${brd}` : "none"
                  }}>
                    <div style={{ minWidth: "45px" }}>
                      <p style={{ fontSize: "12px", fontWeight: "500", color: txt, margin: 0 }}>{s.heure}</p>
                    </div>
                    <div style={{ flex: 1, background: c.bg, borderRadius: "6px", borderLeft: `3px solid ${c.border}`, padding: "6px 8px" }}>
                      <p style={{ fontSize: "11px", fontWeight: "500", color: c.txt, margin: "0 0 2px" }}>
                        {s.matiere.split(" ").slice(0, 2).join(" ")}
                      </p>
                      <p style={{ fontSize: "10px", color: c.txt, margin: 0, opacity: 0.8 }}>
                        {s.enseignant} — {s.salle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historique cahiers */}
          <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>📚 Historique des cahiers</p>
            </div>
            {stats?.mes_cahiers?.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {stats.mes_cahiers.slice(0, 6).map((c, i) => {
                  const s = getStatutCahier(c.statut);
                  const col = getCouleur(c.matiere);
                  return (
                    <div key={i} onClick={() => navigate("/cahiers")} style={{
                      background: bg3, borderRadius: "10px", padding: "12px",
                      borderLeft: `3px solid ${col.border}`, cursor: "pointer"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <p style={{ fontSize: "12px", fontWeight: "500", color: col.border, margin: 0 }}>
                          {c.matiere?.split(" ").slice(0, 2).join(" ")}
                        </p>
                        <span style={{ fontSize: "10px", background: s.bg, color: s.color, padding: "1px 6px", borderRadius: "10px" }}>
                          {s.icon}
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
                <p style={{ fontSize: "32px" }}>📖</p>
                <p style={{ color: txt2, fontSize: "13px" }}>Aucun historique de cahiers</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}