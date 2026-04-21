import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = "http://localhost/eduschedulepro/backend/api";

export default function DashboardComptablePage() {
  const { utilisateur, token, deconnecter } = useAuth();
  const navigate = useNavigate();
  const [vacations, setVacations]       = useState([]);
  const [selected, setSelected]         = useState(null);
  const [dark, setDark]                 = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [loading, setLoading]           = useState(true);
  const [ongletActif, setOngletActif]   = useState("attente");

  const bg   = dark ? "#0d1117" : "#f0faf6";
  const bg2  = dark ? "#161b22" : "#ffffff";
  const bg3  = dark ? "#21262d" : "#e1f5ee";
  const txt  = dark ? "#e6edf3" : "#04342C";
  const txt2 = dark ? "#8b949e" : "#5F5E5A";
  const brd  = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  useEffect(() => {
    axios.get(`${API}/vacations.php`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.succes) setVacations(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const handleLogout = () => { deconnecter(); navigate("/login"); };

  const handleApprouver = async (id) => {
    try {
      await axios.post(`${API}/vacations.php?action=approuver&id=${id}`,
        { commentaire: "Approuvé par le comptable" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVacations(prev => prev.map(v =>
        v.id === id ? { ...v, statut: "approuvee_comptable" } : v
      ));
      setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  const mois = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const getStatut = (statut) => {
    const cfg = {
      generee:              { bg: "#F1EFE8", color: "#5F5E5A", label: "Générée",           icon: "📄" },
      signee_enseignant:    { bg: "#FAEEDA", color: "#633806", label: "Signée enseignant", icon: "✍️" },
      validee_surveillant:  { bg: "#EEEDFE", color: "#3C3489", label: "Validée",           icon: "👁️" },
      approuvee_comptable:  { bg: "#E1F5EE", color: "#085041", label: "Approuvée",         icon: "✅" },
    };
    return cfg[statut] || cfg.generee;
  };

  const vacationsAttente   = vacations.filter(v => v.statut === "validee_surveillant");
  const vacationsApprouvees = vacations.filter(v => v.statut === "approuvee_comptable");
  const totalAPayer        = vacationsAttente.reduce((sum, v) => sum + parseFloat(v.montant_net || 0), 0);
  const totalPaye          = vacationsApprouvees.reduce((sum, v) => sum + parseFloat(v.montant_net || 0), 0);

  const menuItems = [
    { label: "En attente",   icon: "⏳", id: "attente" },
    { label: "Approuvées",   icon: "✅", id: "approuvees" },
    { label: "Statistiques", icon: "📊", id: "stats" },
  ];

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
            <div style={{ background: "#FAEEDA", color: "#633806", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "500", textAlign: "center" }}>
              💰 Responsable Comptable
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
              {sidebarOpen && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                  <span style={{ color: ongletActif === item.id ? "#E1F5EE" : "#9FE1CB", fontSize: "13px", whiteSpace: "nowrap" }}>{item.label}</span>
                  {item.id === "attente" && vacationsAttente.length > 0 && (
                    <span style={{ background: "#E24B4A", color: "#fff", fontSize: "10px", padding: "1px 6px", borderRadius: "10px" }}>
                      {vacationsAttente.length}
                    </span>
                  )}
                </div>
              )}
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
              Tableau de bord — Comptable
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
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#BA7517", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: "500" }}>
                CP
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: "500", color: txt }}>Comptable</p>
                <p style={{ margin: 0, fontSize: "11px", color: txt2 }}>{utilisateur?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} style={{ background: "#FCEBEB", color: "#791F1F", border: "0.5px solid #F09595", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}>
              Déconnexion
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "1.25rem" }}>
            {[
              { label: "En attente",       val: vacationsAttente.length,    color: "#BA7517", bg: "#FAEEDA", icon: "⏳", sub: "à approuver" },
              { label: "Approuvées",       val: vacationsApprouvees.length, color: "#0F6E56", bg: "#E1F5EE", icon: "✅", sub: "ce mois" },
              { label: "Montant à payer",  val: `${totalAPayer.toLocaleString("fr-FR")} F`, color: "#E24B4A", bg: "#FCEBEB", icon: "💸", sub: "FCFA" },
              { label: "Total payé",       val: `${totalPaye.toLocaleString("fr-FR")} F`,   color: "#0F6E56", bg: "#E1F5EE", icon: "💰", sub: "FCFA" },
            ].map((kpi, i) => (
              <div key={i} style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: txt2, margin: "0 0 8px" }}>{kpi.label}</p>
                    <p style={{ fontSize: "22px", fontWeight: "500", margin: "0 0 4px", color: kpi.color }}>{kpi.val}</p>
                    <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>{kpi.sub}</p>
                  </div>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{kpi.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Onglet En attente */}
          {ongletActif === "attente" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

              {/* Liste fiches en attente */}
              <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, overflow: "hidden" }}>
                <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${brd}`, background: "#FAEEDA" }}>
                  <p style={{ fontSize: "13px", fontWeight: "500", color: "#633806", margin: 0 }}>
                    ⏳ Fiches en attente d'approbation ({vacationsAttente.length})
                  </p>
                </div>
                <div style={{ padding: "8px" }}>
                  {loading ? (
                    <p style={{ color: txt2, textAlign: "center", padding: "2rem", fontSize: "13px" }}>Chargement...</p>
                  ) : vacationsAttente.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                      <p style={{ fontSize: "32px" }}>🎉</p>
                      <p style={{ color: txt2, fontSize: "13px" }}>Aucune fiche en attente</p>
                    </div>
                  ) : (
                    vacationsAttente.map((v, i) => (
                      <div key={i} onClick={() => setSelected(v)} style={{
                        background: selected?.id === v.id ? "#FAEEDA" : "transparent",
                        borderRadius: "10px",
                        border: `0.5px solid ${selected?.id === v.id ? "#BA7517" : "transparent"}`,
                        borderLeft: `3px solid ${selected?.id === v.id ? "#BA7517" : "transparent"}`,
                        padding: "12px", marginBottom: "4px", cursor: "pointer"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>{v.enseignant_nom}</p>
                          <span style={{ fontSize: "10px", background: "#FAEEDA", color: "#633806", padding: "2px 7px", borderRadius: "20px", fontWeight: "500" }}>
                            👁️ Validée surveillant
                          </span>
                        </div>
                        <p style={{ fontSize: "12px", color: txt2, margin: "0 0 6px" }}>{mois[v.mois]} {v.annee}</p>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "12px", color: txt2 }}>{v.matricule}</span>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#0F6E56" }}>
                            {parseFloat(v.montant_net || 0).toLocaleString("fr-FR")} FCFA
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Détail fiche sélectionnée */}
              <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, overflow: "hidden" }}>
                {!selected ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "2rem" }}>
                    <p style={{ fontSize: "48px", margin: "0 0 16px" }}>💰</p>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: txt, margin: "0 0 8px" }}>Sélectionnez une fiche</p>
                    <p style={{ fontSize: "13px", color: txt2 }}>Cliquez sur une fiche pour voir les détails</p>
                  </div>
                ) : (
                  <>
                    <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${brd}`, background: "#E1F5EE" }}>
                      <p style={{ fontSize: "13px", fontWeight: "500", color: "#085041", margin: 0 }}>
                        📋 Détail — {selected.enseignant_nom}
                      </p>
                    </div>
                    <div style={{ padding: "1rem" }}>
                      {/* Montants */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "16px" }}>
                        {[
                          { label: "Brut",    val: `${parseFloat(selected.montant_brut || 0).toLocaleString("fr-FR")} F`, color: "#0F6E56" },
                          { label: "Retenues", val: `${parseFloat(selected.retenues || 0).toLocaleString("fr-FR")} F`,   color: "#E24B4A" },
                          { label: "Net",      val: `${parseFloat(selected.montant_net || 0).toLocaleString("fr-FR")} F`, color: "#0F6E56" },
                        ].map(item => (
                          <div key={item.label} style={{ background: bg3, borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                            <p style={{ fontSize: "11px", color: txt2, margin: "0 0 4px" }}>{item.label}</p>
                            <p style={{ fontSize: "14px", fontWeight: "500", color: item.color, margin: 0 }}>{item.val}</p>
                          </div>
                        ))}
                      </div>

                      {/* Infos */}
                      {[
                        { label: "Enseignant",  val: selected.enseignant_nom },
                        { label: "Matricule",   val: selected.matricule },
                        { label: "Période",     val: `${mois[selected.mois]} ${selected.annee}` },
                        { label: "Taux horaire", val: `${parseFloat(selected.taux_horaire || 0).toLocaleString("fr-FR")} FCFA/h` },
                      ].map(item => (
                        <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `0.5px solid ${brd}` }}>
                          <span style={{ fontSize: "13px", color: txt2 }}>{item.label}</span>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: txt }}>{item.val}</span>
                        </div>
                      ))}

                      {/* Boutons */}
                      <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                        <button onClick={() => handleApprouver(selected.id)} style={{
                          flex: 1, padding: "12px", background: "#0F6E56", color: "#fff",
                          border: "none", borderRadius: "10px", fontSize: "13px",
                          fontWeight: "500", cursor: "pointer"
                        }}>✅ Approuver le paiement</button>
                        <button style={{
                          padding: "12px 16px", background: "#E1F5EE", color: "#085041",
                          border: "0.5px solid #9FE1CB", borderRadius: "10px",
                          fontSize: "13px", cursor: "pointer"
                        }}>📄 PDF</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Onglet Approuvées */}
          {ongletActif === "approuvees" && (
            <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${brd}`, background: "#E1F5EE" }}>
                <p style={{ fontSize: "13px", fontWeight: "500", color: "#085041", margin: 0 }}>
                  ✅ Fiches approuvées ({vacationsApprouvees.length})
                </p>
              </div>
              <div style={{ padding: "1rem" }}>
                {vacationsApprouvees.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem" }}>
                    <p style={{ fontSize: "32px" }}>📋</p>
                    <p style={{ color: txt2, fontSize: "13px" }}>Aucune fiche approuvée</p>
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ borderBottom: `0.5px solid ${brd}` }}>
                        {["Enseignant", "Matricule", "Période", "Montant net", "Statut"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "8px 0", color: txt2, fontWeight: "400", fontSize: "11px" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {vacationsApprouvees.map((v, i) => (
                        <tr key={i} style={{ borderBottom: `0.5px solid ${brd}` }}>
                          <td style={{ padding: "10px 0", color: txt, fontWeight: "500" }}>{v.enseignant_nom}</td>
                          <td style={{ padding: "10px 0", color: txt2 }}>{v.matricule}</td>
                          <td style={{ padding: "10px 0", color: txt2 }}>{mois[v.mois]} {v.annee}</td>
                          <td style={{ padding: "10px 0", color: "#0F6E56", fontWeight: "500" }}>
                            {parseFloat(v.montant_net || 0).toLocaleString("fr-FR")} FCFA
                          </td>
                          <td style={{ padding: "10px 0" }}>
                            <span style={{ background: "#E1F5EE", color: "#085041", fontSize: "11px", padding: "3px 8px", borderRadius: "20px", fontWeight: "500" }}>
                              ✅ Approuvée
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Onglet Stats */}
          {ongletActif === "stats" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              {[
                { icon: "💰", title: "Total à payer ce mois",    val: `${totalAPayer.toLocaleString("fr-FR")} FCFA`,  color: "#E24B4A", bg: "#FCEBEB" },
                { icon: "✅", title: "Total déjà payé",          val: `${totalPaye.toLocaleString("fr-FR")} FCFA`,    color: "#0F6E56", bg: "#E1F5EE" },
                { icon: "👨‍🏫", title: "Enseignants vacataires",  val: `${new Set(vacations.map(v => v.id_enseignant)).size}`, color: "#534AB7", bg: "#EEEDFE" },
                { icon: "📋", title: "Total fiches ce mois",     val: vacations.length,                               color: "#BA7517", bg: "#FAEEDA" },
              ].map((s, i) => (
                <div key={i} style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1.5rem", display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                    {s.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: txt2, margin: "0 0 6px" }}>{s.title}</p>
                    <p style={{ fontSize: "24px", fontWeight: "500", color: s.color, margin: 0 }}>{s.val}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}