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

const API = "http://192.168.200.92/eduschedulepro/backend/api";

export default function DashboardEnseignantPage() {
  const { utilisateur, token, deconnecter } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [dark, setDark]     = useState(false);
  const [notifs, setNotifs] = useState(false);
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

  const barData = {
    labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    datasets: [{
      label: "Heures enseignées",
      data: [2, 4, 2, 2, 0, 2],
      backgroundColor: "#1D9E75",
      borderRadius: 6,
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
    { id: "dashboard", label: "Tableau de bord", icon: "⊞", route: "/dashboard/enseignant", active: true },
    { id: "seances",   label: "Mes séances",      icon: "📅", route: "/emploi-temps" },
    { id: "cahiers",   label: "Mes cahiers",       icon: "📝", route: "/cahiers" },
    { id: "vacations", label: "Mes vacations",     icon: "💰", route: "/vacations" },
    { id: "scanner", label: "📱 Scanner QR", icon: "📱", route: "/scanner" },
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
    <span style={{
      background: c.bg, color: c.color,
      fontSize: "11px", padding: "3px 10px",
      borderRadius: "20px", fontWeight: "500"
    }}>{c.label}</span>
  );
};

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg, transition: "all 0.3s" }}>

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? "220px" : "60px",
        background: "#04342C", transition: "width 0.3s",
        display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden"
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
            <div key={item.id} onClick={() => navigate(item.route)} style={{
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
            {/* Notif */}
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setNotifs(!notifs)}>
              <div style={{ width: "36px", height: "36px", background: bg3, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", border: `0.5px solid ${brd}` }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={txt2} strokeWidth="1.5"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={txt2} strokeWidth="1.5"/>
                </svg>
              </div>
              <div style={{ position: "absolute", top: "-4px", right: "-4px", background: "#E24B4A", color: "white", fontSize: "9px", width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>2</div>
            </div>
            {/* Dark mode */}
            <div onClick={() => setDark(!dark)} style={{ width: "36px", height: "36px", background: bg3, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", border: `0.5px solid ${brd}` }}>
              {dark ? "☀️" : "🌙"}
            </div>
            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#1D9E75", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: "500" }}>
                {utilisateur?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: "500", color: txt }}>Enseignant</p>
                <p style={{ margin: 0, fontSize: "11px", color: txt2 }}>{utilisateur?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} style={{ background: "#FCEBEB", color: "#791F1F", border: "0.5px solid #F09595", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}>
              Déconnexion
            </button>
          </div>
        </div>

        {/* Notifications panel */}
        {notifs && (
          <div style={{ position: "absolute", top: "56px", right: "20px", width: "300px", background: bg2, border: `0.5px solid ${brd}`, borderRadius: "12px", zIndex: 100 }}>
            <div style={{ padding: "12px 16px", borderBottom: `0.5px solid ${brd}`, fontSize: "13px", fontWeight: "500", color: txt }}>Notifications</div>
            {[
              { color: "#BA7517", texte: "Séance de demain à 08h00 — Réseaux", temps: "Il y a 1h" },
              { color: "#1D9E75", texte: "Fiche vacation avril approuvée", temps: "Il y a 3h" },
            ].map((n, i) => (
              <div key={i} style={{ padding: "12px 16px", borderBottom: `0.5px solid ${brd}`, display: "flex", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: n.color, marginTop: "5px", flexShrink: 0 }}/>
                <div>
                  <div style={{ fontSize: "12px", color: txt }}>{n.texte}</div>
                  <div style={{ fontSize: "11px", color: txt2, marginTop: "2px" }}>{n.temps}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contenu */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "1.25rem" }}>
            {[
              { label: "Séances cette semaine", val: stats?.mes_seances?.length || 0,  color: "#0F6E56", bg: "#E1F5EE", icon: "📅", sub: "planifiées" },
              { label: "Heures réalisées",       val: "12h",  color: "#1D9E75", bg: "#E1F5EE", icon: "⏱️", sub: "ce mois" },
              { label: "Cahiers signés",          val: stats?.mes_seances?.filter(s => s.statut === "pointee").length || 0, color: "#534AB7", bg: "#EEEDFE", icon: "📝", sub: "validés" },
              { label: "Montant en attente",      val: stats?.mes_vacations?.find(v => v.statut !== "approuvee_comptable") ? `${parseFloat(stats?.mes_vacations?.[0]?.montant_net || 0).toLocaleString("fr-FR")} F` : "0 F", color: "#BA7517", bg: "#FAEEDA", icon: "💰", sub: "FCFA" },
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

          {/* Graphique + Séances */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "12px", marginBottom: "1.25rem" }}>

            {/* Graphique */}
            <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1rem" }}>
              <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: "0 0 16px" }}>Heures cette semaine</p>
              <Bar data={barData} options={chartOptions} height={150}/>
            </div>

            {/* Mes séances */}
            <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>Mes séances de la semaine</p>
                <span style={{ fontSize: "11px", color: "#1D9E75", cursor: "pointer" }}>Voir tout →</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ borderBottom: `0.5px solid ${brd}` }}>
                    {["Jour", "Heure", "Matière", "Classe", "Statut"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "4px 0", color: txt2, fontWeight: "400", fontSize: "11px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats?.mes_seances?.length > 0 ? (
                    stats.mes_seances.map((s, i) => (
                      <tr key={i} style={{ borderBottom: `0.5px solid ${brd}` }}>
                        <td style={{ padding: "7px 0", color: txt }}>{s.jour}</td>
                        <td style={{ padding: "7px 0", color: txt }}>{s.heure_debut?.slice(0,5)}</td>
                        <td style={{ padding: "7px 0", color: txt }}>{s.matiere?.split(" ")[0]}</td>
                        <td style={{ padding: "7px 0", color: txt2 }}>{s.classe?.split(" ").slice(0,2).join(" ")}</td>
                        <td style={{ padding: "7px 0" }}>{statutBadge(s.statut)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: "20px 0", textAlign: "center", color: txt2 }}>
                        Aucune séance cette semaine
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mes vacations */}
          <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>Mes fiches de vacation</p>
              <button onClick={() => navigate("/vacations")} style={{ padding: "6px 14px", background: bg3, color: txt, border: `0.5px solid ${brd}`, borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>
                Voir tout →
              </button>
            </div>
            {stats?.mes_vacations?.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {stats.mes_vacations.slice(0, 3).map((v, i) => {
                  const mois = ["", "Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
                  const statutCfg = {
                    generee:             { bg: "#F1EFE8", color: "#5F5E5A", label: "Générée" },
                    signee_enseignant:   { bg: "#FAEEDA", color: "#633806", label: "Signée" },
                    validee_surveillant: { bg: "#EEEDFE", color: "#3C3489", label: "Validée" },
                    approuvee_comptable: { bg: "#E1F5EE", color: "#085041", label: "Approuvée" },
                  };
                  const s = statutCfg[v.statut] || statutCfg.generee;
                  return (
                    <div key={i} style={{ background: bg3, borderRadius: "10px", padding: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>
                          {mois[v.mois]} {v.annee}
                        </p>
                        <span style={{ fontSize: "10px", background: s.bg, color: s.color, padding: "2px 7px", borderRadius: "20px" }}>{s.label}</span>
                      </div>
                      <p style={{ fontSize: "18px", fontWeight: "500", color: "#0F6E56", margin: "0 0 4px" }}>
                        {parseFloat(v.montant_net || 0).toLocaleString("fr-FR")} FCFA
                      </p>
                      <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>Montant net</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ fontSize: "32px" }}>💰</p>
                <p style={{ color: txt2, fontSize: "13px" }}>Aucune fiche de vacation</p>
              </div>
            )}
          </div>

          {/* Historique par mois */}
<div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1rem", marginTop: "12px" }}>
  <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: "0 0 16px" }}>
    📅 Historique de mes séances par mois
  </p>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
    {[
      { mois: "Avril 2026",   seances: 8,  heures: "16h", statut: "En cours", color: "#BA7517", bg: "#FAEEDA" },
      { mois: "Mars 2026",    seances: 12, heures: "24h", statut: "Clôturé",  color: "#0F6E56", bg: "#E1F5EE" },
      { mois: "Février 2026", seances: 10, heures: "20h", statut: "Payé",     color: "#534AB7", bg: "#EEEDFE" },
    ].map((h, i) => (
      <div key={i} style={{ background: h.bg, borderRadius: "10px", padding: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <p style={{ fontSize: "13px", fontWeight: "500", color: h.color, margin: 0 }}>{h.mois}</p>
          <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.5)", color: h.color, padding: "2px 7px", borderRadius: "20px", fontWeight: "500" }}>
            {h.statut}
          </span>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <div>
            <p style={{ fontSize: "11px", color: h.color, margin: "0 0 2px", opacity: 0.8 }}>Séances</p>
            <p style={{ fontSize: "18px", fontWeight: "500", color: h.color, margin: 0 }}>{h.seances}</p>
          </div>
          <div>
            <p style={{ fontSize: "11px", color: h.color, margin: "0 0 2px", opacity: 0.8 }}>Heures</p>
            <p style={{ fontSize: "18px", fontWeight: "500", color: h.color, margin: 0 }}>{h.heures}</p>
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