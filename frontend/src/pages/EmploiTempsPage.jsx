import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = "http://localhost/eduschedulepro/backend/api";

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const HEURES = ["08:00", "10:30", "14:00", "16:00"];
const COULEURS = {
  "Réseaux Informatiques":        { bg: "#E1F5EE", border: "#0F6E56", txt: "#085041" },
  "Programmation Orientée Objet": { bg: "#EEEDFE", border: "#534AB7", txt: "#3C3489" },
  "Développement Web":            { bg: "#FAEEDA", border: "#BA7517", txt: "#633806" },
  "Bases de Données Avancées":    { bg: "#E6F1FB", border: "#185FA5", txt: "#0C447C" },
  "Systèmes d exploitation":      { bg: "#FAECE7", border: "#993C1D", txt: "#712B13" },
};

export default function EmploiTempsPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [plannings, setPlannings]       = useState([]);
  const [classes, setClasses]           = useState([]);
  const [enseignants, setEnseignants]   = useState([]);
  const [matieres, setMatieres]         = useState([]);
  const [salles, setSalles]             = useState([]);
  const [classeId, setClasseId]         = useState("");
  const [dark, setDark]                 = useState(false);
  const [loading, setLoading]           = useState(true);
  const [vue, setVue]                   = useState("semaine");
  const [creneauSelec, setCreneauSelec] = useState(null);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [showQR, setShowQR]             = useState(false);
  const [qrCreneau, setQrCreneau]       = useState(null);
  const [filtreEns, setFiltreEns]       = useState("");
  const [filtreMatiere, setFiltreMatiere] = useState("");
  const [jourSelec, setJourSelec]       = useState(JOURS[0]);
  const [message, setMessage]           = useState("");
  const [form, setForm]                 = useState({
    id_classe: "", id_matiere: "", id_enseignant: "",
    id_salle: "", jour: "Lundi", heure_debut: "08:00", heure_fin: "10:00"
  });

  const bg   = dark ? "#0d1117" : "#f0faf6";
  const bg2  = dark ? "#161b22" : "#ffffff";
  const bg3  = dark ? "#21262d" : "#e1f5ee";
  const txt  = dark ? "#e6edf3" : "#04342C";
  const txt2 = dark ? "#8b949e" : "#5F5E5A";
  const brd  = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/classes.php`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/enseignants.php`, { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(([classesRes, ensRes]) => {
      if (classesRes.data.succes) {
        setClasses(classesRes.data.data);
        if (classesRes.data.data.length > 0) {
          setClasseId(classesRes.data.data[0].id);
          setForm(f => ({ ...f, id_classe: classesRes.data.data[0].id }));
        }
      }
      if (ensRes.data.succes) setEnseignants(ensRes.data.data);
    });

    // Matières et salles statiques pour démo
    // Charger matières depuis l'API
axios.get(`${API}/matieres.php`, {
  headers: { Authorization: `Bearer ${token}` }
}).then(res => {
  if (res.data.succes) setMatieres(res.data.data);
});

// Charger salles depuis l'API
axios.get(`${API}/salles.php`, {
  headers: { Authorization: `Bearer ${token}` }
}).then(res => {
  if (res.data.succes) setSalles(res.data.data);
});
    setSalles([
      { id: 1, code: "A01" },
      { id: 2, code: "A02" },
      { id: 3, code: "LABO-1" },
      { id: 4, code: "AMPHI-C" },
    ]);
  }, [token]);

  useEffect(() => {
    if (!classeId) return;
    setLoading(true);
    axios.get(`${API}/emploi_temps.php?id_classe=${classeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.succes) setPlannings(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [classeId, token]);

  const getCreneaux = (jour, heure) => {
    let creneaux = [];
    plannings.forEach(planning => {
      if (!planning.creneaux) return;
      planning.creneaux.forEach(cr => {
        if (cr && cr.jour === jour && cr.heure_debut?.slice(0,5) === heure) {
          if (filtreEns && cr.enseignant && !cr.enseignant.toLowerCase().includes(filtreEns.toLowerCase())) return;
          if (filtreMatiere && cr.matiere && !cr.matiere.toLowerCase().includes(filtreMatiere.toLowerCase())) return;
          creneaux.push(cr);
        }
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

  const getCreneauxJour = (jour) => {
    return getTousCreneaux().filter(cr => cr.jour === jour);
  };

  const getCouleur = (matiere) =>
    COULEURS[matiere] || { bg: "#F1EFE8", border: "#888780", txt: "#5F5E5A" };

  const handlePublier = async (id, statut) => {
    try {
      await axios.put(`${API}/emploi_temps.php?id=${id}&action=publier`,
        { statut: statut === "publie" ? "brouillon" : "publie" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(statut === "publie" ? "📴 Planning dépublié" : "📢 Planning publié !");
      setTimeout(() => setMessage(""), 3000);
      const res = await axios.get(`${API}/emploi_temps.php?id_classe=${classeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.succes) setPlannings(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

 const handleCreerCreneau = async () => {
  if (!form.id_matiere || !form.id_enseignant || !form.id_salle) {
    setMessage("⚠️ Veuillez remplir tous les champs !");
    setTimeout(() => setMessage(""), 3000);
    return;
  }

  try {
    const res = await axios.post(`${API}/emploi_temps.php`, {
      id_classe:    classeId,
      semaine_debut: "2026-04-14",
      creneaux: [{
        id_matiere:    form.id_matiere,
        id_enseignant: form.id_enseignant,
        id_salle:      form.id_salle,
        jour:          form.jour,
        heure_debut:   form.heure_debut + ":00",
        heure_fin:     form.heure_fin + ":00",
      }]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.data.succes) {
      setMessage("✅ Créneau créé avec succès !");
      setShowModal(false);
      setForm({
        id_classe: classeId, id_matiere: "", id_enseignant: "",
        id_salle: "", jour: "Lundi", heure_debut: "08:00", heure_fin: "10:00"
      });
      // Recharger les plannings
      const res2 = await axios.get(`${API}/emploi_temps.php?id_classe=${classeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res2.data.succes) setPlannings(res2.data.data);
    } else {
      setMessage(`❌ ${res.data.message}`);
    }
  } catch (err) {
    setMessage(`❌ ${err.response?.data?.message || "Erreur lors de la création"}`);
  } finally {
    setTimeout(() => setMessage(""), 4000);
  }
};

  const menuItems = [
    { label: "Tableau de bord", icon: "⊞",  route: "/dashboard/admin" },
    { label: "Emploi du temps", icon: "📅",  route: "/emploi-temps", active: true },
    { label: "Cahiers de texte",icon: "📝",  route: "/cahiers" },
    { label: "Vacations",       icon: "💰",  route: "/vacations" },
    { label: "Enseignants",     icon: "👨‍🏫", route: "/enseignants" },
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
        <div style={{ background: bg2, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `0.5px solid ${brd}`, flexWrap: "wrap", gap: "8px" }}>
          <div>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: "500", color: txt }}>Emploi du temps</p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>Semaine du 14 au 19 avril 2026</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            {message && (
              <div style={{ padding: "6px 12px", background: message.includes("✅") || message.includes("📢") ? "#E1F5EE" : "#FCEBEB", color: message.includes("✅") || message.includes("📢") ? "#085041" : "#791F1F", borderRadius: "8px", fontSize: "12px", fontWeight: "500" }}>
                {message}
              </div>
            )}

            {/* Filtre classe */}
            <select value={classeId} onChange={e => setClasseId(e.target.value)} style={{ padding: "6px 10px", borderRadius: "8px", fontSize: "12px", border: `0.5px solid ${brd}`, background: bg2, color: txt }}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
            </select>

            {/* Filtre enseignant */}
            <select value={filtreEns} onChange={e => setFiltreEns(e.target.value)} style={{ padding: "6px 10px", borderRadius: "8px", fontSize: "12px", border: `0.5px solid ${brd}`, background: bg2, color: txt }}>
              <option value="">Tous les enseignants</option>
              {enseignants.map(e => <option key={e.id} value={e.nom}>{e.prenom} {e.nom}</option>)}
            </select>

            {/* Filtre matière */}
            <select value={filtreMatiere} onChange={e => setFiltreMatiere(e.target.value)} style={{ padding: "6px 10px", borderRadius: "8px", fontSize: "12px", border: `0.5px solid ${brd}`, background: bg2, color: txt }}>
              <option value="">Toutes les matières</option>
              {matieres.map(m => <option key={m.id} value={m.libelle}>{m.libelle}</option>)}
            </select>

            {/* Vue */}
            <div style={{ display: "flex", background: bg3, borderRadius: "8px", overflow: "hidden" }}>
              {[
                { val: "semaine",   label: "📅 Semaine" },
                { val: "journee",   label: "📆 Journée" },
                { val: "liste",     label: "📋 Liste" },
              ].map(v => (
                <button key={v.val} onClick={() => setVue(v.val)} style={{
                  padding: "6px 12px", border: "none", cursor: "pointer", fontSize: "11px",
                  background: vue === v.val ? "#0F6E56" : "transparent",
                  color: vue === v.val ? "#fff" : txt2,
                  fontWeight: vue === v.val ? "500" : "400"
                }}>{v.label}</button>
              ))}
            </div>

            {/* Navigation semaines */}
            <div style={{ display: "flex", gap: "4px" }}>
              <button style={{ padding: "6px 10px", borderRadius: "6px", border: `0.5px solid ${brd}`, background: bg2, color: txt, cursor: "pointer", fontSize: "12px" }}>◀</button>
              <button style={{ padding: "6px 10px", borderRadius: "6px", border: "none", background: "#0F6E56", color: "#fff", cursor: "pointer", fontSize: "12px" }}>Aujourd'hui</button>
              <button style={{ padding: "6px 10px", borderRadius: "6px", border: `0.5px solid ${brd}`, background: bg2, color: txt, cursor: "pointer", fontSize: "12px" }}>▶</button>
            </div>

            <button onClick={() => setShowModal(true)} style={{ padding: "7px 14px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
              + Nouveau créneau
            </button>

            {/* Publier/Dépublier */}
            {plannings.length > 0 && (
              <button onClick={() => handlePublier(plannings[0].id, plannings[0].statut_publication)} style={{
                padding: "7px 14px",
                background: plannings[0].statut_publication === "publie" ? "#FCEBEB" : "#E1F5EE",
                color: plannings[0].statut_publication === "publie" ? "#791F1F" : "#085041",
                border: `0.5px solid ${plannings[0].statut_publication === "publie" ? "#F09595" : "#9FE1CB"}`,
                borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500"
              }}>
                {plannings[0].statut_publication === "publie" ? "📴 Dépublier" : "📢 Publier"}
              </button>
            )}

            <button style={{ padding: "7px 14px", background: "#EEEDFE", color: "#3C3489", border: "0.5px solid #CECBF6", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>
              📋 Dupliquer semaine
            </button>

            <button style={{ padding: "7px 14px", background: bg2, color: txt, border: `0.5px solid ${brd}`, borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>
              📄 Export PDF
            </button>

            <button onClick={() => setDark(!dark)} style={{ width: "36px", height: "36px", background: bg3, borderRadius: "8px", border: `0.5px solid ${brd}`, cursor: "pointer", fontSize: "16px" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Statut publication */}
        {plannings.length > 0 && (
          <div style={{
            padding: "8px 20px",
            background: plannings[0].statut_publication === "publie" ? "#E1F5EE" : "#FAEEDA",
            borderBottom: `0.5px solid ${brd}`,
            display: "flex", alignItems: "center", gap: "8px"
          }}>
            <span style={{ fontSize: "14px" }}>
              {plannings[0].statut_publication === "publie" ? "📢" : "📄"}
            </span>
            <span style={{ fontSize: "12px", fontWeight: "500", color: plannings[0].statut_publication === "publie" ? "#085041" : "#633806" }}>
              {plannings[0].statut_publication === "publie"
                ? "Planning publié — visible par les étudiants"
                : "Planning en brouillon — non visible par les étudiants"}
            </span>
          </div>
        )}

        {/* Contenu */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ fontSize: "24px" }}>⏳</p>
              <p style={{ color: txt2 }}>Chargement...</p>
            </div>
          ) : (

            /* VUE SEMAINE */
            vue === "semaine" ? (
              <div style={{ overflowX: "auto" }}>
                <div style={{ minWidth: "900px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "70px repeat(6, 1fr)", gap: "4px", marginBottom: "4px" }}>
                    <div/>
                    {JOURS.map((jour, i) => (
                      <div key={jour} style={{
                        background: i === new Date().getDay() - 1 ? "#1D9E75" : "#085041",
                        color: "#E1F5EE", padding: "10px 4px", textAlign: "center",
                        borderRadius: "8px", fontSize: "12px", fontWeight: "500"
                      }}>
                        <div>{jour}</div>
                        <div style={{ fontSize: "10px", opacity: 0.8, marginTop: "2px" }}>{14 + i} avr.</div>
                      </div>
                    ))}
                  </div>
                  {HEURES.map(heure => (
                    <div key={heure} style={{ display: "grid", gridTemplateColumns: "70px repeat(6, 1fr)", gap: "4px", marginBottom: "4px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: "11px", color: txt2, fontWeight: "500" }}>
                        <span>{heure}</span>
                        <span style={{ fontSize: "9px", opacity: 0.6 }}>2h</span>
                      </div>
                      {JOURS.map(jour => {
                        const crs = getCreneaux(jour, heure);
                        return (
                          <div key={jour} style={{ background: bg2, borderRadius: "8px", border: `0.5px solid ${brd}`, minHeight: "90px", padding: "3px" }}>
                            {crs.map((cr, i) => {
                              const c = getCouleur(cr.matiere);
                              return (
                                <div key={i} onClick={() => setCreneauSelec(cr)} style={{
                                  background: c.bg, borderLeft: `3px solid ${c.border}`,
                                  borderRadius: "4px", padding: "6px 8px",
                                  cursor: "pointer", height: "calc(100% - 6px)"
                                }}>
                                  <p style={{ fontSize: "11px", fontWeight: "500", color: c.txt, margin: "0 0 3px" }}>
                                    {cr.matiere?.split(" ").slice(0, 2).join(" ")}
                                  </p>
                                  <p style={{ fontSize: "10px", color: c.txt, margin: "0 0 4px", opacity: 0.8 }}>
                                    {cr.enseignant?.split(" ").slice(-1)[0]}
                                  </p>
                                  <span style={{ fontSize: "9px", background: c.border, color: "#fff", padding: "1px 5px", borderRadius: "8px" }}>
                                    {cr.salle}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {/* Légende */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px", padding: "12px", background: bg2, borderRadius: "8px", border: `0.5px solid ${brd}` }}>
                  <span style={{ fontSize: "11px", color: txt2, fontWeight: "500" }}>Légende :</span>
                  {Object.entries(COULEURS).map(([matiere, c]) => (
                    <div key={matiere} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: c.border }}/>
                      <span style={{ fontSize: "11px", color: txt2 }}>{matiere}</span>
                    </div>
                  ))}
                </div>
              </div>

            /* VUE JOURNEE */
            ) : vue === "journee" ? (
              <div>
                {/* Sélecteur de jour */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                  {JOURS.map((jour, i) => (
                    <button key={jour} onClick={() => setJourSelec(jour)} style={{
                      padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
                      background: jourSelec === jour ? "#0F6E56" : bg2,
                      color: jourSelec === jour ? "#fff" : txt,
                      fontSize: "12px", fontWeight: jourSelec === jour ? "500" : "400",
                      border: `0.5px solid ${jourSelec === jour ? "#0F6E56" : brd}`
                    }}>
                      {jour} {14 + i} avr.
                    </button>
                  ))}
                </div>

                {/* Créneaux du jour */}
                <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${brd}`, background: bg3 }}>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: txt, margin: 0 }}>
                      📆 {jourSelec} — {getCreneauxJour(jourSelec).length} créneau(x)
                    </p>
                  </div>
                  {getCreneauxJour(jourSelec).length === 0 ? (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                      <p style={{ fontSize: "32px" }}>📭</p>
                      <p style={{ color: txt2, fontSize: "13px" }}>Aucun créneau ce jour</p>
                    </div>
                  ) : (
                    getCreneauxJour(jourSelec).map((cr, i) => {
                      const c = getCouleur(cr.matiere);
                      return (
                        <div key={i} onClick={() => setCreneauSelec(cr)} style={{
                          display: "flex", gap: "16px", alignItems: "stretch",
                          padding: "16px", borderBottom: `0.5px solid ${brd}`, cursor: "pointer"
                        }}>
                          {/* Heure */}
                          <div style={{ minWidth: "80px", textAlign: "center" }}>
                            <p style={{ fontSize: "14px", fontWeight: "500", color: txt, margin: "0 0 4px" }}>
                              {cr.heure_debut?.slice(0,5)}
                            </p>
                            <div style={{ height: "40px", width: "2px", background: c.border, margin: "0 auto" }}/>
                            <p style={{ fontSize: "12px", color: txt2, margin: "4px 0 0" }}>
                              {cr.heure_fin?.slice(0,5)}
                            </p>
                          </div>
                          {/* Détail */}
                          <div style={{ flex: 1, background: c.bg, borderRadius: "10px", borderLeft: `4px solid ${c.border}`, padding: "12px 16px" }}>
                            <p style={{ fontSize: "14px", fontWeight: "500", color: c.txt, margin: "0 0 6px" }}>
                              {cr.matiere}
                            </p>
                            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "12px", color: c.txt }}>👨‍🏫 {cr.enseignant}</span>
                              <span style={{ fontSize: "12px", color: c.txt }}>🏛️ Salle {cr.salle}</span>
                            </div>
                          </div>
                          {/* Actions */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", justifyContent: "center" }}>
                            <button onClick={(e) => { e.stopPropagation(); setQrCreneau(cr); setShowQR(true); }} style={{
                              padding: "6px 12px", background: "#E1F5EE", color: "#085041",
                              border: "0.5px solid #9FE1CB", borderRadius: "6px",
                              fontSize: "11px", cursor: "pointer", fontWeight: "500"
                            }}>📱 QR-Code</button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            /* VUE LISTE */
            ) : (
              <div>
                {getTousCreneaux().length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem" }}>
                    <p style={{ fontSize: "32px" }}>📭</p>
                    <p style={{ color: txt2 }}>Aucun créneau trouvé</p>
                  </div>
                ) : (
                  JOURS.map(jour => {
                    const crs = getCreneauxJour(jour);
                    if (crs.length === 0) return null;
                    return (
                      <div key={jour} style={{ marginBottom: "16px" }}>
                        <p style={{ fontSize: "12px", fontWeight: "500", color: txt2, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {jour}
                        </p>
                        {crs.map((cr, i) => {
                          const c = getCouleur(cr.matiere);
                          return (
                            <div key={i} onClick={() => setCreneauSelec(cr)} style={{
                              background: bg2, borderRadius: "10px", border: `0.5px solid ${brd}`,
                              padding: "12px 16px", display: "flex", alignItems: "center",
                              gap: "16px", cursor: "pointer", marginBottom: "6px",
                              borderLeft: `4px solid ${c.border}`
                            }}>
                              <div style={{ minWidth: "60px" }}>
                                <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>{cr.heure_debut?.slice(0,5)}</p>
                                <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>{cr.heure_fin?.slice(0,5)}</p>
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: "13px", fontWeight: "500", color: c.border, margin: "0 0 2px" }}>{cr.matiere}</p>
                                <p style={{ fontSize: "12px", color: txt2, margin: 0 }}>{cr.enseignant}</p>
                              </div>
                              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <span style={{ fontSize: "11px", background: c.bg, color: c.txt, padding: "3px 8px", borderRadius: "20px" }}>{cr.salle}</span>
                                <button onClick={(e) => { e.stopPropagation(); setQrCreneau(cr); setShowQR(true); }} style={{
                                  padding: "5px 10px", background: "#E1F5EE", color: "#085041",
                                  border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer"
                                }}>📱 QR</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Modal détail créneau */}
      {creneauSelec && (
        <div onClick={() => setCreneauSelec(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: bg2, borderRadius: "16px", padding: "1.5rem",
            width: "380px", border: `0.5px solid ${brd}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", color: txt }}>Détail du créneau</h3>
              <button onClick={() => setCreneauSelec(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: txt2 }}>×</button>
            </div>
            {(() => {
              const c = getCouleur(creneauSelec.matiere);
              return (
                <div>
                  <div style={{ background: c.bg, borderRadius: "10px", padding: "12px", marginBottom: "16px" }}>
                    <p style={{ fontSize: "16px", fontWeight: "500", color: c.txt, margin: "0 0 4px" }}>{creneauSelec.matiere}</p>
                    <p style={{ fontSize: "13px", color: c.txt, margin: 0, opacity: 0.8 }}>{creneauSelec.jour}</p>
                  </div>
                  {[
                    { label: "Enseignant", val: creneauSelec.enseignant },
                    { label: "Salle",      val: creneauSelec.salle },
                    { label: "Début",      val: creneauSelec.heure_debut?.slice(0,5) },
                    { label: "Fin",        val: creneauSelec.heure_fin?.slice(0,5) },
                    { label: "Token QR",   val: creneauSelec.qr_expire ? "Généré ✓" : "Non généré" },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `0.5px solid ${brd}` }}>
                      <span style={{ fontSize: "13px", color: txt2 }}>{item.label}</span>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: txt }}>{item.val}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    <button onClick={() => { setQrCreneau(creneauSelec); setShowQR(true); setCreneauSelec(null); }} style={{
                      flex: 1, padding: "10px", background: "#0F6E56", color: "#fff",
                      border: "none", borderRadius: "8px", fontSize: "13px",
                      cursor: "pointer", fontWeight: "500"
                    }}>📱 Voir QR-Code</button>
                    <button onClick={() => {
  setForm({
    id_classe: classeId,
    id_matiere: creneauSelec.id_matiere || "",
    id_enseignant: creneauSelec.id_enseignant || "",
    id_salle: creneauSelec.id_salle || "",
    jour: creneauSelec.jour,
    heure_debut: creneauSelec.heure_debut?.slice(0,5) || "08:00",
    heure_fin: creneauSelec.heure_fin?.slice(0,5) || "10:00",
    id_creneau: creneauSelec.id
  });
  setCreneauSelec(null);
  setShowModal(true);
}} style={{
  flex: 1, padding: "10px", background: "#FAEEDA", color: "#633806",
  border: "0.5px solid #E8C97A", borderRadius: "8px",
  fontSize: "13px", cursor: "pointer", fontWeight: "500"
}}>✏️ Modifier</button>

<button onClick={async () => {
  if (!window.confirm("Supprimer ce créneau ?")) return;
  try {
    await axios.delete(`${API}/emploi_temps.php?id=${creneauSelec.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCreneauSelec(null);
    setMessage("✅ Créneau supprimé !");
    const res = await axios.get(`${API}/emploi_temps.php?id_classe=${classeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.data.succes) setPlannings(res.data.data);
    setTimeout(() => setMessage(""), 3000);
  } catch (err) {
    setMessage("❌ Erreur lors de la suppression");
  }
}} style={{
  flex: 1, padding: "10px", background: "#FCEBEB", color: "#791F1F",
  border: "0.5px solid #F09595", borderRadius: "8px",
  fontSize: "13px", cursor: "pointer", fontWeight: "500"
}}>🗑️ Supprimer</button>
                    <button onClick={() => setCreneauSelec(null)} style={{
                      flex: 1, padding: "10px", background: bg3, color: txt,
                      border: `0.5px solid ${brd}`, borderRadius: "8px", fontSize: "13px", cursor: "pointer"
                    }}>Fermer</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal QR-Code */}
      {showQR && qrCreneau && (
        <div onClick={() => setShowQR(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: bg2, borderRadius: "16px", padding: "2rem",
            width: "340px", textAlign: "center", border: `0.5px solid ${brd}`
          }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "16px", color: txt }}>QR-Code — Séance</h3>
            <p style={{ fontSize: "13px", color: txt2, margin: "0 0 20px" }}>
              {qrCreneau.matiere} — {qrCreneau.jour} {qrCreneau.heure_debut?.slice(0,5)}
            </p>
            {/* QR Code simulé avec SVG */}
            <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", display: "inline-block", marginBottom: "16px", border: "0.5px solid rgba(0,0,0,0.1)" }}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                {/* Coins QR */}
                <rect x="10" y="10" width="40" height="40" fill="none" stroke="#000" strokeWidth="4"/>
                <rect x="18" y="18" width="24" height="24" fill="#000"/>
                <rect x="110" y="10" width="40" height="40" fill="none" stroke="#000" strokeWidth="4"/>
                <rect x="118" y="18" width="24" height="24" fill="#000"/>
                <rect x="10" y="110" width="40" height="40" fill="none" stroke="#000" strokeWidth="4"/>
                <rect x="18" y="118" width="24" height="24" fill="#000"/>
                {/* Données QR */}
                {[20,30,40,50,60,70,80,90,100].map((x, i) =>
                  [60,70,80,90,100,110,120].map((y, j) =>
                    (i + j) % 3 === 0 ? <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" fill="#000"/> : null
                  )
                )}
                {[60,70,80,90,100].map((x, i) =>
                  [20,30,40].map((y, j) =>
                    (i + j) % 2 === 0 ? <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" fill="#000"/> : null
                  )
                )}
              </svg>
            </div>
            <div style={{ background: bg3, borderRadius: "8px", padding: "8px 12px", marginBottom: "16px" }}>
              <p style={{ fontSize: "11px", color: txt2, margin: "0 0 3px" }}>Token</p>
              <p style={{ fontSize: "11px", color: txt, margin: 0, fontFamily: "monospace", wordBreak: "break-all" }}>
                {qrCreneau.qr_token || "abc123def456..."}
              </p>
            </div>
            <div style={{ background: "#FAEEDA", borderRadius: "8px", padding: "8px 12px", marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
              <span>⏰</span>
              <p style={{ fontSize: "12px", color: "#633806", margin: 0 }}>
                Valide ±15 min autour de {qrCreneau.heure_debut?.slice(0,5)} — Usage unique
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ flex: 1, padding: "10px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}>
                🖨️ Imprimer
              </button>
              <button onClick={() => setShowQR(false)} style={{ flex: 1, padding: "10px", background: bg3, color: txt, border: `0.5px solid ${brd}`, borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouveau créneau */}
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
              <h3 style={{ margin: 0, fontSize: "16px", color: txt }}>➕ Nouveau créneau</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: txt2 }}>×</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Matière</label>
                <select value={form.id_matiere} onChange={e => setForm({...form, id_matiere: e.target.value})} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: bg3, color: txt, fontSize: "13px" }}>
                  <option value="">Sélectionner...</option>
                  {matieres.map(m => <option key={m.id} value={m.id}>{m.libelle}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Enseignant</label>
                <select value={form.id_enseignant} onChange={e => setForm({...form, id_enseignant: e.target.value})} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: bg3, color: txt, fontSize: "13px" }}>
                  <option value="">Sélectionner...</option>
                  {enseignants.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Salle</label>
                <select value={form.id_salle} onChange={e => setForm({...form, id_salle: e.target.value})} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: bg3, color: txt, fontSize: "13px" }}>
                  <option value="">Sélectionner...</option>
                  {salles.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Jour</label>
                <select value={form.jour} onChange={e => setForm({...form, jour: e.target.value})} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: bg3, color: txt, fontSize: "13px" }}>
                  {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Heure début</label>
                <input type="time" value={form.heure_debut} onChange={e => setForm({...form, heure_debut: e.target.value})} style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: bg3, color: txt, fontSize: "13px" }}/>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: txt2, display: "block", marginBottom: "5px" }}>Heure fin</label>
                <input type="time" value={form.heure_fin} onChange={e => setForm({...form, heure_fin: e.target.value})} style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: "8px", border: `0.5px solid ${brd}`, background: bg3, color: txt, fontSize: "13px" }}/>
              </div>
            </div>

            {/* Alerte conflit */}
            <div style={{ background: "#FAEEDA", borderRadius: "8px", padding: "8px 12px", marginBottom: "12px", display: "flex", gap: "8px" }}>
              <span>⚠️</span>
              <p style={{ fontSize: "12px", color: "#633806", margin: 0 }}>
                Les conflits (enseignant déjà occupé, salle prise) seront détectés automatiquement.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleCreerCreneau} style={{ flex: 1, padding: "11px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
                ✅ Créer le créneau
              </button>
              <button onClick={() => setShowModal(false)} style={{ padding: "11px 20px", background: bg3, color: txt, border: `0.5px solid ${brd}`, borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}