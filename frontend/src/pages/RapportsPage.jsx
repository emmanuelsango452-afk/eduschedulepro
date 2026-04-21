import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RapportsPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [dark, setDark]               = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const bg   = dark ? "#0d1117" : "#f0faf6";
  const bg2  = dark ? "#161b22" : "#ffffff";
  const bg3  = dark ? "#21262d" : "#e1f5ee";
  const txt  = dark ? "#e6edf3" : "#04342C";
  const txt2 = dark ? "#8b949e" : "#5F5E5A";
  const brd  = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  const menuItems = [
    { label: "Tableau de bord", icon: "⊞",  route: "/dashboard/admin" },
    { label: "Emploi du temps", icon: "📅",  route: "/emploi-temps" },
    { label: "Cahiers de texte",icon: "📝",  route: "/cahiers" },
    { label: "Vacations",       icon: "💰",  route: "/vacations" },
    { label: "Enseignants",     icon: "👨‍🏫", route: "/enseignants" },
    { label: "Rapports",        icon: "📊",  route: "/rapports", active: true },
  ];

  const rapports = [
    {
      icon: "📊", title: "Rapport de présence",
      desc: "Taux de présence par classe, par semaine et par enseignant",
      color: "#0F6E56", bg: "#E1F5EE",
      stats: ["Séances pointées", "Retards", "Absences"]
    },
    {
      icon: "📝", title: "Rapport des cahiers",
      desc: "État des cahiers de texte par matière et par classe",
      color: "#534AB7", bg: "#EEEDFE",
      stats: ["Cahiers signés", "Brouillons", "Clôturés"]
    },
    {
      icon: "💰", title: "Rapport des vacations",
      desc: "Récapitulatif des paiements et heures par enseignant",
      color: "#BA7517", bg: "#FAEEDA",
      stats: ["Total heures", "Montant brut", "Montant net"]
    },
    {
      icon: "📅", title: "Rapport emploi du temps",
      desc: "Vue globale des créneaux planifiés par classe",
      color: "#185FA5", bg: "#E6F1FB",
      stats: ["Classes", "Créneaux", "Enseignants"]
    },
    {
      icon: "📈", title: "Rapport d'avancement",
      desc: "Progression des programmes pédagogiques par matière",
      color: "#993C1D", bg: "#FAECE7",
      stats: ["Chapitres vus", "% avancement", "Retards programme"]
    },
    {
      icon: "🔍", title: "Rapport d'audit",
      desc: "Journal complet des activités et connexions",
      color: "#5F5E5A", bg: "#F1EFE8",
      stats: ["Connexions", "Actions", "Alertes"]
    },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg, transition: "all 0.3s" }}>

      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? "220px" : "60px", background: "#04342C", transition: "width 0.3s", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
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
        <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: "16px", cursor: "pointer", textAlign: "center", borderTop: "0.5px solid rgba(255,255,255,0.1)", color: "#9FE1CB", fontSize: "18px" }}>
          {sidebarOpen ? "◀" : "▶"}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <div style={{ background: bg2, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `0.5px solid ${brd}` }}>
          <div>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: "500", color: txt }}>Rapports</p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>Génération et export des rapports</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={() => setDark(!dark)} style={{ width: "36px", height: "36px", background: bg3, borderRadius: "8px", border: `0.5px solid ${brd}`, cursor: "pointer", fontSize: "16px" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>

          <p style={{ fontSize: "13px", color: txt2, margin: "0 0 1.25rem" }}>
            Sélectionnez un rapport à générer et exporter en PDF ou Excel.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {rapports.map((r, i) => (
              <div key={i} style={{ background: bg2, borderRadius: "14px", border: `0.5px solid ${brd}`, overflow: "hidden" }}>
                {/* Header carte */}
                <div style={{ background: r.bg, padding: "1.25rem" }}>
                  <p style={{ fontSize: "32px", margin: "0 0 10px" }}>{r.icon}</p>
                  <p style={{ fontSize: "14px", fontWeight: "500", color: r.color, margin: "0 0 6px" }}>{r.title}</p>
                  <p style={{ fontSize: "12px", color: r.color, margin: 0, opacity: 0.8 }}>{r.desc}</p>
                </div>

                {/* Stats */}
                <div style={{ padding: "12px 16px", borderBottom: `0.5px solid ${brd}` }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {r.stats.map((s, j) => (
                      <span key={j} style={{ fontSize: "11px", background: bg3, color: txt2, padding: "3px 8px", borderRadius: "20px" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ padding: "12px 16px", display: "flex", gap: "8px" }}>
                  <button style={{
                    flex: 1, padding: "8px", background: r.bg, color: r.color,
                    border: `0.5px solid ${r.color}`, borderRadius: "8px",
                    fontSize: "12px", cursor: "pointer", fontWeight: "500"
                  }}>📄 PDF</button>
                  <button style={{
                    flex: 1, padding: "8px", background: "#E1F5EE", color: "#085041",
                    border: "0.5px solid #9FE1CB", borderRadius: "8px",
                    fontSize: "12px", cursor: "pointer", fontWeight: "500"
                  }}>📊 Excel</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}