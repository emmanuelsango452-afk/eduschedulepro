import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = "http://localhost/eduschedulepro/backend/api";

export default function DashboardComptablePage() {
  const { utilisateur, token, deconnecter } = useAuth();
  const navigate = useNavigate();
  const [vacations, setVacations]     = useState([]);
  const [selected, setSelected]       = useState(null);
  const [dark, setDark]               = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading]         = useState(true);
  const [ongletActif, setOngletActif] = useState("attente");
  const [message, setMessage]         = useState("");

  const bg     = dark ? "#0d1117" : "#f0faf6";
  const bg2    = dark ? "#161b22" : "#ffffff";
  const bg3    = dark ? "#21262d" : "#e8f5ee";
  const txt    = dark ? "#e6edf3" : "#04342C";
  const txt2   = dark ? "#8b949e" : "#5F5E5A";
  const brd    = dark ? "rgba(255,255,255,0.08)" : "rgba(4,52,44,0.08)";
  const shadow = dark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 12px rgba(4,52,44,0.06)";

  useEffect(() => {
    axios.get(`${API}/vacations.php`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.data.succes) setVacations(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const handleLogout  = () => { deconnecter(); navigate("/login"); };
  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };

  const handleApprouver = async (id) => {
    try {
      await axios.post(`${API}/vacations.php?action=approuver&id=${id}`, { commentaire: "Approuvé par le comptable" }, { headers: { Authorization: `Bearer ${token}` } });
      setVacations(prev => prev.map(v => v.id === id ? { ...v, statut: "approuvee_comptable" } : v));
      setSelected(null);
      showMsg("✅ Fiche approuvée !");
    } catch { showMsg("❌ Erreur lors de l'approbation"); }
  };

  const mois = ["","Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

  const getStatut = (statut) => {
    const cfg = {
      generee:             { bg: "#F1EFE8", color: "#5F5E5A", label: "Générée",           icon: "📄" },
      signee_enseignant:   { bg: "#FAEEDA", color: "#633806", label: "Signée enseignant", icon: "✍️" },
      validee_surveillant: { bg: "#EEEDFE", color: "#3C3489", label: "Validée",           icon: "👁️" },
      approuvee_comptable: { bg: "#E1F5EE", color: "#085041", label: "Approuvée",         icon: "✅" },
    };
    return cfg[statut] || cfg.generee;
  };

  const vacationsAttente    = vacations.filter(v => v.statut === "validee_surveillant");
  const vacationsApprouvees = vacations.filter(v => v.statut === "approuvee_comptable");
  const totalAPayer         = vacationsAttente.reduce((sum, v) => sum + parseFloat(v.montant_net || 0), 0);
  const totalPaye           = vacationsApprouvees.reduce((sum, v) => sum + parseFloat(v.montant_net || 0), 0);

  const menuItems = [
    { label: "En attente",   icon: "⏳", id: "attente",    badge: vacationsAttente.length },
    { label: "Approuvées",   icon: "✅", id: "approuvees", badge: null },
    { label: "Statistiques", icon: "📊", id: "stats",      badge: null },
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
            <div style={{ background: "rgba(186,117,23,0.2)", border: "1px solid rgba(186,117,23,0.4)", color: "#F5C96A", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "600", textAlign: "center", letterSpacing: "0.5px" }}>
              💰 RESPONSABLE COMPTABLE
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
              {sidebarOpen && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                  <span style={{ color: ongletActif === item.id ? "#E1F5EE" : "#9FE1CB", fontSize: "13px", fontWeight: ongletActif === item.id ? "600" : "400", whiteSpace: "nowrap" }}>{item.label}</span>
                  {item.badge > 0 && (
                    <span style={{ background: "#E24B4A", color: "#fff", fontSize: "10px", padding: "2px 7px", borderRadius: "10px", fontWeight: "700" }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
              {sidebarOpen && ongletActif === item.id && <div style={{ marginLeft: "auto", width: "4px", height: "16px", background: "#1D9E75", borderRadius: "2px", flexShrink: 0 }}/>}
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
            {message && (
              <div style={{ padding: "7px 14px", background: message.includes("✅") ? "#E1F5EE" : "#FCEBEB", color: message.includes("✅") ? "#085041" : "#791F1F", borderRadius: "8px", fontSize: "12px", fontWeight: "600", boxShadow: shadow }}>
                {message}
              </div>
            )}
            <div onClick={() => setDark(!dark)} style={{ width: "38px", height: "38px", background: bg3, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", border: `1px solid ${brd}` }}>
              {dark ? "☀️" : "🌙"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: bg3, padding: "6px 12px 6px 6px", borderRadius: "12px", border: `1px solid ${brd}` }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #D4920A, #BA7517)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: "700" }}>
                {utilisateur?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: "600", color: txt }}>Comptable</p>
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

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "1.5rem" }}>
            {[
              { label: "En attente",      val: vacationsAttente.length,    color: "#BA7517", bg: "#FAEEDA", icon: "⏳", sub: "à approuver" },
              { label: "Approuvées",      val: vacationsApprouvees.length, color: "#0F6E56", bg: "#E1F5EE", icon: "✅", sub: "ce mois" },
              { label: "Montant à payer", val: `${totalAPayer.toLocaleString("fr-FR")} F`, color: "#E24B4A", bg: "#FCEBEB", icon: "💸", sub: "FCFA" },
              { label: "Total payé",      val: `${totalPaye.toLocaleString("fr-FR")} F`,   color: "#0F6E56", bg: "#E1F5EE", icon: "💰", sub: "FCFA" },
            ].map((kpi, i) => (
              <div key={i} style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.1rem", boxShadow: shadow }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <p style={{ fontSize: "11px", color: txt2, margin: "0 0 6px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>{kpi.label}</p>
                    <p style={{ fontSize: i < 2 ? "30px" : "18px", fontWeight: "700", margin: "0 0 4px", color: kpi.color, lineHeight: 1 }}>{kpi.val}</p>
                    <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>{kpi.sub}</p>
                  </div>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{kpi.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ===== EN ATTENTE ===== */}
          {ongletActif === "attente" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

              {/* Liste */}
              <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, overflow: "hidden", boxShadow: shadow }}>
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${brd}`, background: "#FAEEDA", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: "13px", fontWeight: "700", color: "#633806", margin: 0 }}>⏳ En attente d'approbation</p>
                  <span style={{ background: "#BA7517", color: "#fff", fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "700" }}>{vacationsAttente.length}</span>
                </div>
                <div style={{ padding: "8px" }}>
                  {loading ? (
                    <p style={{ color: txt2, textAlign: "center", padding: "2rem", fontSize: "13px" }}>Chargement...</p>
                  ) : vacationsAttente.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                      <p style={{ fontSize: "40px", margin: "0 0 12px" }}>🎉</p>
                      <p style={{ color: txt2, fontSize: "13px" }}>Aucune fiche en attente</p>
                    </div>
                  ) : vacationsAttente.map((v, i) => {
                    const isSelected = selected?.id === v.id;
                    return (
                      <div key={i} onClick={() => setSelected(v)} style={{
                        background: isSelected ? "#FAEEDA" : "transparent",
                        borderRadius: "10px",
                        border: `1px solid ${isSelected ? "#BA7517" : "transparent"}`,
                        borderLeft: `4px solid ${isSelected ? "#BA7517" : "transparent"}`,
                        padding: "12px", marginBottom: "4px", cursor: "pointer", transition: "all 0.2s"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: 0 }}>{v.enseignant_nom}</p>
                          <span style={{ fontSize: "10px", background: "#EEEDFE", color: "#3C3489", padding: "2px 8px", borderRadius: "20px", fontWeight: "600" }}>👁️ Validée</span>
                        </div>
                        <p style={{ fontSize: "12px", color: txt2, margin: "0 0 6px" }}>{mois[v.mois]} {v.annee}</p>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "11px", color: txt2 }}>{v.matricule}</span>
                          <span style={{ fontSize: "13px", fontWeight: "700", color: "#0F6E56" }}>{parseFloat(v.montant_net || 0).toLocaleString("fr-FR")} FCFA</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Détail */}
              <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, overflow: "hidden", boxShadow: shadow }}>
                {!selected ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "3rem" }}>
                    <p style={{ fontSize: "56px", margin: "0 0 16px" }}>💰</p>
                    <p style={{ fontSize: "15px", fontWeight: "700", color: txt, margin: "0 0 8px" }}>Sélectionnez une fiche</p>
                    <p style={{ fontSize: "13px", color: txt2 }}>Cliquez sur une fiche pour voir les détails</p>
                  </div>
                ) : (
                  <>
                    <div style={{ padding: "14px 18px", borderBottom: `1px solid ${brd}`, background: "#E1F5EE", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontSize: "13px", fontWeight: "700", color: "#085041", margin: 0 }}>📋 {selected.enseignant_nom}</p>
                      <span style={{ fontSize: "12px", color: txt2 }}>{mois[selected.mois]} {selected.annee}</span>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      {/* Montants */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
                        {[
                          { label: "Brut",     val: `${parseFloat(selected.montant_brut || 0).toLocaleString("fr-FR")} F`, color: "#0F6E56", bg: "#E1F5EE", border: "#9FE1CB" },
                          { label: "Retenues", val: `${parseFloat(selected.retenues || 0).toLocaleString("fr-FR")} F`,    color: "#E24B4A", bg: "#FCEBEB", border: "#F09595" },
                          { label: "Net",      val: `${parseFloat(selected.montant_net || 0).toLocaleString("fr-FR")} F`, color: "#0F6E56", bg: "#E1F5EE", border: "#9FE1CB" },
                        ].map(item => (
                          <div key={item.label} style={{ background: item.bg, borderRadius: "10px", padding: "12px", textAlign: "center", border: `1px solid ${item.border}` }}>
                            <p style={{ fontSize: "11px", color: item.color, margin: "0 0 6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</p>
                            <p style={{ fontSize: "15px", fontWeight: "700", color: item.color, margin: 0 }}>{item.val}</p>
                          </div>
                        ))}
                      </div>

                      {/* Infos */}
                      <div style={{ background: bg3, borderRadius: "10px", padding: "12px", marginBottom: "16px", border: `1px solid ${brd}` }}>
                        {[
                          { label: "Enseignant",   val: selected.enseignant_nom },
                          { label: "Matricule",    val: selected.matricule },
                          { label: "Période",      val: `${mois[selected.mois]} ${selected.annee}` },
                          { label: "Taux horaire", val: `${parseFloat(selected.taux_horaire || 0).toLocaleString("fr-FR")} FCFA/h` },
                        ].map(item => (
                          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${brd}` }}>
                            <span style={{ fontSize: "12px", color: txt2 }}>{item.label}</span>
                            <span style={{ fontSize: "12px", fontWeight: "600", color: txt }}>{item.val}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => handleApprouver(selected.id)} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 3px 10px rgba(15,110,86,0.3)" }}>
                          ✅ Approuver le paiement
                        </button>
                        <button style={{ padding: "12px 16px", background: "#E1F5EE", color: "#085041", border: "1px solid #9FE1CB", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}>
                          📄 PDF
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ===== APPROUVÉES ===== */}
          {ongletActif === "approuvees" && (
            <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, overflow: "hidden", boxShadow: shadow }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${brd}`, background: "#E1F5EE", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "13px", fontWeight: "700", color: "#085041", margin: 0 }}>✅ Fiches approuvées</p>
                <span style={{ background: "#0F6E56", color: "#fff", fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "700" }}>{vacationsApprouvees.length}</span>
              </div>
              <div style={{ padding: "1rem" }}>
                {vacationsApprouvees.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem" }}>
                    <p style={{ fontSize: "40px", margin: "0 0 12px" }}>📋</p>
                    <p style={{ color: txt2, fontSize: "13px" }}>Aucune fiche approuvée</p>
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr>
                        {["Enseignant", "Matricule", "Période", "Montant net", "Statut"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "10px 8px", color: txt2, fontWeight: "600", fontSize: "11px", borderBottom: `1px solid ${brd}`, textTransform: "uppercase", letterSpacing: "0.4px" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {vacationsApprouvees.map((v, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${brd}` }}>
                          <td style={{ padding: "11px 8px", color: txt, fontWeight: "600" }}>{v.enseignant_nom}</td>
                          <td style={{ padding: "11px 8px", color: txt2, fontFamily: "monospace" }}>{v.matricule}</td>
                          <td style={{ padding: "11px 8px", color: txt2 }}>{mois[v.mois]} {v.annee}</td>
                          <td style={{ padding: "11px 8px", color: "#0F6E56", fontWeight: "700" }}>{parseFloat(v.montant_net || 0).toLocaleString("fr-FR")} FCFA</td>
                          <td style={{ padding: "11px 8px" }}>
                            <span style={{ background: "#E1F5EE", color: "#085041", fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>✅ Approuvée</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ===== STATS ===== */}
          {ongletActif === "stats" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px", marginBottom: "1.5rem" }}>
                {[
                  { icon: "💰", title: "Total à payer ce mois",   val: `${totalAPayer.toLocaleString("fr-FR")} FCFA`,  color: "#E24B4A", bg: "#FCEBEB", border: "#F09595" },
                  { icon: "✅", title: "Total déjà approuvé",     val: `${totalPaye.toLocaleString("fr-FR")} FCFA`,    color: "#0F6E56", bg: "#E1F5EE", border: "#9FE1CB" },
                  { icon: "👨‍🏫", title: "Enseignants vacataires", val: `${new Set(vacations.map(v => v.id_enseignant)).size}`, color: "#534AB7", bg: "#EEEDFE", border: "#CECBF6" },
                  { icon: "📋", title: "Total fiches ce mois",    val: vacations.length,                               color: "#BA7517", bg: "#FAEEDA", border: "#E8C97A" },
                ].map((s, i) => (
                  <div key={i} style={{ background: bg2, borderRadius: "14px", border: `1px solid ${s.border}`, padding: "1.5rem", display: "flex", alignItems: "center", gap: "16px", boxShadow: shadow }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>
                      {s.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: "12px", color: txt2, margin: "0 0 6px", fontWeight: "500" }}>{s.title}</p>
                      <p style={{ fontSize: "22px", fontWeight: "700", color: s.color, margin: 0 }}>{s.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Résumé par enseignant */}
              <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, overflow: "hidden", boxShadow: shadow }}>
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${brd}`, background: bg3 }}>
                  <p style={{ fontSize: "13px", fontWeight: "700", color: txt, margin: 0 }}>📊 Résumé par enseignant</p>
                </div>
                <div style={{ padding: "1rem" }}>
                  {vacations.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                      <p style={{ fontSize: "32px", margin: "0 0 8px" }}>📊</p>
                      <p style={{ color: txt2, fontSize: "13px" }}>Aucune donnée</p>
                    </div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                      <thead>
                        <tr>
                          {["Enseignant", "Nb fiches", "Montant total", "Statut"].map(h => (
                            <th key={h} style={{ textAlign: "left", padding: "10px 8px", color: txt2, fontWeight: "600", fontSize: "11px", borderBottom: `1px solid ${brd}`, textTransform: "uppercase", letterSpacing: "0.4px" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.values(vacations.reduce((acc, v) => {
                          const key = v.enseignant_nom;
                          if (!acc[key]) acc[key] = { nom: key, count: 0, total: 0, statuts: [] };
                          acc[key].count++;
                          acc[key].total += parseFloat(v.montant_net || 0);
                          acc[key].statuts.push(v.statut);
                          return acc;
                        }, {})).map((e, i) => {
                          const toutApprouve = e.statuts.every(s => s === "approuvee_comptable");
                          return (
                            <tr key={i} style={{ borderBottom: `1px solid ${brd}` }}>
                              <td style={{ padding: "11px 8px", color: txt, fontWeight: "600" }}>{e.nom}</td>
                              <td style={{ padding: "11px 8px", color: txt2 }}>{e.count} fiche(s)</td>
                              <td style={{ padding: "11px 8px", color: "#0F6E56", fontWeight: "700" }}>{e.total.toLocaleString("fr-FR")} F</td>
                              <td style={{ padding: "11px 8px" }}>
                                <span style={{ background: toutApprouve ? "#E1F5EE" : "#FAEEDA", color: toutApprouve ? "#085041" : "#633806", fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>
                                  {toutApprouve ? "✅ Tout approuvé" : "⏳ En cours"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
