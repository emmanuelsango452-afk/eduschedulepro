import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API = "http://localhost/eduschedulepro/backend/api";

export default function DashboardEnseignantPage() {
  const { utilisateur, token, deconnecter } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]         = useState(null);
  const [dark, setDark]           = useState(false);
  const [notifs, setNotifs]       = useState(false);
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

  const barData = {
    labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    datasets: [{
      label: "Heures enseignées",
      data: [2, 4, 2, 2, 0, 2],
      backgroundColor: "#1D9E75",
      borderRadius: 8,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: txt2, font: { size: 11 } } },
      y: { grid: { color: brd }, ticks: { color: txt2, font: { size: 11 } } }
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "⊞", route: "/dashboard/enseignant", active: true },
    { id: "seances",   label: "Mes séances",      icon: "📅", route: "/emploi-temps" },
    { id: "cahiers",   label: "Mes cahiers",       icon: "📝", route: "/cahiers" },
    { id: "vacations", label: "Mes vacations",     icon: "💰", route: "/vacations" },
    { id: "scanner",   label: "Scanner QR",        icon: "📱", route: "/scanner" },
  ];

  const statutBadge = (statut) => {
    const cfg = {
      pointee:     { bg: "#E1F5EE", color: "#085041", label: "Pointée" },
      non_pointee: { bg: "#FCEBEB", color: "#791F1F", label: "Non pointée" },
      cloturee:    { bg: "#EEEDFE", color: "#3C3489", label: "Clôturée" },
      a_venir:     { bg: "#F1EFE8", color: "#5F5E5A", label: "À venir" },
    };
    const c = cfg[statut] || cfg.a_venir;
    return (
      <span style={{ background: c.bg, color: c.color, fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>
        {c.label}
      </span>
    );
  };

  const kpis = [
    { label: "Séances cette semaine", val: stats?.mes_seances?.length || 0,      color: "#0F6E56", bg: "#E1F5EE", icon: "📅", sub: "planifiées" },
    { label: "Heures réalisées",       val: "12h",                                color: "#1D9E75", bg: "#E8F5EE", icon: "⏱️", sub: "ce mois" },
    { label: "Cahiers signés",         val: stats?.mes_seances?.filter(s => s.statut === "pointee").length || 0, color: "#534AB7", bg: "#EEEDFE", icon: "📝", sub: "validés" },
    { label: "Montant en attente",     val: stats?.mes_vacations?.find(v => v.statut !== "approuvee_comptable") ? `${parseFloat(stats?.mes_vacations?.[0]?.montant_net || 0).toLocaleString("fr-FR")} F` : "0 F", color: "#BA7517", bg: "#FAEEDA", icon: "💰", sub: "FCFA" },
  ];

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
            <div style={{ background: "rgba(29,158,117,0.15)", border: "1px solid rgba(29,158,117,0.3)", color: "#5DCAA5", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "600", textAlign: "center", letterSpacing: "0.5px" }}>
              👨‍🏫 ENSEIGNANT
            </div>
          </div>
        )}

        <div style={{ flex: 1, padding: "12px 8px" }}>
          {menuItems.map(item => (
            <div key={item.id} onClick={() => { if (item.route !== "/dashboard/enseignant") navigate(item.route); }} style={{
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
            <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: txt, letterSpacing: "-0.3px" }}>
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
              <div style={{ position: "absolute", top: "-4px", right: "-4px", background: "#E24B4A", color: "white", fontSize: "9px", width: "17px", height: "17px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>2</div>
            </div>

            {/* Dark mode */}
            <div onClick={() => setDark(!dark)} style={{ width: "38px", height: "38px", background: bg3, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", border: `1px solid ${brd}` }}>
              {dark ? "☀️" : "🌙"}
            </div>

            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: bg3, padding: "6px 12px 6px 6px", borderRadius: "12px", border: `1px solid ${brd}` }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: "700" }}>
                {utilisateur?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: "600", color: txt }}>Enseignant</p>
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
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${brd}`, fontSize: "13px", fontWeight: "600", color: txt }}>Notifications</div>
            {[
              { color: "#BA7517", texte: "Séance de demain à 08h00 — Réseaux", temps: "Il y a 1h" },
              { color: "#1D9E75", texte: "Fiche vacation avril approuvée", temps: "Il y a 3h" },
            ].map((n, i) => (
              <div key={i} style={{ padding: "12px 16px", borderBottom: `1px solid ${brd}`, display: "flex", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: n.color, marginTop: "5px", flexShrink: 0 }}/>
                <div>
                  <p style={{ fontSize: "12px", color: txt, margin: "0 0 2px" }}>{n.texte}</p>
                  <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>{n.temps}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CONTENU */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "1.5rem" }}>
            {kpis.map((kpi, i) => (
              <div key={i} style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.1rem", boxShadow: shadow }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <p style={{ fontSize: "11px", color: txt2, margin: "0 0 6px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>{kpi.label}</p>
                    <p style={{ fontSize: "30px", fontWeight: "700", margin: "0 0 4px", color: kpi.color, lineHeight: 1 }}>{kpi.val}</p>
                    <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>{kpi.sub}</p>
                  </div>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                    {kpi.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* GRAPHIQUE + SÉANCES */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "14px", marginBottom: "1.5rem" }}>

            {/* Bar chart */}
            <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.25rem", boxShadow: shadow }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: "0 0 16px" }}>📊 Heures cette semaine</p>
              <Bar data={barData} options={chartOptions} height={150}/>
            </div>

            {/* Séances */}
            <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.25rem", boxShadow: shadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: 0 }}>📅 Mes séances de la semaine</p>
                <span onClick={() => navigate("/emploi-temps")} style={{ fontSize: "11px", color: "#1D9E75", cursor: "pointer", fontWeight: "500" }}>Voir tout →</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr>
                    {["Jour", "Heure", "Matière", "Classe", "Statut"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 6px", color: txt2, fontWeight: "500", fontSize: "11px", borderBottom: `1px solid ${brd}`, textTransform: "uppercase", letterSpacing: "0.4px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats?.mes_seances?.length > 0 ? (
                    stats.mes_seances.map((s, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${brd}` }}>
                        <td style={{ padding: "9px 6px", color: txt, fontWeight: "600" }}>{s.jour}</td>
                        <td style={{ padding: "9px 6px", color: txt }}>{s.heure_debut?.slice(0,5)}</td>
                        <td style={{ padding: "9px 6px", color: txt }}>{s.matiere?.split(" ")[0]}</td>
                        <td style={{ padding: "9px 6px", color: txt2 }}>{s.classe?.split(" ").slice(0,2).join(" ")}</td>
                        <td style={{ padding: "9px 6px" }}>{statutBadge(s.statut)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: "24px 0", textAlign: "center", color: txt2 }}>
                        <p style={{ fontSize: "24px", margin: "0 0 8px" }}>📭</p>
                        <p style={{ margin: 0, fontSize: "13px" }}>Aucune séance cette semaine</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* VACATIONS */}
          <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.25rem", boxShadow: shadow, marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: 0 }}>💰 Mes fiches de vacation</p>
              <button onClick={() => navigate("/vacations")} style={{ padding: "7px 14px", background: bg3, color: txt, border: `1px solid ${brd}`, borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
                Voir tout →
              </button>
            </div>
            {stats?.mes_vacations?.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {stats.mes_vacations.slice(0, 3).map((v, i) => {
                  const moisLabels = ["", "Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
                  const statutCfg = {
                    generee:             { bg: "#F1EFE8", color: "#5F5E5A", label: "Générée" },
                    signee_enseignant:   { bg: "#FAEEDA", color: "#633806", label: "Signée" },
                    validee_surveillant: { bg: "#EEEDFE", color: "#3C3489", label: "Validée" },
                    approuvee_comptable: { bg: "#E1F5EE", color: "#085041", label: "Approuvée" },
                  };
                  const s = statutCfg[v.statut] || statutCfg.generee;
                  return (
                    <div key={i} style={{ background: bg3, borderRadius: "12px", padding: "14px", border: `1px solid ${brd}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: 0 }}>{moisLabels[v.mois]} {v.annee}</p>
                        <span style={{ fontSize: "10px", background: s.bg, color: s.color, padding: "2px 8px", borderRadius: "20px", fontWeight: "600" }}>{s.label}</span>
                      </div>
                      <p style={{ fontSize: "20px", fontWeight: "700", color: "#0F6E56", margin: "0 0 4px" }}>
                        {parseFloat(v.montant_net || 0).toLocaleString("fr-FR")} FCFA
                      </p>
                      <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>Montant net</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ fontSize: "40px", margin: "0 0 12px" }}>💰</p>
                <p style={{ color: txt2, fontSize: "13px" }}>Aucune fiche de vacation</p>
              </div>
            )}
          </div>

          {/* HISTORIQUE PAR MOIS */}
          <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.25rem", boxShadow: shadow }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: "0 0 16px" }}>📅 Historique de mes séances par mois</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {[
                { mois: "Avril 2026",   seances: 8,  heures: "16h", statut: "En cours", color: "#BA7517", bg: "#FAEEDA", border: "#E8C97A" },
                { mois: "Mars 2026",    seances: 12, heures: "24h", statut: "Clôturé",  color: "#0F6E56", bg: "#E1F5EE", border: "#9FE1CB" },
                { mois: "Février 2026", seances: 10, heures: "20h", statut: "Payé",     color: "#534AB7", bg: "#EEEDFE", border: "#CECBF6" },
              ].map((h, i) => (
                <div key={i} style={{ background: h.bg, borderRadius: "12px", padding: "14px", border: `1px solid ${h.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <p style={{ fontSize: "13px", fontWeight: "700", color: h.color, margin: 0 }}>{h.mois}</p>
                    <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.6)", color: h.color, padding: "2px 8px", borderRadius: "20px", fontWeight: "600" }}>{h.statut}</span>
                  </div>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <div>
                      <p style={{ fontSize: "11px", color: h.color, margin: "0 0 3px", opacity: 0.8, fontWeight: "500" }}>Séances</p>
                      <p style={{ fontSize: "22px", fontWeight: "700", color: h.color, margin: 0 }}>{h.seances}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: h.color, margin: "0 0 3px", opacity: 0.8, fontWeight: "500" }}>Heures</p>
                      <p style={{ fontSize: "22px", fontWeight: "700", color: h.color, margin: 0 }}>{h.heures}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
