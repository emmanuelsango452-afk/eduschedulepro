import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = "http://localhost/eduschedulepro/backend/api";

export default function VacationPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [vacations, setVacations]     = useState([]);
  const [selected, setSelected]       = useState(null);
  const [dark, setDark]               = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading]         = useState(true);

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

  const getStatut = (statut) => {
    const cfg = {
      generee:              { bg: "#F1EFE8", color: "#5F5E5A", label: "Générée",           icon: "📄" },
      signee_enseignant:    { bg: "#FAEEDA", color: "#633806", label: "Signée enseignant", icon: "✍️" },
      validee_surveillant:  { bg: "#EEEDFE", color: "#3C3489", label: "Validée",           icon: "👁️" },
      approuvee_comptable:  { bg: "#E1F5EE", color: "#085041", label: "Approuvée",         icon: "✅" },
    };
    return cfg[statut] || cfg.generee;
  };

  const mois = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const menuItems = [
    { label: "Tableau de bord",  icon: "⊞", route: "/dashboard/admin" },
    { label: "Emploi du temps",  icon: "📅", route: "/emploi-temps" },
    { label: "Cahiers de texte", icon: "📝", route: "/cahiers" },
    { label: "Vacations",        icon: "💰", route: "/vacations", active: true },
    { label: "Enseignants",      icon: "👨‍🏫", route: "/enseignants" },
    { label: "Rapports",         icon: "📊", route: "/rapports" },
  ];

  const totalMontant = vacations.reduce((sum, v) => sum + parseFloat(v.montant_net || 0), 0);
  const totalHeures  = vacations.reduce((sum, v) => sum + parseFloat(v.total_heures || 0), 0);

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

      {/* Contenu */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <div style={{
          background: bg2, padding: "10px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `0.5px solid ${brd}`
        }}>
          <div>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: "500", color: txt }}>Fiches de vacation</p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>{vacations.length} fiche(s) enregistrée(s)</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button style={{
              padding: "8px 16px", background: "#0F6E56", color: "#fff",
              border: "none", borderRadius: "8px", fontSize: "12px",
              cursor: "pointer", fontWeight: "500"
            }}>+ Générer fiche</button>
            <button onClick={() => setDark(!dark)} style={{
              width: "36px", height: "36px", background: bg3, borderRadius: "8px",
              border: `0.5px solid ${brd}`, cursor: "pointer", fontSize: "16px"
            }}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", padding: "1rem 1.25rem 0" }}>
          {[
            { label: "Total fiches",    val: vacations.length,                                          color: "#0F6E56", bg: "#E1F5EE", icon: "📋" },
            { label: "Montant total",   val: `${totalMontant.toLocaleString("fr-FR")} FCFA`,            color: "#0F6E56", bg: "#E1F5EE", icon: "💰" },
            { label: "En attente",      val: vacations.filter(v => v.statut === "generee").length,      color: "#BA7517", bg: "#FAEEDA", icon: "⏳" },
          ].map((k, i) => (
            <div key={i} style={{
              background: bg2, borderRadius: "10px", border: `0.5px solid ${brd}`,
              padding: "14px", display: "flex", alignItems: "center", gap: "12px"
            }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                {k.icon}
              </div>
              <div>
                <p style={{ fontSize: "11px", color: txt2, margin: "0 0 4px" }}>{k.label}</p>
                <p style={{ fontSize: "18px", fontWeight: "500", color: k.color, margin: 0 }}>{k.val}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden", padding: "1rem 1.25rem", gap: "12px" }}>

          {/* Liste */}
          <div style={{
            width: "340px", background: bg2, borderRadius: "12px",
            border: `0.5px solid ${brd}`, overflowY: "auto", flexShrink: 0
          }}>
            <div style={{ padding: "12px 16px", borderBottom: `0.5px solid ${brd}` }}>
              <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>Toutes les fiches</p>
            </div>
            <div style={{ padding: "8px" }}>
              {loading ? (
                <p style={{ color: txt2, textAlign: "center", padding: "2rem", fontSize: "13px" }}>Chargement...</p>
              ) : vacations.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <p style={{ fontSize: "32px" }}>💰</p>
                  <p style={{ color: txt2, fontSize: "13px" }}>Aucune fiche de vacation</p>
                </div>
              ) : (
                vacations.map((v, i) => {
                  const s = getStatut(v.statut);
                  return (
                    <div key={i} onClick={() => setSelected(v)} style={{
                      background: selected?.id === v.id ? bg3 : "transparent",
                      borderRadius: "10px",
                      border: `0.5px solid ${selected?.id === v.id ? "#0F6E56" : "transparent"}`,
                      borderLeft: `3px solid ${selected?.id === v.id ? "#0F6E56" : "transparent"}`,
                      padding: "12px", marginBottom: "4px", cursor: "pointer"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>
                          {v.enseignant_nom}
                        </p>
                        <span style={{ fontSize: "10px", background: s.bg, color: s.color, padding: "2px 7px", borderRadius: "20px", fontWeight: "500" }}>
                          {s.icon} {s.label}
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", color: txt2, margin: "0 0 6px" }}>
                        {mois[v.mois]} {v.annee}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: txt2 }}>{v.matricule}</span>
                        <span style={{ fontSize: "13px", fontWeight: "500", color: "#0F6E56" }}>
                          {parseFloat(v.montant_net || 0).toLocaleString("fr-FR")} FCFA
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Détail */}
          <div style={{ flex: 1, background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {!selected ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontSize: "64px", margin: "0 0 16px" }}>💰</p>
                <p style={{ fontSize: "16px", fontWeight: "500", color: txt, margin: "0 0 8px" }}>Sélectionnez une fiche</p>
                <p style={{ fontSize: "13px", color: txt2 }}>Cliquez sur une fiche dans la liste</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ padding: "16px 20px", borderBottom: `0.5px solid ${brd}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: "500", color: txt, margin: "0 0 3px" }}>{selected.enseignant_nom}</p>
                    <p style={{ fontSize: "12px", color: txt2, margin: 0 }}>
                      {mois[selected.mois]} {selected.annee} — {selected.matricule}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button style={{ padding: "6px 14px", background: "#E1F5EE", color: "#085041", border: "0.5px solid #9FE1CB", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>
                      📄 PDF
                    </button>
                    <button style={{ padding: "6px 14px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
                      ✅ Valider
                    </button>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>

                  {/* Montants */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
                    {[
                      { label: "Montant brut",    val: `${parseFloat(selected.montant_brut || 0).toLocaleString("fr-FR")} FCFA`,  color: "#0F6E56" },
                      { label: "Retenues",         val: `${parseFloat(selected.retenues || 0).toLocaleString("fr-FR")} FCFA`,     color: "#E24B4A" },
                      { label: "Montant net",      val: `${parseFloat(selected.montant_net || 0).toLocaleString("fr-FR")} FCFA`,  color: "#0F6E56" },
                    ].map(item => (
                      <div key={item.label} style={{ background: bg3, borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                        <p style={{ fontSize: "11px", color: txt2, margin: "0 0 6px" }}>{item.label}</p>
                        <p style={{ fontSize: "18px", fontWeight: "500", color: item.color, margin: 0 }}>{item.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chaîne validation */}
                  <div style={{ background: bg2, borderRadius: "10px", border: `0.5px solid ${brd}`, padding: "16px", marginBottom: "16px" }}>
                    <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: "0 0 16px" }}>Chaîne de validation</p>
                    <div style={{ display: "flex", gap: "0" }}>
                      {[
                        { label: "Enseignant", done: ["signee_enseignant", "validee_surveillant", "approuvee_comptable"].includes(selected.statut) },
                        { label: "Surveillant", done: ["validee_surveillant", "approuvee_comptable"].includes(selected.statut) },
                        { label: "Comptable",  done: selected.statut === "approuvee_comptable" },
                      ].map((step, i) => (
                        <div key={i} style={{ flex: 1, textAlign: "center", position: "relative" }}>
                          <div style={{
                            width: "36px", height: "36px", borderRadius: "50%",
                            background: step.done ? "#0F6E56" : bg3,
                            border: `2px solid ${step.done ? "#0F6E56" : brd}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 8px", fontSize: "16px"
                          }}>
                            {step.done ? "✓" : (i + 1)}
                          </div>
                          <p style={{ fontSize: "11px", color: step.done ? "#0F6E56" : txt2, margin: 0, fontWeight: step.done ? "500" : "400" }}>
                            {step.label}
                          </p>
                          {i < 2 && (
                            <div style={{
                              position: "absolute", top: "18px", left: "60%", right: "-40%",
                              height: "2px", background: step.done ? "#0F6E56" : brd
                            }}/>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Infos enseignant */}
                  <div style={{ background: bg2, borderRadius: "10px", border: `0.5px solid ${brd}`, padding: "16px" }}>
                    <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: "0 0 12px" }}>Informations</p>
                    {[
                      { label: "Taux horaire",    val: `${parseFloat(selected.taux_horaire || 0).toLocaleString("fr-FR")} FCFA/h` },
                      { label: "Période",         val: `${mois[selected.mois]} ${selected.annee}` },
                      { label: "Statut",          val: getStatut(selected.statut).label },
                    ].map(item => (
                      <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `0.5px solid ${brd}` }}>
                        <span style={{ fontSize: "13px", color: txt2 }}>{item.label}</span>
                        <span style={{ fontSize: "13px", fontWeight: "500", color: txt }}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}