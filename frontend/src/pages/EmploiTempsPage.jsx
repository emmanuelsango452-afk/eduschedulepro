import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";

const API = 'http://localhost/eduschedulepro/backend/api';

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const HEURES = ["07:30", "10:00", "14:00", "16:00"];
const COULEURS = {
  "Réseaux Informatiques":        { bg: "#E1F5EE", border: "#0F6E56", txt: "#085041" },
  "Programmation Orientée Objet": { bg: "#EEEDFE", border: "#534AB7", txt: "#3C3489" },
  "Développement Web":            { bg: "#FAEEDA", border: "#BA7517", txt: "#633806" },
  "Bases de Données Avancées":    { bg: "#E6F1FB", border: "#185FA5", txt: "#0C447C" },
  "Systèmes d exploitation":      { bg: "#FAECE7", border: "#993C1D", txt: "#712B13" },
};

const PALETTE = [
  { bg: "#E1F5EE", border: "#0F6E56", txt: "#085041" },
  { bg: "#EEEDFE", border: "#534AB7", txt: "#3C3489" },
  { bg: "#FAEEDA", border: "#BA7517", txt: "#633806" },
  { bg: "#E6F1FB", border: "#185FA5", txt: "#0C447C" },
  { bg: "#FAECE7", border: "#993C1D", txt: "#712B13" },
  { bg: "#E8F5E9", border: "#2E7D32", txt: "#1B5E20" },
  { bg: "#FCE4EC", border: "#C2185B", txt: "#880E4F" },
  { bg: "#E8EAF6", border: "#3949AB", txt: "#1A237E" },
  { bg: "#FFF8E1", border: "#F9A825", txt: "#F57F17" },
  { bg: "#E0F7FA", border: "#00838F", txt: "#006064" },
];

