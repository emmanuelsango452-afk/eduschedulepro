import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = "http://localhost/eduschedulepro/backend/api";

export default function EnseignantsPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [enseignants, setEnseignants]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [dark, setDark]                 = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [search, setSearch]             = useState("");
  const [filtre, setFiltre]             = useState("tous");
  const [showModal, setShowModal]       = useState(false);
  const [selected, setSelected]         = useState(null);
  const [form, setForm]                 = useState({
    nom: "", prenom: "", email: "",
    specialite: "", statut: "vacataire", taux_horaire: 6500
  });

  const bg   = dark ? "#0d1117" : "#f0faf6";
  const bg2  = dark ? "#161b22" : "#ffffff";
  const bg3  = dark ? "#21262d" : "#e1f5ee";
  const txt  = dark ? "#e6edf3" : "#04342C";
  const txt2 = dark ? "#8b949e" : "#5F5E5A";
  const brd  = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  useEffect(() => {
    axios.get(`${API}/enseignants.php`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.succes) setEnseignants(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

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
      if (selected) {
        await axios.put(`${API}/enseignants.php?id=${selected.id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/enseignants.php`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      const res = await axios.get(`${API}/enseignants.php`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.succes) setEnseignants(res.data.data);
      setShowModal(false);
      setSelected(null);
      setForm({ nom: "", prenom: "", email: "", specialite: "", statut: "vacataire", taux_horaire: 6500 });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (e) => {
    setSelected(e);
    setForm({
      nom: e.nom, prenom: e.prenom, email: e.email,
      specialite: e.specialite, statut: e.statut, taux_horaire: e.taux_horaire
    });
    setShowModal(true);
  };

  const menuItems = [
    { label: "Tableau de bord", icon: "⊞",  route: "/dashboard/admin" },
    { label: "Emploi du temps", icon: "📅",  route: "/emploi-temps" },
    { label: "Cahiers de texte",icon: "📝",  route: "/cahiers" },
    { label: "Vacations",       icon: "💰",  route: "/vacations" },
    { label: "Enseignants",     icon: "👨‍🏫", route: "/enseignants", active: true },
    { label: "Rapports",        icon: "📊",  route: "/rapports" },
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
            <p style={{ margin: 0, fontSize: "15px", fontWeight: "500", color: txt }}>Gestion des enseignants</p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>{enseignants.length} enseignant(s) enregistré(s)</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={() => { setSelected(null); setForm({ nom: "", prenom: "", email: "", specialite: "", statut: "vacataire", taux_horaire: 6500 }); setShowModal(true); }} style={{
              padding: "8px 16px", background: "#0F6E56", color: "#fff",
              border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500"
            }}>+ Ajouter enseignant</button>
            <button onClick={() => setDark(!dark)} style={{ width: "36px", height: "36px", background: bg3, borderRadius: "8px", border: `0.5px solid ${brd}`, cursor: "pointer", fontSize: "16px" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "1.25rem" }}>
            {[
              { label: "Total enseignants", val: enseignants.length,                              color: "#0F6E56", bg: "#E1F5EE", icon: "👨‍🏫" },
              { label: "Vacataires",         val: enseignants.filter(e => e.statut === "vacataire").length,  color: "#BA7517", bg: "#FAEEDA", icon: "📋" },
              { label: "Permanents",         val: enseignants.filter(e => e.statut === "permanent").length,  color: "#534AB7", bg: "#EEEDFE", icon: "🏛️" },
            ].map((s, i) => (
              <div key={i} style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "1rem", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: txt2, margin: "0 0 4px" }}>{s.label}</p>
                  <p style={{ fontSize: "24px", fontWeight: "500", color: s.color, margin: 0 }}>{s.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filtres */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <input type="text" placeholder="🔍 Rechercher un enseignant..." value={search} onChange={e => setSearch(e.target.value)} style={{
              flex: 1, minWidth: "200px", padding: "8px 12px", borderRadius: "8px",
              border: `0.5px solid ${brd}`, background: bg2, color: txt, fontSize: "13px"
            }}/>
            <div style={{ display: "flex", background: bg3, borderRadius: "8px", overflow: "hidden" }}>
              {[
                { val: "tous",      label: "Tous" },
                { val: "vacataire", label: "Vacataires" },
                { val: "permanent", label: "Permanents" },
              ].map(f => (
                <button key={f.val} onClick={() => setFiltre(f.val)} style={{
                  padding: "7px 14px", border: "none", cursor: "pointer", fontSize: "12px",
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
                  {["Matricule", "Nom complet", "Email", "Spécialité", "Statut", "Taux/h", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: txt2, fontWeight: "500", fontSize: "12px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ padding: "3rem", textAlign: "center", color: txt2 }}>Chargement...</td></tr>
                ) : enseignantsFiltres.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: "3rem", textAlign: "center", color: txt2 }}>Aucun enseignant trouvé</td></tr>
                ) : (
                  enseignantsFiltres.map((e, i) => (
                    <tr key={i} style={{ borderBottom: `0.5px solid ${brd}` }}>
                      <td style={{ padding: "12px 16px", color: txt2, fontSize: "12px" }}>{e.matricule}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", color: "#0F6E56", fontSize: "12px", fontWeight: "500" }}>
                            {e.prenom?.charAt(0)}{e.nom?.charAt(0)}
                          </div>
                          <span style={{ color: txt, fontWeight: "500" }}>{e.prenom} {e.nom}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: txt2 }}>{e.email}</td>
                      <td style={{ padding: "12px 16px", color: txt2 }}>{e.specialite || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "500",
                          background: e.statut === "permanent" ? "#EEEDFE" : "#FAEEDA",
                          color: e.statut === "permanent" ? "#3C3489" : "#633806"
                        }}>
                          {e.statut === "permanent" ? "🏛️ Permanent" : "📋 Vacataire"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#0F6E56", fontWeight: "500" }}>
                        {parseFloat(e.taux_horaire || 0).toLocaleString("fr-FR")} F
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => handleEdit(e)} style={{
                            padding: "5px 10px", background: "#E1F5EE", color: "#085041",
                            border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer"
                          }}>✏️ Modifier</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Ajouter/Modifier */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: bg2, borderRadius: "16px", padding: "1.5rem",
            width: "460px", border: `0.5px solid ${brd}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "16px", color: txt }}>
                {selected ? "✏️ Modifier enseignant" : "➕ Ajouter enseignant"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: txt2 }}>×</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              {[
                { label: "Nom", key: "nom", placeholder: "Ex: KABORÉ" },
                { label: "Prénom", key: "prenom", placeholder: "Ex: Ibrahim" },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>{field.label}</label>
                  <input type="text" value={form[field.key]} onChange={e => setForm({...form, [field.key]: e.target.value})} placeholder={field.placeholder} style={{
                    width: "100%", boxSizing: "border-box", padding: "9px 12px",
                    borderRadius: "8px", border: `0.5px solid ${brd}`,
                    background: bg3, color: txt, fontSize: "13px"
                  }}/>
                </div>
              ))}
            </div>
            {[
              { label: "Email", key: "email", placeholder: "email@isge.bf", type: "email" },
              { label: "Spécialité", key: "specialite", placeholder: "Ex: Réseaux informatiques", type: "text" },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>{field.label}</label>
                <input type={field.type} value={form[field.key]} onChange={e => setForm({...form, [field.key]: e.target.value})} placeholder={field.placeholder} style={{
                  width: "100%", boxSizing: "border-box", padding: "9px 12px",
                  borderRadius: "8px", border: `0.5px solid ${brd}`,
                  background: bg3, color: txt, fontSize: "13px"
                }}/>
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Statut</label>
                <select value={form.statut} onChange={e => setForm({...form, statut: e.target.value})} style={{
                  width: "100%", padding: "9px 12px", borderRadius: "8px",
                  border: `0.5px solid ${brd}`, background: bg3, color: txt, fontSize: "13px"
                }}>
                  <option value="vacataire">Vacataire</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Taux horaire (FCFA)</label>
                <input type="number" value={form.taux_horaire} onChange={e => setForm({...form, taux_horaire: e.target.value})} style={{
                  width: "100%", boxSizing: "border-box", padding: "9px 12px",
                  borderRadius: "8px", border: `0.5px solid ${brd}`,
                  background: bg3, color: txt, fontSize: "13px"
                }}/>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleSubmit} style={{
                flex: 1, padding: "11px", background: "#0F6E56", color: "#fff",
                border: "none", borderRadius: "8px", fontSize: "13px",
                fontWeight: "500", cursor: "pointer"
              }}>
                {selected ? "✅ Enregistrer" : "➕ Ajouter"}
              </button>
              <button onClick={() => setShowModal(false)} style={{
                padding: "11px 20px", background: bg3, color: txt,
                border: `0.5px solid ${brd}`, borderRadius: "8px",
                fontSize: "13px", cursor: "pointer"
              }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}