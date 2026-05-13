import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, ArcElement,
  Title, Tooltip, Legend
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend
);

const API = 'http://localhost/eduschedulepro/backend/api';
export default function DashboardAdminPage() {
  const { utilisateur, token, deconnecter } = useAuth();
  const navigate  = useNavigate();
  const [stats, setStats]     = useState(null);
  const [dark, setDark]       = useState(false);
  const [notifs, setNotifs]   = useState(false);
  const [notifications, setNotifications] = useState([
    { color: "#E24B4A", texte: "Séance non pointée détectée", temps: "Il y a 10 min", lu: false },
    { color: "#BA7517", texte: "Retard signalé — M. Kaboré", temps: "Il y a 25 min", lu: false },
    { color: "#BA7517", texte: "5 cahiers en attente de signature", temps: "Il y a 1h", lu: true },
    { color: "#1D9E75", texte: "Planning semaine publié", temps: "Il y a 2h", lu: true },
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu]   = useState("dashboard");

  useEffect(() => {
    axios.get(`${API}/dashboard.php`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.succes) setStats(res.data.data);
    }).catch(console.error);
  }, [token]);

  const bg   = dark ? "#0d1117" : "#f0faf6";
  const bg2  = dark ? "#161b22" : "#ffffff";
  const bg3  = dark ? "#21262d" : "#e8f5ee";
  const txt  = dark ? "#e6edf3" : "#04342C";
  const txt2 = dark ? "#8b949e" : "#5F5E5A";
  const brd  = dark ? "rgba(255,255,255,0.08)" : "rgba(4,52,44,0.08)";
  const shadow = dark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 12px rgba(4,52,44,0.06)";

  const handleLogout = () => { deconnecter(); navigate("/login"); };

  const badge = (statut) => {
    const cfg = {
      pointee: { bg: "#E1F5EE", color: "#085041", label: "Pointée" },
      retard:  { bg: "#FAEEDA", color: "#633806", label: "Retard" },
      absent:  { bg: "#FCEBEB", color: "#791F1F", label: "Absent" },
      a_venir: { bg: "#F1EFE8", color: "#5F5E5A", label: "À venir" },
    };
    const c = cfg[statut] || cfg.a_venir;
    return (
      <span style={{ background: c.bg, color: c.color, fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "500" }}>
        {c.label}
      </span>
    );
  };

  const barData = {
    labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    datasets: [
      { label: "Séances pointées",  data: [5, 7, 4, 6, 3, 2], backgroundColor: "#1D9E75", borderRadius: 6 },
      { label: "Séances planifiées", data: [7, 7, 6, 7, 5, 3], backgroundColor: dark ? "#2d3748" : "#e1f5ee", borderRadius: 6 }
    ]
  };

  const doughnutData = {
    labels: ["Pointées", "Retard", "Absent", "À venir"],
    datasets: [{
      data: [
        stats?.kpis?.pointages_jour || 0,
        stats?.kpis?.retards || 0,
        Math.max(0, (stats?.kpis?.seances_jour || 0) - (stats?.kpis?.pointages_jour || 0) - (stats?.kpis?.retards || 0)),
        2
      ],
      backgroundColor: ["#1D9E75", "#BA7517", "#E24B4A", "#888780"],
      borderWidth: 0,
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
    { id: "dashboard",    label: "Tableau de bord",  icon: "⊞",  route: "/dashboard/admin" },
    { id: "emploi",       label: "Emploi du temps",  icon: "📅",  route: "/emploi-temps" },
    { id: "cahiers",      label: "Cahiers de texte", icon: "📝",  route: "/cahiers" },
    { id: "vacations",    label: "Vacations",         icon: "💰",  route: "/vacations" },
    { id: "enseignants",  label: "Enseignants",       icon: "👨‍🏫", route: "/enseignants" },
    { id: "rapports",     label: "Rapports",          icon: "📊",  route: "/rapports" },
    { id: "referentiels", label: "Référentiels",      icon: "🗂️",  route: "/referentiels" },
    { id: "utilisateurs", label: "Utilisateurs",      icon: "👥",  route: "/utilisateurs" },
  ];

  const kpis = [
    { label: "Séances aujourd'hui", valeur: stats?.kpis?.seances_jour || 0,      couleur: "#0F6E56", bg: "#E1F5EE", sub: `${stats?.kpis?.pointages_jour || 0} pointées`,    prog: stats?.kpis?.seances_jour ? (stats.kpis.pointages_jour / stats.kpis.seances_jour * 100) : 0, icon: "📅" },
    { label: "Taux de présence",    valeur: `${stats?.kpis?.taux_presence || 0}%`, couleur: "#1D9E75", bg: "#E8F5EE", sub: "Cette semaine",                                    prog: stats?.kpis?.taux_presence || 0, icon: "✅" },
    { label: "Alertes actives",     valeur: stats?.kpis?.retards || 0,            couleur: "#BA7517", bg: "#FAEEDA", sub: "Retards / absences",                                prog: 30, icon: "⚠️" },
    { label: "Cahiers non signés",  valeur: stats?.kpis?.cahiers_non_signes || 0, couleur: "#E24B4A", bg: "#FCEBEB", sub: "En attente",                                        prog: 25, icon: "📋" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg, transition: "all 0.3s", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ===== SIDEBAR ===== */}
      <div style={{
        width: sidebarOpen ? "240px" : "64px",
        background: "linear-gradient(180deg, #04342C 0%, #062E26 100%)",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        flexShrink: 0, overflow: "hidden",
        boxShadow: "2px 0 20px rgba(0,0,0,0.15)"
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(29,158,117,0.4)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#E1F5EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {sidebarOpen && (
            <div>
              <p style={{ color: "#E1F5EE", fontWeight: "700", fontSize: "15px", margin: 0, letterSpacing: "-0.3px" }}>EduTrack Pro</p>
              <p style={{ color: "#5DCAA5", fontSize: "10px", margin: 0 }}>Gestion pédagogique</p>
            </div>
          )}
        </div>

        {/* Badge rôle */}
        {sidebarOpen && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ background: "rgba(29,158,117,0.15)", border: "1px solid rgba(29,158,117,0.3)", color: "#5DCAA5", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "600", textAlign: "center", letterSpacing: "0.5px" }}>
              ⊞ ADMINISTRATEUR
            </div>
          </div>
        )}

        {/* Menu */}
        <div style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {menuItems.map(item => (
            <div key={item.id} onClick={() => { setActiveMenu(item.id); navigate(item.route); }} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: sidebarOpen ? "10px 12px" : "10px",
              borderRadius: "10px", cursor: "pointer", marginBottom: "2px",
              background: activeMenu === item.id
                ? "linear-gradient(135deg, rgba(29,158,117,0.25), rgba(15,110,86,0.15))"
                : "transparent",
              border: activeMenu === item.id ? "1px solid rgba(29,158,117,0.3)" : "1px solid transparent",
              transition: "all 0.2s"
            }}>
              <span style={{ fontSize: "17px", flexShrink: 0, filter: activeMenu === item.id ? "none" : "opacity(0.7)" }}>{item.icon}</span>
              {sidebarOpen && (
                <span style={{ color: activeMenu === item.id ? "#E1F5EE" : "#9FE1CB", fontSize: "13px", fontWeight: activeMenu === item.id ? "600" : "400", whiteSpace: "nowrap" }}>
                  {item.label}
                </span>
              )}
              {sidebarOpen && activeMenu === item.id && (
                <div style={{ marginLeft: "auto", width: "4px", height: "16px", background: "#1D9E75", borderRadius: "2px" }}/>
              )}
            </div>
          ))}
        </div>

        {/* Toggle */}
        <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{
          padding: "16px", cursor: "pointer", textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.06)", color: "#5DCAA5",
          fontSize: "16px", transition: "color 0.2s"
        }}>
          {sidebarOpen ? "◀" : "▶"}
        </div>
      </div>

      {/* ===== MAIN ===== */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* TOPBAR */}
        <div style={{
          background: bg2, padding: "12px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid ${brd}`, boxShadow: shadow
        }}>
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
              <div style={{ width: "38px", height: "38px", background: bg3, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${brd}`, transition: "all 0.2s" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={txt2} strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={txt2} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              {notifications.filter(n => !n.lu).length > 0 && (
                <div style={{ position: "absolute", top: "-4px", right: "-4px", background: "#E24B4A", color: "white", fontSize: "9px", width: "17px", height: "17px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", boxShadow: "0 2px 6px rgba(226,75,74,0.5)" }}>
                  {notifications.filter(n => !n.lu).length}
                </div>
              )}
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
                <p style={{ margin: 0, fontSize: "12px", fontWeight: "600", color: txt }}>Administrateur</p>
                <p style={{ margin: 0, fontSize: "10px", color: txt2 }}>{utilisateur?.email}</p>
              </div>
            </div>

            <button onClick={handleLogout} style={{ background: "#FCEBEB", color: "#791F1F", border: "1px solid #F09595", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
              Déconnexion
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS PANEL */}
        {notifs && (
          <div style={{ position: "absolute", top: "65px", right: "20px", width: "320px", background: bg2, border: `1px solid ${brd}`, borderRadius: "14px", zIndex: 100, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${brd}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: txt }}>Notifications</span>
              <span onClick={() => setNotifications([])} style={{ fontSize: "11px", color: "#1D9E75", cursor: "pointer", fontWeight: "500" }}>Tout marquer lu</span>
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <p style={{ fontSize: "24px", margin: "0 0 8px" }}>✅</p>
                <p style={{ fontSize: "13px", color: txt2, margin: 0 }}>Aucune notification</p>
              </div>
            ) : notifications.map((n, i) => (
              <div key={i} style={{ padding: "12px 16px", borderBottom: `1px solid ${brd}`, display: "flex", gap: "10px", alignItems: "flex-start", background: !n.lu ? (dark ? "rgba(29,158,117,0.06)" : "rgba(29,158,117,0.03)") : "transparent" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: n.color, marginTop: "5px", flexShrink: 0 }}/>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "12px", color: txt, margin: "0 0 2px" }}>{n.texte}</p>
                  <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>{n.temps}</p>
                </div>
                {!n.lu && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1D9E75", marginTop: "5px" }}/>}
              </div>
            ))}
          </div>
        )}

        {/* CONTENU */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "1.5rem" }}>
            {kpis.map((kpi, i) => (
              <div key={i} style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.1rem", boxShadow: shadow, transition: "transform 0.2s, box-shadow 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <p style={{ fontSize: "11px", color: txt2, margin: "0 0 6px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>{kpi.label}</p>
                    <p style={{ fontSize: "30px", fontWeight: "700", margin: "0 0 4px", color: kpi.couleur, lineHeight: 1 }}>{kpi.valeur}</p>
                    <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>{kpi.sub}</p>
                  </div>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                    {kpi.icon}
                  </div>
                </div>
                <div style={{ height: "5px", background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(kpi.prog, 100)}%`, background: `linear-gradient(90deg, ${kpi.couleur}99, ${kpi.couleur})`, borderRadius: "3px", transition: "width 1.2s ease" }}/>
                </div>
              </div>
            ))}
          </div>

          {/* GRAPHIQUES */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "14px", marginBottom: "1.5rem" }}>
            {/* Bar chart */}
            <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.25rem", boxShadow: shadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: 0 }}>Présences cette semaine</p>
                <div style={{ display: "flex", gap: "12px" }}>
                  {[{ color: "#1D9E75", label: "Pointées" }, { color: dark ? "#2d3748" : "#e1f5ee", label: "Planifiées" }].map((l, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: l.color }}/>
                      <span style={{ fontSize: "11px", color: txt2 }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Bar data={barData} options={chartOptions} height={110}/>
            </div>

            {/* Donut */}
            <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.25rem", boxShadow: shadow }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: "0 0 16px" }}>Séances du jour</p>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "120px", height: "120px", flexShrink: 0 }}>
                  <Doughnut data={doughnutData} options={{ plugins: { legend: { display: false } }, cutout: "72%" }}/>
                </div>
                <div style={{ flex: 1 }}>
                  {[
                    { label: "Pointées", color: "#1D9E75", val: stats?.kpis?.pointages_jour || 0 },
                    { label: "Retard",   color: "#BA7517", val: stats?.kpis?.retards || 0 },
                    { label: "Absent",   color: "#E24B4A", val: Math.max(0, (stats?.kpis?.seances_jour || 0) - (stats?.kpis?.pointages_jour || 0)) },
                    { label: "À venir",  color: "#888780", val: 2 },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, flexShrink: 0 }}/>
                      <span style={{ fontSize: "12px", color: txt2, flex: 1 }}>{item.label}</span>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: item.color }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TABLEAU + ALERTES */}
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "14px", marginBottom: "1.5rem" }}>

            {/* Séances du jour */}
            <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.25rem", boxShadow: shadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: 0 }}>Séances du jour</p>
                <span onClick={() => navigate("/emploi-temps")} style={{ fontSize: "11px", color: "#1D9E75", cursor: "pointer", fontWeight: "500", display: "flex", alignItems: "center", gap: "3px" }}>
                  Voir tout →
                </span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr>
                    {["Heure", "Matière", "Classe", "Enseignant", "Statut"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 6px", color: txt2, fontWeight: "500", fontSize: "11px", borderBottom: `1px solid ${brd}`, textTransform: "uppercase", letterSpacing: "0.4px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats?.seances_du_jour?.length > 0 ? (
                    stats.seances_du_jour.slice(0, 6).map((s, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${brd}` }}>
                        <td style={{ padding: "10px 6px", color: txt, fontWeight: "600" }}>{s.heure_debut?.slice(0,5)}</td>
                        <td style={{ padding: "10px 6px", color: txt }}>{s.matiere}</td>
                        <td style={{ padding: "10px 6px", color: txt2 }}>{s.classe?.split(" ").slice(0,2).join(" ")}</td>
                        <td style={{ padding: "10px 6px", color: txt2 }}>{s.enseignant?.split(" ").slice(-1)[0]}</td>
                        <td style={{ padding: "10px 6px" }}>{badge(s.statut_seance)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: "24px 0", textAlign: "center", color: txt2 }}>
                        <p style={{ fontSize: "24px", margin: "0 0 8px" }}>📭</p>
                        <p style={{ margin: 0, fontSize: "13px" }}>Aucune séance aujourd'hui</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Alertes + Actions */}
            <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.25rem", boxShadow: shadow }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: "0 0 12px" }}>🚨 Alertes en temps réel</p>

              {stats?.kpis?.retards > 0 ? (
                <div style={{ background: "#FAEEDA", padding: "10px 12px", borderLeft: "3px solid #BA7517", borderRadius: "0 8px 8px 0", marginBottom: "8px" }}>
                  <p style={{ fontSize: "12px", color: "#633806", margin: "0 0 2px", fontWeight: "600" }}>⚠️ {stats.kpis.retards} retard(s)</p>
                  <p style={{ fontSize: "11px", color: "#854F0B", margin: 0 }}>Vérifier les séances</p>
                </div>
              ) : null}

              {stats?.kpis?.cahiers_non_signes > 0 ? (
                <div style={{ background: "#FCEBEB", padding: "10px 12px", borderLeft: "3px solid #E24B4A", borderRadius: "0 8px 8px 0", marginBottom: "8px" }}>
                  <p style={{ fontSize: "12px", color: "#791F1F", margin: "0 0 2px", fontWeight: "600" }}>📋 {stats.kpis.cahiers_non_signes} cahier(s) non signé(s)</p>
                  <p style={{ fontSize: "11px", color: "#A32D2D", margin: 0 }}>En attente de signature</p>
                </div>
              ) : null}

              {stats?.kpis?.vacations_attente > 0 ? (
                <div style={{ background: "#EEEDFE", padding: "10px 12px", borderLeft: "3px solid #534AB7", borderRadius: "0 8px 8px 0", marginBottom: "8px" }}>
                  <p style={{ fontSize: "12px", color: "#3C3489", margin: "0 0 2px", fontWeight: "600" }}>💰 {stats.kpis.vacations_attente} vacation(s)</p>
                  <p style={{ fontSize: "11px", color: "#534AB7", margin: 0 }}>En attente de validation</p>
                </div>
              ) : null}

              {(!stats?.kpis?.retards && !stats?.kpis?.cahiers_non_signes && !stats?.kpis?.vacations_attente) && (
                <div style={{ background: "#E1F5EE", padding: "10px 12px", borderLeft: "3px solid #0F6E56", borderRadius: "0 8px 8px 0", marginBottom: "8px" }}>
                  <p style={{ fontSize: "12px", color: "#085041", margin: 0, fontWeight: "600" }}>✅ Tout est en ordre</p>
                </div>
              )}

              <p style={{ fontSize: "11px", fontWeight: "600", color: txt, margin: "16px 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Actions rapides</p>
              {[
                { label: "📅 Emploi du temps", route: "/emploi-temps", color: "#E1F5EE", txt: "#085041", border: "#9FE1CB" },
                { label: "📝 Cahiers de texte", route: "/cahiers",      color: "#EEEDFE", txt: "#3C3489", border: "#CECBF6" },
                { label: "💰 Fiches vacation",  route: "/vacations",    color: "#FAEEDA", txt: "#633806", border: "#E8C97A" },
                { label: "📊 Rapports",          route: "/rapports",    color: "#E6F1FB", txt: "#0C447C", border: "#A8CBF0" },
              ].map(btn => (
                <div key={btn.label} onClick={() => navigate(btn.route)} style={{
                  background: btn.color, color: btn.txt, border: `1px solid ${btn.border}`,
                  padding: "9px 12px", borderRadius: "8px", fontSize: "12px",
                  cursor: "pointer", marginBottom: "6px", fontWeight: "500",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  transition: "opacity 0.2s"
                }}>
                  <span>{btn.label}</span>
                  <span style={{ fontSize: "14px" }}>→</span>
                </div>
              ))}
            </div>
          </div>

          {/* AVANCEMENT PROGRAMMES */}
          <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.25rem", boxShadow: shadow, marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: "0 0 16px" }}>📈 Avancement des programmes</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { matiere: "Réseaux Informatiques",        avancement: 65, couleur: "#0F6E56", classe: "L1-RST" },
                { matiere: "Programmation Orientée Objet", avancement: 45, couleur: "#534AB7", classe: "L1-RST" },
                { matiere: "Développement Web",            avancement: 30, couleur: "#BA7517", classe: "L2-RST" },
                { matiere: "Bases de Données Avancées",    avancement: 55, couleur: "#185FA5", classe: "L2-RST" },
                { matiere: "Systèmes d'exploitation",      avancement: 40, couleur: "#993C1D", classe: "L1-RST" },
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ minWidth: "220px" }}>
                    <p style={{ fontSize: "12px", fontWeight: "600", color: txt, margin: "0 0 2px" }}>{m.matiere}</p>
                    <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>{m.classe}</p>
                  </div>
                  <div style={{ flex: 1, height: "8px", background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${m.avancement}%`, background: `linear-gradient(90deg, ${m.couleur}88, ${m.couleur})`, borderRadius: "4px", transition: "width 1.5s ease" }}/>
                  </div>
                  <span style={{ minWidth: "38px", fontSize: "12px", fontWeight: "700", color: m.couleur, textAlign: "right" }}>
                    {m.avancement}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* HEURES PLANIFIEES VS REALISEES */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
            {[
              { classe: "L1-RST",  planifiees: 14, realisees: 10, color: "#0F6E56", bg: "#E1F5EE" },
              { classe: "L2-RST",  planifiees: 12, realisees: 9,  color: "#534AB7", bg: "#EEEDFE" },
              { classe: "L3-INFO", planifiees: 10, realisees: 6,  color: "#BA7517", bg: "#FAEEDA" },
            ].map((c, i) => (
              <div key={i} style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.1rem", boxShadow: shadow }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div style={{ background: c.bg, color: c.color, padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" }}>{c.classe}</div>
                  <span style={{ fontSize: "11px", color: txt2, fontWeight: "500" }}>{c.realisees}/{c.planifiees}h</span>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", color: txt2 }}>Planifiées</span>
                    <span style={{ fontSize: "11px", color: txt2 }}>{c.planifiees}h</span>
                  </div>
                  <div style={{ height: "6px", background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "100%", background: `${c.color}25`, borderRadius: "3px" }}/>
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", color: txt2 }}>Réalisées</span>
                    <span style={{ fontSize: "11px", color: c.color, fontWeight: "600" }}>{c.realisees}h</span>
                  </div>
                  <div style={{ height: "6px", background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(c.realisees / c.planifiees) * 100}%`, background: `linear-gradient(90deg, ${c.color}88, ${c.color})`, borderRadius: "3px" }}/>
                  </div>
                </div>
                <div style={{ textAlign: "center", marginTop: "12px" }}>
                  <span style={{ fontSize: "20px", fontWeight: "800", color: c.color }}>{Math.round((c.realisees / c.planifiees) * 100)}%</span>
                  <p style={{ fontSize: "10px", color: txt2, margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>réalisé</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}