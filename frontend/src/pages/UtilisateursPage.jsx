import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = "http://localhost/eduschedulepro/backend/api";

export default function UtilisateursPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [dark, setDark]                 = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [search, setSearch]             = useState("");
  const [filtre, setFiltre]             = useState("tous");
  const [showModal, setShowModal]       = useState(false);
  const [selected, setSelected]         = useState(null);
  const [message, setMessage]           = useState("");
  const [saving, setSaving]             = useState(false);
  const [form, setForm] = useState({
    email: "", mot_de_passe: "password",
    role: "delegue", actif: 1
  });

  const bg   = dark ? "#0d1117" : "#f0faf6";
  const bg2  = dark ? "#161b22" : "#ffffff";
  const bg3  = dark ? "#21262d" : "#e1f5ee";
  const txt  = dark ? "#e6edf3" : "#04342C";
  const txt2 = dark ? "#8b949e" : "#5F5E5A";
  const brd  = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  const chargerUtilisateurs = async () => {
    try {
      const res = await axios.get(`${API}/utilisateurs.php`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.succes) setUtilisateurs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerUtilisateurs();
  }, [token]);

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSauvegarder = async () => {
    if (!form.email) { showMsg("⚠️ Email requis !"); return; }
    setSaving(true);
    try {
      if (selected) {
        await axios.put(`${API}/utilisateurs.php?id=${selected.id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showMsg("✅ Utilisateur modifié !");
      } else {
        await axios.post(`${API}/utilisateurs.php`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showMsg("✅ Utilisateur créé !");
      }
      setShowModal(false);
setSelected(null);
setFiltre(form.role);
setForm({ email: "", mot_de_passe: "password", role: "delegue", actif: 1 });
chargerUtilisateurs();
    } catch (err) {
      showMsg(`❌ ${err.response?.data?.message || "Erreur"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActif = async (id, actif) => {
    try {
      await axios.put(`${API}/utilisateurs.php?id=${id}`, { actif: actif ? 0 : 1 }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMsg(actif ? "⚠️ Compte désactivé" : "✅ Compte activé");
      chargerUtilisateurs();
    } catch (err) {
      showMsg("❌ Erreur");
    }
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await axios.delete(`${API}/utilisateurs.php?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMsg("✅ Utilisateur supprimé !");
      chargerUtilisateurs();
    } catch (err) {
      showMsg("❌ Erreur lors de la suppression");
    }
  };

  const getRoleConfig = (role) => {
    const cfg = {
      administrateur: { bg: "#E1F5EE", color: "#085041", label: "Administrateur", icon: "⊞" },
      enseignant:     { bg: "#EEEDFE", color: "#3C3489", label: "Enseignant",     icon: "👨‍🏫" },
      delegue:        { bg: "#FAEEDA", color: "#633806", label: "Délégué",         icon: "📝" },
      surveillant:    { bg: "#E6F1FB", color: "#0C447C", label: "Surveillant",    icon: "👁️" },
      comptable:      { bg: "#FAECE7", color: "#712B13", label: "Comptable",      icon: "💰" },
      etudiant:       { bg: "#E1F5EE", color: "#085041", label: "Étudiant",       icon: "🎓" },
    };
    return cfg[role] || cfg.etudiant;
  };

  const utilisateursFiltres = utilisateurs.filter(u => {
    const matchFiltre = filtre === "tous" || u.role === filtre;
    const matchSearch = !search || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchFiltre && matchSearch;
  });

  const stats = {
    total:       utilisateurs.length,
    actifs:      utilisateurs.filter(u => u.actif).length,
    inactifs:    utilisateurs.filter(u => !u.actif).length,
  };

  const menuItems = [
    { label: "Tableau de bord",  icon: "⊞",  route: "/dashboard/admin" },
    { label: "Emploi du temps",  icon: "📅",  route: "/emploi-temps" },
    { label: "Référentiels",     icon: "🗂️",  route: "/referentiels" },
    { label: "Utilisateurs",     icon: "👥",  route: "/utilisateurs", active: true },
    { label: "Cahiers de texte", icon: "📝",  route: "/cahiers" },
    { label: "Vacations",        icon: "💰",  route: "/vacations" },
    { label: "Enseignants",      icon: "👨‍🏫", route: "/enseignants" },
    { label: "Rapports",         icon: "📊",  route: "/rapports" },
  ];

  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "9px 12px",
    borderRadius: "8px", border: `0.5px solid ${brd}`,
    background: bg3, color: txt, fontSize: "13px"
  };

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
            <p style={{ margin: 0, fontSize: "15px", fontWeight: "500", color: txt }}>Gestion des utilisateurs</p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>{utilisateurs.length} utilisateur(s) enregistré(s)</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {message && (
              <div style={{ padding: "6px 12px", background: message.includes("✅") ? "#E1F5EE" : message.includes("⚠️") ? "#FAEEDA" : "#FCEBEB", color: message.includes("✅") ? "#085041" : message.includes("⚠️") ? "#633806" : "#791F1F", borderRadius: "8px", fontSize: "12px", fontWeight: "500" }}>
                {message}
              </div>
            )}
            <button onClick={() => { setSelected(null); setForm({ email: "", mot_de_passe: "password", role: "delegue", actif: 1 }); setShowModal(true); }} style={{
              padding: "8px 16px", background: "#0F6E56", color: "#fff",
              border: "none", borderRadius: "8px", fontSize: "12px",
              cursor: "pointer", fontWeight: "500"
            }}>+ Ajouter utilisateur</button>
            <button onClick={() => setDark(!dark)} style={{ width: "36px", height: "36px", background: bg3, borderRadius: "8px", border: `0.5px solid ${brd}`, cursor: "pointer", fontSize: "16px" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "1.25rem" }}>
            {[
              { label: "Total",    val: stats.total,    color: "#0F6E56", bg: "#E1F5EE", icon: "👥" },
              { label: "Actifs",   val: stats.actifs,   color: "#0F6E56", bg: "#E1F5EE", icon: "✅" },
              { label: "Inactifs", val: stats.inactifs, color: "#E24B4A", bg: "#FCEBEB", icon: "⛔" },
            ].map((s, i) => (
              <div key={i} style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1rem", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{s.icon}</div>
                <div>
                  <p style={{ fontSize: "11px", color: txt2, margin: "0 0 4px" }}>{s.label}</p>
                  <p style={{ fontSize: "24px", fontWeight: "500", color: s.color, margin: 0 }}>{s.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filtres */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <input type="text" placeholder="🔍 Rechercher par email..." value={search} onChange={e => setSearch(e.target.value)} style={{
              flex: 1, minWidth: "200px", padding: "8px 12px", borderRadius: "8px",
              border: `0.5px solid ${brd}`, background: bg2, color: txt, fontSize: "13px"
            }}/>
            <div style={{ display: "flex", background: bg3, borderRadius: "8px", overflow: "hidden" }}>
              {[
                { val: "tous",          label: "Tous" },
                { val: "delegue",       label: "Délégués" },
                { val: "surveillant",   label: "Surveillants" },
                { val: "comptable",     label: "Comptables" },
                { val: "etudiant",      label: "Étudiants" },
              ].map(f => (
                <button key={f.val} onClick={() => setFiltre(f.val)} style={{
                  padding: "7px 12px", border: "none", cursor: "pointer", fontSize: "11px",
                  background: filtre === f.val ? "#0F6E56" : "transparent",
                  color: filtre === f.val ? "#fff" : txt2,
                  fontWeight: filtre === f.val ? "500" : "400"
                }}>{f.label}</button>
              ))}
            </div>
          </div>

          {/* Tableau */}
          <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: bg3 }}>
                  {["Email", "Rôle", "Statut", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: txt2, fontWeight: "500", fontSize: "12px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ padding: "3rem", textAlign: "center", color: txt2 }}>Chargement...</td></tr>
                ) : utilisateursFiltres.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: "3rem", textAlign: "center", color: txt2 }}>Aucun utilisateur trouvé</td></tr>
                ) : (
                  utilisateursFiltres.map((u, i) => {
                    const r = getRoleConfig(u.role);
                    return (
                      <tr key={i} style={{ borderBottom: `0.5px solid ${brd}` }}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                              {r.icon}
                            </div>
                            <span style={{ color: txt, fontWeight: "500" }}>{u.email}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: "11px", background: r.bg, color: r.color, padding: "3px 10px", borderRadius: "20px", fontWeight: "500" }}>
                            {r.icon} {r.label}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            fontSize: "11px",
                            background: u.actif ? "#E1F5EE" : "#FCEBEB",
                            color: u.actif ? "#085041" : "#791F1F",
                            padding: "3px 10px", borderRadius: "20px", fontWeight: "500"
                          }}>
                            {u.actif ? "✅ Actif" : "⛔ Inactif"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => { setSelected(u); setForm({ email: u.email, mot_de_passe: "", role: u.role, actif: u.actif }); setShowModal(true); }} style={{ padding: "5px 10px", background: "#E1F5EE", color: "#085041", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>✏️ Modifier</button>
                            <button onClick={() => handleToggleActif(u.id, u.actif)} style={{ padding: "5px 10px", background: u.actif ? "#FAEEDA" : "#E1F5EE", color: u.actif ? "#633806" : "#085041", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>
                              {u.actif ? "⛔ Désactiver" : "✅ Activer"}
                            </button>
                            <button onClick={() => handleSupprimer(u.id)} style={{ padding: "5px 10px", background: "#FCEBEB", color: "#791F1F", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>🗑️ Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: bg2, borderRadius: "16px", padding: "1.5rem", width: "420px", border: `0.5px solid ${brd}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "16px", color: txt }}>{selected ? "✏️ Modifier utilisateur" : "➕ Ajouter utilisateur"}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: txt2 }}>×</button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@isge.bf" style={inputStyle}/>
            </div>

            {!selected && (
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Mot de passe</label>
                <input type="password" value={form.mot_de_passe} onChange={e => setForm({...form, mot_de_passe: e.target.value})} placeholder="Mot de passe" style={inputStyle}/>
              </div>
            )}

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Rôle</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={inputStyle}>
                <option value="delegue">📝 Délégué</option>
                <option value="surveillant">👁️ Surveillant</option>
                <option value="comptable">💰 Comptable</option>
                <option value="etudiant">🎓 Étudiant</option>
                <option value="enseignant">👨‍🏫 Enseignant</option>
                <option value="administrateur">⊞ Administrateur</option>
              </select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Statut</label>
              <select value={form.actif} onChange={e => setForm({...form, actif: parseInt(e.target.value)})} style={inputStyle}>
                <option value={1}>✅ Actif</option>
                <option value={0}>⛔ Inactif</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleSauvegarder} disabled={saving} style={{ flex: 1, padding: "11px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
                {saving ? "⏳..." : selected ? "✅ Modifier" : "➕ Ajouter"}
              </button>
              <button onClick={() => setShowModal(false)} style={{ padding: "11px 20px", background: bg3, color: txt, border: `0.5px solid ${brd}`, borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}