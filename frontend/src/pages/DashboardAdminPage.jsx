import { useState, useEffect, useRef } from "react";
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

const API = "http://localhost/eduschedulepro/backend/api";

export default function DashboardAdminPage() {
  const { utilisateur, token, deconnecter } = useAuth();
  const navigate  = useNavigate();
  const [stats, setStats]     = useState(null);
  const [dark, setDark]       = useState(false);
  const [notifs, setNotifs]   = useState(false);
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
  const bg3  = dark ? "#21262d" : "#e1f5ee";
  const txt  = dark ? "#e6edf3" : "#04342C";
  const txt2 = dark ? "#8b949e" : "#5F5E5A";
  const brd  = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

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
      <span style={{
        background: c.bg, color: c.color,
        fontSize: "11px", padding: "3px 10px",
        borderRadius: "20px", fontWeight: "500"
      }}>{c.label}</span>
    );
  };

  // Données graphique présence
  const barData = {
    labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    datasets: [{
      label: "Séances pointées",
      data: [5, 7, 4, 6, 3, 2],
      backgroundColor: "#1D9E75",
      borderRadius: 6,
    }, {
      label: "Séances planifiées",
      data: [7, 7, 6, 7, 5, 3],
      backgroundColor: dark ? "#21262d" : "#e1f5ee",
      borderRadius: 6,
    }]
  };

  const doughnutData = {
    labels: ["Pointées", "Retard", "Absent", "À venir"],
    datasets: [{
      data: [
        stats?.kpis?.pointages_jour || 0,
        stats?.kpis?.retards || 0,
        (stats?.kpis?.seances_jour || 0) - (stats?.kpis?.pointages_jour || 0) - (stats?.kpis?.retards || 0),
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
      x: { grid: { display: false }, ticks: { color: txt2 } },
      y: { grid: { color: brd }, ticks: { color: txt2 } }
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "⊞", route: "/dashboard/admin" },
    { id: "emploi",    label: "Emploi du temps", icon: "📅", route: "/emploi-temps" },
    { id: "cahiers",   label: "Cahiers de texte", icon: "📝", route: "/cahiers" },
    { id: "vacations", label: "Vacations",         icon: "💰", route: "/vacations" },
    { id: "enseignants", label: "Enseignants",     icon: "👨‍🏫", route: "/enseignants" },
    { id: "rapports",  label: "Rapports",          icon: "📊", route: "/rapports" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg, transition: "all 0.3s" }}>

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? "220px" : "60px",
        background: "#04342C", transition: "width 0.3s",
        display: "flex", flexDirection: "column",
        flexShrink: 0, overflow: "hidden"
      }}>
        {/* Logo */}
        <div style={{
          padding: "16px", display: "flex", alignItems: "center",
          gap: "10px", borderBottom: "0.5px solid rgba(255,255,255,0.1)"
        }}>
          <div style={{
            width: "32px", height: "32px", background: "#1D9E75",
            borderRadius: "8px", display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                stroke="#E1F5EE" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          {sidebarOpen && (
            <span style={{ color: "#E1F5EE", fontWeight: "500", fontSize: "14px", whiteSpace: "nowrap" }}>
              EduTrack Pro
            </span>
          )}
        </div>

        {/* Menu items */}
        <div style={{ flex: 1, padding: "8px" }}>
          {menuItems.map(item => (
            <div key={item.id}
              onClick={() => { setActiveMenu(item.id); navigate(item.route); }}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 8px", borderRadius: "8px", cursor: "pointer",
                background: activeMenu === item.id ? "#0F6E56" : "transparent",
                marginBottom: "4px", transition: "background 0.2s"
              }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && (
                <span style={{
                  color: activeMenu === item.id ? "#E1F5EE" : "#9FE1CB",
                  fontSize: "13px", whiteSpace: "nowrap"
                }}>{item.label}</span>
              )}
            </div>
          ))}
        </div>

        {/* Toggle sidebar */}
        <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{
          padding: "16px", cursor: "pointer", textAlign: "center",
          borderTop: "0.5px solid rgba(255,255,255,0.1)", color: "#9FE1CB", fontSize: "18px"
        }}>
          {sidebarOpen ? "◀" : "▶"}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <div style={{
          background: bg2, padding: "10px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `0.5px solid ${brd}`
        }}>
          <div>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: "500", color: txt }}>
              Tableau de bord
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long", day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {/* Notif */}
            <div style={{ position: "relative", cursor: "pointer" }}
              onClick={() => setNotifs(!notifs)}>
              <div style={{
                width: "36px", height: "36px", background: bg3,
                borderRadius: "8px", display: "flex", alignItems: "center",
                justifyContent: "center", border: `0.5px solid ${brd}`
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                    stroke={txt2} strokeWidth="1.5"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={txt2} strokeWidth="1.5"/>
                </svg>
              </div>
              <div style={{
                position: "absolute", top: "-4px", right: "-4px",
                background: "#E24B4A", color: "white", fontSize: "9px",
                width: "16px", height: "16px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {(stats?.kpis?.retards || 0) + (stats?.kpis?.cahiers_non_signes || 0)}
              </div>
            </div>
            {/* Dark mode */}
            <div onClick={() => setDark(!dark)} style={{
              width: "36px", height: "36px", background: bg3,
              borderRadius: "8px", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", fontSize: "16px",
              border: `0.5px solid ${brd}`
            }}>
              {dark ? "☀️" : "🌙"}
            </div>
            {/* Avatar + nom */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "#1D9E75", display: "flex", alignItems: "center",
                justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: "500"
              }}>AD</div>
              <div>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: "500", color: txt }}>
                  Administrateur
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: txt2 }}>
                  {utilisateur?.email}
                </p>
              </div>
            </div>
            <button onClick={handleLogout} style={{
              background: "#FCEBEB", color: "#791F1F", border: "0.5px solid #F09595",
              borderRadius: "6px", padding: "6px 12px", fontSize: "12px", cursor: "pointer"
            }}>Déconnexion</button>
          </div>
        </div>

        {/* Panneau notifications */}
        {notifs && (
          <div style={{
            position: "absolute", top: "56px", right: "20px",
            width: "300px", background: bg2, border: `0.5px solid ${brd}`,
            borderRadius: "12px", zIndex: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              padding: "12px 16px", borderBottom: `0.5px solid ${brd}`,
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <span style={{ fontSize: "13px", fontWeight: "500", color: txt }}>Notifications</span>
              <span style={{ fontSize: "11px", color: "#1D9E75", cursor: "pointer" }}>
                Tout marquer lu
              </span>
            </div>
            {[
              { color: "#E24B4A", texte: "Séance non pointée détectée", temps: "Il y a 10 min", lu: false },
              { color: "#BA7517", texte: "Retard signalé — M. Kaboré", temps: "Il y a 25 min", lu: false },
              { color: "#BA7517", texte: "5 cahiers en attente de signature", temps: "Il y a 1h", lu: true },
              { color: "#1D9E75", texte: "Planning semaine publié", temps: "Il y a 2h", lu: true },
            ].map((n, i) => (
              <div key={i} style={{
                padding: "12px 16px", borderBottom: `0.5px solid ${brd}`,
                display: "flex", gap: "10px", alignItems: "flex-start",
                background: n.lu ? "transparent" : (dark ? "rgba(255,255,255,0.03)" : "rgba(15,110,86,0.04)")
              }}>
                <div style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: n.color, marginTop: "5px", flexShrink: 0
                }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", color: txt }}>{n.texte}</div>
                  <div style={{ fontSize: "11px", color: txt2, marginTop: "2px" }}>{n.temps}</div>
                </div>
                {!n.lu && (
                  <div style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "#1D9E75", marginTop: "5px", flexShrink: 0
                  }}/>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Contenu scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>

          {/* KPIs */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px", marginBottom: "1.25rem"
          }}>
            {[
              { label: "Séances aujourd'hui", valeur: stats?.kpis?.seances_jour || 0,
                couleur: "#0F6E56", bg: "#E1F5EE", sub: `${stats?.kpis?.pointages_jour || 0} pointées`,
                prog: stats?.kpis?.seances_jour ? (stats.kpis.pointages_jour / stats.kpis.seances_jour * 100) : 0,
                icon: "📅" },
              { label: "Taux de présence", valeur: `${stats?.kpis?.taux_presence || 0}%`,
                couleur: "#1D9E75", bg: "#E1F5EE", sub: "Cette semaine",
                prog: stats?.kpis?.taux_presence || 0, icon: "✅" },
              { label: "Alertes actives", valeur: stats?.kpis?.retards || 0,
                couleur: "#BA7517", bg: "#FAEEDA", sub: "Retards / absences",
                prog: 30, icon: "⚠️" },
              { label: "Cahiers non signés", valeur: stats?.kpis?.cahiers_non_signes || 0,
                couleur: "#E24B4A", bg: "#FCEBEB", sub: "En attente",
                prog: 25, icon: "📋" },
            ].map((kpi, i) => (
              <div key={i} style={{
                background: bg2, borderRadius: "12px",
                border: `0.5px solid ${brd}`, padding: "1rem",
                transition: "transform 0.2s"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: txt2, margin: "0 0 8px" }}>{kpi.label}</p>
                    <p style={{ fontSize: "28px", fontWeight: "500", margin: "0 0 4px", color: kpi.couleur }}>
                      {kpi.valeur}
                    </p>
                    <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>{kpi.sub}</p>
                  </div>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    background: kpi.bg, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "20px"
                  }}>{kpi.icon}</div>
                </div>
                <div style={{
                  height: "4px", background: brd,
                  borderRadius: "2px", marginTop: "12px", overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%", width: `${Math.min(kpi.prog, 100)}%`,
                    background: kpi.couleur, borderRadius: "2px",
                    transition: "width 1s ease"
                  }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Graphiques + Tableau */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "12px", marginBottom: "1.25rem"
          }}>
            {/* Graphique barres */}
            <div style={{
              background: bg2, borderRadius: "12px",
              border: `0.5px solid ${brd}`, padding: "1rem"
            }}>
              <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: "0 0 16px" }}>
                Présences cette semaine
              </p>
              <Bar data={barData} options={chartOptions} height={120}/>
            </div>

            {/* Graphique donut */}
            <div style={{
              background: bg2, borderRadius: "12px",
              border: `0.5px solid ${brd}`, padding: "1rem"
            }}>
              <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: "0 0 16px" }}>
                Répartition séances du jour
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ width: "140px", height: "140px" }}>
                  <Doughnut data={doughnutData} options={{ plugins: { legend: { display: false } }, cutout: "70%" }}/>
                </div>
                <div style={{ flex: 1 }}>
                  {[
                    { label: "Pointées", color: "#1D9E75", val: stats?.kpis?.pointages_jour || 0 },
                    { label: "Retard",   color: "#BA7517", val: stats?.kpis?.retards || 0 },
                    { label: "Absent",   color: "#E24B4A", val: (stats?.kpis?.seances_jour || 0) - (stats?.kpis?.pointages_jour || 0) },
                    { label: "À venir",  color: "#888780", val: 2 },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color }}/>
                      <span style={{ fontSize: "12px", color: txt2, flex: 1 }}>{item.label}</span>
                      <span style={{ fontSize: "12px", fontWeight: "500", color: txt }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tableau séances + Alertes */}
          <div style={{
            display: "grid", gridTemplateColumns: "1.6fr 1fr",
            gap: "12px"
          }}>
            {/* Tableau */}
            <div style={{
              background: bg2, borderRadius: "12px",
              border: `0.5px solid ${brd}`, padding: "1rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>
                  Séances du jour
                </p>
                <span style={{ fontSize: "11px", color: "#1D9E75", cursor: "pointer" }}>
                  Voir tout →
                </span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ borderBottom: `0.5px solid ${brd}` }}>
                    {["Heure", "Matière", "Classe", "Enseignant", "Statut"].map(h => (
                      <th key={h} style={{
                        textAlign: "left", padding: "6px 0",
                        color: txt2, fontWeight: "400", fontSize: "11px"
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats?.seances_du_jour?.length > 0 ? (
                    stats.seances_du_jour.slice(0, 6).map((s, i) => (
                      <tr key={i} style={{
                        borderBottom: `0.5px solid ${brd}`,
                        cursor: "pointer"
                      }}>
                        <td style={{ padding: "8px 0", color: txt, fontWeight: "500" }}>{s.heure_debut?.slice(0,5)}</td>
                        <td style={{ padding: "8px 0", color: txt }}>{s.matiere}</td>
                        <td style={{ padding: "8px 0", color: txt2 }}>{s.classe?.split(" ").slice(0,2).join(" ")}</td>
                        <td style={{ padding: "8px 0", color: txt2 }}>{s.enseignant?.split(" ").slice(-1)[0]}</td>
                        <td style={{ padding: "8px 0" }}>{badge(s.statut_seance)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: "20px 0", textAlign: "center", color: txt2 }}>
                        Aucune séance aujourd'hui
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Alertes */}
            <div style={{
              background: bg2, borderRadius: "12px",
              border: `0.5px solid ${brd}`, padding: "1rem"
            }}>
              <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: "0 0 12px" }}>
                Alertes en temps réel
              </p>
              {stats?.kpis?.retards > 0 && (
                <div style={{
                  background: "#FAEEDA", padding: "10px 12px",
                  borderLeft: "3px solid #BA7517", borderRadius: "0 8px 8px 0",
                  marginBottom: "10px"
                }}>
                  <p style={{ fontSize: "12px", color: "#633806", margin: "0 0 2px", fontWeight: "500" }}>
                    ⚠️ {stats.kpis.retards} retard(s) signalé(s)
                  </p>
                  <p style={{ fontSize: "11px", color: "#854F0B", margin: 0 }}>
                    Vérifier les séances en cours
                  </p>
                </div>
              )}
              {stats?.kpis?.cahiers_non_signes > 0 && (
                <div style={{
                  background: "#FCEBEB", padding: "10px 12px",
                  borderLeft: "3px solid #E24B4A", borderRadius: "0 8px 8px 0",
                  marginBottom: "10px"
                }}>
                  <p style={{ fontSize: "12px", color: "#791F1F", margin: "0 0 2px", fontWeight: "500" }}>
                    📋 {stats.kpis.cahiers_non_signes} cahier(s) non signé(s)
                  </p>
                  <p style={{ fontSize: "11px", color: "#A32D2D", margin: 0 }}>
                    En attente de signature
                  </p>
                </div>
              )}
              {stats?.kpis?.vacations_attente > 0 && (
                <div style={{
                  background: "#EEEDFE", padding: "10px 12px",
                  borderLeft: "3px solid #534AB7", borderRadius: "0 8px 8px 0",
                  marginBottom: "10px"
                }}>
                  <p style={{ fontSize: "12px", color: "#3C3489", margin: "0 0 2px", fontWeight: "500" }}>
                    💰 {stats.kpis.vacations_attente} vacation(s) en attente
                  </p>
                  <p style={{ fontSize: "11px", color: "#534AB7", margin: 0 }}>
                    À valider ce mois
                  </p>
                </div>
              )}
              {(!stats?.kpis?.retards && !stats?.kpis?.cahiers_non_signes && !stats?.kpis?.vacations_attente) && (
                <div style={{
                  background: "#E1F5EE", padding: "10px 12px",
                  borderLeft: "3px solid #0F6E56", borderRadius: "0 8px 8px 0"
                }}>
                  <p style={{ fontSize: "12px", color: "#085041", margin: 0, fontWeight: "500" }}>
                    ✅ Tout est en ordre
                  </p>
                </div>
              )}

              {/* Heures planifiées vs réalisées */}
<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "1.25rem" }}>
  {[
    { classe: "L1-RST",  planifiees: 14, realisees: 10, color: "#0F6E56" },
    { classe: "L2-RST",  planifiees: 12, realisees: 9,  color: "#534AB7" },
    { classe: "L3-INFO", planifiees: 10, realisees: 6,  color: "#BA7517" },
  ].map((c, i) => (
    <div key={i} style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>{c.classe}</p>
        <span style={{ fontSize: "11px", color: txt2 }}>{c.realisees}/{c.planifiees}h</span>
      </div>
      <p style={{ fontSize: "11px", color: txt2, margin: "0 0 4px" }}>Planifiées</p>
      <div style={{ height: "6px", background: brd, borderRadius: "3px", marginBottom: "8px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: "100%", background: `${c.color}40`, borderRadius: "3px" }}/>
      </div>
      <p style={{ fontSize: "11px", color: txt2, margin: "0 0 4px" }}>Réalisées</p>
      <div style={{ height: "6px", background: brd, borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(c.realisees / c.planifiees) * 100}%`, background: c.color, borderRadius: "3px" }}/>
      </div>
      <p style={{ fontSize: "11px", color: c.color, margin: "6px 0 0", fontWeight: "500", textAlign: "right" }}>
        {Math.round((c.realisees / c.planifiees) * 100)}% réalisé
      </p>
    </div>
  ))}
</div>

{/* Avancement programmes */}
<div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1rem", marginBottom: "1.25rem" }}>
  <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: "0 0 16px" }}>
    📈 Avancement des programmes par matière
  </p>
  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
    {[
      { matiere: "Réseaux Informatiques",        avancement: 65, couleur: "#0F6E56", classe: "L1-RST" },
      { matiere: "Programmation Orientée Objet", avancement: 45, couleur: "#534AB7", classe: "L1-RST" },
      { matiere: "Développement Web",            avancement: 30, couleur: "#BA7517", classe: "L2-RST" },
      { matiere: "Bases de Données Avancées",    avancement: 55, couleur: "#185FA5", classe: "L2-RST" },
      { matiere: "Systèmes d exploitation",      avancement: 40, couleur: "#993C1D", classe: "L1-RST" },
    ].map((m, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ minWidth: "200px" }}>
          <p style={{ fontSize: "12px", fontWeight: "500", color: txt, margin: "0 0 2px" }}>{m.matiere}</p>
          <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>{m.classe}</p>
        </div>
        <div style={{ flex: 1, height: "8px", background: brd, borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${m.avancement}%`, background: m.couleur, borderRadius: "4px" }}/>
        </div>
        <span style={{ minWidth: "40px", fontSize: "12px", fontWeight: "500", color: m.couleur, textAlign: "right" }}>
          {m.avancement}%
        </span>
      </div>
    ))}
  </div>
</div>

              {/* Actions rapides */}
              <p style={{ fontSize: "12px", fontWeight: "500", color: txt, margin: "16px 0 8px" }}>
                Actions rapides
              </p>
              {[
                { label: "Emploi du temps", route: "/emploi-temps", color: "#E1F5EE", txt: "#085041" },
                { label: "Cahiers de texte", route: "/cahiers", color: "#EEEDFE", txt: "#3C3489" },
                { label: "Fiches vacation", route: "/vacations", color: "#FAEEDA", txt: "#633806" },
              ].map(btn => (
                <div key={btn.label} onClick={() => navigate(btn.route)} style={{
                  background: btn.color, color: btn.txt,
                  padding: "8px 12px", borderRadius: "8px",
                  fontSize: "12px", cursor: "pointer", marginBottom: "6px",
                  fontWeight: "500", display: "flex", justifyContent: "space-between"
                }}>
                  <span>{btn.label}</span>
                  <span>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}