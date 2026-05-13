import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = 'http://localhost/eduschedulepro/backend/api';
export default function ReferentielsPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [onglet, setOnglet]           = useState("classes");
  const [dark, setDark]               = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage]         = useState("");

  // Classes
  const [classes, setClasses]     = useState([]);
  const [showModalClasse, setShowModalClasse] = useState(false);
  const [selectedClasse, setSelectedClasse]   = useState(null);
  const [formClasse, setFormClasse] = useState({ code: "", libelle: "", niveau: "Licence", annee_academique: "2025-2026" });

  // Matières
  const [matieres, setMatieres]   = useState([]);
  const [showModalMatiere, setShowModalMatiere] = useState(false);
  const [selectedMatiere, setSelectedMatiere]   = useState(null);
  const [formMatiere, setFormMatiere] = useState({ code: "", libelle: "", volume_horaire_total: 40, coefficient: 2 });

  // Salles
  const [salles, setSalles]       = useState([]);
  const [showModalSalle, setShowModalSalle] = useState(false);
  const [selectedSalle, setSelectedSalle]   = useState(null);
  const [formSalle, setFormSalle] = useState({ code: "", capacite: 30, equipements: "", batiment: "" });

  const bg   = dark ? "#0d1117" : "#f0faf6";
  const bg2  = dark ? "#161b22" : "#ffffff";
  const bg3  = dark ? "#21262d" : "#e1f5ee";
  const txt  = dark ? "#e6edf3" : "#04342C";
  const txt2 = dark ? "#8b949e" : "#5F5E5A";
  const brd  = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  useEffect(() => {
    chargerDonnees();
  }, [token]);

  const chargerDonnees = async () => {
    try {
      const [classesRes, matieresRes, sallesRes] = await Promise.all([
        axios.get(`${API}/classes.php`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/matieres.php`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/salles.php`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (classesRes.data.succes) setClasses(classesRes.data.data);
      if (matieresRes.data.succes) setMatieres(matieresRes.data.data);
      if (sallesRes.data.succes) setSalles(sallesRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // CRUD Classes
  const handleSauvegarderClasse = async () => {
    try {
      if (selectedClasse) {
        await axios.put(`${API}/classes.php?id=${selectedClasse.id}`, formClasse, { headers: { Authorization: `Bearer ${token}` } });
        showMsg("✅ Classe modifiée !");
      } else {
        await axios.post(`${API}/classes.php`, formClasse, { headers: { Authorization: `Bearer ${token}` } });
        showMsg("✅ Classe créée !");
      }
      setShowModalClasse(false);
      setSelectedClasse(null);
      setFormClasse({ code: "", libelle: "", niveau: "Licence", annee_academique: "2025-2026" });
      chargerDonnees();
    } catch (err) {
      showMsg("❌ Erreur lors de la sauvegarde");
    }
  };

  const handleSupprimerClasse = async (id) => {
    if (!window.confirm("Supprimer cette classe ?")) return;
    try {
      await axios.delete(`${API}/classes.php?id=${id}`, { headers: { Authorization: `Bearer ${token}` } });
      showMsg("✅ Classe supprimée !");
      chargerDonnees();
    } catch (err) {
      showMsg("❌ Erreur lors de la suppression");
    }
  };

  // CRUD Matières
  const handleSauvegarderMatiere = async () => {
    try {
      if (selectedMatiere) {
        await axios.put(`${API}/matieres.php?id=${selectedMatiere.id}`, formMatiere, { headers: { Authorization: `Bearer ${token}` } });
        showMsg("✅ Matière modifiée !");
      } else {
        await axios.post(`${API}/matieres.php`, formMatiere, { headers: { Authorization: `Bearer ${token}` } });
        showMsg("✅ Matière créée !");
      }
      setShowModalMatiere(false);
      setSelectedMatiere(null);
      setFormMatiere({ code: "", libelle: "", volume_horaire_total: 40, coefficient: 2 });
      chargerDonnees();
    } catch (err) {
      showMsg("❌ Erreur lors de la sauvegarde");
    }
  };

  const handleSupprimerMatiere = async (id) => {
    if (!window.confirm("Supprimer cette matière ?")) return;
    try {
      await axios.delete(`${API}/matieres.php?id=${id}`, { headers: { Authorization: `Bearer ${token}` } });
      showMsg("✅ Matière supprimée !");
      chargerDonnees();
    } catch (err) {
      showMsg("❌ Erreur lors de la suppression");
    }
  };

  // CRUD Salles
  const handleSauvegarderSalle = async () => {
    try {
      if (selectedSalle) {
        await axios.put(`${API}/salles.php?id=${selectedSalle.id}`, formSalle, { headers: { Authorization: `Bearer ${token}` } });
        showMsg("✅ Salle modifiée !");
      } else {
        await axios.post(`${API}/salles.php`, formSalle, { headers: { Authorization: `Bearer ${token}` } });
        showMsg("✅ Salle créée !");
      }
      setShowModalSalle(false);
      setSelectedSalle(null);
      setFormSalle({ code: "", capacite: 30, equipements: "", batiment: "" });
      chargerDonnees();
    } catch (err) {
      showMsg("❌ Erreur lors de la sauvegarde");
    }
  };

  const handleSupprimerSalle = async (id) => {
    if (!window.confirm("Supprimer cette salle ?")) return;
    try {
      await axios.delete(`${API}/salles.php?id=${id}`, { headers: { Authorization: `Bearer ${token}` } });
      showMsg("✅ Salle supprimée !");
      chargerDonnees();
    } catch (err) {
      showMsg("❌ Erreur lors de la suppression");
    }
  };

  const menuItems = [
    { label: "Tableau de bord",  icon: "⊞",  route: "/dashboard/admin" },
    { label: "Emploi du temps",  icon: "📅",  route: "/emploi-temps" },
    { label: "Référentiels",     icon: "🗂️",  route: "/referentiels", active: true },
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
            <p style={{ margin: 0, fontSize: "15px", fontWeight: "500", color: txt }}>Référentiels</p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>Gestion des classes, matières et salles</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {message && (
              <div style={{ padding: "6px 12px", background: message.includes("✅") ? "#E1F5EE" : "#FCEBEB", color: message.includes("✅") ? "#085041" : "#791F1F", borderRadius: "8px", fontSize: "12px", fontWeight: "500" }}>
                {message}
              </div>
            )}
            <button onClick={() => setDark(!dark)} style={{ width: "36px", height: "36px", background: bg3, borderRadius: "8px", border: `0.5px solid ${brd}`, cursor: "pointer", fontSize: "16px" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div style={{ display: "flex", borderBottom: `0.5px solid ${brd}`, background: bg2 }}>
          {[
            { id: "classes",  label: "🎓 Classes",  count: classes.length },
            { id: "matieres", label: "📚 Matières", count: matieres.length },
            { id: "salles",   label: "🏛️ Salles",   count: salles.length },
          ].map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id)} style={{
              padding: "12px 24px", border: "none", cursor: "pointer", background: "transparent",
              color: onglet === o.id ? "#0F6E56" : txt2, fontSize: "13px",
              fontWeight: onglet === o.id ? "500" : "400",
              borderBottom: onglet === o.id ? "2px solid #0F6E56" : "2px solid transparent",
              display: "flex", alignItems: "center", gap: "8px"
            }}>
              {o.label}
              <span style={{ background: onglet === o.id ? "#E1F5EE" : bg3, color: onglet === o.id ? "#085041" : txt2, fontSize: "11px", padding: "1px 6px", borderRadius: "10px" }}>
                {o.count}
              </span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>

          {/* ===== CLASSES ===== */}
          {onglet === "classes" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <p style={{ fontSize: "14px", fontWeight: "500", color: txt, margin: 0 }}>
                  Liste des classes ({classes.length})
                </p>
                <button onClick={() => { setSelectedClasse(null); setFormClasse({ code: "", libelle: "", niveau: "Licence", annee_academique: "2025-2026" }); setShowModalClasse(true); }} style={{ padding: "8px 16px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
                  + Ajouter classe
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {classes.map((c, i) => (
                  <div key={i} style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🎓</div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => { setSelectedClasse(c); setFormClasse({ code: c.code, libelle: c.libelle, niveau: c.niveau, annee_academique: c.annee_academique }); setShowModalClasse(true); }} style={{ padding: "4px 8px", background: "#E1F5EE", color: "#085041", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>✏️</button>
                        <button onClick={() => handleSupprimerClasse(c.id)} style={{ padding: "4px 8px", background: "#FCEBEB", color: "#791F1F", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>🗑️</button>
                      </div>
                    </div>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: txt, margin: "0 0 4px" }}>{c.libelle}</p>
                    <p style={{ fontSize: "12px", color: txt2, margin: "0 0 8px" }}>{c.code}</p>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span style={{ fontSize: "11px", background: "#EEEDFE", color: "#3C3489", padding: "2px 8px", borderRadius: "20px" }}>{c.niveau}</span>
                      <span style={{ fontSize: "11px", background: bg3, color: txt2, padding: "2px 8px", borderRadius: "20px" }}>{c.annee_academique}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== MATIERES ===== */}
          {onglet === "matieres" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <p style={{ fontSize: "14px", fontWeight: "500", color: txt, margin: 0 }}>
                  Liste des matières ({matieres.length})
                </p>
                <button onClick={() => { setSelectedMatiere(null); setFormMatiere({ code: "", libelle: "", volume_horaire_total: 40, coefficient: 2 }); setShowModalMatiere(true); }} style={{ padding: "8px 16px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
                  + Ajouter matière
                </button>
              </div>
              <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: bg3 }}>
                      {["Code", "Libellé", "Volume horaire", "Coefficient", "Actions"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: txt2, fontWeight: "500", fontSize: "12px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matieres.length === 0 ? (
                      <tr><td colSpan="5" style={{ padding: "3rem", textAlign: "center", color: txt2 }}>Aucune matière</td></tr>
                    ) : (
                      matieres.map((m, i) => (
                        <tr key={i} style={{ borderBottom: `0.5px solid ${brd}` }}>
                          <td style={{ padding: "12px 16px", color: txt2, fontWeight: "500" }}>{m.code}</td>
                          <td style={{ padding: "12px 16px", color: txt, fontWeight: "500" }}>{m.libelle}</td>
                          <td style={{ padding: "12px 16px", color: txt2 }}>{m.volume_horaire_total}h</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ background: "#EEEDFE", color: "#3C3489", fontSize: "12px", padding: "2px 8px", borderRadius: "20px" }}>
                              Coeff. {m.coefficient}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button onClick={() => { setSelectedMatiere(m); setFormMatiere({ code: m.code, libelle: m.libelle, volume_horaire_total: m.volume_horaire_total, coefficient: m.coefficient }); setShowModalMatiere(true); }} style={{ padding: "5px 10px", background: "#E1F5EE", color: "#085041", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>✏️ Modifier</button>
                              <button onClick={() => handleSupprimerMatiere(m.id)} style={{ padding: "5px 10px", background: "#FCEBEB", color: "#791F1F", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>🗑️ Supprimer</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== SALLES ===== */}
          {onglet === "salles" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <p style={{ fontSize: "14px", fontWeight: "500", color: txt, margin: 0 }}>
                  Liste des salles ({salles.length})
                </p>
                <button onClick={() => { setSelectedSalle(null); setFormSalle({ code: "", capacite: 30, equipements: "", batiment: "" }); setShowModalSalle(true); }} style={{ padding: "8px 16px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
                  + Ajouter salle
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {salles.length === 0 ? (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem", background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}` }}>
                    <p style={{ fontSize: "32px" }}>🏛️</p>
                    <p style={{ color: txt2, fontSize: "13px" }}>Aucune salle</p>
                  </div>
                ) : (
                  salles.map((s, i) => (
                    <div key={i} style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🏛️</div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => { setSelectedSalle(s); setFormSalle({ code: s.code, capacite: s.capacite, equipements: s.equipements, batiment: s.batiment }); setShowModalSalle(true); }} style={{ padding: "4px 8px", background: "#E1F5EE", color: "#085041", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>✏️</button>
                          <button onClick={() => handleSupprimerSalle(s.id)} style={{ padding: "4px 8px", background: "#FCEBEB", color: "#791F1F", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>🗑️</button>
                        </div>
                      </div>
                      <p style={{ fontSize: "16px", fontWeight: "500", color: txt, margin: "0 0 4px" }}>{s.code}</p>
                      <p style={{ fontSize: "12px", color: txt2, margin: "0 0 8px" }}>{s.batiment}</p>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", background: "#E1F5EE", color: "#085041", padding: "2px 8px", borderRadius: "20px" }}>
                          👥 {s.capacite} places
                        </span>
                        {s.equipements && (
                          <span style={{ fontSize: "11px", background: bg3, color: txt2, padding: "2px 8px", borderRadius: "20px" }}>
                            {s.equipements?.split(",")[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Classe */}
      {showModalClasse && (
        <div onClick={() => setShowModalClasse(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: bg2, borderRadius: "16px", padding: "1.5rem", width: "420px", border: `0.5px solid ${brd}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "16px", color: txt }}>{selectedClasse ? "✏️ Modifier classe" : "➕ Ajouter classe"}</h3>
              <button onClick={() => setShowModalClasse(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: txt2 }}>×</button>
            </div>
            {[
              { label: "Code", key: "code", placeholder: "Ex: L1-RST" },
              { label: "Libellé", key: "libelle", placeholder: "Ex: Licence 1 Réseaux" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>{f.label}</label>
                <input type="text" value={formClasse[f.key]} onChange={e => setFormClasse({...formClasse, [f.key]: e.target.value})} placeholder={f.placeholder} style={inputStyle}/>
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Niveau</label>
                <select value={formClasse.niveau} onChange={e => setFormClasse({...formClasse, niveau: e.target.value})} style={inputStyle}>
                  <option>Licence</option>
                  <option>Master</option>
                  <option>Doctorat</option>
                  <option>BTS</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Année académique</label>
                <input type="text" value={formClasse.annee_academique} onChange={e => setFormClasse({...formClasse, annee_academique: e.target.value})} style={inputStyle}/>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleSauvegarderClasse} style={{ flex: 1, padding: "11px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
                {selectedClasse ? "✅ Modifier" : "➕ Ajouter"}
              </button>
              <button onClick={() => setShowModalClasse(false)} style={{ padding: "11px 20px", background: bg3, color: txt, border: `0.5px solid ${brd}`, borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Matière */}
      {showModalMatiere && (
        <div onClick={() => setShowModalMatiere(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: bg2, borderRadius: "16px", padding: "1.5rem", width: "420px", border: `0.5px solid ${brd}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "16px", color: txt }}>{selectedMatiere ? "✏️ Modifier matière" : "➕ Ajouter matière"}</h3>
              <button onClick={() => setShowModalMatiere(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: txt2 }}>×</button>
            </div>
            {[
              { label: "Code", key: "code", placeholder: "Ex: RES301" },
              { label: "Libellé", key: "libelle", placeholder: "Ex: Réseaux Informatiques" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>{f.label}</label>
                <input type="text" value={formMatiere[f.key]} onChange={e => setFormMatiere({...formMatiere, [f.key]: e.target.value})} placeholder={f.placeholder} style={inputStyle}/>
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Volume horaire total</label>
                <input type="number" value={formMatiere.volume_horaire_total} onChange={e => setFormMatiere({...formMatiere, volume_horaire_total: e.target.value})} style={inputStyle}/>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Coefficient</label>
                <input type="number" value={formMatiere.coefficient} onChange={e => setFormMatiere({...formMatiere, coefficient: e.target.value})} style={inputStyle}/>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleSauvegarderMatiere} style={{ flex: 1, padding: "11px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
                {selectedMatiere ? "✅ Modifier" : "➕ Ajouter"}
              </button>
              <button onClick={() => setShowModalMatiere(false)} style={{ padding: "11px 20px", background: bg3, color: txt, border: `0.5px solid ${brd}`, borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Salle */}
      {showModalSalle && (
        <div onClick={() => setShowModalSalle(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: bg2, borderRadius: "16px", padding: "1.5rem", width: "420px", border: `0.5px solid ${brd}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "16px", color: txt }}>{selectedSalle ? "✏️ Modifier salle" : "➕ Ajouter salle"}</h3>
              <button onClick={() => setShowModalSalle(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: txt2 }}>×</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Code salle</label>
                <input type="text" value={formSalle.code} onChange={e => setFormSalle({...formSalle, code: e.target.value})} placeholder="Ex: A01" style={inputStyle}/>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Capacité</label>
                <input type="number" value={formSalle.capacite} onChange={e => setFormSalle({...formSalle, capacite: e.target.value})} style={inputStyle}/>
              </div>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Bâtiment</label>
              <input type="text" value={formSalle.batiment} onChange={e => setFormSalle({...formSalle, batiment: e.target.value})} placeholder="Ex: Bâtiment A" style={inputStyle}/>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Équipements</label>
              <input type="text" value={formSalle.equipements} onChange={e => setFormSalle({...formSalle, equipements: e.target.value})} placeholder="Ex: Tableau, Vidéoprojecteur" style={inputStyle}/>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleSauvegarderSalle} style={{ flex: 1, padding: "11px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
                {selectedSalle ? "✅ Modifier" : "➕ Ajouter"}
              </button>
              <button onClick={() => setShowModalSalle(false)} style={{ padding: "11px 20px", background: bg3, color: txt, border: `0.5px solid ${brd}`, borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}