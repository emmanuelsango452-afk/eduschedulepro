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
  const [classeId, setClasseId]         = useState("");
  const [dark, setDark]                 = useState(false);
  const [loading, setLoading]           = useState(true);
  const [vue, setVue]                   = useState("semaine");
  const [creneauSelec, setCreneauSelec] = useState(null);
  const [sidebarOpen, setSidebarOpen]   = useState(true);

  const bg   = dark ? "#0d1117" : "#f0faf6";
  const bg2  = dark ? "#161b22" : "#ffffff";
  const bg3  = dark ? "#21262d" : "#e1f5ee";
  const txt  = dark ? "#e6edf3" : "#04342C";
  const txt2 = dark ? "#8b949e" : "#5F5E5A";
  const brd  = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  useEffect(() => {
    axios.get(`${API}/classes.php`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.succes) {
        setClasses(res.data.data);
        if (res.data.data.length > 0) setClasseId(res.data.data[0].id);
      }
    });
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
    const creneaux = [];
    plannings.forEach(planning => {
      if (!planning.creneaux) return;
      planning.creneaux.forEach(cr => {
        if (cr && cr.jour === jour && cr.heure_debut?.slice(0,5) === heure) {
          creneaux.push(cr);
        }
      });
    });
    return creneaux;
  };

  const getTousCreneaux = () => {
    const all = [];
    plannings.forEach(p => {
      if (p.creneaux) p.creneaux.forEach(cr => { if (cr) all.push(cr); });
    });
    return all;
  };

  const getCouleur = (matiere) =>
    COULEURS[matiere] || { bg: "#F1EFE8", border: "#888780", txt: "#5F5E5A" };

  const menuItems = [
    { label: "Tableau de bord", icon: "⊞", route: "/dashboard/admin" },
    { label: "Emploi du temps", icon: "📅", route: "/emploi-temps", active: true },
    { label: "Cahiers de texte", icon: "📝", route: "/cahiers" },
    { label: "Vacations",        icon: "💰", route: "/vacations" },
    { label: "Enseignants",      icon: "👨‍🏫", route: "/enseignants" },
    { label: "Rapports",         icon: "📊", route: "/rapports" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg, transition: "all 0.3s" }}>

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? "220px" : "60px",
        background: "#04342C", transition: "width 0.3s",
        display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden"
      }}>
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
        <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{
          padding: "16px", cursor: "pointer", textAlign: "center",
          borderTop: "0.5px solid rgba(255,255,255,0.1)", color: "#9FE1CB", fontSize: "18px"
        }}>{sidebarOpen ? "◀" : "▶"}</div>
      </div>

      {/* Contenu principal */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <div style={{
          background: bg2, padding: "10px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `0.5px solid ${brd}`
        }}>
          <div>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: "500", color: txt }}>Emploi du temps</p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>Semaine du 14 au 19 avril 2026</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Filtre classe */}
            <select value={classeId} onChange={e => setClasseId(e.target.value)} style={{
              padding: "6px 12px", borderRadius: "8px", fontSize: "12px",
              border: `0.5px solid ${brd}`, background: bg2, color: txt
            }}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
            </select>

            {/* Vue semaine / liste */}
            <div style={{ display: "flex", background: bg3, borderRadius: "8px", overflow: "hidden" }}>
              {["semaine", "liste"].map(v => (
                <button key={v} onClick={() => setVue(v)} style={{
                  padding: "6px 14px", border: "none", cursor: "pointer", fontSize: "12px",
                  background: vue === v ? "#0F6E56" : "transparent",
                  color: vue === v ? "#fff" : txt2, fontWeight: vue === v ? "500" : "400"
                }}>{v === "semaine" ? "📅 Semaine" : "📋 Liste"}</button>
              ))}
            </div>

            {/* Navigation semaines */}
            <div style={{ display: "flex", gap: "4px" }}>
              <button style={{ padding: "6px 10px", borderRadius: "6px", border: `0.5px solid ${brd}`, background: bg2, color: txt, cursor: "pointer", fontSize: "12px" }}>◀</button>
              <button style={{ padding: "6px 10px", borderRadius: "6px", border: "none", background: "#0F6E56", color: "#fff", cursor: "pointer", fontSize: "12px" }}>Aujourd'hui</button>
              <button style={{ padding: "6px 10px", borderRadius: "6px", border: `0.5px solid ${brd}`, background: bg2, color: txt, cursor: "pointer", fontSize: "12px" }}>▶</button>
            </div>

            <button style={{
              padding: "6px 14px", background: "#E1F5EE", color: "#085041",
              border: "0.5px solid #9FE1CB", borderRadius: "8px", fontSize: "12px", cursor: "pointer"
            }}>📄 Exporter PDF</button>

            <button onClick={() => setDark(!dark)} style={{
              width: "36px", height: "36px", background: bg3, borderRadius: "8px",
              border: `0.5px solid ${brd}`, cursor: "pointer", fontSize: "16px"
            }}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>

        {/* Contenu grille ou liste */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>⏳</div>
              <p style={{ color: txt2 }}>Chargement de l'emploi du temps...</p>
            </div>
          ) : vue === "semaine" ? (

            /* VUE SEMAINE */
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: "900px" }}>
                {/* En-tête */}
                <div style={{ display: "grid", gridTemplateColumns: "70px repeat(6, 1fr)", gap: "4px", marginBottom: "4px" }}>
                  <div/>
                  {JOURS.map((jour, i) => (
                    <div key={jour} style={{
                      background: i === new Date().getDay() - 1 ? "#1D9E75" : "#085041",
                      color: "#E1F5EE", padding: "10px 4px", textAlign: "center",
                      borderRadius: "8px", fontSize: "12px", fontWeight: "500"
                    }}>
                      <div>{jour}</div>
                      <div style={{ fontSize: "10px", opacity: 0.8, marginTop: "2px" }}>
                        {14 + i} avr.
                      </div>
                    </div>
                  ))}
                </div>

                {/* Créneaux */}
                {HEURES.map(heure => (
                  <div key={heure} style={{ display: "grid", gridTemplateColumns: "70px repeat(6, 1fr)", gap: "4px", marginBottom: "4px" }}>
                    <div style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      justifyContent: "center", fontSize: "11px", color: txt2, fontWeight: "500"
                    }}>
                      <span>{heure}</span>
                      <span style={{ fontSize: "9px", opacity: 0.6 }}>2h</span>
                    </div>
                    {JOURS.map(jour => {
                      const crs = getCreneaux(jour, heure);
                      return (
                        <div key={jour} style={{
                          background: bg2, borderRadius: "8px",
                          border: `0.5px solid ${brd}`, minHeight: "90px", padding: "3px"
                        }}>
                          {crs.map((cr, i) => {
                            const c = getCouleur(cr.matiere);
                            return (
                              <div key={i} onClick={() => setCreneauSelec(cr)} style={{
                                background: c.bg, borderLeft: `3px solid ${c.border}`,
                                borderRadius: "4px", padding: "6px 8px",
                                cursor: "pointer", height: "calc(100% - 6px)",
                                transition: "opacity 0.2s"
                              }}>
                                <p style={{ fontSize: "11px", fontWeight: "500", color: c.txt, margin: "0 0 3px" }}>
                                  {cr.matiere?.split(" ").slice(0, 2).join(" ")}
                                </p>
                                <p style={{ fontSize: "10px", color: c.txt, margin: "0 0 4px", opacity: 0.8 }}>
                                  {cr.enseignant?.split(" ").slice(-1)[0]}
                                </p>
                                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "9px", background: c.border, color: "#fff", padding: "1px 5px", borderRadius: "8px" }}>
                                    {cr.salle}
                                  </span>
                                </div>
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

          ) : (

            /* VUE LISTE */
            <div>
              {getTousCreneaux().length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: txt2 }}>
                  Aucun créneau trouvé pour cette classe.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {JOURS.map(jour => {
                    const creneauxJour = getTousCreneaux().filter(cr => cr.jour === jour);
                    if (creneauxJour.length === 0) return null;
                    return (
                      <div key={jour}>
                        <p style={{ fontSize: "12px", fontWeight: "500", color: txt2, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {jour}
                        </p>
                        {creneauxJour.map((cr, i) => {
                          const c = getCouleur(cr.matiere);
                          return (
                            <div key={i} onClick={() => setCreneauSelec(cr)} style={{
                              background: bg2, borderRadius: "10px",
                              border: `0.5px solid ${brd}`, padding: "12px 16px",
                              display: "flex", alignItems: "center", gap: "16px",
                              cursor: "pointer", marginBottom: "6px",
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
                              <div style={{ textAlign: "right" }}>
                                <span style={{ fontSize: "11px", background: c.bg, color: c.txt, padding: "3px 8px", borderRadius: "20px", fontWeight: "500" }}>
                                  {cr.salle}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal détail créneau */}
      {creneauSelec && (
        <div onClick={() => setCreneauSelec(null)} style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: bg2, borderRadius: "16px",
            padding: "1.5rem", width: "360px",
            border: `0.5px solid ${brd}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", color: txt }}>Détail du créneau</h3>
              <button onClick={() => setCreneauSelec(null)} style={{
                background: "none", border: "none", fontSize: "20px",
                cursor: "pointer", color: txt2
              }}>×</button>
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
                  ].map(item => (
                    <div key={item.label} style={{
                      display: "flex", justifyContent: "space-between",
                      padding: "8px 0", borderBottom: `0.5px solid ${brd}`
                    }}>
                      <span style={{ fontSize: "13px", color: txt2 }}>{item.label}</span>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: txt }}>{item.val}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    <button style={{
                      flex: 1, padding: "10px", background: "#0F6E56",
                      color: "#fff", border: "none", borderRadius: "8px",
                      fontSize: "13px", cursor: "pointer", fontWeight: "500"
                    }}>Voir QR-Code</button>
                    <button onClick={() => setCreneauSelec(null)} style={{
                      flex: 1, padding: "10px", background: bg3,
                      color: txt, border: `0.5px solid ${brd}`, borderRadius: "8px",
                      fontSize: "13px", cursor: "pointer"
                    }}>Fermer</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}