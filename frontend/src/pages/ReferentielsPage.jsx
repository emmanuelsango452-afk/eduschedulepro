import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = "http://localhost/eduschedulepro/backend/api";

export default function ReferentielsPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [onglet, setOnglet]           = useState("classes");
  const [dark, setDark]               = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage]         = useState("");

  const [classes, setClasses]   = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [salles, setSalles]     = useState([]);

  const [showModalClasse,  setShowModalClasse]  = useState(false);
  const [showModalMatiere, setShowModalMatiere] = useState(false);
  const [showModalSalle,   setShowModalSalle]   = useState(false);

  const [selectedClasse,  setSelectedClasse]  = useState(null);
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [selectedSalle,   setSelectedSalle]   = useState(null);

  const [formClasse,  setFormClasse]  = useState({ code: "", libelle: "", niveau: "Licence", annee_academique: "2025-2026" });
  const [formMatiere, setFormMatiere] = useState({ code: "", libelle: "", volume_horaire_total: 40, coefficient: 2 });
  const [formSalle,   setFormSalle]   = useState({ code: "", capacite: 30, equipements: "", batiment: "" });

  const bg     = dark ? "#0d1117" : "#f0faf6";
  const bg2    = dark ? "#161b22" : "#ffffff";
  const bg3    = dark ? "#21262d" : "#e8f5ee";
  const txt    = dark ? "#e6edf3" : "#04342C";
  const txt2   = dark ? "#8b949e" : "#5F5E5A";
  const brd    = dark ? "rgba(255,255,255,0.08)" : "rgba(4,52,44,0.08)";
  const shadow = dark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 12px rgba(4,52,44,0.06)";

  useEffect(() => { chargerDonnees(); }, [token]);

  const chargerDonnees = async () => {
    try {
      const [classesRes, matieresRes, sallesRes] = await Promise.all([
        axios.get(`${API}/classes.php`,  { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/matieres.php`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/salles.php`,   { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (classesRes.data.succes)  setClasses(classesRes.data.data);
      if (matieresRes.data.succes) setMatieres(matieresRes.data.data);
      if (sallesRes.data.succes)   setSalles(sallesRes.data.data);
    } catch (err) { console.error(err); }
  };

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };

  const handleSauvegarderClasse = async () => {
    try {
      if (selectedClasse) await axios.put(`${API}/classes.php?id=${selectedClasse.id}`, formClasse, { headers: { Authorization: `Bearer ${token}` } });
      else await axios.post(`${API}/classes.php`, formClasse, { headers: { Authorization: `Bearer ${token}` } });
      showMsg(selectedClasse ? "✅ Classe modifiée !" : "✅ Classe créée !");
      setShowModalClasse(false); setSelectedClasse(null);
      setFormClasse({ code: "", libelle: "", niveau: "Licence", annee_academique: "2025-2026" });
      chargerDonnees();
    } catch { showMsg("❌ Erreur"); }
  };

  const handleSupprimerClasse = async (id) => {
    if (!window.confirm("Supprimer cette classe ?")) return;
    try { await axios.delete(`${API}/classes.php?id=${id}`, { headers: { Authorization: `Bearer ${token}` } }); showMsg("✅ Supprimée !"); chargerDonnees(); }
    catch { showMsg("❌ Erreur"); }
  };

  const handleSauvegarderMatiere = async () => {
    try {
      if (selectedMatiere) await axios.put(`${API}/matieres.php?id=${selectedMatiere.id}`, formMatiere, { headers: { Authorization: `Bearer ${token}` } });
      else await axios.post(`${API}/matieres.php`, formMatiere, { headers: { Authorization: `Bearer ${token}` } });
      showMsg(selectedMatiere ? "✅ Matière modifiée !" : "✅ Matière créée !");
      setShowModalMatiere(false); setSelectedMatiere(null);
      setFormMatiere({ code: "", libelle: "", volume_horaire_total: 40, coefficient: 2 });
      chargerDonnees();
    } catch { showMsg("❌ Erreur"); }
  };

  const handleSupprimerMatiere = async (id) => {
    if (!window.confirm("Supprimer cette matière ?")) return;
    try { await axios.delete(`${API}/matieres.php?id=${id}`, { headers: { Authorization: `Bearer ${token}` } }); showMsg("✅ Supprimée !"); chargerDonnees(); }
    catch { showMsg("❌ Erreur"); }
  };

  const handleSauvegarderSalle = async () => {
    try {
      if (selectedSalle) await axios.put(`${API}/salles.php?id=${selectedSalle.id}`, formSalle, { headers: { Authorization: `Bearer ${token}` } });
      else await axios.post(`${API}/salles.php`, formSalle, { headers: { Authorization: `Bearer ${token}` } });
      showMsg(selectedSalle ? "✅ Salle modifiée !" : "✅ Salle créée !");
      setShowModalSalle(false); setSelectedSalle(null);
      setFormSalle({ code: "", capacite: 30, equipements: "", batiment: "" });
      chargerDonnees();
    } catch { showMsg("❌ Erreur"); }
  };

  const handleSupprimerSalle = async (id) => {
    if (!window.confirm("Supprimer cette salle ?")) return;
    try { await axios.delete(`${API}/salles.php?id=${id}`, { headers: { Authorization: `Bearer ${token}` } }); showMsg("✅ Supprimée !"); chargerDonnees(); }
    catch { showMsg("❌ Erreur"); }
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

  const labelStyle = { fontSize: "11px", color: txt2, display: "block", marginBottom: "5px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" };
  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${brd}`, background: bg3, color: txt, fontSize: "13px", outline: "none" };

  const ModalWrapper = ({ show, onClose, title, children }) => !show ? null : (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: bg2, borderRadius: "20px", padding: "1.75rem", width: "440px", border: `1px solid ${brd}`, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: txt }}>{title}</h3>
          <button onClick={onClose} style={{ background: bg3, border: `1px solid ${brd}`, width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", color: txt2, fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );

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
            <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: txt }}>🗂️ Référentiels</p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>Gestion des classes, matières et salles</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {message && (
              <div style={{ padding: "7px 14px", background: message.includes("✅") ? "#E1F5EE" : "#FCEBEB", color: message.includes("✅") ? "#085041" : "#791F1F", borderRadius: "8px", fontSize: "12px", fontWeight: "600", boxShadow: shadow }}>
                {message}
              </div>
            )}
            <button onClick={() => setDark(!dark)} style={{ width: "38px", height: "38px", background: bg3, borderRadius: "10px", border: `1px solid ${brd}`, cursor: "pointer", fontSize: "17px" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* ONGLETS */}
        <div style={{ display: "flex", borderBottom: `1px solid ${brd}`, background: bg2 }}>
          {[
            { id: "classes",  label: "🎓 Classes",  count: classes.length,  color: "#0F6E56",  bg: "#E1F5EE" },
            { id: "matieres", label: "📚 Matières", count: matieres.length, color: "#534AB7",  bg: "#EEEDFE" },
            { id: "salles",   label: "🏛️ Salles",   count: salles.length,   color: "#185FA5",  bg: "#E6F1FB" },
          ].map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id)} style={{
              padding: "14px 24px", border: "none", cursor: "pointer", background: "transparent",
              color: onglet === o.id ? o.color : txt2, fontSize: "13px",
              fontWeight: onglet === o.id ? "700" : "400",
              borderBottom: onglet === o.id ? `2px solid ${o.color}` : "2px solid transparent",
              display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s"
            }}>
              {o.label}
              <span style={{ background: onglet === o.id ? o.bg : bg3, color: onglet === o.id ? o.color : txt2, fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" }}>
                {o.count}
              </span>
            </button>
          ))}
        </div>

        {/* CONTENU */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>

          {/* ===== CLASSES ===== */}
          {onglet === "classes" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <p style={{ fontSize: "14px", fontWeight: "700", color: txt, margin: 0 }}>
                  Liste des classes <span style={{ color: txt2, fontWeight: "400" }}>({classes.length})</span>
                </p>
                <button onClick={() => { setSelectedClasse(null); setFormClasse({ code: "", libelle: "", niveau: "Licence", annee_academique: "2025-2026" }); setShowModalClasse(true); }} style={{ padding: "8px 16px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600", boxShadow: "0 2px 8px rgba(15,110,86,0.3)" }}>
                  ＋ Ajouter classe
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
                {classes.map((c, i) => (
                  <div key={i} style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "18px", boxShadow: shadow, transition: "transform 0.2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🎓</div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => { setSelectedClasse(c); setFormClasse({ code: c.code, libelle: c.libelle, niveau: c.niveau, annee_academique: c.annee_academique }); setShowModalClasse(true); }} style={{ padding: "5px 10px", background: "#E1F5EE", color: "#085041", border: "1px solid #9FE1CB", borderRadius: "8px", fontSize: "11px", cursor: "pointer", fontWeight: "500" }}>✏️</button>
                        <button onClick={() => handleSupprimerClasse(c.id)} style={{ padding: "5px 10px", background: "#FCEBEB", color: "#791F1F", border: "1px solid #F09595", borderRadius: "8px", fontSize: "11px", cursor: "pointer" }}>🗑️</button>
                      </div>
                    </div>
                    <p style={{ fontSize: "15px", fontWeight: "700", color: txt, margin: "0 0 4px" }}>{c.libelle}</p>
                    <p style={{ fontSize: "12px", color: txt2, margin: "0 0 10px", fontFamily: "monospace" }}>{c.code}</p>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "11px", background: "#EEEDFE", color: "#3C3489", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>{c.niveau}</span>
                      <span style={{ fontSize: "11px", background: bg3, color: txt2, padding: "3px 10px", borderRadius: "20px" }}>{c.annee_academique}</span>
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
                <p style={{ fontSize: "14px", fontWeight: "700", color: txt, margin: 0 }}>
                  Liste des matières <span style={{ color: txt2, fontWeight: "400" }}>({matieres.length})</span>
                </p>
                <button onClick={() => { setSelectedMatiere(null); setFormMatiere({ code: "", libelle: "", volume_horaire_total: 40, coefficient: 2 }); setShowModalMatiere(true); }} style={{ padding: "8px 16px", background: "linear-gradient(135deg, #6B5CE7, #534AB7)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600", boxShadow: "0 2px 8px rgba(83,74,183,0.3)" }}>
                  ＋ Ajouter matière
                </button>
              </div>
              <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, overflow: "hidden", boxShadow: shadow }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: bg3 }}>
                      {["Code", "Libellé", "Volume horaire", "Coefficient", "Actions"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: txt2, fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matieres.length === 0 ? (
                      <tr><td colSpan="5" style={{ padding: "3rem", textAlign: "center", color: txt2 }}>
                        <p style={{ fontSize: "32px", margin: "0 0 8px" }}>📚</p>
                        Aucune matière
                      </td></tr>
                    ) : matieres.map((m, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${brd}` }}>
                        <td style={{ padding: "12px 16px", color: txt2, fontWeight: "600", fontFamily: "monospace" }}>{m.code}</td>
                        <td style={{ padding: "12px 16px", color: txt, fontWeight: "600" }}>{m.libelle}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ background: "#E6F1FB", color: "#0C447C", fontSize: "12px", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>{m.volume_horaire_total}h</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ background: "#EEEDFE", color: "#3C3489", fontSize: "12px", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>Coeff. {m.coefficient}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => { setSelectedMatiere(m); setFormMatiere({ code: m.code, libelle: m.libelle, volume_horaire_total: m.volume_horaire_total, coefficient: m.coefficient }); setShowModalMatiere(true); }} style={{ padding: "5px 10px", background: "#E1F5EE", color: "#085041", border: "1px solid #9FE1CB", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: "500" }}>✏️ Modifier</button>
                            <button onClick={() => handleSupprimerMatiere(m.id)} style={{ padding: "5px 10px", background: "#FCEBEB", color: "#791F1F", border: "1px solid #F09595", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== SALLES ===== */}
          {onglet === "salles" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <p style={{ fontSize: "14px", fontWeight: "700", color: txt, margin: 0 }}>
                  Liste des salles <span style={{ color: txt2, fontWeight: "400" }}>({salles.length})</span>
                </p>
                <button onClick={() => { setSelectedSalle(null); setFormSalle({ code: "", capacite: 30, equipements: "", batiment: "" }); setShowModalSalle(true); }} style={{ padding: "8px 16px", background: "linear-gradient(135deg, #2874D6, #185FA5)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600", boxShadow: "0 2px 8px rgba(24,95,165,0.3)" }}>
                  ＋ Ajouter salle
                </button>
              </div>
              {salles.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", background: bg2, borderRadius: "14px", border: `1px solid ${brd}` }}>
                  <p style={{ fontSize: "40px", margin: "0 0 12px" }}>🏛️</p>
                  <p style={{ color: txt2, fontSize: "13px" }}>Aucune salle enregistrée</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
                  {salles.map((s, i) => (
                    <div key={i} style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, padding: "18px", boxShadow: shadow }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🏛️</div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => { setSelectedSalle(s); setFormSalle({ code: s.code, capacite: s.capacite, equipements: s.equipements, batiment: s.batiment }); setShowModalSalle(true); }} style={{ padding: "5px 10px", background: "#E1F5EE", color: "#085041", border: "1px solid #9FE1CB", borderRadius: "8px", fontSize: "11px", cursor: "pointer", fontWeight: "500" }}>✏️</button>
                          <button onClick={() => handleSupprimerSalle(s.id)} style={{ padding: "5px 10px", background: "#FCEBEB", color: "#791F1F", border: "1px solid #F09595", borderRadius: "8px", fontSize: "11px", cursor: "pointer" }}>🗑️</button>
                        </div>
                      </div>
                      <p style={{ fontSize: "18px", fontWeight: "700", color: txt, margin: "0 0 4px" }}>{s.code}</p>
                      <p style={{ fontSize: "12px", color: txt2, margin: "0 0 10px" }}>{s.batiment || "—"}</p>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", background: "#E1F5EE", color: "#085041", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>👥 {s.capacite} places</span>
                        {s.equipements && <span style={{ fontSize: "11px", background: bg3, color: txt2, padding: "3px 10px", borderRadius: "20px" }}>{s.equipements?.split(",")[0]}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL CLASSE ===== */}
      <ModalWrapper show={showModalClasse} onClose={() => setShowModalClasse(false)} title={selectedClasse ? "✏️ Modifier classe" : "➕ Ajouter classe"}>
        {[{ label: "Code", key: "code", placeholder: "Ex: L1-RST" }, { label: "Libellé", key: "libelle", placeholder: "Ex: Licence 1 Réseaux" }].map(f => (
          <div key={f.key} style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>{f.label}</label>
            <input type="text" value={formClasse[f.key]} onChange={e => setFormClasse({...formClasse, [f.key]: e.target.value})} placeholder={f.placeholder} style={inputStyle}/>
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div>
            <label style={labelStyle}>Niveau</label>
            <select value={formClasse.niveau} onChange={e => setFormClasse({...formClasse, niveau: e.target.value})} style={inputStyle}>
              <option>Licence</option><option>Master</option><option>Doctorat</option><option>BTS</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Année académique</label>
            <input type="text" value={formClasse.annee_academique} onChange={e => setFormClasse({...formClasse, annee_academique: e.target.value})} style={inputStyle}/>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleSauvegarderClasse} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 3px 10px rgba(15,110,86,0.3)" }}>
            {selectedClasse ? "✅ Modifier" : "➕ Ajouter"}
          </button>
          <button onClick={() => setShowModalClasse(false)} style={{ padding: "12px 20px", background: bg3, color: txt, border: `1px solid ${brd}`, borderRadius: "10px", fontSize: "13px", cursor: "pointer" }}>Annuler</button>
        </div>
      </ModalWrapper>

      {/* ===== MODAL MATIÈRE ===== */}
      <ModalWrapper show={showModalMatiere} onClose={() => setShowModalMatiere(false)} title={selectedMatiere ? "✏️ Modifier matière" : "➕ Ajouter matière"}>
        {[{ label: "Code", key: "code", placeholder: "Ex: RES301" }, { label: "Libellé", key: "libelle", placeholder: "Ex: Réseaux Informatiques" }].map(f => (
          <div key={f.key} style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>{f.label}</label>
            <input type="text" value={formMatiere[f.key]} onChange={e => setFormMatiere({...formMatiere, [f.key]: e.target.value})} placeholder={f.placeholder} style={inputStyle}/>
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div>
            <label style={labelStyle}>Volume horaire</label>
            <input type="number" value={formMatiere.volume_horaire_total} onChange={e => setFormMatiere({...formMatiere, volume_horaire_total: e.target.value})} style={inputStyle}/>
          </div>
          <div>
            <label style={labelStyle}>Coefficient</label>
            <input type="number" value={formMatiere.coefficient} onChange={e => setFormMatiere({...formMatiere, coefficient: e.target.value})} style={inputStyle}/>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleSauvegarderMatiere} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #6B5CE7, #534AB7)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
            {selectedMatiere ? "✅ Modifier" : "➕ Ajouter"}
          </button>
          <button onClick={() => setShowModalMatiere(false)} style={{ padding: "12px 20px", background: bg3, color: txt, border: `1px solid ${brd}`, borderRadius: "10px", fontSize: "13px", cursor: "pointer" }}>Annuler</button>
        </div>
      </ModalWrapper>

      {/* ===== MODAL SALLE ===== */}
      <ModalWrapper show={showModalSalle} onClose={() => setShowModalSalle(false)} title={selectedSalle ? "✏️ Modifier salle" : "➕ Ajouter salle"}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div>
            <label style={labelStyle}>Code salle</label>
            <input type="text" value={formSalle.code} onChange={e => setFormSalle({...formSalle, code: e.target.value})} placeholder="Ex: A01" style={inputStyle}/>
          </div>
          <div>
            <label style={labelStyle}>Capacité</label>
            <input type="number" value={formSalle.capacite} onChange={e => setFormSalle({...formSalle, capacite: e.target.value})} style={inputStyle}/>
          </div>
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>Bâtiment</label>
          <input type="text" value={formSalle.batiment} onChange={e => setFormSalle({...formSalle, batiment: e.target.value})} placeholder="Ex: Bâtiment A" style={inputStyle}/>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Équipements</label>
          <input type="text" value={formSalle.equipements} onChange={e => setFormSalle({...formSalle, equipements: e.target.value})} placeholder="Ex: Tableau, Vidéoprojecteur" style={inputStyle}/>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleSauvegarderSalle} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #2874D6, #185FA5)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
            {selectedSalle ? "✅ Modifier" : "➕ Ajouter"}
          </button>
          <button onClick={() => setShowModalSalle(false)} style={{ padding: "12px 20px", background: bg3, color: txt, border: `1px solid ${brd}`, borderRadius: "10px", fontSize: "13px", cursor: "pointer" }}>Annuler</button>
        </div>
      </ModalWrapper>
    </div>
  );
}
