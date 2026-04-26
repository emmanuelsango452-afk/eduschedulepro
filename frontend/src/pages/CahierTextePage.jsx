import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import SignaturePad from "signature_pad";

const API = "http://localhost/eduschedulepro/backend/api";

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
    titre_cours: "", points_vus: "", niveau_avancement: "",
    observations: "", heure_fin: "",
  });
  const [travaux, setTravaux]         = useState([]);
  const [nouveauTravail, setNouveauTravail] = useState({
    description: "", date_limite: "", type: "exercice"
  });
  const [saving, setSaving]           = useState(false);
  const [message, setMessage]         = useState("");

  const sigDelRef = useRef(null);
  const sigEnsRef = useRef(null);
  const sigDelPad = useRef(null);
  const sigEnsPad = useRef(null);

  const bg   = dark ? "#0d1117" : "#f0faf6";
  const bg2  = dark ? "#161b22" : "#ffffff";
  const bg3  = dark ? "#21262d" : "#e1f5ee";
  const txt  = dark ? "#e6edf3" : "#04342C";
  const txt2 = dark ? "#8b949e" : "#5F5E5A";
  const brd  = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  const chargerCahiers = async () => {
    try {
      const res = await axios.get(`${API}/cahiers.php`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.succes) setCahiers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerCahiers();
    // Charger les créneaux pour le formulaire d'ajout
    axios.get(`${API}/emploi_temps.php`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.succes) {
        const allCreneaux = [];
        res.data.data.forEach(p => {
          if (p.creneaux) p.creneaux.forEach(cr => {
            if (cr) allCreneaux.push(cr);
          });
        });
        setCreneaux(allCreneaux);
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
        titre_cours:       selected.titre_cours || "",
        points_vus:        selected.contenu_json?.points?.join("\n") || "",
        niveau_avancement: selected.niveau_avancement || "",
        observations:      selected.contenu_json?.observations || "",
        heure_fin:         selected.heure_fin_reelle || "",
      });
      setTravaux(selected.travaux || []);
    }
  }, [selected]);

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const getStatut = (statut) => {
    const cfg = {
      brouillon:     { bg: "#F1EFE8", color: "#5F5E5A", label: "Brouillon",     icon: "📄", step: 1 },
      signe_delegue: { bg: "#FAEEDA", color: "#633806", label: "Signé délégué", icon: "✍️", step: 2 },
      cloture:       { bg: "#E1F5EE", color: "#085041", label: "Clôturé",        icon: "✅", step: 3 },
    };
    return cfg[statut] || cfg.brouillon;
  };

  const estVerrouille = selected?.statut === "cloture";

  const cahiersFiltres = cahiers.filter(c => {
    const matchFiltre = filtre === "tous" || c.statut === filtre;
    const matchSearch = !search ||
      c.matiere?.toLowerCase().includes(search.toLowerCase()) ||
      c.classe?.toLowerCase().includes(search.toLowerCase()) ||
      c.enseignant?.toLowerCase().includes(search.toLowerCase());
    return matchFiltre && matchSearch;
  });

  const stats = {
    total:     cahiers.length,
    brouillon: cahiers.filter(c => c.statut === "brouillon").length,
    signe:     cahiers.filter(c => c.statut === "signe_delegue").length,
    cloture:   cahiers.filter(c => c.statut === "cloture").length,
  };

  // ---- Ajouter un cahier ----
  const handleAjouterCahier = async () => {
    if (!formNouveauCahier.id_creneau) {
      showMsg("⚠️ Sélectionnez un créneau !");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.post(`${API}/cahiers.php`, {
        id_creneau: formNouveauCahier.id_creneau
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.succes) {
        showMsg("✅ Cahier créé avec succès !");
        setShowModalAjouter(false);
        setFormNouveauCahier({ id_creneau: "" });
        chargerCahiers();
      } else {
        showMsg(`❌ ${res.data.message}`);
      }
    } catch (err) {
      showMsg(`❌ ${err.response?.data?.message || "Erreur lors de la création"}`);
    } finally {
      setSaving(false);
    }
  };

  // ---- Supprimer un cahier ----
  const handleSupprimerCahier = async (id) => {
    if (!window.confirm("Supprimer ce cahier ? Cette action est irréversible.")) return;
    try {
      await axios.delete(`${API}/cahiers.php?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMsg("✅ Cahier supprimé !");
      setSelected(null);
      chargerCahiers();
    } catch (err) {
      showMsg("❌ Erreur lors de la suppression");
    }
  };

  // ---- Sauvegarder contenu ----
  const handleSauvegarder = async () => {
    if (!selected || estVerrouille) return;
    setSaving(true);
    try {
      await axios.put(`${API}/cahiers.php?id=${selected.id}`, {
        titre_cours:       formContenu.titre_cours,
        contenu_json: {
          points:       formContenu.points_vus.split("\n").filter(p => p.trim()),
          observations: formContenu.observations
        },
        niveau_avancement: formContenu.niveau_avancement,
        heure_fin:         formContenu.heure_fin,
      }, { headers: { Authorization: `Bearer ${token}` } });
      showMsg("✅ Cahier sauvegardé !");
      chargerCahiers();
    } catch (err) {
      showMsg("❌ Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // ---- Clôturer ----
  const handleCloture = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const sigBase64 = sigEnsPad.current?.isEmpty() ? null : sigEnsPad.current?.toDataURL();
      await axios.post(`${API}/cahiers.php?id=${selected.id}&action=cloture`, {
        heure_fin:        formContenu.heure_fin || new Date().toTimeString().slice(0,8),
        signature_base64: sigBase64
      }, { headers: { Authorization: `Bearer ${token}` } });
      showMsg("✅ Séance clôturée !");
      chargerCahiers();
      setSelected(prev => prev ? { ...prev, statut: "cloture" } : null);
    } catch (err) {
      showMsg(`❌ ${err.response?.data?.message || "Erreur lors de la clôture"}`);
    } finally {
      setSaving(false);
    }
  };

  // ---- Signer ----
  const handleSigner = async (type) => {
    const pad = type === "delegue" ? sigDelPad.current : sigEnsPad.current;
    if (!pad || pad.isEmpty()) {
      showMsg("⚠️ Veuillez d'abord dessiner votre signature !");
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API}/cahiers.php?id=${selected.id}&action=signer`, {
        type:             type,
        signature_base64: pad.toDataURL()
      }, { headers: { Authorization: `Bearer ${token}` } });
      showMsg(`✅ Signature ${type === "delegue" ? "délégué" : "enseignant"} enregistrée !`);
      chargerCahiers();
      setSelected(prev => prev ? { ...prev, statut: "signe_delegue" } : null);
    } catch (err) {
      showMsg(`❌ ${err.response?.data?.message || "Erreur lors de la signature"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAjouterTravail = () => {
    if (!nouveauTravail.description) return;
    setTravaux([...travaux, { ...nouveauTravail, id: Date.now() }]);
    setNouveauTravail({ description: "", date_limite: "", type: "exercice" });
  };

  const menuItems = [
    { label: "Tableau de bord",  icon: "⊞", route: "/dashboard/admin" },
    { label: "Emploi du temps",  icon: "📅", route: "/emploi-temps" },
    { label: "Cahiers de texte", icon: "📝", route: "/cahiers", active: true },
    { label: "Vacations",        icon: "💰", route: "/vacations" },
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
            <p style={{ margin: 0, fontSize: "15px", fontWeight: "500", color: txt }}>Cahiers de texte</p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>{cahiers.length} cahier(s) enregistré(s)</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {message && (
              <div style={{ padding: "6px 12px", background: message.includes("✅") ? "#E1F5EE" : message.includes("⚠️") ? "#FAEEDA" : "#FCEBEB", color: message.includes("✅") ? "#085041" : message.includes("⚠️") ? "#633806" : "#791F1F", borderRadius: "8px", fontSize: "12px", fontWeight: "500" }}>
                {message}
              </div>
            )}
            <button onClick={() => setShowModalAjouter(true)} style={{
              padding: "8px 16px", background: "#0F6E56", color: "#fff",
              border: "none", borderRadius: "8px", fontSize: "12px",
              cursor: "pointer", fontWeight: "500"
            }}>+ Nouveau cahier</button>
            <button onClick={() => setDark(!dark)} style={{ width: "36px", height: "36px", background: bg3, borderRadius: "8px", border: `0.5px solid ${brd}`, cursor: "pointer", fontSize: "16px" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", padding: "1rem 1.25rem 0" }}>
          {[
            { label: "Total",          val: stats.total,     color: "#0F6E56", bg: "#E1F5EE", icon: "📚", id: "tous" },
            { label: "Brouillons",     val: stats.brouillon, color: "#5F5E5A", bg: "#F1EFE8", icon: "📄", id: "brouillon" },
            { label: "Signés délégué", val: stats.signe,     color: "#633806", bg: "#FAEEDA", icon: "✍️", id: "signe_delegue" },
            { label: "Clôturés",       val: stats.cloture,   color: "#085041", bg: "#E1F5EE", icon: "✅", id: "cloture" },
          ].map((s, i) => (
            <div key={i} onClick={() => setFiltre(s.id)} style={{
              background: bg2, borderRadius: "10px",
              border: `0.5px solid ${filtre === s.id ? s.color : brd}`,
              padding: "12px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "12px"
            }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: "22px", fontWeight: "500", color: s.color, margin: "0 0 2px" }}>{s.val}</p>
                <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden", padding: "1rem 1.25rem", gap: "12px" }}>

          {/* Liste */}
          <div style={{ width: "300px", background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ padding: "12px", borderBottom: `0.5px solid ${brd}` }}>
              <input type="text" placeholder="🔍 Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{
                width: "100%", boxSizing: "border-box", padding: "8px 12px",
                borderRadius: "8px", border: `0.5px solid ${brd}`,
                background: bg3, color: txt, fontSize: "12px"
              }}/>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              {loading ? (
                <p style={{ color: txt2, textAlign: "center", padding: "2rem", fontSize: "13px" }}>Chargement...</p>
              ) : cahiersFiltres.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <p style={{ fontSize: "32px" }}>📝</p>
                  <p style={{ color: txt2, fontSize: "13px" }}>Aucun cahier trouvé</p>
                  <button onClick={() => setShowModalAjouter(true)} style={{ padding: "8px 16px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", marginTop: "8px" }}>
                    + Créer un cahier
                  </button>
                </div>
              ) : (
                cahiersFiltres.map((c, i) => {
                  const s = getStatut(c.statut);
                  return (
                    <div key={i} onClick={() => { setSelected(c); setOnglet("detail"); }} style={{
                      background: selected?.id === c.id ? bg3 : "transparent",
                      borderRadius: "10px",
                      border: `0.5px solid ${selected?.id === c.id ? "#0F6E56" : "transparent"}`,
                      borderLeft: `3px solid ${selected?.id === c.id ? "#0F6E56" : "transparent"}`,
                      padding: "12px", marginBottom: "4px", cursor: "pointer"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>{c.matiere || "Matière"}</p>
                        <span style={{ fontSize: "10px", background: s.bg, color: s.color, padding: "2px 7px", borderRadius: "20px", fontWeight: "500" }}>
                          {s.icon} {s.label}
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", color: txt2, margin: "0 0 3px" }}>{c.classe}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>{c.enseignant?.split(" ").slice(-1)[0]}</p>
                        <button onClick={(e) => { e.stopPropagation(); handleSupprimerCahier(c.id); }} style={{
                          padding: "2px 6px", background: "#FCEBEB", color: "#791F1F",
                          border: "none", borderRadius: "4px", fontSize: "10px", cursor: "pointer"
                        }}>🗑️</button>
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
                <p style={{ fontSize: "64px", margin: "0 0 16px" }}>📖</p>
                <p style={{ fontSize: "16px", fontWeight: "500", color: txt, margin: "0 0 8px" }}>Sélectionnez un cahier</p>
                <p style={{ fontSize: "13px", color: txt2 }}>Cliquez sur un cahier dans la liste</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ padding: "14px 20px", borderBottom: `0.5px solid ${brd}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: "500", color: txt, margin: "0 0 3px" }}>{selected.matiere}</p>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: txt2 }}>{selected.classe}</span>
                      <span style={{ color: brd }}>•</span>
                      <span style={{ fontSize: "12px", color: txt2 }}>{selected.enseignant}</span>
                      <span style={{ color: brd }}>•</span>
                      <span style={{ fontSize: "11px", background: getStatut(selected.statut).bg, color: getStatut(selected.statut).color, padding: "2px 8px", borderRadius: "20px", fontWeight: "500" }}>
                        {getStatut(selected.statut).icon} {getStatut(selected.statut).label}
                      </span>
                      {estVerrouille && (
                        <span style={{ fontSize: "11px", background: "#FCEBEB", color: "#791F1F", padding: "2px 8px", borderRadius: "20px" }}>
                          🔒 Verrouillé
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button style={{ padding: "6px 14px", background: "#E1F5EE", color: "#085041", border: "0.5px solid #9FE1CB", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>
                      📄 Exporter PDF
                    </button>
                    <button onClick={() => handleSupprimerCahier(selected.id)} style={{ padding: "6px 14px", background: "#FCEBEB", color: "#791F1F", border: "0.5px solid #F09595", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>

                {/* Étapes du processus */}
                <div style={{ padding: "12px 20px", borderBottom: `0.5px solid ${brd}`, background: bg3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                    {[
                      { num: 1, label: "Pointage QR", done: true },
                      { num: 2, label: "Saisie contenu", done: selected.titre_cours },
                      { num: 3, label: "Signature délégué", done: selected.statut !== "brouillon" },
                      { num: 4, label: "Clôture enseignant", done: selected.statut === "cloture" },
                    ].map((step, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                          <div style={{
                            width: "28px", height: "28px", borderRadius: "50%",
                            background: step.done ? "#0F6E56" : bg2,
                            border: `2px solid ${step.done ? "#0F6E56" : brd}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "11px", fontWeight: "500",
                            color: step.done ? "#fff" : txt2
                          }}>
                            {step.done ? "✓" : step.num}
                          </div>
                          <p style={{ fontSize: "10px", color: step.done ? "#0F6E56" : txt2, margin: "4px 0 0", textAlign: "center", fontWeight: step.done ? "500" : "400" }}>
                            {step.label}
                          </p>
                        </div>
                        {i < 3 && (
                          <div style={{ height: "2px", flex: 1, background: step.done ? "#0F6E56" : brd, margin: "0 4px", marginBottom: "16px" }}/>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Onglets */}
                <div style={{ display: "flex", borderBottom: `0.5px solid ${brd}` }}>
                  {[
                    { id: "detail",  label: "📄 Contenu" },
                    { id: "travaux", label: "📚 Travaux" },
                    { id: "signer",  label: "✍️ Signatures" },
                  ].map(o => (
                    <button key={o.id} onClick={() => setOnglet(o.id)} style={{
                      padding: "10px 20px", border: "none", cursor: "pointer",
                      background: "transparent",
                      color: onglet === o.id ? "#0F6E56" : txt2,
                      fontSize: "13px", fontWeight: onglet === o.id ? "500" : "400",
                      borderBottom: onglet === o.id ? "2px solid #0F6E56" : "2px solid transparent"
                    }}>{o.label}</button>
                  ))}
                </div>

                {/* Contenu onglets */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>

                  {onglet === "detail" && (
                    <div>
                      <div style={{ background: bg3, borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
                        <p style={{ fontSize: "12px", color: txt2, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "500" }}>
                          Informations automatiques
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                          {[
                            { label: "Classe",           val: selected.classe },
                            { label: "Matière",          val: selected.matiere },
                            { label: "Enseignant",       val: selected.enseignant },
                            { label: "Date",             val: selected.date_creation ? new Date(selected.date_creation).toLocaleDateString("fr-FR") : "—" },
                            { label: "Heure début (QR)", val: "08h07 ✓" },
                            { label: "Heure fin",        val: selected.heure_fin_reelle || "En cours..." },
                          ].map(item => (
                            <div key={item.label} style={{ background: bg2, borderRadius: "8px", padding: "8px 10px" }}>
                              <p style={{ fontSize: "10px", color: txt2, margin: "0 0 3px" }}>{item.label}</p>
                              <p style={{ fontSize: "12px", fontWeight: "500", color: txt, margin: 0 }}>{item.val || "—"}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "6px", fontWeight: "500" }}>
                          📌 Titre du cours <span style={{ color: "#E24B4A" }}>*</span>
                        </label>
                        <input type="text" value={formContenu.titre_cours} onChange={e => setFormContenu({...formContenu, titre_cours: e.target.value})} placeholder="Ex: Introduction aux protocoles TCP/IP" disabled={estVerrouille} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: estVerrouille ? bg3 : bg2, color: txt, fontSize: "13px" }}/>
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "6px", fontWeight: "500" }}>
                          📋 Points vus dans le cours <span style={{ color: "#E24B4A" }}>*</span>
                        </label>
                        <textarea value={formContenu.points_vus} onChange={e => setFormContenu({...formContenu, points_vus: e.target.value})} placeholder="Un point par ligne&#10;Ex: Modèle OSI&#10;Protocole IP" disabled={estVerrouille} rows={4} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: estVerrouille ? bg3 : bg2, color: txt, fontSize: "13px", resize: "vertical", fontFamily: "inherit" }}/>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                        <div>
                          <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "6px", fontWeight: "500" }}>📊 Niveau d'avancement</label>
                          <input type="text" value={formContenu.niveau_avancement} onChange={e => setFormContenu({...formContenu, niveau_avancement: e.target.value})} placeholder="Ex: Chapitre 2 / 5 — 40%" disabled={estVerrouille} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: estVerrouille ? bg3 : bg2, color: txt, fontSize: "13px" }}/>
                        </div>
                        <div>
                          <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "6px", fontWeight: "500" }}>⏰ Heure de fin réelle</label>
                          <input type="time" value={formContenu.heure_fin} onChange={e => setFormContenu({...formContenu, heure_fin: e.target.value})} disabled={estVerrouille} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: estVerrouille ? bg3 : bg2, color: txt, fontSize: "13px" }}/>
                        </div>
                      </div>

                      <div style={{ marginBottom: "16px" }}>
                        <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "6px", fontWeight: "500" }}>💬 Observations</label>
                        <textarea value={formContenu.observations} onChange={e => setFormContenu({...formContenu, observations: e.target.value})} placeholder="Signaler tout incident, retard ou absence..." disabled={estVerrouille} rows={3} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: estVerrouille ? bg3 : bg2, color: txt, fontSize: "13px", resize: "vertical", fontFamily: "inherit" }}/>
                      </div>

                      {!estVerrouille && (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button onClick={handleSauvegarder} disabled={saving} style={{ flex: 1, padding: "11px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
                            {saving ? "⏳ Sauvegarde..." : "💾 Enregistrer brouillon"}
                          </button>
                          <button onClick={() => setOnglet("signer")} style={{ padding: "11px 20px", background: "#EEEDFE", color: "#3C3489", border: "0.5px solid #CECBF6", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}>
                            ✍️ Signer →
                          </button>
                        </div>
                      )}

                      {estVerrouille && (
                        <div style={{ background: "#FCEBEB", borderRadius: "10px", padding: "12px 16px", display: "flex", gap: "10px", alignItems: "center" }}>
                          <span style={{ fontSize: "20px" }}>🔒</span>
                          <p style={{ fontSize: "13px", color: "#791F1F", margin: 0 }}>
                            Cette fiche est verrouillée. Aucune modification n'est possible.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {onglet === "travaux" && (
                    <div>
                      {!estVerrouille && (
                        <div style={{ background: bg3, borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
                          <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: "0 0 12px" }}>➕ Ajouter un travail</p>
                          <input type="text" placeholder="Description du travail..." value={nouveauTravail.description} onChange={e => setNouveauTravail({...nouveauTravail, description: e.target.value})} style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: bg2, color: txt, fontSize: "13px", marginBottom: "10px" }}/>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                            <select value={nouveauTravail.type} onChange={e => setNouveauTravail({...nouveauTravail, type: e.target.value})} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: bg2, color: txt, fontSize: "13px" }}>
                              <option value="exercice">Exercice</option>
                              <option value="devoir">Devoir</option>
                              <option value="projet">Projet</option>
                              <option value="lecture">Lecture</option>
                            </select>
                            <input type="date" value={nouveauTravail.date_limite} onChange={e => setNouveauTravail({...nouveauTravail, date_limite: e.target.value})} style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: bg2, color: txt, fontSize: "13px" }}/>
                          </div>
                          <button onClick={handleAjouterTravail} style={{ padding: "9px 20px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}>➕ Ajouter</button>
                        </div>
                      )}
                      {travaux.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "2rem" }}>
                          <p style={{ fontSize: "32px" }}>📚</p>
                          <p style={{ color: txt2, fontSize: "13px" }}>Aucun travail demandé</p>
                        </div>
                      ) : (
                        travaux.map((t, i) => {
                          const typeCfg = { exercice: { bg: "#EEEDFE", color: "#3C3489" }, devoir: { bg: "#FAEEDA", color: "#633806" }, projet: { bg: "#E6F1FB", color: "#0C447C" }, lecture: { bg: "#E1F5EE", color: "#085041" } };
                          const tc = typeCfg[t.type] || typeCfg.exercice;
                          return (
                            <div key={i} style={{ background: bg2, borderRadius: "10px", border: `0.5px solid ${brd}`, padding: "12px 16px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
                              <span style={{ fontSize: "11px", background: tc.bg, color: tc.color, padding: "3px 8px", borderRadius: "20px", fontWeight: "500", flexShrink: 0 }}>{t.type}</span>
                              <p style={{ fontSize: "13px", color: txt, margin: 0, flex: 1 }}>{t.description}</p>
                              {t.date_limite && <span style={{ fontSize: "11px", color: txt2, flexShrink: 0 }}>📅 {t.date_limite}</span>}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {onglet === "signer" && (
                    <div>
                      {estVerrouille ? (
                        <div style={{ background: "#E1F5EE", borderRadius: "10px", padding: "16px", marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
                          <span style={{ fontSize: "20px" }}>✅</span>
                          <p style={{ fontSize: "13px", color: "#085041", margin: 0, fontWeight: "500" }}>Cette fiche est clôturée et signée par les deux parties.</p>
                        </div>
                      ) : (
                        <div style={{ background: bg3, borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", gap: "10px" }}>
                          <span style={{ fontSize: "20px" }}>ℹ️</span>
                          <p style={{ fontSize: "13px", color: txt2, margin: 0 }}>Dessinez votre signature dans le cadre puis cliquez sur Valider.</p>
                        </div>
                      )}

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        {/* Signature délégué */}
                        <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>✍️</div>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>Délégué de classe</p>
                              <p style={{ fontSize: "11px", color: selected.statut !== "brouillon" ? "#0F6E56" : txt2, margin: 0 }}>
                                {selected.statut !== "brouillon" ? "✅ Signé" : "En attente"}
                              </p>
                            </div>
                          </div>
                          <canvas ref={sigDelRef} width={300} height={120} style={{ border: `1.5px dashed ${brd}`, borderRadius: "8px", background: bg3, width: "100%", touchAction: "none", cursor: estVerrouille ? "not-allowed" : "crosshair" }}/>
                          {!estVerrouille && (
                            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                              <button onClick={() => sigDelPad.current?.clear()} style={{ flex: 1, padding: "8px", background: bg3, color: txt2, border: `0.5px solid ${brd}`, borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>🗑️ Effacer</button>
                              <button onClick={() => handleSigner("delegue")} disabled={saving} style={{ flex: 1, padding: "8px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>✅ Valider</button>
                            </div>
                          )}
                        </div>

                        {/* Signature enseignant */}
                        <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>✍️</div>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>Enseignant</p>
                              <p style={{ fontSize: "11px", color: selected.statut === "cloture" ? "#0F6E56" : txt2, margin: 0 }}>
                                {selected.statut === "cloture" ? "✅ Signé" : "En attente"}
                              </p>
                            </div>
                          </div>
                          <canvas ref={sigEnsRef} width={300} height={120} style={{ border: `1.5px dashed ${brd}`, borderRadius: "8px", background: bg3, width: "100%", touchAction: "none", cursor: estVerrouille ? "not-allowed" : "crosshair" }}/>
                          {!estVerrouille && (
                            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                              <button onClick={() => sigEnsPad.current?.clear()} style={{ flex: 1, padding: "8px", background: bg3, color: txt2, border: `0.5px solid ${brd}`, borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>🗑️ Effacer</button>
                              <button onClick={() => handleSigner("enseignant")} disabled={saving} style={{ flex: 1, padding: "8px", background: "#534AB7", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>✅ Valider</button>
                            </div>
                          )}
                        </div>
                      </div>

                      {!estVerrouille && (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button onClick={handleCloture} disabled={saving} style={{ flex: 1, padding: "12px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>
                            {saving ? "⏳..." : "🔒 Clôturer la séance"}
                          </button>
                          <button style={{ padding: "12px 20px", background: "#FCEBEB", color: "#791F1F", border: "0.5px solid #F09595", borderRadius: "10px", fontSize: "14px", cursor: "pointer" }}>⚠️ Signaler incident</button>
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

      {/* Modal Ajouter Cahier */}
      {showModalAjouter && (
        <div onClick={() => setShowModalAjouter(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: bg2, borderRadius: "16px", padding: "1.5rem", width: "420px", border: `0.5px solid ${brd}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "16px", color: txt }}>➕ Nouveau cahier de texte</h3>
              <button onClick={() => setShowModalAjouter(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: txt2 }}>×</button>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "6px" }}>Sélectionnez un créneau</label>
              <select value={formNouveauCahier.id_creneau} onChange={e => setFormNouveauCahier({...formNouveauCahier, id_creneau: e.target.value})} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: bg3, color: txt, fontSize: "13px" }}>
                <option value="">Choisir un créneau...</option>
                {creneaux.map((cr, i) => (
                  <option key={i} value={cr.id}>
                    {cr.jour} — {cr.heure_debut?.slice(0,5)} — {cr.matiere} ({cr.enseignant?.split(" ").slice(-1)[0]})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ background: bg3, borderRadius: "8px", padding: "10px 12px", marginBottom: "16px", display: "flex", gap: "8px" }}>
              <span>ℹ️</span>
              <p style={{ fontSize: "12px", color: txt2, margin: 0 }}>Le cahier sera créé en brouillon. Le délégué pourra ensuite remplir le contenu.</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleAjouterCahier} disabled={saving} style={{ flex: 1, padding: "11px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
                {saving ? "⏳..." : "➕ Créer le cahier"}
              </button>
              <button onClick={() => setShowModalAjouter(false)} style={{ padding: "11px 20px", background: bg3, color: txt, border: `0.5px solid ${brd}`, borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
