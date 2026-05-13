import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = "http://localhost/eduschedulepro/backend/api";

export default function DashboardSurveillantPage() {
  const { utilisateur, token, deconnecter } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]             = useState(null);
  const [dark, setDark]               = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ongletActif, setOngletActif] = useState("apercu");

  const bg     = dark ? "#0d1117" : "#f0faf6";
  const bg2    = dark ? "#161b22" : "#ffffff";
  const bg3    = dark ? "#21262d" : "#e8f5ee";
  const txt    = dark ? "#e6edf3" : "#04342C";
  const txt2   = dark ? "#8b949e" : "#5F5E5A";
  const brd    = dark ? "rgba(255,255,255,0.08)" : "rgba(4,52,44,0.08)";
  const shadow = dark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 12px rgba(4,52,44,0.06)";

  useEffect(() => {
    axios.get(`${API}/dashboard.php`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.data.succes) setStats(res.data.data); })
      .catch(console.error);
  }, [token]);

  const handleLogout = () => { deconnecter(); navigate("/login"); };

  const menuItems = [
    { label: "Aperçu",              icon: "⊞",  id: "apercu" },
    { label: "Cahiers à vérifier",  icon: "📝",  id: "cahiers" },
    { label: "Fiches à valider",    icon: "💰",  id: "vacations" },
    { label: "Rapports",            icon: "📊",  id: "rapports" },
  ];

  const badge = (statut) => {
    const cfg = {
      pointee: { bg: "#E1F5EE", color: "#085041", label: "Pointée" },
      retard:  { bg: "#FAEEDA", color: "#633806", label: "Retard" },
      absent:  { bg: "#FCEBEB", color: "#791F1F", label: "Absent" },
      a_venir: { bg: "#F1EFE8", color: "#5F5E5A", label: "À venir" },
    };
    const c = cfg[statut] || cfg.a_venir;
    return <span style={{ background: c.bg, color: c.color, fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>{c.label}</span>;
  };

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
            <div style={{ background: "rgba(24,95,165,0.2)", border: "1px solid rgba(24,95,165,0.4)", color: "#7BB8F5", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "600", textAlign: "center", letterSpacing: "0.5px" }}>
              👁️ SURVEILLANT GÉNÉRAL
            </div>
          </div>
        )}

        <div style={{ flex: 1, padding: "12px 8px" }}>
          {menuItems.map(item => (
            <div key={item.id} onClick={() => setOngletActif(item.id)} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: sidebarOpen ? "10px 12px" : "10px", borderRadius: "10px", cursor: "pointer", marginBottom: "2px",
              background: ongletActif === item.id ? "linear-gradient(135deg, rgba(29,158,117,0.25), rgba(15,110,86,0.15))" : "transparent",
              border: ongletActif === item.id ? "1px solid rgba(29,158,117,0.3)" : "1px solid transparent",
            }}>
              <span style={{ fontSize: "17px", flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ color: ongletActif === item.id ? "#E1F5EE" : "#9FE1CB", fontSize: "13px", fontWeight: ongletActif === item.id ? "600" : "400", whiteSpace: "nowrap" }}>{item.label}</span>}
              {sidebarOpen && ongletActif === item.id && <div style={{ marginLeft: "auto", width: "4px", height: "16px", background: "#1D9E75", borderRadius: "2px" }}/>}
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
            <div onClick={() => setDark(!dark)} style={{ width: "38px", height: "38px", background: bg3, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", border: `1px solid ${brd}` }}>
              {dark ? "☀️" : "🌙"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: bg3, padding: "6px 12px 6px 6px", borderRadius: "12px", border: `1px solid ${brd}` }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #2874D6, #185FA5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: "700" }}>
                {utilisateur?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: "600", color: txt }}>Surveillant</p>
                <p style={{ margin: 0, fontSize: "10px", color: txt2 }}>{utilisateur?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} style={{ background: "#FCEBEB", color: "#791F1F", border: "1px solid #F09595", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
              Déconnexion
            </button>
          </div>
        </div>

        {/* CONTENU */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>

          {/* ===== APERÇU ===== */}
          {ongletActif === "apercu" && (
            <div>
              {/* KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "1.5rem" }}>
                {[
                  { label: "Séances aujourd'hui", val: stats?.kpis?.seances_jour || 0,       color: "#0F6E56", bg: "#E1F5EE", icon: "📅", sub: `${stats?.kpis?.pointages_jour || 0} pointées` },
                  { label: "Alertes actives",      val: stats?.kpis?.retards || 0,            color: "#E24B4A", bg: "#FCEBEB", icon: "🚨", sub: "À surveiller" },
                  { label: "Cahiers non signés",   val: stats?.kpis?.cahiers_non_signes || 0, color: "#BA7517", bg: "#FAEEDA", icon: "📝", sub: "En attente" },
                  { label: "Vacations à valider",  val: stats?.kpis?.vacations_attente || 0,  color: "#185FA5", bg: "#E6F1FB", icon: "💰", sub: "En attente visa" },
                ].map((kpi, i) => (
                  <div key={i} style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.1rem", boxShadow: shadow }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <p style={{ fontSize: "11px", color: txt2, margin: "0 0 6px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>{kpi.label}</p>
                        <p style={{ fontSize: "30px", fontWeight: "700", margin: "0 0 4px", color: kpi.color, lineHeight: 1 }}>{kpi.val}</p>
                        <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>{kpi.sub}</p>
                      </div>
                      <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{kpi.icon}</div>
                    </div>
                    <div style={{ height: "5px", background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min((kpi.val / 10) * 100, 100)}%`, background: `linear-gradient(90deg, ${kpi.color}99, ${kpi.color})`, borderRadius: "3px" }}/>
                    </div>
                  </div>
                ))}
              </div>

              {/* Séances + Alertes */}
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "14px" }}>

                {/* Tableau séances */}
                <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.25rem", boxShadow: shadow }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: 0 }}>📅 Séances du jour</p>
                    <span style={{ fontSize: "11px", color: "#1D9E75", cursor: "pointer", fontWeight: "500" }}>Voir tout →</span>
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
                            <td style={{ padding: "9px 6px", color: txt, fontWeight: "600" }}>{s.heure_debut?.slice(0,5)}</td>
                            <td style={{ padding: "9px 6px", color: txt }}>{s.matiere}</td>
                            <td style={{ padding: "9px 6px", color: txt2 }}>{s.classe?.split(" ").slice(0,2).join(" ")}</td>
                            <td style={{ padding: "9px 6px", color: txt2 }}>{s.enseignant?.split(" ").slice(-1)[0]}</td>
                            <td style={{ padding: "9px 6px" }}>{badge(s.statut_seance)}</td>
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

                  {stats?.kpis?.retards > 0 && (
                    <div style={{ background: "#FCEBEB", padding: "10px 12px", borderLeft: "4px solid #E24B4A", borderRadius: "0 8px 8px 0", marginBottom: "8px" }}>
                      <p style={{ fontSize: "12px", color: "#791F1F", margin: "0 0 2px", fontWeight: "700" }}>🚨 {stats.kpis.retards} retard(s)</p>
                      <p style={{ fontSize: "11px", color: "#A32D2D", margin: 0 }}>Action requise immédiatement</p>
                    </div>
                  )}
                  {stats?.kpis?.cahiers_non_signes > 0 && (
                    <div style={{ background: "#FAEEDA", padding: "10px 12px", borderLeft: "4px solid #BA7517", borderRadius: "0 8px 8px 0", marginBottom: "8px" }}>
                      <p style={{ fontSize: "12px", color: "#633806", margin: "0 0 2px", fontWeight: "700" }}>📝 {stats.kpis.cahiers_non_signes} cahier(s) non signé(s)</p>
                      <p style={{ fontSize: "11px", color: "#854F0B", margin: 0 }}>À vérifier</p>
                    </div>
                  )}
                  {stats?.kpis?.vacations_attente > 0 && (
                    <div style={{ background: "#E6F1FB", padding: "10px 12px", borderLeft: "4px solid #185FA5", borderRadius: "0 8px 8px 0", marginBottom: "8px" }}>
                      <p style={{ fontSize: "12px", color: "#0C447C", margin: "0 0 2px", fontWeight: "700" }}>💰 {stats.kpis.vacations_attente} vacation(s) à valider</p>
                      <p style={{ fontSize: "11px", color: "#185FA5", margin: 0 }}>En attente de visa</p>
                    </div>
                  )}
                  {(!stats?.kpis?.retards && !stats?.kpis?.cahiers_non_signes && !stats?.kpis?.vacations_attente) && (
                    <div style={{ background: "#E1F5EE", padding: "10px 12px", borderLeft: "4px solid #0F6E56", borderRadius: "0 8px 8px 0", marginBottom: "8px" }}>
                      <p style={{ fontSize: "12px", color: "#085041", margin: 0, fontWeight: "700" }}>✅ Tout est en ordre</p>
                    </div>
                  )}

                  <p style={{ fontSize: "11px", fontWeight: "600", color: txt, margin: "16px 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Actions rapides</p>
                  {[
                    { label: "📝 Vérifier cahiers",  id: "cahiers",   color: "#FAEEDA", txt: "#633806", border: "#E8C97A" },
                    { label: "💰 Valider vacations", id: "vacations", color: "#E6F1FB", txt: "#0C447C", border: "#A8CBF0" },
                    { label: "📊 Générer rapport",   id: "rapports",  color: "#E1F5EE", txt: "#085041", border: "#9FE1CB" },
                  ].map(btn => (
                    <div key={btn.label} onClick={() => setOngletActif(btn.id)} style={{
                      background: btn.color, color: btn.txt, border: `1px solid ${btn.border}`,
                      padding: "9px 12px", borderRadius: "8px", fontSize: "12px",
                      cursor: "pointer", marginBottom: "6px", fontWeight: "500",
                      display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                      <span>{btn.label}</span>
                      <span>→</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== CAHIERS ===== */}
          {ongletActif === "cahiers" && (
            <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.5rem", boxShadow: shadow }}>
              <p style={{ fontSize: "16px", fontWeight: "700", color: txt, margin: "0 0 16px" }}>📝 Cahiers de texte à vérifier</p>
              <div style={{ background: bg3, borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", display: "flex", gap: "12px", alignItems: "center", border: `1px solid ${brd}` }}>
                <span style={{ fontSize: "20px" }}>ℹ️</span>
                <p style={{ fontSize: "13px", color: txt2, margin: 0 }}>En tant que surveillant, vous pouvez consulter les cahiers en lecture seule et signaler les anomalies.</p>
              </div>
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <p style={{ fontSize: "56px", margin: "0 0 16px" }}>📝</p>
                <p style={{ fontSize: "15px", fontWeight: "700", color: txt, margin: "0 0 8px" }}>Accéder aux cahiers</p>
                <p style={{ fontSize: "13px", color: txt2, margin: "0 0 20px" }}>{stats?.kpis?.cahiers_non_signes || 0} cahier(s) en attente de vérification</p>
                <button onClick={() => navigate("/cahiers")} style={{ padding: "11px 24px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "700", boxShadow: "0 3px 10px rgba(15,110,86,0.3)" }}>
                  Voir tous les cahiers →
                </button>
              </div>
            </div>
          )}

          {/* ===== VACATIONS ===== */}
          {ongletActif === "vacations" && (
            <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.5rem", boxShadow: shadow }}>
              <p style={{ fontSize: "16px", fontWeight: "700", color: txt, margin: "0 0 16px" }}>💰 Fiches de vacation à valider</p>
              <div style={{ background: "#FAEEDA", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", display: "flex", gap: "12px", alignItems: "center", border: "1px solid #E8C97A" }}>
                <span style={{ fontSize: "20px" }}>⚠️</span>
                <p style={{ fontSize: "13px", color: "#633806", margin: 0, fontWeight: "500" }}>
                  {stats?.kpis?.vacations_attente || 0} fiche(s) en attente de votre visa de contrôle.
                </p>
              </div>
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <p style={{ fontSize: "56px", margin: "0 0 16px" }}>💰</p>
                <p style={{ fontSize: "15px", fontWeight: "700", color: txt, margin: "0 0 8px" }}>Valider les fiches</p>
                <p style={{ fontSize: "13px", color: txt2, margin: "0 0 20px" }}>Votre visa est requis pour valider le paiement des enseignants</p>
                <button onClick={() => navigate("/vacations")} style={{ padding: "11px 24px", background: "linear-gradient(135deg, #2874D6, #185FA5)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "700", boxShadow: "0 3px 10px rgba(24,95,165,0.3)" }}>
                  Voir les fiches vacation →
                </button>
              </div>
            </div>
          )}

          {/* ===== RAPPORTS ===== */}
          {ongletActif === "rapports" && (
            <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.5rem", boxShadow: shadow }}>
              <p style={{ fontSize: "16px", fontWeight: "700", color: txt, margin: "0 0 16px" }}>📊 Génération de rapports</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "16px" }}>
                {[
                  { icon: "📊", title: "Rapport de présence",   desc: "Taux de présence par classe et par semaine", color: "#E1F5EE", txt: "#085041", border: "#9FE1CB" },
                  { icon: "📝", title: "Rapport des cahiers",   desc: "État des cahiers de texte par matière",      color: "#EEEDFE", txt: "#3C3489", border: "#CECBF6" },
                  { icon: "💰", title: "Rapport des vacations", desc: "Récapitulatif des paiements du mois",        color: "#FAEEDA", txt: "#633806", border: "#E8C97A" },
                ].map((r, i) => (
                  <div key={i} style={{ background: r.color, borderRadius: "14px", padding: "1.25rem", border: `1px solid ${r.border}` }}>
                    <p style={{ fontSize: "36px", margin: "0 0 12px" }}>{r.icon}</p>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: r.txt, margin: "0 0 6px" }}>{r.title}</p>
                    <p style={{ fontSize: "12px", color: r.txt, margin: "0 0 16px", opacity: 0.8, lineHeight: 1.4 }}>{r.desc}</p>
                    <button onClick={() => navigate("/rapports")} style={{ width: "100%", padding: "9px", background: "rgba(0,0,0,0.08)", color: r.txt, border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
                      Générer →
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ background: bg3, borderRadius: "10px", padding: "12px 16px", display: "flex", gap: "10px", alignItems: "center", border: `1px solid ${brd}` }}>
                <span>💡</span>
                <p style={{ fontSize: "12px", color: txt2, margin: 0 }}>Cliquez sur "Générer →" pour accéder à la page complète des rapports avec export PDF et Excel.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
