import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import SignaturePad from "signature_pad";

const API = 'http://localhost/eduschedulepro/backend/api';

export default function VacationPage() {
  const { token, utilisateur } = useAuth();
  const navigate  = useNavigate();
  const [vacations, setVacations]     = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [selected, setSelected]       = useState(null);
  const [dark, setDark]               = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading]         = useState(true);
  const [onglet, setOnglet]           = useState("detail");
  const [showGenerer, setShowGenerer] = useState(false);
  const [message, setMessage]         = useState("");
  const [saving, setSaving]           = useState(false);
  const [formGen, setFormGen]         = useState({ id_enseignant: "", mois: new Date().getMonth() + 1, annee: 2026 });

  const sigEnsRef  = useRef(null);
  const sigSurvRef = useRef(null);
  const sigEnsPad  = useRef(null);
  const sigSurvPad = useRef(null);

  const bg     = dark ? "#0d1117" : "#f0faf6";
  const bg2    = dark ? "#161b22" : "#ffffff";
  const bg3    = dark ? "#21262d" : "#e8f5ee";
  const txt    = dark ? "#e6edf3" : "#04342C";
  const txt2   = dark ? "#8b949e" : "#5F5E5A";
  const brd    = dark ? "rgba(255,255,255,0.08)" : "rgba(4,52,44,0.08)";
  const shadow = dark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 12px rgba(4,52,44,0.06)";

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/vacations.php`,    { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/enseignants.php`,  { headers: { Authorization: `Bearer ${token}` } }),
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

  const mois = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const getStatut = (statut) => {
    const cfg = {
      generee:             { bg: "#F1EFE8", color: "#5F5E5A", label: "Générée",           icon: "📄" },
      signee_enseignant:   { bg: "#FAEEDA", color: "#633806", label: "Signée enseignant", icon: "✍️" },
      validee_surveillant: { bg: "#EEEDFE", color: "#3C3489", label: "Validée",           icon: "👁️" },
      approuvee_comptable: { bg: "#E1F5EE", color: "#085041", label: "Approuvée",         icon: "✅" },
    };
    return cfg[statut] || cfg.generee;
  };

  const handleGenerer = async () => {
    if (!formGen.id_enseignant) { setMessage("⚠️ Sélectionnez un enseignant"); setTimeout(() => setMessage(""), 3000); return; }
    setSaving(true);
    try {
      const res = await axios.post(`${API}/vacations.php?action=generer`, formGen, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.succes) {
        setMessage(`✅ Fiche générée — ${res.data.montant_net?.toLocaleString("fr-FR")} FCFA net`);
        const res2 = await axios.get(`${API}/vacations.php`, { headers: { Authorization: `Bearer ${token}` } });
        if (res2.data.succes) setVacations(res2.data.data);
        setShowGenerer(false);
      }
    } catch { setMessage("❌ Vérifiez qu'il y a des séances clôturées ce mois"); }
    finally { setSaving(false); setTimeout(() => setMessage(""), 4000); }
  };

  const handleValider = async (action) => {
    if (!selected) return;
    const pad = action === "signer" ? sigEnsPad.current : action === "valider" ? sigSurvPad.current : null;
    setSaving(true);
    try {
      await axios.post(`${API}/vacations.php?action=${action}&id=${selected.id}`, {
        visa_base64: pad && !pad.isEmpty() ? pad.toDataURL() : null,
        signature_base64: pad && !pad.isEmpty() ? pad.toDataURL() : null,
        commentaire: "Validé"
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage("✅ Validation enregistrée !");
      const res = await axios.get(`${API}/vacations.php`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.succes) { setVacations(res.data.data); setSelected(res.data.data.find(v => v.id === selected.id)); }
    } catch (err) { setMessage(`❌ ${err.response?.data?.message || "Erreur"}`); }
    finally { setSaving(false); setTimeout(() => setMessage(""), 3000); }
  };

  const seancesDemo = [
    { date: "07/04/2026", matiere: "POO",     classe: "L1-RST", debut: "08h05", fin: "10h10", duree: "2h05", taux: 6500, montant: 13542, qr: true,  cahier: true },
    { date: "07/04/2026", matiere: "POO",     classe: "L2-RST", debut: "16h02", fin: "18h00", duree: "1h58", taux: 6500, montant: 12783, qr: true,  cahier: true },
    { date: "14/04/2026", matiere: "POO",     classe: "L1-RST", debut: "10h32", fin: "12h30", duree: "1h58", taux: 6500, montant: 12783, qr: true,  cahier: false },
    { date: "15/04/2026", matiere: "Dev Web", classe: "L2-RST", debut: "10h35", fin: "12h30", duree: "1h55", taux: 6500, montant: 12458, qr: false, cahier: true },
  ];
  const totalHeures  = "7h56";
  const totalMontant = seancesDemo.reduce((sum, s) => sum + s.montant, 0);

  const dashRoute = utilisateur?.role === "administrateur" ? "/dashboard/admin" : utilisateur?.role === "enseignant" ? "/dashboard/enseignant" : utilisateur?.role === "delegue" ? "/dashboard/delegue" : utilisateur?.role === "surveillant" ? "/dashboard/surveillant" : utilisateur?.role === "comptable" ? "/dashboard/comptable" : "/dashboard/admin";

  const menuItems = [
    { label: "Tableau de bord",  icon: "⊞",  route: dashRoute },
    { label: "Emploi du temps",  icon: "📅",  route: "/emploi-temps" },
    { label: "Cahiers de texte", icon: "📝",  route: "/cahiers" },
    { label: "Vacations",        icon: "💰",  route: "/vacations", active: true },
    { label: "Enseignants",      icon: "👨‍🏫", route: "/enseignants" },
    { label: "Rapports",         icon: "📊",  route: "/rapports" },
  ];

  const labelStyle = { fontSize: "11px", color: txt2, display: "block", marginBottom: "5px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" };

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
        <div style={{ flex: 1, padding: "12px 8px" }}>
          {menuItems.map(item => (
            <div key={item.label} onClick={() => navigate(item.route)} style={{
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
            <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: txt }}>💰 Fiches de vacation</p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>{vacations.length} fiche(s) enregistrée(s)</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {message && (
              <div style={{ padding: "7px 14px", background: message.includes("✅") ? "#E1F5EE" : message.includes("⚠️") ? "#FAEEDA" : "#FCEBEB", color: message.includes("✅") ? "#085041" : message.includes("⚠️") ? "#633806" : "#791F1F", borderRadius: "8px", fontSize: "12px", fontWeight: "600", boxShadow: shadow }}>
                {message}
              </div>
            )}
            <button onClick={() => setShowGenerer(true)} style={{ padding: "8px 18px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600", boxShadow: "0 2px 8px rgba(15,110,86,0.3)" }}>
              ⚡ Générer fiche
            </button>
            <button onClick={() => setDark(!dark)} style={{ width: "38px", height: "38px", background: bg3, borderRadius: "10px", border: `1px solid ${brd}`, cursor: "pointer", fontSize: "17px" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", padding: "1rem 1.5rem 0" }}>
          {[
            { label: "Total fiches",  val: vacations.length, color: "#0F6E56", bg: "#E1F5EE", icon: "📋" },
            { label: "En attente",    val: vacations.filter(v => v.statut === "generee").length, color: "#BA7517", bg: "#FAEEDA", icon: "⏳" },
            { label: "À valider",     val: vacations.filter(v => v.statut === "validee_surveillant").length, color: "#185FA5", bg: "#E6F1FB", icon: "👁️" },
            { label: "Approuvées",    val: vacations.filter(v => v.statut === "approuvee_comptable").length, color: "#085041", bg: "#E1F5EE", icon: "✅" },
          ].map((k, i) => (
            <div key={i} style={{ background: bg2, borderRadius: "12px", border: `1px solid ${brd}`, padding: "14px", display: "flex", alignItems: "center", gap: "14px", boxShadow: shadow }}>
              <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{k.icon}</div>
              <div>
                <p style={{ fontSize: "11px", color: txt2, margin: "0 0 3px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.4px" }}>{k.label}</p>
                <p style={{ fontSize: "26px", fontWeight: "700", color: k.color, margin: 0, lineHeight: 1 }}>{k.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* BODY */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", padding: "1rem 1.5rem", gap: "14px" }}>

          {/* LISTE */}
          <div style={{ width: "300px", background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden", boxShadow: shadow }}>
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${brd}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: "13px", fontWeight: "700", color: txt, margin: 0 }}>Toutes les fiches</p>
              <span style={{ fontSize: "11px", background: bg3, color: txt2, padding: "3px 8px", borderRadius: "6px" }}>{vacations.length}</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              {loading ? (
                <p style={{ color: txt2, textAlign: "center", padding: "2rem", fontSize: "13px" }}>Chargement...</p>
              ) : vacations.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <p style={{ fontSize: "40px", margin: "0 0 12px" }}>💰</p>
                  <p style={{ color: txt2, fontSize: "13px", marginBottom: "12px" }}>Aucune fiche</p>
                  <button onClick={() => setShowGenerer(true)} style={{ padding: "8px 16px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
                    Générer une fiche
                  </button>
                </div>
              ) : (
                vacations.map((v, i) => {
                  const s = getStatut(v.statut);
                  const isSelected = selected?.id === v.id;
                  return (
                    <div key={i} onClick={() => { setSelected(v); setOnglet("detail"); }} style={{
                      background: isSelected ? bg3 : "transparent",
                      borderRadius: "10px",
                      border: `1px solid ${isSelected ? "#0F6E56" : "transparent"}`,
                      borderLeft: `4px solid ${isSelected ? "#0F6E56" : "transparent"}`,
                      padding: "12px", marginBottom: "4px", cursor: "pointer", transition: "all 0.2s"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: 0 }}>{v.enseignant_nom}</p>
                        <span style={{ fontSize: "10px", background: s.bg, color: s.color, padding: "2px 7px", borderRadius: "20px", fontWeight: "600" }}>{s.icon} {s.label}</span>
                      </div>
                      <p style={{ fontSize: "12px", color: txt2, margin: "0 0 5px" }}>{mois[v.mois]} {v.annee}</p>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "11px", color: txt2 }}>{v.matricule}</span>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#0F6E56" }}>{parseFloat(v.montant_net || 0).toLocaleString("fr-FR")} F</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* DÉTAIL */}
          <div style={{ flex: 1, background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: shadow }}>
            {!selected ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontSize: "72px", margin: "0 0 16px" }}>💰</p>
                <p style={{ fontSize: "17px", fontWeight: "700", color: txt, margin: "0 0 8px" }}>Sélectionnez une fiche</p>
                <p style={{ fontSize: "13px", color: txt2 }}>Cliquez sur une fiche dans la liste</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${brd}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: "16px", fontWeight: "700", color: txt, margin: "0 0 6px" }}>{selected.enseignant_nom}</p>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: txt2, background: bg3, padding: "3px 8px", borderRadius: "6px" }}>{mois[selected.mois]} {selected.annee}</span>
                      <span style={{ fontSize: "11px", background: getStatut(selected.statut).bg, color: getStatut(selected.statut).color, padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>
                        {getStatut(selected.statut).icon} {getStatut(selected.statut).label}
                      </span>
                    </div>
                  </div>
                  <button style={{ padding: "7px 14px", background: "#E1F5EE", color: "#085041", border: "1px solid #9FE1CB", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>📄 Exporter PDF</button>
                </div>

                {/* Workflow */}
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${brd}`, background: bg3 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {[
                      { label: "Générer",     icon: "⚡", done: true },
                      { label: "Enseignant",  icon: "✍️", done: ["signee_enseignant","validee_surveillant","approuvee_comptable"].includes(selected.statut) },
                      { label: "Surveillant", icon: "👁️", done: ["validee_surveillant","approuvee_comptable"].includes(selected.statut) },
                      { label: "Comptable",   icon: "✅", done: selected.statut === "approuvee_comptable" },
                    ].map((step, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                          <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: step.done ? "linear-gradient(135deg, #1D9E75, #0F6E56)" : bg2, border: `2px solid ${step.done ? "#0F6E56" : brd}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", color: step.done ? "#fff" : txt2, boxShadow: step.done ? "0 2px 8px rgba(15,110,86,0.3)" : "none" }}>
                            {step.done ? "✓" : step.icon}
                          </div>
                          <p style={{ fontSize: "10px", color: step.done ? "#0F6E56" : txt2, margin: "5px 0 0", fontWeight: step.done ? "600" : "400" }}>{step.label}</p>
                        </div>
                        {i < 3 && <div style={{ height: "2px", flex: 1, background: step.done ? "#0F6E56" : brd, margin: "0 4px", marginBottom: "18px", borderRadius: "1px" }}/>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Onglets */}
                <div style={{ display: "flex", borderBottom: `1px solid ${brd}` }}>
                  {[
                    { id: "detail",     label: "📋 Détail" },
                    { id: "seances",    label: "📅 Séances" },
                    { id: "controles",  label: "🔍 Contrôles" },
                    { id: "signatures", label: "✍️ Signatures" },
                  ].map(o => (
                    <button key={o.id} onClick={() => setOnglet(o.id)} style={{
                      padding: "12px 16px", border: "none", cursor: "pointer", background: "transparent",
                      color: onglet === o.id ? "#0F6E56" : txt2, fontSize: "12px",
                      fontWeight: onglet === o.id ? "700" : "400",
                      borderBottom: onglet === o.id ? "2px solid #0F6E56" : "2px solid transparent",
                      transition: "all 0.2s"
                    }}>{o.label}</button>
                  ))}
                </div>

                {/* CONTENU */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>

                  {/* DÉTAIL */}
                  {onglet === "detail" && (
                    <div>
                      <div style={{ background: bg3, borderRadius: "12px", padding: "14px", marginBottom: "16px", border: `1px solid ${brd}` }}>
                        <p style={{ fontSize: "11px", color: txt2, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700" }}>Informations enseignant</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                          {[
                            { label: "Nom complet",  val: selected.enseignant_nom },
                            { label: "Matricule",    val: selected.matricule },
                            { label: "Taux horaire", val: `${parseFloat(selected.taux_horaire || 0).toLocaleString("fr-FR")} FCFA/h` },
                            { label: "Mois",         val: mois[selected.mois] },
                            { label: "Année",        val: selected.annee },
                            { label: "Total heures", val: totalHeures },
                          ].map(item => (
                            <div key={item.label} style={{ background: bg2, borderRadius: "8px", padding: "8px 10px", border: `1px solid ${brd}` }}>
                              <p style={{ fontSize: "10px", color: txt2, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.3px" }}>{item.label}</p>
                              <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: 0 }}>{item.val}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
                        {[
                          { label: "Montant brut",  val: `${parseFloat(selected.montant_brut || 0).toLocaleString("fr-FR")} FCFA`,  color: "#0F6E56", bg: "#E1F5EE", border: "#9FE1CB" },
                          { label: "Retenues (5%)", val: `${parseFloat(selected.retenues || 0).toLocaleString("fr-FR")} FCFA`,      color: "#E24B4A", bg: "#FCEBEB", border: "#F09595" },
                          { label: "Montant net",   val: `${parseFloat(selected.montant_net || 0).toLocaleString("fr-FR")} FCFA`,   color: "#0F6E56", bg: "#E1F5EE", border: "#9FE1CB" },
                        ].map(item => (
                          <div key={item.label} style={{ background: item.bg, borderRadius: "12px", padding: "16px", textAlign: "center", border: `1px solid ${item.border}` }}>
                            <p style={{ fontSize: "11px", color: item.color, margin: "0 0 8px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</p>
                            <p style={{ fontSize: "20px", fontWeight: "700", color: item.color, margin: 0 }}>{item.val}</p>
                          </div>
                        ))}
                      </div>

                      {selected.statut === "validee_surveillant" && (
                        <button onClick={() => handleValider("approuver")} disabled={saving} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(15,110,86,0.3)" }}>
                          {saving ? "⏳..." : "✅ Approuver le paiement (Comptable)"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* SÉANCES */}
                  {onglet === "seances" && (
                    <div>
                      <p style={{ fontSize: "13px", color: txt2, margin: "0 0 16px" }}>Détail des séances réalisées — source : cahiers de texte clôturés</p>
                      <div style={{ background: bg2, borderRadius: "12px", border: `1px solid ${brd}`, overflow: "hidden", boxShadow: shadow }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                          <thead>
                            <tr style={{ background: bg3 }}>
                              {["Date", "Matière", "Classe", "Début", "Fin", "Durée", "Taux", "Montant"].map(h => (
                                <th key={h} style={{ textAlign: "left", padding: "11px 12px", color: txt2, fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {seancesDemo.map((s, i) => (
                              <tr key={i} style={{ borderBottom: `1px solid ${brd}` }}>
                                <td style={{ padding: "11px 12px", color: txt }}>{s.date}</td>
                                <td style={{ padding: "11px 12px", color: txt, fontWeight: "600" }}>{s.matiere}</td>
                                <td style={{ padding: "11px 12px", color: txt2 }}>{s.classe}</td>
                                <td style={{ padding: "11px 12px", color: txt }}>{s.debut}</td>
                                <td style={{ padding: "11px 12px", color: txt }}>{s.fin}</td>
                                <td style={{ padding: "11px 12px", color: txt, fontWeight: "600" }}>{s.duree}</td>
                                <td style={{ padding: "11px 12px", color: txt2 }}>{s.taux.toLocaleString("fr-FR")} F</td>
                                <td style={{ padding: "11px 12px", color: "#0F6E56", fontWeight: "700" }}>{s.montant.toLocaleString("fr-FR")} F</td>
                              </tr>
                            ))}
                            <tr style={{ background: bg3 }}>
                              <td colSpan="5" style={{ padding: "11px 12px", color: txt, fontWeight: "700", textAlign: "right" }}>Total</td>
                              <td style={{ padding: "11px 12px", color: "#0F6E56", fontWeight: "700" }}>{totalHeures}</td>
                              <td/>
                              <td style={{ padding: "11px 12px", color: "#0F6E56", fontWeight: "700" }}>{totalMontant.toLocaleString("fr-FR")} F</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* CONTRÔLES */}
                  {onglet === "controles" && (
                    <div>
                      <p style={{ fontSize: "13px", color: txt2, margin: "0 0 16px" }}>Vérifications automatiques de cohérence</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {[
                          { title: "📝 Cahiers de texte signés", anomalie: true, items: seancesDemo.map(s => ({ label: `${s.date} — ${s.matiere}`, ok: s.cahier })) },
                          { title: "📱 Pointages QR-Code",        anomalie: true, items: seancesDemo.map(s => ({ label: `${s.date} — ${s.matiere}`, ok: s.qr })) },
                        ].map((ctrl, ci) => (
                          <div key={ci} style={{ background: bg2, borderRadius: "12px", border: `1px solid ${brd}`, padding: "14px 16px", boxShadow: shadow }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                              <p style={{ fontSize: "13px", fontWeight: "700", color: txt, margin: 0 }}>{ctrl.title}</p>
                              <span style={{ fontSize: "11px", background: "#FAEEDA", color: "#633806", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>⚠️ 1 anomalie</span>
                            </div>
                            {ctrl.items.map((item, ii) => (
                              <div key={ii} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${brd}` }}>
                                <span style={{ fontSize: "12px", color: txt }}>{item.label}</span>
                                <span style={{ fontSize: "11px", background: item.ok ? "#E1F5EE" : "#FCEBEB", color: item.ok ? "#085041" : "#791F1F", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>
                                  {item.ok ? "✅ OK" : "❌ Manquant"}
                                </span>
                              </div>
                            ))}
                          </div>
                        ))}
                        <div style={{ background: bg2, borderRadius: "12px", border: `1px solid ${brd}`, padding: "14px 16px", boxShadow: shadow }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <p style={{ fontSize: "13px", fontWeight: "700", color: txt, margin: 0 }}>⏱️ Durées vs planifiées</p>
                            <span style={{ fontSize: "11px", background: "#E1F5EE", color: "#085041", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>✅ OK</span>
                          </div>
                          <p style={{ fontSize: "12px", color: txt2, margin: "10px 0 0" }}>Aucune séance ne dépasse la durée planifiée de plus de 30 minutes.</p>
                        </div>
                        <div style={{ background: "#FAEEDA", borderRadius: "12px", padding: "14px 16px", display: "flex", gap: "12px", alignItems: "flex-start", border: "1px solid #E8C97A" }}>
                          <span style={{ fontSize: "22px" }}>⚠️</span>
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: "700", color: "#633806", margin: "0 0 4px" }}>2 anomalies détectées</p>
                            <p style={{ fontSize: "12px", color: "#854F0B", margin: 0 }}>1 cahier non signé, 1 séance sans QR. La validation reste possible.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SIGNATURES */}
                  {onglet === "signatures" && (
                    <div>
                      <div style={{ background: bg3, borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", display: "flex", gap: "10px", border: `1px solid ${brd}` }}>
                        <span style={{ fontSize: "18px" }}>ℹ️</span>
                        <p style={{ fontSize: "13px", color: txt2, margin: 0 }}>Chaque partie signe numériquement pour valider la fiche. Les signatures sont horodatées et archivées.</p>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        {/* Enseignant */}
                        <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "16px", boxShadow: shadow }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>✍️</div>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: "700", color: txt, margin: 0 }}>Enseignant</p>
                              <p style={{ fontSize: "11px", color: ["signee_enseignant","validee_surveillant","approuvee_comptable"].includes(selected.statut) ? "#0F6E56" : txt2, margin: 0, fontWeight: "500" }}>
                                {["signee_enseignant","validee_surveillant","approuvee_comptable"].includes(selected.statut) ? "✅ Signé" : "En attente"}
                              </p>
                            </div>
                          </div>
                          <canvas ref={sigEnsRef} width={280} height={100} style={{ border: `2px dashed ${brd}`, borderRadius: "10px", background: bg3, width: "100%", touchAction: "none", cursor: "crosshair" }}/>
                          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                            <button onClick={() => sigEnsPad.current?.clear()} style={{ flex: 1, padding: "8px", background: bg3, color: txt2, border: `1px solid ${brd}`, borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>🗑️ Effacer</button>
                            <button onClick={() => handleValider("signer")} disabled={saving} style={{ flex: 1, padding: "8px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>✅ Valider</button>
                          </div>
                        </div>

                        {/* Surveillant */}
                        <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "16px", boxShadow: shadow }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>👁️</div>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: "700", color: txt, margin: 0 }}>Surveillant</p>
                              <p style={{ fontSize: "11px", color: ["validee_surveillant","approuvee_comptable"].includes(selected.statut) ? "#0F6E56" : txt2, margin: 0, fontWeight: "500" }}>
                                {["validee_surveillant","approuvee_comptable"].includes(selected.statut) ? "✅ Visé" : "En attente"}
                              </p>
                            </div>
                          </div>
                          <canvas ref={sigSurvRef} width={280} height={100} style={{ border: `2px dashed ${brd}`, borderRadius: "10px", background: bg3, width: "100%", touchAction: "none", cursor: "crosshair" }}/>
                          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                            <button onClick={() => sigSurvPad.current?.clear()} style={{ flex: 1, padding: "8px", background: bg3, color: txt2, border: `1px solid ${brd}`, borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>🗑️ Effacer</button>
                            <button onClick={() => handleValider("valider")} disabled={saving} style={{ flex: 1, padding: "8px", background: "linear-gradient(135deg, #2874D6, #185FA5)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>👁️ Viser</button>
                          </div>
                        </div>
                      </div>

                      {selected.statut === "validee_surveillant" && (
                        <div style={{ background: "#E1F5EE", borderRadius: "12px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #9FE1CB" }}>
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: "700", color: "#085041", margin: "0 0 4px" }}>💰 Approbation comptable</p>
                            <p style={{ fontSize: "12px", color: "#1D9E75", margin: 0 }}>La fiche est prête pour approbation finale</p>
                          </div>
                          <button onClick={() => handleValider("approuver")} disabled={saving} style={{ padding: "11px 20px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 3px 10px rgba(15,110,86,0.3)" }}>
                            ✅ Approuver
                          </button>
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

      {/* ===== MODAL GÉNÉRER ===== */}
      {showGenerer && (
        <div onClick={() => setShowGenerer(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: bg2, borderRadius: "20px", padding: "1.75rem", width: "420px", border: `1px solid ${brd}`, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: txt }}>⚡ Générer une fiche</h3>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: txt2 }}>Fiche de vacation mensuelle</p>
              </div>
              <button onClick={() => setShowGenerer(false)} style={{ background: bg3, border: `1px solid ${brd}`, width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", color: txt2, fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>Enseignant vacataire</label>
              <select value={formGen.id_enseignant} onChange={e => setFormGen({...formGen, id_enseignant: e.target.value})} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${brd}`, background: bg3, color: txt, fontSize: "13px" }}>
                <option value="">Sélectionner un enseignant...</option>
                {enseignants.filter(e => e.statut === "vacataire").map(e => (
                  <option key={e.id} value={e.id}>{e.prenom} {e.nom} — {parseFloat(e.taux_horaire).toLocaleString("fr-FR")} F/h</option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyle}>Mois</label>
                <select value={formGen.mois} onChange={e => setFormGen({...formGen, mois: parseInt(e.target.value)})} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${brd}`, background: bg3, color: txt, fontSize: "13px" }}>
                  {mois.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Année</label>
                <input type="number" value={formGen.annee} onChange={e => setFormGen({...formGen, annee: parseInt(e.target.value)})} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${brd}`, background: bg3, color: txt, fontSize: "13px" }}/>
              </div>
            </div>

            <div style={{ background: bg3, borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", display: "flex", gap: "10px", border: `1px solid ${brd}` }}>
              <span>ℹ️</span>
              <p style={{ fontSize: "12px", color: txt2, margin: 0 }}>La fiche sera générée depuis les cahiers de texte clôturés ce mois.</p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleGenerer} disabled={saving} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 3px 10px rgba(15,110,86,0.3)" }}>
                {saving ? "⏳ Génération..." : "⚡ Générer la fiche"}
              </button>
              <button onClick={() => setShowGenerer(false)} style={{ padding: "12px 20px", background: bg3, color: txt, border: `1px solid ${brd}`, borderRadius: "10px", fontSize: "13px", cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
