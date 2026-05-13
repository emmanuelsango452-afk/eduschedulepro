import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import SignaturePad from "signature_pad";

const API = 'http://localhost/eduschedulepro/backend/api';

export default function CahierTextePage() {
  const { token, utilisateur } = useAuth();
  const navigate  = useNavigate();
  const [cahiers, setCahiers]         = useState([]);
  const [selected, setSelected]       = useState(null);
  const [dark, setDark]               = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading]         = useState(true);
  const [onglet, setOnglet]           = useState("detail");
  const [filtre, setFiltre]           = useState("tous");
  const [search, setSearch]           = useState("");
  const [showModalAjouter, setShowModalAjouter] = useState(false);
  const [creneaux, setCreneaux]       = useState([]);
  const [formNouveauCahier, setFormNouveauCahier] = useState({ id_creneau: "" });
  const [formContenu, setFormContenu] = useState({
    titre_cours: "", points_vus: "", niveau_avancement: "", observations: "", heure_fin: "",
  });
  const [travaux, setTravaux]         = useState([]);
  const [nouveauTravail, setNouveauTravail] = useState({ description: "", date_limite: "", type: "exercice" });
  const [saving, setSaving]           = useState(false);
  const [message, setMessage]         = useState("");

  const sigDelRef = useRef(null);
  const sigEnsRef = useRef(null);
  const sigDelPad = useRef(null);
  const sigEnsPad = useRef(null);

  const bg     = dark ? "#0d1117" : "#f0faf6";
  const bg2    = dark ? "#161b22" : "#ffffff";
  const bg3    = dark ? "#21262d" : "#e8f5ee";
  const txt    = dark ? "#e6edf3" : "#04342C";
  const txt2   = dark ? "#8b949e" : "#5F5E5A";
  const brd    = dark ? "rgba(255,255,255,0.08)" : "rgba(4,52,44,0.08)";
  const shadow = dark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 12px rgba(4,52,44,0.06)";

  const chargerCahiers = async () => {
    try {
      const res = await axios.get(`${API}/cahiers.php`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.succes) setCahiers(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    chargerCahiers();
    axios.get(`${API}/emploi_temps.php`, { headers: { Authorization: `Bearer ${token}` } }).then(res => {
      if (res.data.succes) {
        const all = [];
        res.data.data.forEach(p => { if (p.creneaux) p.creneaux.forEach(cr => { if (cr) all.push(cr); }); });
        setCreneaux(all);
      }
    });
  }, [token]);

  useEffect(() => {
    if (onglet === "signer" && sigDelRef.current && sigEnsRef.current) {
      setTimeout(() => {
        sigDelPad.current = new SignaturePad(sigDelRef.current, { penColor: "#0F6E56" });
        sigEnsPad.current = new SignaturePad(sigEnsRef.current, { penColor: "#0F6E56" });
      }, 100);
    }
  }, [onglet, selected]);

  useEffect(() => {
    if (selected) {
      setFormContenu({
        titre_cours: selected.titre_cours || "",
        points_vus: selected.contenu_json?.points?.join("\n") || "",
        niveau_avancement: selected.niveau_avancement || "",
        observations: selected.contenu_json?.observations || "",
        heure_fin: selected.heure_fin_reelle || "",
      });
      setTravaux(selected.travaux || []);
    }
  }, [selected]);

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };
  const estVerrouille = selected?.statut === "cloture";

  const getStatut = (statut) => {
    const cfg = {
      brouillon:     { bg: "#F1EFE8", color: "#5F5E5A", label: "Brouillon",     icon: "📄" },
      signe_delegue: { bg: "#FAEEDA", color: "#633806", label: "Signé délégué", icon: "✍️" },
      cloture:       { bg: "#E1F5EE", color: "#085041", label: "Clôturé",        icon: "✅" },
    };
    return cfg[statut] || cfg.brouillon;
  };

  const cahiersFiltres = cahiers.filter(c => {
    const matchFiltre = filtre === "tous" || c.statut === filtre;
    const matchSearch = !search || c.matiere?.toLowerCase().includes(search.toLowerCase()) || c.classe?.toLowerCase().includes(search.toLowerCase()) || c.enseignant?.toLowerCase().includes(search.toLowerCase());
    return matchFiltre && matchSearch;
  });

  const stats = {
    total: cahiers.length,
    brouillon: cahiers.filter(c => c.statut === "brouillon").length,
    signe: cahiers.filter(c => c.statut === "signe_delegue").length,
    cloture: cahiers.filter(c => c.statut === "cloture").length,
  };

  const handleAjouterCahier = async () => {
    if (!formNouveauCahier.id_creneau) { showMsg("⚠️ Sélectionnez un créneau !"); return; }
    setSaving(true);
    try {
      const res = await axios.post(`${API}/cahiers.php`, { id_creneau: formNouveauCahier.id_creneau }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.succes) { showMsg("✅ Cahier créé !"); setShowModalAjouter(false); setFormNouveauCahier({ id_creneau: "" }); chargerCahiers(); }
      else { showMsg(`❌ ${res.data.message}`); }
    } catch (err) { showMsg(`❌ ${err.response?.data?.message || "Erreur"}`); }
    finally { setSaving(false); }
  };

  const handleSupprimerCahier = async (id) => {
    if (!window.confirm("Supprimer ce cahier ?")) return;
    try {
      await axios.delete(`${API}/cahiers.php?id=${id}`, { headers: { Authorization: `Bearer ${token}` } });
      showMsg("✅ Supprimé !"); setSelected(null); chargerCahiers();
    } catch { showMsg("❌ Erreur"); }
  };

  const handleSauvegarder = async () => {
    if (!selected || estVerrouille) return;
    setSaving(true);
    try {
      await axios.put(`${API}/cahiers.php?id=${selected.id}`, {
        titre_cours: formContenu.titre_cours,
        contenu_json: { points: formContenu.points_vus.split("\n").filter(p => p.trim()), observations: formContenu.observations },
        niveau_avancement: formContenu.niveau_avancement, heure_fin: formContenu.heure_fin,
      }, { headers: { Authorization: `Bearer ${token}` } });
      showMsg("✅ Sauvegardé !"); chargerCahiers();
    } catch { showMsg("❌ Erreur"); }
    finally { setSaving(false); }
  };

  const handleCloture = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const sigBase64 = sigEnsPad.current?.isEmpty() ? null : sigEnsPad.current?.toDataURL();
      await axios.post(`${API}/cahiers.php?id=${selected.id}&action=cloture`, { heure_fin: formContenu.heure_fin || new Date().toTimeString().slice(0,8), signature_base64: sigBase64 }, { headers: { Authorization: `Bearer ${token}` } });
      showMsg("✅ Séance clôturée !"); chargerCahiers(); setSelected(prev => prev ? { ...prev, statut: "cloture" } : null);
    } catch (err) { showMsg(`❌ ${err.response?.data?.message || "Erreur"}`); }
    finally { setSaving(false); }
  };

  const handleSigner = async (type) => {
    const pad = type === "delegue" ? sigDelPad.current : sigEnsPad.current;
    if (!pad || pad.isEmpty()) { showMsg("⚠️ Dessinez votre signature !"); return; }
    setSaving(true);
    try {
      await axios.post(`${API}/cahiers.php?id=${selected.id}&action=signer`, { type, signature_base64: pad.toDataURL() }, { headers: { Authorization: `Bearer ${token}` } });
      showMsg(`✅ Signature enregistrée !`); chargerCahiers(); setSelected(prev => prev ? { ...prev, statut: "signe_delegue" } : null);
    } catch (err) { showMsg(`❌ ${err.response?.data?.message || "Erreur"}`); }
    finally { setSaving(false); }
  };

  const dashRoute = utilisateur?.role === "administrateur" ? "/dashboard/admin" : utilisateur?.role === "enseignant" ? "/dashboard/enseignant" : utilisateur?.role === "delegue" ? "/dashboard/delegue" : utilisateur?.role === "surveillant" ? "/dashboard/surveillant" : utilisateur?.role === "comptable" ? "/dashboard/comptable" : "/dashboard/admin";

  const menuItems = [
    { label: "Tableau de bord",  icon: "⊞",  route: dashRoute },
    { label: "Emploi du temps",  icon: "📅",  route: "/emploi-temps" },
    { label: "Cahiers de texte", icon: "📝",  route: "/cahiers", active: true },
    { label: "Vacations",        icon: "💰",  route: "/vacations" },
    { label: "Enseignants",      icon: "👨‍🏫", route: "/enseignants" },
    { label: "Rapports",         icon: "📊",  route: "/rapports" },
  ];

  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${brd}`, background: estVerrouille ? bg3 : bg2, color: txt, fontSize: "13px", outline: "none", fontFamily: "inherit" };
  const labelStyle = { fontSize: "11px", color: txt2, display: "block", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" };

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
            <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: txt }}>📝 Cahiers de texte</p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>{cahiers.length} cahier(s) enregistré(s)</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {message && (
              <div style={{ padding: "7px 14px", background: message.includes("✅") ? "#E1F5EE" : message.includes("⚠️") ? "#FAEEDA" : "#FCEBEB", color: message.includes("✅") ? "#085041" : message.includes("⚠️") ? "#633806" : "#791F1F", borderRadius: "8px", fontSize: "12px", fontWeight: "600", boxShadow: shadow }}>
                {message}
              </div>
            )}
            <button onClick={() => setShowModalAjouter(true)} style={{ padding: "8px 16px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600", boxShadow: "0 2px 8px rgba(15,110,86,0.3)" }}>
              ＋ Nouveau cahier
            </button>
            <button onClick={() => setDark(!dark)} style={{ width: "38px", height: "38px", background: bg3, borderRadius: "10px", border: `1px solid ${brd}`, cursor: "pointer", fontSize: "17px" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", padding: "1rem 1.5rem 0" }}>
          {[
            { label: "Total",          val: stats.total,     color: "#0F6E56", bg: "#E1F5EE", icon: "📚", id: "tous" },
            { label: "Brouillons",     val: stats.brouillon, color: "#5F5E5A", bg: "#F1EFE8", icon: "📄", id: "brouillon" },
            { label: "Signés délégué", val: stats.signe,     color: "#633806", bg: "#FAEEDA", icon: "✍️", id: "signe_delegue" },
            { label: "Clôturés",       val: stats.cloture,   color: "#085041", bg: "#E1F5EE", icon: "✅", id: "cloture" },
          ].map((s, i) => (
            <div key={i} onClick={() => setFiltre(s.id)} style={{
              background: bg2, borderRadius: "12px", cursor: "pointer",
              border: `2px solid ${filtre === s.id ? s.color : brd}`,
              padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px",
              boxShadow: filtre === s.id ? `0 4px 12px ${s.color}25` : shadow,
              transition: "all 0.2s"
            }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: "26px", fontWeight: "700", color: s.color, margin: "0 0 2px", lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontSize: "11px", color: txt2, margin: 0, fontWeight: "500" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* BODY */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", padding: "1rem 1.5rem", gap: "14px" }}>

          {/* LISTE */}
          <div style={{ width: "300px", background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, display: "flex", flexDirection: "column", flexShrink: 0, boxShadow: shadow }}>
            <div style={{ padding: "12px", borderBottom: `1px solid ${brd}` }}>
              <input type="text" placeholder="🔍 Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: "8px", border: `1px solid ${brd}`, background: bg3, color: txt, fontSize: "12px", outline: "none" }}/>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              {loading ? (
                <p style={{ color: txt2, textAlign: "center", padding: "2rem", fontSize: "13px" }}>Chargement...</p>
              ) : cahiersFiltres.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <p style={{ fontSize: "40px", margin: "0 0 12px" }}>📝</p>
                  <p style={{ color: txt2, fontSize: "13px", marginBottom: "12px" }}>Aucun cahier trouvé</p>
                  <button onClick={() => setShowModalAjouter(true)} style={{ padding: "8px 16px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
                    ＋ Créer
                  </button>
                </div>
              ) : (
                cahiersFiltres.map((c, i) => {
                  const s = getStatut(c.statut);
                  const isSelected = selected?.id === c.id;
                  return (
                    <div key={i} onClick={() => { setSelected(c); setOnglet("detail"); }} style={{
                      background: isSelected ? bg3 : "transparent",
                      borderRadius: "10px",
                      border: `1px solid ${isSelected ? "#0F6E56" : "transparent"}`,
                      borderLeft: `4px solid ${isSelected ? "#0F6E56" : "transparent"}`,
                      padding: "12px", marginBottom: "4px", cursor: "pointer",
                      transition: "all 0.2s"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: txt, margin: 0 }}>{c.matiere || "Matière"}</p>
                        <span style={{ fontSize: "10px", background: s.bg, color: s.color, padding: "2px 7px", borderRadius: "20px", fontWeight: "600" }}>
                          {s.icon} {s.label}
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", color: txt2, margin: "0 0 4px" }}>{c.classe}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>👨‍🏫 {c.enseignant?.split(" ").slice(-1)[0]}</p>
                        <button onClick={(e) => { e.stopPropagation(); handleSupprimerCahier(c.id); }} style={{ padding: "2px 7px", background: "#FCEBEB", color: "#791F1F", border: "1px solid #F09595", borderRadius: "6px", fontSize: "10px", cursor: "pointer" }}>🗑️</button>
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
                <p style={{ fontSize: "72px", margin: "0 0 16px" }}>📖</p>
                <p style={{ fontSize: "17px", fontWeight: "700", color: txt, margin: "0 0 8px" }}>Sélectionnez un cahier</p>
                <p style={{ fontSize: "13px", color: txt2 }}>Cliquez sur un cahier dans la liste pour voir son contenu</p>
              </div>
            ) : (
              <>
                {/* Header détail */}
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${brd}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "16px", fontWeight: "700", color: txt, margin: "0 0 6px" }}>{selected.matiere}</p>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "12px", color: txt2, background: bg3, padding: "3px 8px", borderRadius: "6px" }}>{selected.classe}</span>
                      <span style={{ fontSize: "12px", color: txt2 }}>👨‍🏫 {selected.enseignant}</span>
                      <span style={{ fontSize: "11px", background: getStatut(selected.statut).bg, color: getStatut(selected.statut).color, padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>
                        {getStatut(selected.statut).icon} {getStatut(selected.statut).label}
                      </span>
                      {estVerrouille && <span style={{ fontSize: "11px", background: "#FCEBEB", color: "#791F1F", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>🔒 Verrouillé</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button style={{ padding: "7px 14px", background: "#E1F5EE", color: "#085041", border: "1px solid #9FE1CB", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>📄 PDF</button>
                    <button onClick={() => handleSupprimerCahier(selected.id)} style={{ padding: "7px 14px", background: "#FCEBEB", color: "#791F1F", border: "1px solid #F09595", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>🗑️ Supprimer</button>
                  </div>
                </div>

                {/* Étapes workflow */}
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${brd}`, background: bg3 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {[
                      { num: 1, label: "Pointage QR",       done: true },
                      { num: 2, label: "Saisie contenu",    done: !!selected.titre_cours },
                      { num: 3, label: "Signature délégué", done: selected.statut !== "brouillon" },
                      { num: 4, label: "Clôture",           done: selected.statut === "cloture" },
                    ].map((step, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                          <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: step.done ? "linear-gradient(135deg, #1D9E75, #0F6E56)" : bg2, border: `2px solid ${step.done ? "#0F6E56" : brd}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: step.done ? "#fff" : txt2, boxShadow: step.done ? "0 2px 8px rgba(15,110,86,0.3)" : "none" }}>
                            {step.done ? "✓" : step.num}
                          </div>
                          <p style={{ fontSize: "10px", color: step.done ? "#0F6E56" : txt2, margin: "5px 0 0", textAlign: "center", fontWeight: step.done ? "600" : "400" }}>{step.label}</p>
                        </div>
                        {i < 3 && <div style={{ height: "2px", flex: 1, background: step.done ? "#0F6E56" : brd, margin: "0 4px", marginBottom: "18px", borderRadius: "1px" }}/>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Onglets */}
                <div style={{ display: "flex", borderBottom: `1px solid ${brd}` }}>
                  {[
                    { id: "detail",  label: "📄 Contenu" },
                    { id: "travaux", label: "📚 Travaux" },
                    { id: "signer",  label: "✍️ Signatures" },
                  ].map(o => (
                    <button key={o.id} onClick={() => setOnglet(o.id)} style={{
                      padding: "12px 20px", border: "none", cursor: "pointer", background: "transparent",
                      color: onglet === o.id ? "#0F6E56" : txt2, fontSize: "13px",
                      fontWeight: onglet === o.id ? "700" : "400",
                      borderBottom: onglet === o.id ? "2px solid #0F6E56" : "2px solid transparent",
                      transition: "all 0.2s"
                    }}>{o.label}</button>
                  ))}
                </div>

                {/* CONTENU ONGLETS */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>

                  {onglet === "detail" && (
                    <div>
                      {/* Infos auto */}
                      <div style={{ background: bg3, borderRadius: "12px", padding: "14px 16px", marginBottom: "16px", border: `1px solid ${brd}` }}>
                        <p style={{ fontSize: "11px", color: txt2, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700" }}>Informations automatiques</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                          {[
                            { label: "Classe",       val: selected.classe },
                            { label: "Matière",      val: selected.matiere },
                            { label: "Enseignant",   val: selected.enseignant },
                            { label: "Date",         val: selected.date_creation ? new Date(selected.date_creation).toLocaleDateString("fr-FR") : "—" },
                            { label: "Heure début",  val: "08h07 ✓" },
                            { label: "Heure fin",    val: selected.heure_fin_reelle || "En cours..." },
                          ].map(item => (
                            <div key={item.label} style={{ background: bg2, borderRadius: "8px", padding: "8px 10px", border: `1px solid ${brd}` }}>
                              <p style={{ fontSize: "10px", color: txt2, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.3px" }}>{item.label}</p>
                              <p style={{ fontSize: "12px", fontWeight: "600", color: txt, margin: 0 }}>{item.val || "—"}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <label style={labelStyle}>📌 Titre du cours <span style={{ color: "#E24B4A" }}>*</span></label>
                        <input type="text" value={formContenu.titre_cours} onChange={e => setFormContenu({...formContenu, titre_cours: e.target.value})} placeholder="Ex: Introduction aux protocoles TCP/IP" disabled={estVerrouille} style={inputStyle}/>
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <label style={labelStyle}>📋 Points vus <span style={{ color: "#E24B4A" }}>*</span></label>
                        <textarea value={formContenu.points_vus} onChange={e => setFormContenu({...formContenu, points_vus: e.target.value})} placeholder="Un point par ligne..." disabled={estVerrouille} rows={4} style={{ ...inputStyle, resize: "vertical" }}/>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                        <div>
                          <label style={labelStyle}>📊 Niveau d'avancement</label>
                          <input type="text" value={formContenu.niveau_avancement} onChange={e => setFormContenu({...formContenu, niveau_avancement: e.target.value})} placeholder="Ex: Chapitre 2/5 — 40%" disabled={estVerrouille} style={inputStyle}/>
                        </div>
                        <div>
                          <label style={labelStyle}>⏰ Heure de fin réelle</label>
                          <input type="time" value={formContenu.heure_fin} onChange={e => setFormContenu({...formContenu, heure_fin: e.target.value})} disabled={estVerrouille} style={inputStyle}/>
                        </div>
                      </div>

                      <div style={{ marginBottom: "16px" }}>
                        <label style={labelStyle}>💬 Observations</label>
                        <textarea value={formContenu.observations} onChange={e => setFormContenu({...formContenu, observations: e.target.value})} placeholder="Incidents, retards, absences..." disabled={estVerrouille} rows={3} style={{ ...inputStyle, resize: "vertical" }}/>
                      </div>

                      {!estVerrouille ? (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button onClick={handleSauvegarder} disabled={saving} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 3px 10px rgba(15,110,86,0.3)" }}>
                            {saving ? "⏳ Sauvegarde..." : "💾 Enregistrer brouillon"}
                          </button>
                          <button onClick={() => setOnglet("signer")} style={{ padding: "12px 20px", background: "#EEEDFE", color: "#3C3489", border: "1px solid #CECBF6", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "600" }}>
                            ✍️ Signer →
                          </button>
                        </div>
                      ) : (
                        <div style={{ background: "#FCEBEB", borderRadius: "12px", padding: "14px 16px", display: "flex", gap: "12px", alignItems: "center", border: "1px solid #F09595" }}>
                          <span style={{ fontSize: "22px" }}>🔒</span>
                          <p style={{ fontSize: "13px", color: "#791F1F", margin: 0, fontWeight: "500" }}>Cette fiche est verrouillée. Aucune modification possible.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {onglet === "travaux" && (
                    <div>
                      {!estVerrouille && (
                        <div style={{ background: bg3, borderRadius: "12px", padding: "16px", marginBottom: "16px", border: `1px solid ${brd}` }}>
                          <p style={{ fontSize: "13px", fontWeight: "700", color: txt, margin: "0 0 12px" }}>➕ Ajouter un travail</p>
                          <input type="text" placeholder="Description du travail..." value={nouveauTravail.description} onChange={e => setNouveauTravail({...nouveauTravail, description: e.target.value})} style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${brd}`, background: bg2, color: txt, fontSize: "13px", outline: "none", marginBottom: "10px" }}/>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                            <select value={nouveauTravail.type} onChange={e => setNouveauTravail({...nouveauTravail, type: e.target.value})} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${brd}`, background: bg2, color: txt, fontSize: "13px" }}>
                              <option value="exercice">Exercice</option>
                              <option value="devoir">Devoir</option>
                              <option value="projet">Projet</option>
                              <option value="lecture">Lecture</option>
                            </select>
                            <input type="date" value={nouveauTravail.date_limite} onChange={e => setNouveauTravail({...nouveauTravail, date_limite: e.target.value})} style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${brd}`, background: bg2, color: txt, fontSize: "13px" }}/>
                          </div>
                          <button onClick={() => { if (!nouveauTravail.description) return; setTravaux([...travaux, { ...nouveauTravail, id: Date.now() }]); setNouveauTravail({ description: "", date_limite: "", type: "exercice" }); }} style={{ padding: "9px 20px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontWeight: "600" }}>
                            ➕ Ajouter
                          </button>
                        </div>
                      )}
                      {travaux.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "3rem" }}>
                          <p style={{ fontSize: "48px", margin: "0 0 12px" }}>📚</p>
                          <p style={{ color: txt2, fontSize: "13px" }}>Aucun travail demandé</p>
                        </div>
                      ) : travaux.map((t, i) => {
                        const tc = { exercice: { bg: "#EEEDFE", color: "#3C3489" }, devoir: { bg: "#FAEEDA", color: "#633806" }, projet: { bg: "#E6F1FB", color: "#0C447C" }, lecture: { bg: "#E1F5EE", color: "#085041" } }[t.type] || { bg: "#EEEDFE", color: "#3C3489" };
                        return (
                          <div key={i} style={{ background: bg2, borderRadius: "10px", border: `1px solid ${brd}`, padding: "12px 16px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "11px", background: tc.bg, color: tc.color, padding: "3px 10px", borderRadius: "20px", fontWeight: "600", flexShrink: 0 }}>{t.type}</span>
                            <p style={{ fontSize: "13px", color: txt, margin: 0, flex: 1 }}>{t.description}</p>
                            {t.date_limite && <span style={{ fontSize: "11px", color: txt2, flexShrink: 0 }}>📅 {t.date_limite}</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {onglet === "signer" && (
                    <div>
                      {estVerrouille ? (
                        <div style={{ background: "#E1F5EE", borderRadius: "12px", padding: "16px", marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center", border: "1px solid #9FE1CB" }}>
                          <span style={{ fontSize: "22px" }}>✅</span>
                          <p style={{ fontSize: "13px", color: "#085041", margin: 0, fontWeight: "600" }}>Cette fiche est clôturée et signée par les deux parties.</p>
                        </div>
                      ) : (
                        <div style={{ background: bg3, borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", display: "flex", gap: "10px", border: `1px solid ${brd}` }}>
                          <span style={{ fontSize: "18px" }}>ℹ️</span>
                          <p style={{ fontSize: "13px", color: txt2, margin: 0 }}>Dessinez votre signature puis cliquez sur Valider. Elle sera horodatée et archivée.</p>
                        </div>
                      )}

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        {/* Délégué */}
                        <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "16px", boxShadow: shadow }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>✍️</div>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: "700", color: txt, margin: 0 }}>Délégué de classe</p>
                              <p style={{ fontSize: "11px", color: selected.statut !== "brouillon" ? "#0F6E56" : txt2, margin: 0, fontWeight: "500" }}>
                                {selected.statut !== "brouillon" ? "✅ Signé" : "En attente"}
                              </p>
                            </div>
                          </div>
                          <canvas ref={sigDelRef} width={300} height={120} style={{ border: `2px dashed ${brd}`, borderRadius: "10px", background: bg3, width: "100%", touchAction: "none", cursor: estVerrouille ? "not-allowed" : "crosshair" }}/>
                          {!estVerrouille && (
                            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                              <button onClick={() => sigDelPad.current?.clear()} style={{ flex: 1, padding: "8px", background: bg3, color: txt2, border: `1px solid ${brd}`, borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>🗑️ Effacer</button>
                              <button onClick={() => handleSigner("delegue")} disabled={saving} style={{ flex: 1, padding: "8px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>✅ Valider</button>
                            </div>
                          )}
                        </div>

                        {/* Enseignant */}
                        <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "16px", boxShadow: shadow }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>✍️</div>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: "700", color: txt, margin: 0 }}>Enseignant</p>
                              <p style={{ fontSize: "11px", color: selected.statut === "cloture" ? "#0F6E56" : txt2, margin: 0, fontWeight: "500" }}>
                                {selected.statut === "cloture" ? "✅ Signé" : "En attente"}
                              </p>
                            </div>
                          </div>
                          <canvas ref={sigEnsRef} width={300} height={120} style={{ border: `2px dashed ${brd}`, borderRadius: "10px", background: bg3, width: "100%", touchAction: "none", cursor: estVerrouille ? "not-allowed" : "crosshair" }}/>
                          {!estVerrouille && (
                            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                              <button onClick={() => sigEnsPad.current?.clear()} style={{ flex: 1, padding: "8px", background: bg3, color: txt2, border: `1px solid ${brd}`, borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>🗑️ Effacer</button>
                              <button onClick={() => handleSigner("enseignant")} disabled={saving} style={{ flex: 1, padding: "8px", background: "linear-gradient(135deg, #6B5CE7, #534AB7)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>✅ Valider</button>
                            </div>
                          )}
                        </div>
                      </div>

                      {!estVerrouille && (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button onClick={handleCloture} disabled={saving} style={{ flex: 1, padding: "13px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(15,110,86,0.3)" }}>
                            {saving ? "⏳..." : "🔒 Clôturer la séance"}
                          </button>
                          <button style={{ padding: "13px 20px", background: "#FCEBEB", color: "#791F1F", border: "1px solid #F09595", borderRadius: "12px", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}>⚠️ Signaler incident</button>
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

      {/* ===== MODAL AJOUTER CAHIER ===== */}
      {showModalAjouter && (
        <div onClick={() => setShowModalAjouter(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: bg2, borderRadius: "20px", padding: "1.75rem", width: "440px", border: `1px solid ${brd}`, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: txt }}>➕ Nouveau cahier</h3>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: txt2 }}>Créer un cahier de texte pour une séance</p>
              </div>
              <button onClick={() => setShowModalAjouter(false)} style={{ background: bg3, border: `1px solid ${brd}`, width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", color: txt2, fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Sélectionnez un créneau</label>
              <select value={formNouveauCahier.id_creneau} onChange={e => setFormNouveauCahier({...formNouveauCahier, id_creneau: e.target.value})} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${brd}`, background: bg3, color: txt, fontSize: "13px" }}>
                <option value="">Choisir un créneau...</option>
                {creneaux.map((cr, i) => (
                  <option key={i} value={cr.id}>{cr.jour} — {cr.heure_debut?.slice(0,5)} — {cr.matiere} ({cr.enseignant?.split(" ").slice(-1)[0]})</option>
                ))}
              </select>
            </div>
            <div style={{ background: bg3, borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", display: "flex", gap: "10px", border: `1px solid ${brd}` }}>
              <span>ℹ️</span>
              <p style={{ fontSize: "12px", color: txt2, margin: 0 }}>Le cahier sera créé en brouillon. Le délégué pourra ensuite remplir le contenu.</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleAjouterCahier} disabled={saving} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 3px 10px rgba(15,110,86,0.3)" }}>
                {saving ? "⏳..." : "➕ Créer le cahier"}
              </button>
              <button onClick={() => setShowModalAjouter(false)} style={{ padding: "12px 20px", background: bg3, color: txt, border: `1px solid ${brd}`, borderRadius: "10px", fontSize: "13px", cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
