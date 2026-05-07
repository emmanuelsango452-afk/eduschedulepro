import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = "http://192.168.200.92/eduschedulepro/backend/api";

export default function DashboardSurveillantPage() {
  const { utilisateur, token, deconnecter } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]             = useState(null);
  const [dark, setDark]               = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ongletActif, setOngletActif] = useState("apercu");

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

  const menuItems = [
    { label: "Aperçu",           icon: "⊞", id: "apercu" },
    { label: "Cahiers à vérifier", icon: "📝", id: "cahiers" },
    { label: "Fiches à valider", icon: "💰", id: "vacations" },
    { label: "Rapports",         icon: "📊", id: "rapports" },
  ];

  const badge = (statut) => {
    const cfg = {
      pointee:  { bg: "#E1F5EE", color: "#085041", label: "Pointée" },
      retard:   { bg: "#FAEEDA", color: "#633806", label: "Retard" },
      absent:   { bg: "#FCEBEB", color: "#791F1F", label: "Absent" },
      a_venir:  { bg: "#F1EFE8", color: "#5F5E5A", label: "À venir" },
    };
    const c = cfg[statut] || cfg.a_venir;
    return (
      <span style={{ background: c.bg, color: c.color, fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "500" }}>
        {c.label}
      </span>
    );
  };

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

        {/* Badge rôle */}
        {sidebarOpen && (
          <div style={{ padding: "10px 16px", borderBottom: "0.5px solid rgba(255,255,255,0.1)" }}>
            <div style={{ background: "#E6F1FB", color: "#0C447C", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "500", textAlign: "center" }}>
              👁️ Surveillant Général
            </div>
          </div>
        )}

        <div style={{ flex: 1, padding: "8px" }}>
          {menuItems.map(item => (
            <div key={item.id} onClick={() => setOngletActif(item.id)} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 8px", borderRadius: "8px", cursor: "pointer",
              background: ongletActif === item.id ? "#0F6E56" : "transparent", marginBottom: "4px"
            }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ color: ongletActif === item.id ? "#E1F5EE" : "#9FE1CB", fontSize: "13px", whiteSpace: "nowrap" }}>{item.label}</span>}
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
              Tableau de bord — Surveillant
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div onClick={() => setDark(!dark)} style={{ width: "36px", height: "36px", background: bg3, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", border: `0.5px solid ${brd}` }}>
              {dark ? "☀️" : "🌙"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#185FA5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: "500" }}>
                SG
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: "500", color: txt }}>Surveillant</p>
                <p style={{ margin: 0, fontSize: "11px", color: txt2 }}>{utilisateur?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} style={{ background: "#FCEBEB", color: "#791F1F", border: "0.5px solid #F09595", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}>
              Déconnexion
            </button>
          </div>
        </div>

        {/* Contenu selon onglet */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>

          {ongletActif === "apercu" && (
            <div>
              {/* KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "1.25rem" }}>
                {[
                  { label: "Séances aujourd'hui", val: stats?.kpis?.seances_jour || 0,          color: "#0F6E56", bg: "#E1F5EE", icon: "📅", sub: `${stats?.kpis?.pointages_jour || 0} pointées` },
                  { label: "Alertes actives",      val: stats?.kpis?.retards || 0,               color: "#E24B4A", bg: "#FCEBEB", icon: "🚨", sub: "À surveiller" },
                  { label: "Cahiers non signés",   val: stats?.kpis?.cahiers_non_signes || 0,    color: "#BA7517", bg: "#FAEEDA", icon: "📝", sub: "En attente" },
                  { label: "Vacations à valider",  val: stats?.kpis?.vacations_attente || 0,     color: "#185FA5", bg: "#E6F1FB", icon: "💰", sub: "En attente visa" },
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
                    <div style={{ height: "4px", background: brd, borderRadius: "2px", marginTop: "12px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min((kpi.val / 10) * 100, 100)}%`, background: kpi.color, borderRadius: "2px" }}/>
                    </div>
                  </div>
                ))}
              </div>

              {/* Séances + Alertes */}
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "12px", marginBottom: "1.25rem" }}>

                {/* Tableau séances */}
                <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>Séances du jour</p>
                    <span style={{ fontSize: "11px", color: "#1D9E75", cursor: "pointer" }}>Voir tout →</span>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ borderBottom: `0.5px solid ${brd}` }}>
                        {["Heure", "Matière", "Classe", "Enseignant", "Statut"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "6px 0", color: txt2, fontWeight: "400", fontSize: "11px" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.seances_du_jour?.length > 0 ? (
                        stats.seances_du_jour.slice(0, 6).map((s, i) => (
                          <tr key={i} style={{ borderBottom: `0.5px solid ${brd}` }}>
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
                <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1rem" }}>
                  <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: "0 0 12px" }}>
                    🚨 Alertes en temps réel
                  </p>
                  {stats?.kpis?.retards > 0 && (
                    <div style={{ background: "#FCEBEB", padding: "10px 12px", borderLeft: "3px solid #E24B4A", borderRadius: "0 8px 8px 0", marginBottom: "10px" }}>
                      <p style={{ fontSize: "12px", color: "#791F1F", margin: "0 0 2px", fontWeight: "500" }}>
                        🚨 {stats.kpis.retards} retard(s) signalé(s)
                      </p>
                      <p style={{ fontSize: "11px", color: "#A32D2D", margin: 0 }}>Action requise</p>
                    </div>
                  )}
                  {stats?.kpis?.cahiers_non_signes > 0 && (
                    <div style={{ background: "#FAEEDA", padding: "10px 12px", borderLeft: "3px solid #BA7517", borderRadius: "0 8px 8px 0", marginBottom: "10px" }}>
                      <p style={{ fontSize: "12px", color: "#633806", margin: "0 0 2px", fontWeight: "500" }}>
                        📝 {stats.kpis.cahiers_non_signes} cahier(s) non signé(s)
                      </p>
                      <p style={{ fontSize: "11px", color: "#854F0B", margin: 0 }}>À vérifier</p>
                    </div>
                  )}
                  {stats?.kpis?.vacations_attente > 0 && (
                    <div style={{ background: "#E6F1FB", padding: "10px 12px", borderLeft: "3px solid #185FA5", borderRadius: "0 8px 8px 0", marginBottom: "10px" }}>
                      <p style={{ fontSize: "12px", color: "#0C447C", margin: "0 0 2px", fontWeight: "500" }}>
                        💰 {stats.kpis.vacations_attente} vacation(s) à valider
                      </p>
                      <p style={{ fontSize: "11px", color: "#185FA5", margin: 0 }}>En attente de visa</p>
                    </div>
                  )}
                  {(!stats?.kpis?.retards && !stats?.kpis?.cahiers_non_signes && !stats?.kpis?.vacations_attente) && (
                    <div style={{ background: "#E1F5EE", padding: "10px 12px", borderLeft: "3px solid #0F6E56", borderRadius: "0 8px 8px 0" }}>
                      <p style={{ fontSize: "12px", color: "#085041", margin: 0, fontWeight: "500" }}>✅ Tout est en ordre</p>
                    </div>
                  )}

                  {/* Actions rapides */}
                  <p style={{ fontSize: "12px", fontWeight: "500", color: txt, margin: "16px 0 8px" }}>Actions rapides</p>
                  {[
                    { label: "Vérifier cahiers",    id: "cahiers",   color: "#FAEEDA", txt: "#633806" },
                    { label: "Valider vacations",   id: "vacations", color: "#E6F1FB", txt: "#0C447C" },
                    { label: "Générer rapport",     id: "rapports",  color: "#E1F5EE", txt: "#085041" },
                  ].map(btn => (
                    <div key={btn.label} onClick={() => setOngletActif(btn.id)} style={{
                      background: btn.color, color: btn.txt, padding: "8px 12px",
                      borderRadius: "8px", fontSize: "12px", cursor: "pointer",
                      marginBottom: "6px", fontWeight: "500",
                      display: "flex", justifyContent: "space-between"
                    }}>
                      <span>{btn.label}</span>
                      <span>→</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {ongletActif === "cahiers" && (
            <div>
              <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1.25rem" }}>
                <p style={{ fontSize: "15px", fontWeight: "500", color: txt, margin: "0 0 16px" }}>
                  📝 Cahiers de texte à vérifier
                </p>
                <div style={{ background: bg3, borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ fontSize: "20px" }}>ℹ️</span>
                  <p style={{ fontSize: "13px", color: txt2, margin: 0 }}>
                    En tant que surveillant, vous pouvez consulter les cahiers en lecture seule et signaler les anomalies.
                  </p>
                </div>
                <div style={{ textAlign: "center", padding: "3rem" }}>
                  <p style={{ fontSize: "48px" }}>📝</p>
                  <p style={{ fontSize: "14px", fontWeight: "500", color: txt, margin: "0 0 8px" }}>Accéder aux cahiers</p>
                  <button onClick={() => navigate("/cahiers")} style={{
                    padding: "10px 20px", background: "#0F6E56", color: "#fff",
                    border: "none", borderRadius: "8px", fontSize: "13px",
                    cursor: "pointer", fontWeight: "500"
                  }}>Voir tous les cahiers →</button>
                </div>
              </div>
            </div>
          )}

          {ongletActif === "vacations" && (
            <div>
              <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1.25rem" }}>
                <p style={{ fontSize: "15px", fontWeight: "500", color: txt, margin: "0 0 16px" }}>
                  💰 Fiches de vacation à valider
                </p>
                <div style={{ background: "#FAEEDA", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ fontSize: "20px" }}>⚠️</span>
                  <p style={{ fontSize: "13px", color: "#633806", margin: 0 }}>
                    {stats?.kpis?.vacations_attente || 0} fiche(s) en attente de votre visa de contrôle.
                  </p>
                </div>
                <div style={{ textAlign: "center", padding: "3rem" }}>
                  <p style={{ fontSize: "48px" }}>💰</p>
                  <p style={{ fontSize: "14px", fontWeight: "500", color: txt, margin: "0 0 8px" }}>Valider les fiches</p>
                  <button onClick={() => navigate("/vacations")} style={{
                    padding: "10px 20px", background: "#0F6E56", color: "#fff",
                    border: "none", borderRadius: "8px", fontSize: "13px",
                    cursor: "pointer", fontWeight: "500"
                  }}>Voir les fiches vacation →</button>
                </div>
              </div>
            </div>
          )}

       {ongletActif === "rapports" && (
            <div>
            <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1.25rem" }}>
            <p style={{ fontSize: "15px", fontWeight: "500", color: txt, margin: "0 0 16px" }}>
                📊 Génération de rapports
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {[
                  { icon: "📊", title: "Rapport de présence",   desc: "Taux de présence par classe et par semaine", color: "#E1F5EE", txt: "#085041" },
                  { icon: "📝", title: "Rapport des cahiers",   desc: "État des cahiers de texte par matière",      color: "#EEEDFE", txt: "#3C3489" },
                  { icon: "💰", title: "Rapport des vacations", desc: "Récapitulatif des paiements du mois",        color: "#FAEEDA", txt: "#633806" },
                ].map((r, i) => (
                  <div key={i} style={{ background: r.color, borderRadius: "12px", padding: "1.25rem" }}>
                    <p style={{ fontSize: "32px", margin: "0 0 12px" }}>{r.icon}</p>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: r.txt, margin: "0 0 6px" }}>{r.title}</p>
                    <p style={{ fontSize: "12px", color: r.txt, margin: "0 0 16px", opacity: 0.8 }}>{r.desc}</p>
                    <button onClick={() => navigate("/rapports")} style={{
                      width: "100%", padding: "8px", background: "rgba(0,0,0,0.1)",
                      color: r.txt, border: "none", borderRadius: "8px",
                      fontSize: "12px", cursor: "pointer", fontWeight: "500"
                    }}>Générer →</button>
              </div>
                ))}
              </div>
              <div style={{ marginTop: "16px", background: bg3, borderRadius: "10px", padding: "12px 16px", display: "flex", gap: "10px", alignItems: "center" }}>
                <span>💡</span>
                <p style={{ fontSize: "12px", color: txt2, margin: 0 }}>
                  Cliquez sur "Générer →" pour accéder à la page complète des rapports avec export PDF et Excel.
                </p>
              </div>
            </div>
          </div>
         )}
        </div>
      </div>
    </div>
  );
}