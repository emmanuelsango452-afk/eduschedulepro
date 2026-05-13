import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = "http://localhost/eduschedulepro/backend/api";

export default function EnseignantsPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [dark, setDark]               = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch]           = useState("");
  const [filtre, setFiltre]           = useState("tous");
  const [showModal, setShowModal]     = useState(false);
  const [selected, setSelected]       = useState(null);
  const [message, setMessage]         = useState("");
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", specialite: "", statut: "vacataire", taux_horaire: 6500 });

  const bg     = dark ? "#0d1117" : "#f0faf6";
  const bg2    = dark ? "#161b22" : "#ffffff";
  const bg3    = dark ? "#21262d" : "#e8f5ee";
  const txt    = dark ? "#e6edf3" : "#04342C";
  const txt2   = dark ? "#8b949e" : "#5F5E5A";
  const brd    = dark ? "rgba(255,255,255,0.08)" : "rgba(4,52,44,0.08)";
  const shadow = dark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 12px rgba(4,52,44,0.06)";

  const chargerEnseignants = () => {
    axios.get(`${API}/enseignants.php`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.data.succes) setEnseignants(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { chargerEnseignants(); }, [token]);

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };

  const enseignantsFiltres = enseignants.filter(e => {
    const matchSearch = !search ||
      e.nom?.toLowerCase().includes(search.toLowerCase()) ||
      e.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.specialite?.toLowerCase().includes(search.toLowerCase());
    const matchFiltre = filtre === "tous" || e.statut === filtre;
    return matchSearch && matchFiltre;
  });

  const handleSubmit = async () => {
    try {
      if (selected) await axios.put(`${API}/enseignants.php?id=${selected.id}`, form, { headers: { Authorization: `Bearer ${token}` } });
      else await axios.post(`${API}/enseignants.php`, form, { headers: { Authorization: `Bearer ${token}` } });
      showMsg(selected ? "✅ Enseignant modifié !" : "✅ Enseignant ajouté !");
      setShowModal(false); setSelected(null);
      setForm({ nom: "", prenom: "", email: "", specialite: "", statut: "vacataire", taux_horaire: 6500 });
      chargerEnseignants();
    } catch { showMsg("❌ Erreur"); }
  };

  const handleEdit = (e) => {
    setSelected(e);
    setForm({ nom: e.nom, prenom: e.prenom, email: e.email, specialite: e.specialite, statut: e.statut, taux_horaire: e.taux_horaire });
    setShowModal(true);
  };

  const exportExcel = () => {
    const data = enseignantsFiltres.map(e => ({
      "Matricule": e.matricule || "", "Nom": e.nom || "", "Prénom": e.prenom || "",
      "Email": e.email || "", "Spécialité": e.specialite || "",
      "Statut": e.statut === "permanent" ? "Permanent" : "Vacataire", "Taux horaire": e.taux_horaire || 0,
    }));
    const entete = Object.keys(data[0]).join(";");
    const lignes = data.map(row => Object.values(row).join(";"));
    const csv    = [entete, ...lignes].join("\n");
    const blob   = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a");
    a.href = url; a.download = "enseignants_edutrack.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const menuItems = [
    { label: "Tableau de bord", icon: "⊞",  route: "/dashboard/admin" },
    { label: "Emploi du temps", icon: "📅",  route: "/emploi-temps" },
    { label: "Cahiers de texte",icon: "📝",  route: "/cahiers" },
    { label: "Vacations",       icon: "💰",  route: "/vacations" },
    { label: "Enseignants",     icon: "👨‍🏫", route: "/enseignants", active: true },
    { label: "Rapports",        icon: "📊",  route: "/rapports" },
  ];

  const labelStyle = { fontSize: "11px", color: txt2, display: "block", marginBottom: "5px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" };
  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${brd}`, background: bg3, color: txt, fontSize: "13px", outline: "none" };

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
            <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: txt }}>👨‍🏫 Gestion des enseignants</p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>{enseignants.length} enseignant(s) enregistré(s)</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {message && (
              <div style={{ padding: "7px 14px", background: message.includes("✅") ? "#E1F5EE" : "#FCEBEB", color: message.includes("✅") ? "#085041" : "#791F1F", borderRadius: "8px", fontSize: "12px", fontWeight: "600", boxShadow: shadow }}>
                {message}
              </div>
            )}
            <button onClick={exportExcel} style={{ padding: "8px 14px", background: "#1D6F42", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
              📊 Export Excel
            </button>
            <button onClick={() => { setSelected(null); setForm({ nom: "", prenom: "", email: "", specialite: "", statut: "vacataire", taux_horaire: 6500 }); setShowModal(true); }} style={{ padding: "8px 16px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600", boxShadow: "0 2px 8px rgba(15,110,86,0.3)" }}>
              ＋ Ajouter enseignant
            </button>
            <button onClick={() => setDark(!dark)} style={{ width: "38px", height: "38px", background: bg3, borderRadius: "10px", border: `1px solid ${brd}`, cursor: "pointer", fontSize: "17px" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>

          {/* STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "1.5rem" }}>
            {[
              { label: "Total enseignants", val: enseignants.length, color: "#0F6E56", bg: "#E1F5EE", icon: "👨‍🏫" },
              { label: "Vacataires",        val: enseignants.filter(e => e.statut === "vacataire").length, color: "#BA7517", bg: "#FAEEDA", icon: "📋" },
              { label: "Permanents",        val: enseignants.filter(e => e.statut === "permanent").length, color: "#534AB7", bg: "#EEEDFE", icon: "🏛️" },
            ].map((s, i) => (
              <div key={i} style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "1.1rem", display: "flex", alignItems: "center", gap: "14px", boxShadow: shadow }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{s.icon}</div>
                <div>
                  <p style={{ fontSize: "11px", color: txt2, margin: "0 0 4px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.4px" }}>{s.label}</p>
                  <p style={{ fontSize: "28px", fontWeight: "700", color: s.color, margin: 0, lineHeight: 1 }}>{s.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FILTRES */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
            <input type="text" placeholder="🔍 Rechercher un enseignant..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: "200px", padding: "9px 14px", borderRadius: "8px", border: `1px solid ${brd}`, background: bg2, color: txt, fontSize: "13px", outline: "none" }}/>
            <div style={{ display: "flex", background: bg3, borderRadius: "8px", overflow: "hidden", border: `1px solid ${brd}` }}>
              {[{ val: "tous", label: "Tous" }, { val: "vacataire", label: "Vacataires" }, { val: "permanent", label: "Permanents" }].map(f => (
                <button key={f.val} onClick={() => setFiltre(f.val)} style={{ padding: "8px 14px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "500", background: filtre === f.val ? "#0F6E56" : "transparent", color: filtre === f.val ? "#fff" : txt2, transition: "all 0.2s" }}>{f.label}</button>
              ))}
            </div>
          </div>

          {/* TABLEAU */}
          <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, overflow: "hidden", boxShadow: shadow }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: bg3 }}>
                  {["Matricule", "Nom complet", "Email", "Spécialité", "Statut", "Taux/h", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: txt2, fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ padding: "3rem", textAlign: "center", color: txt2 }}>
                    <p style={{ fontSize: "24px", margin: "0 0 8px" }}>⏳</p>Chargement...
                  </td></tr>
                ) : enseignantsFiltres.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: "3rem", textAlign: "center", color: txt2 }}>
                    <p style={{ fontSize: "32px", margin: "0 0 8px" }}>👨‍🏫</p>Aucun enseignant trouvé
                  </td></tr>
                ) : enseignantsFiltres.map((e, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${brd}` }}>
                    <td style={{ padding: "12px 16px", color: txt2, fontSize: "12px", fontFamily: "monospace", fontWeight: "600" }}>{e.matricule}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: "700", flexShrink: 0 }}>
                          {e.prenom?.charAt(0)}{e.nom?.charAt(0)}
                        </div>
                        <span style={{ color: txt, fontWeight: "600" }}>{e.prenom} {e.nom}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: txt2 }}>{e.email}</td>
                    <td style={{ padding: "12px 16px", color: txt2 }}>{e.specialite || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "600", background: e.statut === "permanent" ? "#EEEDFE" : "#FAEEDA", color: e.statut === "permanent" ? "#3C3489" : "#633806" }}>
                        {e.statut === "permanent" ? "🏛️ Permanent" : "📋 Vacataire"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ color: "#0F6E56", fontWeight: "700" }}>{parseFloat(e.taux_horaire || 0).toLocaleString("fr-FR")} F</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => handleEdit(e)} style={{ padding: "5px 12px", background: "#E1F5EE", color: "#085041", border: "1px solid #9FE1CB", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: "500" }}>✏️ Modifier</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: bg2, borderRadius: "20px", padding: "1.75rem", width: "480px", border: `1px solid ${brd}`, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: txt }}>{selected ? "✏️ Modifier enseignant" : "➕ Ajouter enseignant"}</h3>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: txt2 }}>Remplissez les informations</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: bg3, border: `1px solid ${brd}`, width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", color: txt2, fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              {[{ label: "Nom", key: "nom", placeholder: "Ex: KABORÉ" }, { label: "Prénom", key: "prenom", placeholder: "Ex: Ibrahim" }].map(field => (
                <div key={field.key}>
                  <label style={labelStyle}>{field.label}</label>
                  <input type="text" value={form[field.key]} onChange={e => setForm({...form, [field.key]: e.target.value})} placeholder={field.placeholder} style={inputStyle}/>
                </div>
              ))}
            </div>

            {[{ label: "Email", key: "email", placeholder: "email@isge.bf", type: "email" }, { label: "Spécialité", key: "specialite", placeholder: "Ex: Réseaux informatiques", type: "text" }].map(field => (
              <div key={field.key} style={{ marginBottom: "12px" }}>
                <label style={labelStyle}>{field.label}</label>
                <input type={field.type} value={form[field.key]} onChange={e => setForm({...form, [field.key]: e.target.value})} placeholder={field.placeholder} style={inputStyle}/>
              </div>
            ))}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <div>
                <label style={labelStyle}>Statut</label>
                <select value={form.statut} onChange={e => setForm({...form, statut: e.target.value})} style={inputStyle}>
                  <option value="vacataire">📋 Vacataire</option>
                  <option value="permanent">🏛️ Permanent</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Taux horaire (FCFA)</label>
                <input type="number" value={form.taux_horaire} onChange={e => setForm({...form, taux_horaire: e.target.value})} style={inputStyle}/>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleSubmit} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 3px 10px rgba(15,110,86,0.3)" }}>
                {selected ? "✅ Enregistrer" : "➕ Ajouter"}
              </button>
              <button onClick={() => setShowModal(false)} style={{ padding: "12px 20px", background: bg3, color: txt, border: `1px solid ${brd}`, borderRadius: "10px", fontSize: "13px", cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
