import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import SignaturePad from "signature_pad";

const API = "http://192.168.200.92/eduschedulepro/backend/api";

export default function VacationPage() {
 const { token, utilisateur } = useAuth();
  const navigate  = useNavigate();
  const [vacations, setVacations]       = useState([]);
  const [enseignants, setEnseignants]   = useState([]);
  const [selected, setSelected]         = useState(null);
  const [dark, setDark]                 = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [loading, setLoading]           = useState(true);
  const [onglet, setOnglet]             = useState("detail");
  const [showGenerer, setShowGenerer]   = useState(false);
  const [message, setMessage]           = useState("");
  const [saving, setSaving]             = useState(false);
  const [formGen, setFormGen]           = useState({
    id_enseignant: "", mois: new Date().getMonth() + 1, annee: 2026
  });

  const sigEnsRef = useRef(null);
  const sigSurvRef = useRef(null);
  const sigEnsPad = useRef(null);
  const sigSurvPad = useRef(null);

  const bg   = dark ? "#0d1117" : "#f0faf6";
  const bg2  = dark ? "#161b22" : "#ffffff";
  const bg3  = dark ? "#21262d" : "#e1f5ee";
  const txt  = dark ? "#e6edf3" : "#04342C";
  const txt2 = dark ? "#8b949e" : "#5F5E5A";
  const brd  = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/vacations.php`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/enseignants.php`, { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(([vacRes, ensRes]) => {
      if (vacRes.data.succes) setVacations(vacRes.data.data);
      if (ensRes.data.succes) setEnseignants(ensRes.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (onglet === "signatures" && sigEnsRef.current && sigSurvRef.current) {
      setTimeout(() => {
        sigEnsPad.current  = new SignaturePad(sigEnsRef.current,  { penColor: "#0F6E56" });
        sigSurvPad.current = new SignaturePad(sigSurvRef.current, { penColor: "#185FA5" });
      }, 100);
    }
  }, [onglet, selected]);

  const mois = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const getStatut = (statut) => {
    const cfg = {
      generee:              { bg: "#F1EFE8", color: "#5F5E5A", label: "Générée",           icon: "📄", step: 0 },
      signee_enseignant:    { bg: "#FAEEDA", color: "#633806", label: "Signée enseignant", icon: "✍️", step: 1 },
      validee_surveillant:  { bg: "#EEEDFE", color: "#3C3489", label: "Validée",           icon: "👁️", step: 2 },
      approuvee_comptable:  { bg: "#E1F5EE", color: "#085041", label: "Approuvée",         icon: "✅", step: 3 },
    };
    return cfg[statut] || cfg.generee;
  };

  const handleGenerer = async () => {
    if (!formGen.id_enseignant) {
      setMessage("⚠️ Sélectionnez un enseignant");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    setSaving(true);
    try {
      const res = await axios.post(`${API}/vacations.php?action=generer`, formGen, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.succes) {
        setMessage(`✅ Fiche générée — ${res.data.montant_net?.toLocaleString("fr-FR")} FCFA net`);
        const res2 = await axios.get(`${API}/vacations.php`, { headers: { Authorization: `Bearer ${token}` } });
        if (res2.data.succes) setVacations(res2.data.data);
        setShowGenerer(false);
      }
    } catch (err) {
      setMessage("❌ Erreur — Vérifiez qu'il y a des séances clôturées ce mois");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

 const handleValider = async (action) => {
  if (!selected) return;
  const pad = action === "signer" ? sigEnsPad.current : action === "valider" ? sigSurvPad.current : null;
  setSaving(true);
  try {
    await axios.post(`${API}/vacations.php?action=${action}&id=${selected.id}`, {
      visa_base64:  pad && !pad.isEmpty() ? pad.toDataURL() : null,
      signature_base64: pad && !pad.isEmpty() ? pad.toDataURL() : null,
      commentaire: "Validé"
    }, { headers: { Authorization: `Bearer ${token}` } });
    setMessage("✅ Validation enregistrée !");
    const res = await axios.get(`${API}/vacations.php`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.data.succes) {
      setVacations(res.data.data);
      setSelected(res.data.data.find(v => v.id === selected.id));
    }
  } catch (err) {
    setMessage(`❌ ${err.response?.data?.message || "Erreur lors de la validation"}`);
  } finally {
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }
};



  // Données séances simulées pour la démo
  const seancesDemo = [
    { date: "07/04/2026", matiere: "POO", classe: "L1-RST", debut: "08h05", fin: "10h10", duree: "2h05", taux: 6500, montant: 13542, qr: true, cahier: true },
    { date: "07/04/2026", matiere: "POO", classe: "L2-RST", debut: "16h02", fin: "18h00", duree: "1h58", taux: 6500, montant: 12783, qr: true, cahier: true },
    { date: "14/04/2026", matiere: "POO", classe: "L1-RST", debut: "10h32", fin: "12h30", duree: "1h58", taux: 6500, montant: 12783, qr: true, cahier: false },
    { date: "15/04/2026", matiere: "Dev Web", classe: "L2-RST", debut: "10h35", fin: "12h30", duree: "1h55", taux: 6500, montant: 12458, qr: false, cahier: true },
  ];

  const totalHeures = "7h56";
  const totalMontant = seancesDemo.reduce((sum, s) => sum + s.montant, 0);

  const menuItems = [
    { label: "Tableau de bord", icon: "⊞", route: utilisateur?.role === "administrateur" ? "/dashboard/admin" : utilisateur?.role === "enseignant" ? "/dashboard/enseignant" : utilisateur?.role === "delegue" ? "/dashboard/delegue" : utilisateur?.role === "surveillant" ? "/dashboard/surveillant" : utilisateur?.role === "comptable" ? "/dashboard/comptable" : "/dashboard/admin" },
    { label: "Emploi du temps",  icon: "📅", route: "/emploi-temps" },
    { label: "Cahiers de texte", icon: "📝", route: "/cahiers" },
    { label: "Vacations",        icon: "💰", route: "/vacations", active: true },
    { label: "Enseignants",      icon: "👨‍🏫", route: "/enseignants" },
    { label: "Rapports",         icon: "📊", route: "/rapports" },
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
            <p style={{ margin: 0, fontSize: "15px", fontWeight: "500", color: txt }}>Fiches de vacation</p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>{vacations.length} fiche(s) enregistrée(s)</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {message && (
              <div style={{ padding: "6px 12px", background: message.includes("✅") ? "#E1F5EE" : message.includes("⚠️") ? "#FAEEDA" : "#FCEBEB", color: message.includes("✅") ? "#085041" : message.includes("⚠️") ? "#633806" : "#791F1F", borderRadius: "8px", fontSize: "12px", fontWeight: "500" }}>
                {message}
              </div>
            )}
            <button onClick={() => setShowGenerer(true)} style={{ padding: "8px 16px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
              ⚡ Générer fiche
            </button>
            <button onClick={() => setDark(!dark)} style={{ width: "36px", height: "36px", background: bg3, borderRadius: "8px", border: `0.5px solid ${brd}`, cursor: "pointer", fontSize: "16px" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", padding: "1rem 1.25rem 0" }}>
          {[
            { label: "Total fiches",    val: vacations.length,                                               color: "#0F6E56", bg: "#E1F5EE", icon: "📋" },
            { label: "En attente",      val: vacations.filter(v => v.statut === "generee").length,           color: "#BA7517", bg: "#FAEEDA", icon: "⏳" },
            { label: "À valider",       val: vacations.filter(v => v.statut === "validee_surveillant").length, color: "#185FA5", bg: "#E6F1FB", icon: "👁️" },
            { label: "Approuvées",      val: vacations.filter(v => v.statut === "approuvee_comptable").length, color: "#085041", bg: "#E1F5EE", icon: "✅" },
          ].map((k, i) => (
            <div key={i} style={{ background: bg2, borderRadius: "10px", border: `0.5px solid ${brd}`, padding: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{k.icon}</div>
              <div>
                <p style={{ fontSize: "11px", color: txt2, margin: "0 0 3px" }}>{k.label}</p>
                <p style={{ fontSize: "22px", fontWeight: "500", color: k.color, margin: 0 }}>{k.val}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden", padding: "1rem 1.25rem", gap: "12px" }}>

          {/* Liste */}
          <div style={{ width: "300px", background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `0.5px solid ${brd}` }}>
              <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>Toutes les fiches</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              {loading ? (
                <p style={{ color: txt2, textAlign: "center", padding: "2rem", fontSize: "13px" }}>Chargement...</p>
              ) : vacations.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <p style={{ fontSize: "32px" }}>💰</p>
                  <p style={{ color: txt2, fontSize: "13px" }}>Aucune fiche</p>
                  <button onClick={() => setShowGenerer(true)} style={{ padding: "8px 16px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", marginTop: "8px" }}>
                    Générer une fiche
                  </button>
                </div>
              ) : (
                vacations.map((v, i) => {
                  const s = getStatut(v.statut);
                  return (
                    <div key={i} onClick={() => { setSelected(v); setOnglet("detail"); }} style={{
                      background: selected?.id === v.id ? bg3 : "transparent",
                      borderRadius: "10px",
                      border: `0.5px solid ${selected?.id === v.id ? "#0F6E56" : "transparent"}`,
                      borderLeft: `3px solid ${selected?.id === v.id ? "#0F6E56" : "transparent"}`,
                      padding: "12px", marginBottom: "4px", cursor: "pointer"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>{v.enseignant_nom}</p>
                        <span style={{ fontSize: "10px", background: s.bg, color: s.color, padding: "2px 7px", borderRadius: "20px", fontWeight: "500" }}>
                          {s.icon} {s.label}
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", color: txt2, margin: "0 0 5px" }}>{mois[v.mois]} {v.annee}</p>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "11px", color: txt2 }}>{v.matricule}</span>
                        <span style={{ fontSize: "13px", fontWeight: "500", color: "#0F6E56" }}>
                          {parseFloat(v.montant_net || 0).toLocaleString("fr-FR")} F
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
                <div style={{ padding: "14px 20px", borderBottom: `0.5px solid ${brd}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: "500", color: txt, margin: "0 0 3px" }}>{selected.enseignant_nom}</p>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: txt2 }}>{mois[selected.mois]} {selected.annee}</span>
                      <span style={{ color: brd }}>•</span>
                      <span style={{ fontSize: "11px", background: getStatut(selected.statut).bg, color: getStatut(selected.statut).color, padding: "2px 8px", borderRadius: "20px", fontWeight: "500" }}>
                        {getStatut(selected.statut).icon} {getStatut(selected.statut).label}
                      </span>
                    </div>
                  </div>
                  <button style={{ padding: "6px 14px", background: "#E1F5EE", color: "#085041", border: "0.5px solid #9FE1CB", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>
                    📄 Exporter PDF
                  </button>
                </div>

                {/* Chaîne validation */}
                <div style={{ padding: "12px 20px", borderBottom: `0.5px solid ${brd}`, background: bg3 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {[
                      { label: "Générer",     icon: "⚡", done: true },
                      { label: "Enseignant",  icon: "✍️", done: ["signee_enseignant", "validee_surveillant", "approuvee_comptable"].includes(selected.statut) },
                      { label: "Surveillant", icon: "👁️", done: ["validee_surveillant", "approuvee_comptable"].includes(selected.statut) },
                      { label: "Comptable",   icon: "✅", done: selected.statut === "approuvee_comptable" },
                    ].map((step, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                          <div style={{
                            width: "32px", height: "32px", borderRadius: "50%",
                            background: step.done ? "#0F6E56" : bg2,
                            border: `2px solid ${step.done ? "#0F6E56" : brd}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "14px"
                          }}>
                            {step.done ? "✓" : step.icon}
                          </div>
                          <p style={{ fontSize: "10px", color: step.done ? "#0F6E56" : txt2, margin: "4px 0 0", fontWeight: step.done ? "500" : "400" }}>
                            {step.label}
                          </p>
                        </div>
                        {i < 3 && <div style={{ height: "2px", flex: 1, background: step.done ? "#0F6E56" : brd, margin: "0 4px", marginBottom: "16px" }}/>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Onglets */}
                <div style={{ display: "flex", borderBottom: `0.5px solid ${brd}` }}>
                  {[
                    { id: "detail",     label: "📋 Détail fiche" },
                    { id: "seances",    label: "📅 Séances" },
                    { id: "controles",  label: "🔍 Contrôles" },
                    { id: "signatures", label: "✍️ Signatures" },
                  ].map(o => (
                    <button key={o.id} onClick={() => setOnglet(o.id)} style={{
                      padding: "10px 16px", border: "none", cursor: "pointer", background: "transparent",
                      color: onglet === o.id ? "#0F6E56" : txt2, fontSize: "12px",
                      fontWeight: onglet === o.id ? "500" : "400",
                      borderBottom: onglet === o.id ? "2px solid #0F6E56" : "2px solid transparent"
                    }}>{o.label}</button>
                  ))}
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>

                  {/* Onglet Détail */}
                  {onglet === "detail" && (
                    <div>
                      {/* Infos enseignant */}
                      <div style={{ background: bg3, borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
                        <p style={{ fontSize: "12px", color: txt2, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "500" }}>Informations enseignant</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                          {[
                            { label: "Nom complet",   val: selected.enseignant_nom },
                            { label: "Matricule",     val: selected.matricule },
                            { label: "Taux horaire",  val: `${parseFloat(selected.taux_horaire || 0).toLocaleString("fr-FR")} FCFA/h` },
                            { label: "Mois",          val: mois[selected.mois] },
                            { label: "Année",         val: selected.annee },
                            { label: "Total heures",  val: totalHeures },
                          ].map(item => (
                            <div key={item.label} style={{ background: bg2, borderRadius: "8px", padding: "8px 10px" }}>
                              <p style={{ fontSize: "10px", color: txt2, margin: "0 0 3px" }}>{item.label}</p>
                              <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>{item.val}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Montants */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
                        {[
                          { label: "Montant brut",   val: `${parseFloat(selected.montant_brut || 0).toLocaleString("fr-FR")} FCFA`,  color: "#0F6E56", bg: "#E1F5EE" },
                          { label: "Retenues (5%)",  val: `${parseFloat(selected.retenues || 0).toLocaleString("fr-FR")} FCFA`,      color: "#E24B4A", bg: "#FCEBEB" },
                          { label: "Montant net",    val: `${parseFloat(selected.montant_net || 0).toLocaleString("fr-FR")} FCFA`,   color: "#0F6E56", bg: "#E1F5EE" },
                        ].map(item => (
                          <div key={item.label} style={{ background: item.bg, borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                            <p style={{ fontSize: "11px", color: item.color, margin: "0 0 6px", opacity: 0.8 }}>{item.label}</p>
                            <p style={{ fontSize: "18px", fontWeight: "500", color: item.color, margin: 0 }}>{item.val}</p>
                          </div>
                        ))}
                      </div>

                      {/* Actions selon statut */}
                      {selected.statut === "validee_surveillant" && (
                        <button onClick={() => handleValider("approuver")} disabled={saving} style={{
                          width: "100%", padding: "12px", background: "#0F6E56", color: "#fff",
                          border: "none", borderRadius: "10px", fontSize: "14px",
                          fontWeight: "500", cursor: "pointer"
                        }}>
                          {saving ? "⏳..." : "✅ Approuver le paiement (Comptable)"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Onglet Séances */}
                  {onglet === "seances" && (
                    <div>
                      <p style={{ fontSize: "13px", color: txt2, margin: "0 0 16px" }}>
                        Détail des séances réalisées ce mois — source : cahiers de texte clôturés
                      </p>
                      <div style={{ background: bg2, borderRadius: "10px", border: `0.5px solid ${brd}`, overflow: "hidden", marginBottom: "16px" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                          <thead>
                            <tr style={{ background: bg3 }}>
                              {["Date", "Matière", "Classe", "Début", "Fin", "Durée", "Taux", "Montant"].map(h => (
                                <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: txt2, fontWeight: "500", fontSize: "11px" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {seancesDemo.map((s, i) => (
                              <tr key={i} style={{ borderBottom: `0.5px solid ${brd}` }}>
                                <td style={{ padding: "10px 12px", color: txt }}>{s.date}</td>
                                <td style={{ padding: "10px 12px", color: txt, fontWeight: "500" }}>{s.matiere}</td>
                                <td style={{ padding: "10px 12px", color: txt2 }}>{s.classe}</td>
                                <td style={{ padding: "10px 12px", color: txt }}>{s.debut}</td>
                                <td style={{ padding: "10px 12px", color: txt }}>{s.fin}</td>
                                <td style={{ padding: "10px 12px", color: txt, fontWeight: "500" }}>{s.duree}</td>
                                <td style={{ padding: "10px 12px", color: txt2 }}>{s.taux.toLocaleString("fr-FR")} F</td>
                                <td style={{ padding: "10px 12px", color: "#0F6E56", fontWeight: "500" }}>{s.montant.toLocaleString("fr-FR")} F</td>
                              </tr>
                            ))}
                            <tr style={{ background: bg3 }}>
                              <td colSpan="5" style={{ padding: "10px 12px", color: txt, fontWeight: "500", textAlign: "right" }}>Total</td>
                              <td style={{ padding: "10px 12px", color: "#0F6E56", fontWeight: "500" }}>{totalHeures}</td>
                              <td/>
                              <td style={{ padding: "10px 12px", color: "#0F6E56", fontWeight: "500" }}>{totalMontant.toLocaleString("fr-FR")} F</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Onglet Contrôles */}
                  {onglet === "controles" && (
                    <div>
                      <p style={{ fontSize: "13px", color: txt2, margin: "0 0 16px" }}>
                        Vérifications automatiques de cohérence des données
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

                        {/* Contrôle 1 — Cahiers signés */}
                        <div style={{ background: bg2, borderRadius: "10px", border: `0.5px solid ${brd}`, padding: "14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>
                              📝 Cahiers de texte signés
                            </p>
                            <span style={{ fontSize: "11px", background: "#FAEEDA", color: "#633806", padding: "3px 8px", borderRadius: "20px" }}>
                              ⚠️ 1 anomalie
                            </span>
                          </div>
                          {seancesDemo.map((s, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `0.5px solid ${brd}` }}>
                              <span style={{ fontSize: "12px", color: txt }}>{s.date} — {s.matiere}</span>
                              <span style={{ fontSize: "11px", background: s.cahier ? "#E1F5EE" : "#FCEBEB", color: s.cahier ? "#085041" : "#791F1F", padding: "2px 7px", borderRadius: "20px" }}>
                                {s.cahier ? "✅ Signé" : "❌ Non signé"}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Contrôle 2 — Pointages QR */}
                        <div style={{ background: bg2, borderRadius: "10px", border: `0.5px solid ${brd}`, padding: "14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>
                              📱 Pointages QR-Code
                            </p>
                            <span style={{ fontSize: "11px", background: "#FAEEDA", color: "#633806", padding: "3px 8px", borderRadius: "20px" }}>
                              ⚠️ 1 anomalie
                            </span>
                          </div>
                          {seancesDemo.map((s, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `0.5px solid ${brd}` }}>
                              <span style={{ fontSize: "12px", color: txt }}>{s.date} — {s.matiere}</span>
                              <span style={{ fontSize: "11px", background: s.qr ? "#E1F5EE" : "#FCEBEB", color: s.qr ? "#085041" : "#791F1F", padding: "2px 7px", borderRadius: "20px" }}>
                                {s.qr ? "✅ Pointé" : "❌ Sans QR"}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Contrôle 3 — Durées */}
                        <div style={{ background: bg2, borderRadius: "10px", border: `0.5px solid ${brd}`, padding: "14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>
                              ⏱️ Durées vs planifiées
                            </p>
                            <span style={{ fontSize: "11px", background: "#E1F5EE", color: "#085041", padding: "3px 8px", borderRadius: "20px" }}>
                              ✅ OK
                            </span>
                          </div>
                          <p style={{ fontSize: "12px", color: txt2, margin: 0 }}>
                            Aucune séance ne dépasse la durée planifiée de plus de 30 minutes.
                          </p>
                        </div>

                        {/* Résumé */}
                        <div style={{ background: "#FAEEDA", borderRadius: "10px", padding: "12px 14px", display: "flex", gap: "10px", alignItems: "center" }}>
                          <span style={{ fontSize: "20px" }}>⚠️</span>
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: "500", color: "#633806", margin: "0 0 3px" }}>
                              2 anomalies détectées
                            </p>
                            <p style={{ fontSize: "12px", color: "#854F0B", margin: 0 }}>
                              1 cahier non signé, 1 séance sans pointage QR. La validation reste possible mais ces anomalies seront signalées.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Onglet Signatures */}
                  {onglet === "signatures" && (
                    <div>
                      <div style={{ background: bg3, borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", gap: "10px" }}>
                        <span style={{ fontSize: "20px" }}>ℹ️</span>
                        <p style={{ fontSize: "13px", color: txt2, margin: 0 }}>
                          Chaque partie signe numériquement pour valider la fiche. Les signatures sont horodatées et archivées.
                        </p>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        {/* Signature enseignant */}
                        <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>✍️</div>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>Enseignant</p>
                              <p style={{ fontSize: "11px", color: ["signee_enseignant","validee_surveillant","approuvee_comptable"].includes(selected.statut) ? "#0F6E56" : txt2, margin: 0 }}>
                                {["signee_enseignant","validee_surveillant","approuvee_comptable"].includes(selected.statut) ? "✅ Signé" : "En attente"}
                              </p>
                            </div>
                          </div>
                          <canvas ref={sigEnsRef} width={280} height={100} style={{
                            border: `1.5px dashed ${brd}`, borderRadius: "8px",
                            background: bg3, width: "100%", touchAction: "none", cursor: "crosshair"
                          }}/>
                        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                            <button onClick={() => sigEnsPad.current?.clear()} style={{ flex: 1, padding: "7px", background: bg3, color: txt2, border: `0.5px solid ${brd}`, borderRadius: "7px", fontSize: "11px", cursor: "pointer" }}>🗑️ Effacer</button>
                            <button onClick={() => handleValider("signer")} disabled={saving} style={{ flex: 1, padding: "7px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "7px", fontSize: "11px", cursor: "pointer", fontWeight: "500" }}>✅ Valider</button>
                          </div>
                       </div>
                        
                        {/* Visa surveillant */}
                        <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>👁️</div>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>Surveillant</p>
                              <p style={{ fontSize: "11px", color: ["validee_surveillant","approuvee_comptable"].includes(selected.statut) ? "#0F6E56" : txt2, margin: 0 }}>
                                {["validee_surveillant","approuvee_comptable"].includes(selected.statut) ? "✅ Visé" : "En attente"}
                              </p>
                            </div>
                          </div>
                          <canvas ref={sigSurvRef} width={280} height={100} style={{
                            border: `1.5px dashed ${brd}`, borderRadius: "8px",
                            background: bg3, width: "100%", touchAction: "none", cursor: "crosshair"
                          }}/>
                          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                            <button onClick={() => sigSurvPad.current?.clear()} style={{ flex: 1, padding: "7px", background: bg3, color: txt2, border: `0.5px solid ${brd}`, borderRadius: "7px", fontSize: "11px", cursor: "pointer" }}>🗑️ Effacer</button>
                            <button onClick={() => handleValider("valider")} disabled={saving} style={{ flex: 1, padding: "7px", background: "#185FA5", color: "#fff", border: "none", borderRadius: "7px", fontSize: "11px", cursor: "pointer", fontWeight: "500" }}>👁️ Viser</button>
                          </div>
                        </div>
                      </div>

                      {/* Validation comptable */}
                      {selected.statut === "validee_surveillant" && (
                        <div style={{ background: "#E1F5EE", borderRadius: "10px", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: "500", color: "#085041", margin: "0 0 3px" }}>💰 Approbation comptable</p>
                            <p style={{ fontSize: "12px", color: "#1D9E75", margin: 0 }}>La fiche est prête pour approbation finale</p>
                          </div>
                          <button onClick={() => handleValider("approuver")} disabled={saving} style={{
                            padding: "10px 20px", background: "#0F6E56", color: "#fff",
                            border: "none", borderRadius: "8px", fontSize: "13px",
                            fontWeight: "500", cursor: "pointer"
                          }}>✅ Approuver</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Générer fiche */}
      {showGenerer && (
        <div onClick={() => setShowGenerer(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: bg2, borderRadius: "16px", padding: "1.5rem",
            width: "400px", border: `0.5px solid ${brd}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "16px", color: txt }}>⚡ Générer une fiche de vacation</h3>
              <button onClick={() => setShowGenerer(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: txt2 }}>×</button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Enseignant</label>
              <select value={formGen.id_enseignant} onChange={e => setFormGen({...formGen, id_enseignant: e.target.value})} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: bg3, color: txt, fontSize: "13px" }}>
                <option value="">Sélectionner un enseignant...</option>
                {enseignants.filter(e => e.statut === "vacataire").map(e => (
                  <option key={e.id} value={e.id}>{e.prenom} {e.nom} — {parseFloat(e.taux_horaire).toLocaleString("fr-FR")} F/h</option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Mois</label>
                <select value={formGen.mois} onChange={e => setFormGen({...formGen, mois: parseInt(e.target.value)})} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: bg3, color: txt, fontSize: "13px" }}>
                  {mois.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Année</label>
                <input type="number" value={formGen.annee} onChange={e => setFormGen({...formGen, annee: parseInt(e.target.value)})} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: bg3, color: txt, fontSize: "13px" }}/>
              </div>
            </div>

            <div style={{ background: bg3, borderRadius: "8px", padding: "10px 12px", marginBottom: "16px", display: "flex", gap: "8px" }}>
              <span>ℹ️</span>
              <p style={{ fontSize: "12px", color: txt2, margin: 0 }}>
                La fiche sera générée automatiquement à partir des séances clôturées dans les cahiers de texte.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleGenerer} disabled={saving} style={{
                flex: 1, padding: "11px", background: "#0F6E56", color: "#fff",
                border: "none", borderRadius: "8px", fontSize: "13px",
                fontWeight: "500", cursor: "pointer"
              }}>
                {saving ? "⏳ Génération..." : "⚡ Générer la fiche"}
              </button>
              <button onClick={() => setShowGenerer(false)} style={{
                padding: "11px 20px", background: bg3, color: txt,
                border: `0.5px solid ${brd}`, borderRadius: "8px", fontSize: "13px", cursor: "pointer"
              }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}