export default function EmploiTempsPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [plannings, setPlannings]         = useState([]);
  const [classes, setClasses]             = useState([]);
  const [enseignants, setEnseignants]     = useState([]);
  const [matieres, setMatieres]           = useState([]);
  const [salles, setSalles]               = useState([]);
  const [classeId, setClasseId]           = useState("");
  const [dark, setDark]                   = useState(false);
  const [loading, setLoading]             = useState(true);
  const [vue, setVue]                     = useState("semaine");
  const [creneauSelec, setCreneauSelec]   = useState(null);
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [showQR, setShowQR]               = useState(false);
  const [qrCreneau, setQrCreneau]         = useState(null);
  const [filtreEns, setFiltreEns]         = useState("");
  const [filtreMatiere, setFiltreMatiere] = useState("");
  const [jourSelec, setJourSelec]         = useState(JOURS[0]);
  const [message, setMessage]             = useState("");
  const [semaineDebut, setSemaineDebut]   = useState(() => {
    const today = new Date();
    const day = today.getDay() || 7;
    today.setDate(today.getDate() - day + 1);
    return today.toISOString().slice(0,10);
  });
  const [form, setForm] = useState({
    id_classe: "", id_matiere: "", id_enseignant: "",
    id_salle: "", jour: "Lundi", heure_debut: "07:30", heure_fin: "09:30"
  });

  const bg     = dark ? "#0d1117" : "#f0faf6";
  const bg2    = dark ? "#161b22" : "#ffffff";
  const bg3    = dark ? "#21262d" : "#e8f5ee";
  const txt    = dark ? "#e6edf3" : "#04342C";
  const txt2   = dark ? "#8b949e" : "#5F5E5A";
  const brd    = dark ? "rgba(255,255,255,0.08)" : "rgba(4,52,44,0.08)";
  const shadow = dark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 12px rgba(4,52,44,0.06)";

  const chargerPlannings = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/emploi_temps.php?id_classe=${id}&semaine=${semaineDebut}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.succes) setPlannings(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/classes.php`,     { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/enseignants.php`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/matieres.php`,    { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/salles.php`,      { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(([classesRes, ensRes, matRes, salRes]) => {
      if (classesRes.data.succes) {
        setClasses(classesRes.data.data);
        if (classesRes.data.data.length > 0) {
          setClasseId(classesRes.data.data[0].id);
          setForm(f => ({ ...f, id_classe: classesRes.data.data[0].id }));
        }
      }
      if (ensRes.data.succes) setEnseignants(ensRes.data.data);
      if (matRes.data.succes) setMatieres(matRes.data.data);
      if (salRes.data.succes) setSalles(salRes.data.data);
    });
  }, [token]);

  useEffect(() => { chargerPlannings(classeId); }, [classeId, token, semaineDebut]);

  const getCouleur = (matiere) => {
    if (COULEURS[matiere]) return COULEURS[matiere];
    let hash = 0;
    for (let i = 0; i < (matiere?.length || 0); i++) hash = matiere.charCodeAt(i) + ((hash << 5) - hash);
    return PALETTE[Math.abs(hash) % PALETTE.length];
  };

  const getCreneaux = (jour, heure) => {
    const creneaux = [];
    plannings.forEach(p => {
      if (!p.creneaux) return;
      p.creneaux.forEach(cr => {
        if (!cr || cr.jour !== jour || cr.heure_debut?.slice(0,5) !== heure) return;
        if (filtreEns && cr.enseignant && !cr.enseignant.toLowerCase().includes(filtreEns.toLowerCase())) return;
        if (filtreMatiere && cr.matiere && !cr.matiere.toLowerCase().includes(filtreMatiere.toLowerCase())) return;
        creneaux.push(cr);
      });
    });
    return creneaux;
  };

  const getTousCreneaux = () => {
    const all = [];
    plannings.forEach(p => {
      if (p.creneaux) p.creneaux.forEach(cr => {
        if (!cr) return;
        if (filtreEns && cr.enseignant && !cr.enseignant.toLowerCase().includes(filtreEns.toLowerCase())) return;
        if (filtreMatiere && cr.matiere && !cr.matiere.toLowerCase().includes(filtreMatiere.toLowerCase())) return;
        all.push(cr);
      });
    });
    return all;
  };

  const getCreneauxJour = (jour) => getTousCreneaux().filter(cr => cr.jour === jour);
  const getToken = (cr) => `TOKEN_${cr.id}_TEST`;

  const handlePublier = async (id, statut) => {
    try {
      await axios.put(`${API}/emploi_temps.php?id=${id}&action=publier`,
        { statut: statut === "publie" ? "brouillon" : "publie" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(statut === "publie" ? "📴 Planning dépublié" : "📢 Planning publié !");
      setTimeout(() => setMessage(""), 3000);
      chargerPlannings(classeId);
    } catch (err) { console.error(err); }
  };

  const handleCreerCreneau = async () => {
    if (!form.id_matiere || !form.id_enseignant || !form.id_salle) {
      setMessage("⚠️ Veuillez remplir tous les champs !");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    try {
      const res = await axios.post(`${API}/emploi_temps.php`, {
        id_classe: classeId, semaine_debut: semaineDebut,
        creneaux: [{ id_matiere: form.id_matiere, id_enseignant: form.id_enseignant, id_salle: form.id_salle, jour: form.jour, heure_debut: form.heure_debut + ":00", heure_fin: form.heure_fin + ":00" }]
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.succes) {
        setMessage("✅ Créneau créé !");
        setShowModal(false);
        setForm({ id_classe: classeId, id_matiere: "", id_enseignant: "", id_salle: "", jour: "Lundi", heure_debut: "07:30", heure_fin: "09:30" });
        chargerPlannings(classeId);
      } else { setMessage(`❌ ${res.data.message}`); }
    } catch (err) { setMessage(`❌ ${err.response?.data?.message || "Erreur"}`); }
    finally { setTimeout(() => setMessage(""), 4000); }
  };

  const menuItems = [
    { label: "Tableau de bord",  icon: "⊞",  route: "/dashboard/admin" },
    { label: "Emploi du temps",  icon: "📅",  route: "/emploi-temps", active: true },
    { label: "Cahiers de texte", icon: "📝",  route: "/cahiers" },
    { label: "Vacations",        icon: "💰",  route: "/vacations" },
    { label: "Enseignants",      icon: "👨‍🏫", route: "/enseignants" },
    { label: "Rapports",         icon: "📊",  route: "/rapports" },
  ];

  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${brd}`, background: bg3, color: txt, fontSize: "13px", outline: "none" };
  const selectStyle = { ...inputStyle };

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
              padding: sidebarOpen ? "10px 12px" : "10px",
              borderRadius: "10px", cursor: "pointer", marginBottom: "2px",
              background: item.active ? "linear-gradient(135deg, rgba(29,158,117,0.25), rgba(15,110,86,0.15))" : "transparent",
              border: item.active ? "1px solid rgba(29,158,117,0.3)" : "1px solid transparent",
            }}>
              <span style={{ fontSize: "17px", flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && (
                <span style={{ color: item.active ? "#E1F5EE" : "#9FE1CB", fontSize: "13px", fontWeight: item.active ? "600" : "400", whiteSpace: "nowrap" }}>{item.label}</span>
              )}
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
        <div style={{ background: bg2, padding: "12px 24px", borderBottom: `1px solid ${brd}`, boxShadow: shadow }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: txt }}>📅 Emploi du temps</p>
              <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>
                Semaine du {new Date(semaineDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} au {new Date(new Date(semaineDebut).setDate(new Date(semaineDebut).getDate() + 5)).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {message && (
                <div style={{ padding: "7px 14px", background: message.includes("✅") || message.includes("📢") ? "#E1F5EE" : message.includes("⚠️") ? "#FAEEDA" : "#FCEBEB", color: message.includes("✅") || message.includes("📢") ? "#085041" : message.includes("⚠️") ? "#633806" : "#791F1F", borderRadius: "8px", fontSize: "12px", fontWeight: "600", boxShadow: shadow }}>
                  {message}
                </div>
              )}
              <button onClick={() => setDark(!dark)} style={{ width: "38px", height: "38px", background: bg3, borderRadius: "10px", border: `1px solid ${brd}`, cursor: "pointer", fontSize: "17px" }}>
                {dark ? "☀️" : "🌙"}
              </button>
            </div>
          </div>

          {/* Barre d'outils */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Filtres */}
            <select value={classeId} onChange={e => setClasseId(e.target.value)} style={{ padding: "7px 10px", borderRadius: "8px", fontSize: "12px", border: `1px solid ${brd}`, background: bg3, color: txt, fontWeight: "500" }}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
            </select>
            <select value={filtreEns} onChange={e => setFiltreEns(e.target.value)} style={{ padding: "7px 10px", borderRadius: "8px", fontSize: "12px", border: `1px solid ${brd}`, background: bg3, color: txt }}>
              <option value="">👨‍🏫 Tous les enseignants</option>
              {enseignants.map(e => <option key={e.id} value={e.nom}>{e.prenom} {e.nom}</option>)}
            </select>
            <select value={filtreMatiere} onChange={e => setFiltreMatiere(e.target.value)} style={{ padding: "7px 10px", borderRadius: "8px", fontSize: "12px", border: `1px solid ${brd}`, background: bg3, color: txt }}>
              <option value="">📚 Toutes les matières</option>
              {matieres.map(m => <option key={m.id} value={m.libelle}>{m.libelle}</option>)}
            </select>

            {/* Séparateur */}
            <div style={{ width: "1px", height: "24px", background: brd }}/>

            {/* Vues */}
            <div style={{ display: "flex", background: bg3, borderRadius: "8px", overflow: "hidden", border: `1px solid ${brd}` }}>
              {[{ val: "semaine", label: "📅 Semaine" }, { val: "journee", label: "📆 Journée" }, { val: "liste", label: "📋 Liste" }].map(v => (
                <button key={v.val} onClick={() => setVue(v.val)} style={{ padding: "7px 12px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: "500", background: vue === v.val ? "#0F6E56" : "transparent", color: vue === v.val ? "#fff" : txt2, transition: "all 0.2s" }}>{v.label}</button>
              ))}
            </div>

            {/* Navigation semaine */}
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <button onClick={() => { const d = new Date(semaineDebut); d.setDate(d.getDate() - 7); setSemaineDebut(d.toISOString().slice(0,10)); }} style={{ padding: "7px 11px", borderRadius: "8px", border: `1px solid ${brd}`, background: bg2, color: txt, cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>◀</button>
              <button onClick={() => { const today = new Date(); const day = today.getDay() || 7; today.setDate(today.getDate() - day + 1); setSemaineDebut(today.toISOString().slice(0,10)); }} style={{ padding: "7px 12px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", cursor: "pointer", fontSize: "11px", fontWeight: "600", boxShadow: "0 2px 8px rgba(15,110,86,0.3)" }}>Aujourd'hui</button>
              <button onClick={() => { const d = new Date(semaineDebut); d.setDate(d.getDate() + 7); setSemaineDebut(d.toISOString().slice(0,10)); }} style={{ padding: "7px 11px", borderRadius: "8px", border: `1px solid ${brd}`, background: bg2, color: txt, cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>▶</button>
            </div>

            {/* Séparateur */}
            <div style={{ width: "1px", height: "24px", background: brd }}/>

            {/* Actions */}
            <button onClick={() => setShowModal(true)} style={{ padding: "7px 14px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600", boxShadow: "0 2px 8px rgba(15,110,86,0.3)" }}>
              ＋ Nouveau créneau
            </button>

            {plannings.length > 0 && (
              <button onClick={() => handlePublier(plannings[0].id, plannings[0].statut_publication)} style={{ padding: "7px 14px", background: plannings[0].statut_publication === "publie" ? "#FCEBEB" : "#E1F5EE", color: plannings[0].statut_publication === "publie" ? "#791F1F" : "#085041", border: `1px solid ${plannings[0].statut_publication === "publie" ? "#F09595" : "#9FE1CB"}`, borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
                {plannings[0].statut_publication === "publie" ? "📴 Dépublier" : "📢 Publier"}
              </button>
            )}

            <button onClick={async () => {
              const creneaux = getTousCreneaux();
              if (creneaux.length === 0) { setMessage("⚠️ Aucun créneau à dupliquer !"); setTimeout(() => setMessage(""), 3000); return; }
              const prochaineLundi = new Date(semaineDebut);
              prochaineLundi.setDate(prochaineLundi.getDate() + 7);
              const semaineSuivante = prochaineLundi.toISOString().slice(0,10);
              try {
                const res = await axios.post(`${API}/emploi_temps.php`, { id_classe: classeId, semaine_debut: semaineSuivante, creneaux: creneaux.map(cr => ({ id_matiere: cr.id_matiere, id_enseignant: cr.id_enseignant, id_salle: cr.id_salle, jour: cr.jour, heure_debut: cr.heure_debut, heure_fin: cr.heure_fin })) }, { headers: { Authorization: `Bearer ${token}` } });
                if (res.data.succes) { setMessage(`✅ Semaine dupliquée !`); setSemaineDebut(semaineSuivante); }
                else { setMessage(`❌ ${res.data.message}`); }
              } catch (err) { setMessage(`❌ Erreur`); }
              finally { setTimeout(() => setMessage(""), 4000); }
            }} style={{ padding: "7px 14px", background: "#EEEDFE", color: "#3C3489", border: "1px solid #CECBF6", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
              📋 Dupliquer
            </button>

            <button onClick={() => {
              const classe = classes.find(c => c.id == classeId)?.libelle || "Classe";
              const creneaux = getTousCreneaux();
              const contenu = `<html><head><title>Emploi du temps — ${classe}</title><style>body{font-family:Arial,sans-serif;padding:20px}h1{color:#04342C;font-size:18px}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#04342C;color:white;padding:8px 12px;text-align:left}td{padding:8px 12px;border-bottom:1px solid #e0e0e0}tr:nth-child(even){background:#f5f5f5}</style></head><body><h1>📅 Emploi du temps — ${classe}</h1><p>Semaine du ${new Date(semaineDebut).toLocaleDateString("fr-FR")}</p><table><thead><tr><th>Jour</th><th>Début</th><th>Fin</th><th>Matière</th><th>Enseignant</th><th>Salle</th></tr></thead><tbody>${creneaux.map(cr => `<tr><td>${cr.jour}</td><td>${cr.heure_debut?.slice(0,5)}</td><td>${cr.heure_fin?.slice(0,5)}</td><td>${cr.matiere}</td><td>${cr.enseignant}</td><td>${cr.salle}</td></tr>`).join("")}</tbody></table></body></html>`;
              const fenetre = window.open("", "_blank");
              fenetre.document.write(contenu);
              fenetre.document.close();
              fenetre.print();
            }} style={{ padding: "7px 14px", background: bg2, color: txt, border: `1px solid ${brd}`, borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
              📄 PDF
            </button>
          </div>
        </div>

        {/* Statut publication */}
        {plannings.length > 0 && (
          <div style={{ padding: "8px 24px", background: plannings[0].statut_publication === "publie" ? "#E1F5EE" : "#FAEEDA", borderBottom: `1px solid ${brd}`, display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>{plannings[0].statut_publication === "publie" ? "📢" : "📄"}</span>
            <span style={{ fontSize: "12px", fontWeight: "600", color: plannings[0].statut_publication === "publie" ? "#085041" : "#633806" }}>
              {plannings[0].statut_publication === "publie" ? "Planning publié — visible par les étudiants" : "Planning en brouillon — non visible par les étudiants"}
            </span>
          </div>
        )}

        {/* CONTENU */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
              <p style={{ color: txt2, fontSize: "14px" }}>Chargement de l'emploi du temps...</p>
            </div>
          ) : vue === "semaine" ? (
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: "900px" }}>
                {/* En-têtes jours */}
                <div style={{ display: "grid", gridTemplateColumns: "80px repeat(6, 1fr)", gap: "6px", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "11px", color: txt2, fontWeight: "500" }}>Horaire</span>
                  </div>
                  {JOURS.map((jour, i) => {
                    const isToday = i === new Date().getDay() - 1;
                    return (
                      <div key={jour} style={{
                        background: isToday ? "linear-gradient(135deg, #1D9E75, #0F6E56)" : dark ? "#1e2a26" : "#085041",
                        color: "#E1F5EE", padding: "12px 6px", textAlign: "center",
                        borderRadius: "10px", fontSize: "12px", fontWeight: "600",
                        boxShadow: isToday ? "0 4px 12px rgba(29,158,117,0.4)" : "none",
                        border: isToday ? "2px solid #1D9E75" : "2px solid transparent"
                      }}>
                        <div>{jour}</div>
                        <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "3px", fontWeight: "400" }}>
                          {new Date(new Date(semaineDebut).setDate(new Date(semaineDebut).getDate() + i)).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </div>
                        {isToday && <div style={{ fontSize: "9px", marginTop: "3px", background: "rgba(255,255,255,0.2)", borderRadius: "4px", padding: "1px 6px" }}>Aujourd'hui</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Créneaux */}
                {HEURES.map((heure, index) => (
                  <div key={heure}>
                    {/* Pause déjeuner */}
                    {index === 2 && (
                      <div style={{ display: "grid", gridTemplateColumns: "80px repeat(6, 1fr)", gap: "6px", marginBottom: "6px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px" }}>
                          <span style={{ fontSize: "11px", color: "#BA7517", fontWeight: "700" }}>12:00</span>
                          <span style={{ fontSize: "9px", color: "#BA7517", opacity: 0.7 }}>1h30</span>
                        </div>
                        {JOURS.map(jour => (
                          <div key={jour} style={{ background: dark ? "rgba(186,117,23,0.15)" : "#FFF8E8", borderRadius: "8px", border: "1px dashed #E8C97A", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                            <span style={{ fontSize: "14px" }}>🍽️</span>
                            <span style={{ fontSize: "11px", color: "#BA7517", fontWeight: "600" }}>Pause déjeuner</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Ligne créneau */}
                    <div style={{ display: "grid", gridTemplateColumns: "80px repeat(6, 1fr)", gap: "6px", marginBottom: "6px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: bg2, borderRadius: "8px", border: `1px solid ${brd}`, padding: "8px 4px" }}>
                        <span style={{ fontSize: "12px", color: txt, fontWeight: "700" }}>{heure}</span>
                        <span style={{ fontSize: "9px", color: txt2, marginTop: "2px" }}>–</span>
                        <span style={{ fontSize: "12px", color: txt2 }}>{["09:30", "12:00", "16:00", "18:00"][index]}</span>
                      </div>
                      {JOURS.map(jour => {
                        const crs = getCreneaux(jour, heure);
                        return (
                          <div key={jour} style={{ background: bg2, borderRadius: "10px", border: `1px solid ${brd}`, minHeight: "100px", padding: "4px", position: "relative", transition: "box-shadow 0.2s" }}>
                            {crs.length === 0 ? (
                              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "92px" }}>
                                <span style={{ fontSize: "10px", color: brd }}>—</span>
                              </div>
                            ) : crs.map((cr, i) => {
                              const c = getCouleur(cr.matiere);
                              return (
                                <div key={i} onClick={() => setCreneauSelec(cr)} style={{
                                  background: c.bg, borderLeft: `4px solid ${c.border}`,
                                  borderRadius: "6px", padding: "8px 10px", cursor: "pointer",
                                  height: "calc(100% - 8px)", transition: "opacity 0.2s"
                                }}>
                                  <p style={{ fontSize: "11px", fontWeight: "700", color: c.txt, margin: "0 0 4px", lineHeight: 1.2 }}>{cr.matiere?.split(" ").slice(0, 3).join(" ")}</p>
                                  <p style={{ fontSize: "10px", color: c.txt, margin: "0 0 6px", opacity: 0.8 }}>👨‍🏫 {cr.enseignant?.split(" ").slice(-1)[0]}</p>
                                  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                                    <span style={{ fontSize: "9px", background: c.border, color: "#fff", padding: "2px 6px", borderRadius: "6px", fontWeight: "600" }}>🏛️ {cr.salle}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Légende */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px", padding: "14px 16px", background: bg2, borderRadius: "10px", border: `1px solid ${brd}`, boxShadow: shadow }}>
                  <span style={{ fontSize: "11px", color: txt2, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Légende :</span>
                  {Object.entries(COULEURS).map(([matiere, c]) => (
                    <div key={matiere} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: c.border }}/>
                      <span style={{ fontSize: "11px", color: txt2 }}>{matiere}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          ) : vue === "journee" ? (
            <div>
              {/* Sélecteur jours */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                {JOURS.map((jour, i) => (
                  <button key={jour} onClick={() => setJourSelec(jour)} style={{
                    padding: "9px 16px", borderRadius: "10px",
                    border: `1px solid ${jourSelec === jour ? "#0F6E56" : brd}`,
                    cursor: "pointer", fontWeight: jourSelec === jour ? "600" : "400", fontSize: "12px",
                    background: jourSelec === jour ? "linear-gradient(135deg, #1D9E75, #0F6E56)" : bg2,
                    color: jourSelec === jour ? "#fff" : txt,
                    boxShadow: jourSelec === jour ? "0 2px 8px rgba(15,110,86,0.3)" : "none"
                  }}>
                    <div>{jour}</div>
                    <div style={{ fontSize: "10px", opacity: 0.8 }}>
                      {new Date(new Date(semaineDebut).setDate(new Date(semaineDebut).getDate() + i)).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </div>
                  </button>
                ))}
              </div>

              <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, overflow: "hidden", boxShadow: shadow }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${brd}`, background: bg3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: txt, margin: 0 }}>📆 {jourSelec}</p>
                  <span style={{ fontSize: "12px", background: bg2, color: txt2, padding: "4px 10px", borderRadius: "20px", border: `1px solid ${brd}` }}>
                    {getCreneauxJour(jourSelec).length} créneau(x)
                  </span>
                </div>
                {getCreneauxJour(jourSelec).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "4rem" }}>
                    <p style={{ fontSize: "48px", margin: "0 0 16px" }}>📭</p>
                    <p style={{ color: txt2, fontSize: "14px" }}>Aucun créneau ce jour</p>
                  </div>
                ) : (
                  getCreneauxJour(jourSelec).map((cr, i) => {
                    const c = getCouleur(cr.matiere);
                    return (
                      <div key={i} onClick={() => setCreneauSelec(cr)} style={{ display: "flex", gap: "16px", alignItems: "stretch", padding: "16px 20px", borderBottom: `1px solid ${brd}`, cursor: "pointer", transition: "background 0.2s" }}>
                        <div style={{ minWidth: "90px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                          <p style={{ fontSize: "15px", fontWeight: "700", color: txt, margin: "0 0 4px" }}>{cr.heure_debut?.slice(0,5)}</p>
                          <div style={{ height: "30px", width: "2px", background: `linear-gradient(180deg, ${c.border}, transparent)`, margin: "0 auto" }}/>
                          <p style={{ fontSize: "12px", color: txt2, margin: "4px 0 0" }}>{cr.heure_fin?.slice(0,5)}</p>
                        </div>
                        <div style={{ flex: 1, background: c.bg, borderRadius: "12px", borderLeft: `4px solid ${c.border}`, padding: "14px 18px" }}>
                          <p style={{ fontSize: "15px", fontWeight: "700", color: c.txt, margin: "0 0 8px" }}>{cr.matiere}</p>
                          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "12px", color: c.txt }}>👨‍🏫 {cr.enseignant}</span>
                            <span style={{ fontSize: "12px", color: c.txt }}>🏛️ Salle {cr.salle}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", justifyContent: "center" }}>
                          <button onClick={(e) => { e.stopPropagation(); setQrCreneau(cr); setShowQR(true); }} style={{ padding: "7px 14px", background: "#E1F5EE", color: "#085041", border: "1px solid #9FE1CB", borderRadius: "8px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>📱 QR-Code</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          ) : (
            <div>
              {getTousCreneaux().length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem" }}>
                  <p style={{ fontSize: "48px", margin: "0 0 16px" }}>📭</p>
                  <p style={{ color: txt2, fontSize: "14px" }}>Aucun créneau trouvé</p>
                </div>
              ) : (
                JOURS.map(jour => {
                  const crs = getCreneauxJour(jour);
                  if (crs.length === 0) return null;
                  return (
                    <div key={jour} style={{ marginBottom: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <p style={{ fontSize: "12px", fontWeight: "700", color: txt2, margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>{jour}</p>
                        <div style={{ flex: 1, height: "1px", background: brd }}/>
                        <span style={{ fontSize: "11px", color: txt2 }}>{crs.length} cours</span>
                      </div>
                      {crs.map((cr, i) => {
                        const c = getCouleur(cr.matiere);
                        return (
                          <div key={i} onClick={() => setCreneauSelec(cr)} style={{ background: bg2, borderRadius: "12px", border: `1px solid ${brd}`, padding: "14px 18px", display: "flex", alignItems: "center", gap: "16px", cursor: "pointer", marginBottom: "8px", borderLeft: `5px solid ${c.border}`, boxShadow: shadow, transition: "transform 0.2s" }}>
                            <div style={{ minWidth: "70px", background: c.bg, padding: "8px", borderRadius: "8px", textAlign: "center" }}>
                              <p style={{ fontSize: "13px", fontWeight: "700", color: c.txt, margin: 0 }}>{cr.heure_debut?.slice(0,5)}</p>
                              <p style={{ fontSize: "11px", color: c.txt, margin: 0, opacity: 0.7 }}>{cr.heure_fin?.slice(0,5)}</p>
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: "13px", fontWeight: "700", color: c.border, margin: "0 0 4px" }}>{cr.matiere}</p>
                              <div style={{ display: "flex", gap: "12px" }}>
                                <span style={{ fontSize: "11px", color: txt2 }}>👨‍🏫 {cr.enseignant}</span>
                                <span style={{ fontSize: "11px", color: txt2 }}>🏛️ {cr.salle}</span>
                              </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setQrCreneau(cr); setShowQR(true); }} style={{ padding: "6px 12px", background: "#E1F5EE", color: "#085041", border: "1px solid #9FE1CB", borderRadius: "8px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>📱 QR</button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL DÉTAIL CRÉNEAU ===== */}
      {creneauSelec && (
        <div onClick={() => setCreneauSelec(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: bg2, borderRadius: "20px", padding: "1.75rem", width: "400px", border: `1px solid ${brd}`, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            {(() => {
              const c = getCouleur(creneauSelec.matiere);
              return (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ background: c.bg, borderRadius: "12px", padding: "12px 16px", flex: 1, marginRight: "12px", borderLeft: `4px solid ${c.border}` }}>
                      <p style={{ fontSize: "17px", fontWeight: "700", color: c.txt, margin: "0 0 4px" }}>{creneauSelec.matiere}</p>
                      <p style={{ fontSize: "13px", color: c.txt, margin: 0, opacity: 0.8 }}>{creneauSelec.jour}</p>
                    </div>
                    <button onClick={() => setCreneauSelec(null)} style={{ background: bg3, border: `1px solid ${brd}`, width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", color: txt2, fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  </div>
                  <div style={{ background: bg3, borderRadius: "10px", padding: "12px", marginBottom: "16px" }}>
                    {[
                      { icon: "👨‍🏫", label: "Enseignant", val: creneauSelec.enseignant },
                      { icon: "🏛️",  label: "Salle",       val: creneauSelec.salle },
                      { icon: "⏰",  label: "Horaire",     val: `${creneauSelec.heure_debut?.slice(0,5)} — ${creneauSelec.heure_fin?.slice(0,5)}` },
                      { icon: "🔑",  label: "Token QR",    val: getToken(creneauSelec) },
                    ].map(item => (
                      <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: `1px solid ${brd}` }}>
                        <span style={{ fontSize: "16px" }}>{item.icon}</span>
                        <span style={{ fontSize: "12px", color: txt2, minWidth: "80px" }}>{item.label}</span>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: item.label === "Token QR" ? "#0F6E56" : txt, flex: 1, textAlign: "right", fontFamily: item.label === "Token QR" ? "monospace" : "inherit" }}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <button onClick={() => { setQrCreneau(creneauSelec); setShowQR(true); setCreneauSelec(null); }} style={{ padding: "11px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "600", gridColumn: "span 2" }}>📱 Voir QR-Code</button>
                    <button onClick={() => { setForm({ id_classe: classeId, id_matiere: creneauSelec.id_matiere || "", id_enseignant: creneauSelec.id_enseignant || "", id_salle: creneauSelec.id_salle || "", jour: creneauSelec.jour, heure_debut: creneauSelec.heure_debut?.slice(0,5) || "07:30", heure_fin: creneauSelec.heure_fin?.slice(0,5) || "09:30", id_creneau: creneauSelec.id }); setCreneauSelec(null); setShowModal(true); }} style={{ padding: "10px", background: "#FAEEDA", color: "#633806", border: "1px solid #E8C97A", borderRadius: "10px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>✏️ Modifier</button>
                    <button onClick={async () => { if (!window.confirm("Supprimer ce créneau ?")) return; try { await axios.delete(`${API}/emploi_temps.php?id=${creneauSelec.id}`, { headers: { Authorization: `Bearer ${token}` } }); setCreneauSelec(null); setMessage("✅ Créneau supprimé !"); chargerPlannings(classeId); setTimeout(() => setMessage(""), 3000); } catch { setMessage("❌ Erreur"); } }} style={{ padding: "10px", background: "#FCEBEB", color: "#791F1F", border: "1px solid #F09595", borderRadius: "10px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>🗑️ Supprimer</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ===== MODAL QR-CODE ===== */}
      {showQR && qrCreneau && (
        <div onClick={() => setShowQR(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, backdropFilter: "blur(4px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: bg2, borderRadius: "20px", padding: "2rem", width: "360px", textAlign: "center", border: `1px solid ${brd}`, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: "700", color: txt }}>QR-Code — Séance</h3>
            <p style={{ fontSize: "13px", color: txt2, margin: "0 0 20px" }}>{qrCreneau.matiere} — {qrCreneau.jour} {qrCreneau.heure_debut?.slice(0,5)}</p>
            <div style={{ background: "#fff", padding: "20px", borderRadius: "16px", display: "inline-block", marginBottom: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
              <QRCodeSVG value={getToken(qrCreneau)} size={160} fgColor="#04342C" bgColor="#ffffff" level="H" />
            </div>
            <div style={{ background: "#E1F5EE", borderRadius: "10px", padding: "12px 16px", marginBottom: "12px", textAlign: "left", border: "1px solid #9FE1CB" }}>
              <p style={{ fontSize: "11px", color: "#5F5E5A", margin: "0 0 6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>🔑 Token de pointage</p>
              <p style={{ fontSize: "15px", color: "#0F6E56", margin: 0, fontFamily: "monospace", fontWeight: "700", wordBreak: "break-all" }}>{getToken(qrCreneau)}</p>
            </div>
            <div style={{ background: "#FAEEDA", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center", border: "1px solid #E8C97A" }}>
              <span style={{ fontSize: "16px" }}>⏰</span>
              <p style={{ fontSize: "12px", color: "#633806", margin: 0 }}>Valide ±15 min — Usage unique</p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => { navigator.clipboard?.writeText(getToken(qrCreneau)); setMessage("✅ Token copié !"); setTimeout(() => setMessage(""), 2000); setShowQR(false); }} style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "600" }}>📋 Copier token</button>
              <button onClick={() => setShowQR(false)} style={{ flex: 1, padding: "11px", background: bg3, color: txt, border: `1px solid ${brd}`, borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL NOUVEAU CRÉNEAU ===== */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: bg2, borderRadius: "20px", padding: "1.75rem", width: "480px", border: `1px solid ${brd}`, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: txt }}>➕ Nouveau créneau</h3>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: txt2 }}>Remplissez les informations du créneau</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: bg3, border: `1px solid ${brd}`, width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", color: txt2, fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              {[
                { label: "Matière", key: "id_matiere", options: matieres.map(m => ({ val: m.id, label: m.libelle })) },
                { label: "Enseignant", key: "id_enseignant", options: enseignants.map(e => ({ val: e.id, label: `${e.prenom} ${e.nom}` })) },
                { label: "Salle", key: "id_salle", options: salles.map(s => ({ val: s.id, label: s.code })) },
                { label: "Jour", key: "jour", options: JOURS.map(j => ({ val: j, label: j })) },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: "11px", color: txt2, display: "block", marginBottom: "5px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{field.label}</label>
                  <select value={form[field.key]} onChange={e => setForm({...form, [field.key]: e.target.value})} style={selectStyle}>
                    <option value="">Sélectionner...</option>
                    {field.options.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label style={{ fontSize: "11px", color: txt2, display: "block", marginBottom: "5px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Heure début</label>
                <select value={form.heure_debut} onChange={e => setForm({...form, heure_debut: e.target.value})} style={selectStyle}>
                  <option value="07:30">07:30</option>
                  <option value="10:00">10:00</option>
                  <option value="14:00">14:00</option>
                  <option value="16:00">16:00</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: txt2, display: "block", marginBottom: "5px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Heure fin</label>
                <select value={form.heure_fin} onChange={e => setForm({...form, heure_fin: e.target.value})} style={selectStyle}>
                  <option value="09:30">09:30</option>
                  <option value="12:00">12:00</option>
                  <option value="16:00">16:00</option>
                  <option value="18:00">18:00</option>
                </select>
              </div>
            </div>
            <div style={{ background: "#FAEEDA", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center", border: "1px solid #E8C97A" }}>
              <span style={{ fontSize: "16px" }}>⚠️</span>
              <p style={{ fontSize: "12px", color: "#633806", margin: 0 }}>Les conflits d'horaires seront détectés automatiquement.</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleCreerCreneau} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(15,110,86,0.3)" }}>✅ Créer le créneau</button>
              <button onClick={() => setShowModal(false)} style={{ padding: "12px 20px", background: bg3, color: txt, border: `1px solid ${brd}`, borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
