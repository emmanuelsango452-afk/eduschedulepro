import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = "http://localhost/eduschedulepro/backend/api";
const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const HEURES = ["07:30", "10:00", "14:00", "16:00"];
const COULEURS = {
  "Réseaux Informatiques":        { bg: "#E1F5EE", border: "#0F6E56", txt: "#085041" },
  "Programmation Orientée Objet": { bg: "#EEEDFE", border: "#534AB7", txt: "#3C3489" },
  "Développement Web":            { bg: "#FAEEDA", border: "#BA7517", txt: "#633806" },
  "Bases de Données Avancées":    { bg: "#E6F1FB", border: "#185FA5", txt: "#0C447C" },
  "Systèmes d exploitation":      { bg: "#FAECE7", border: "#993C1D", txt: "#712B13" },
};

const getDatesOfWeek = (mondayDate) => {
  const monday = new Date(mondayDate);
  const dates = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const formatDateShort = (date) =>
  date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

export default function DashboardEtudiantPage() {
  const { utilisateur, token, deconnecter } = useAuth();
  const navigate = useNavigate();
  const [plannings, setPlannings]         = useState([]);
  const [classes, setClasses]             = useState([]);
  const [joursFeries, setJoursFeries]     = useState([]);
  const [classeId, setClasseId]           = useState("");
  const [dark, setDark]                   = useState(false);
  const [loading, setLoading]             = useState(true);
  const [vue, setVue]                     = useState("semaine");
  const [jourSelec, setJourSelec]         = useState(JOURS[0]);
  const [creneauSelec, setCreneauSelec]   = useState(null);
  const [isPublic, setIsPublic]           = useState(false);
  const [semaineDebut, setSemaineDebut]   = useState(() => {
    const today = new Date();
    const day = today.getDay() || 7;
    today.setDate(today.getDate() - day + 1);
    return today.toISOString().slice(0, 10);
  });

  const bg     = dark ? "#0d1117" : "#f0faf6";
  const bg2    = dark ? "#161b22" : "#ffffff";
  const bg3    = dark ? "#21262d" : "#e8f5ee";
  const txt    = dark ? "#e6edf3" : "#04342C";
  const txt2   = dark ? "#8b949e" : "#5F5E5A";
  const brd    = dark ? "rgba(255,255,255,0.08)" : "rgba(4,52,44,0.08)";
  const shadow = dark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 12px rgba(4,52,44,0.06)";

  // Chargement classes
  useEffect(() => {
    axios.get(`${API}/classes.php`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.data.succes && res.data.data.length > 0) {
          setClasses(res.data.data);
          setClasseId(res.data.data[0].id);
        }
      }).catch(console.error);
  }, [token]);

  // Chargement emploi du temps
  useEffect(() => {
    if (!classeId) return;
    setLoading(true);
    axios.get(`${API}/emploi_temps.php?id_classe=${classeId}&semaine=${semaineDebut}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.succes) {
        const data = res.data.data || [];
        const statut = res.data.statut_publication || (data.length > 0 ? data[0].statut_publication : null);
        setIsPublic(statut === "publie");
        setPlannings(statut === "publie" ? data : []);
      } else {
        setPlannings([]); setIsPublic(false);
      }
    }).catch(() => { setPlannings([]); setIsPublic(false); })
    .finally(() => setLoading(false));
  }, [classeId, token, semaineDebut]);

  // ===== CHARGEMENT JOURS FÉRIÉS =====
  useEffect(() => {
    axios.get(`${API}/jours_feries.php?semaine=${semaineDebut}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.succes) setJoursFeries(res.data.data);
      else setJoursFeries([]);
    }).catch(() => setJoursFeries([]));
  }, [token, semaineDebut]);

  const datesSemaine = useMemo(() => getDatesOfWeek(semaineDebut), [semaineDebut]);

  // Obtenir jour férié pour un index de jour
  const getJourFerie = (jourIndex) => {
    const date = new Date(semaineDebut);
    date.setDate(date.getDate() + jourIndex);
    const dateStr = date.toISOString().slice(0, 10);
    return joursFeries.find(jf => jf.date === dateStr) || null;
  };

  const getCreneaux = (jour, heure) => {
    const crs = [];
    plannings.forEach(p => {
      if (!p.creneaux) return;
      p.creneaux.forEach(cr => {
        if (cr && cr.jour === jour && cr.heure_debut?.slice(0, 5) === heure) crs.push(cr);
      });
    });
    return crs;
  };

  const getTousCreneaux = () => {
    const all = [];
    plannings.forEach(p => { if (p.creneaux) p.creneaux.forEach(cr => { if (cr) all.push(cr); }); });
    return all;
  };

  const getCouleur = (matiere) => COULEURS[matiere] || { bg: "#F1EFE8", border: "#888780", txt: "#5F5E5A" };

  const semainePrecedente = useCallback(() => {
    const d = new Date(semaineDebut); d.setDate(d.getDate() - 7);
    setSemaineDebut(d.toISOString().slice(0, 10));
  }, [semaineDebut]);

  const semaineSuivante = useCallback(() => {
    const d = new Date(semaineDebut); d.setDate(d.getDate() + 7);
    setSemaineDebut(d.toISOString().slice(0, 10));
  }, [semaineDebut]);

  const retourAujourdhui = useCallback(() => {
    const today = new Date();
    const day = today.getDay() || 7;
    today.setDate(today.getDate() - day + 1);
    setSemaineDebut(today.toISOString().slice(0, 10));
  }, []);

  const debutSemaine = new Date(semaineDebut);
  const finSemaine   = new Date(debutSemaine);
  finSemaine.setDate(debutSemaine.getDate() + 5);
  const plageSemaine = `${debutSemaine.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} — ${finSemaine.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;
  const hasCreneaux  = getTousCreneaux().length > 0;

  const joursFeriesSemaine = JOURS.map((_, i) => getJourFerie(i));
  const nbFeriesSemaine    = joursFeriesSemaine.filter(Boolean).length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg, fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ===== SIDEBAR ===== */}
      <div style={{ width: "240px", background: "linear-gradient(180deg, #04342C 0%, #062E26 100%)", display: "flex", flexDirection: "column", flexShrink: 0, boxShadow: "2px 0 20px rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(29,158,117,0.4)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#E1F5EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p style={{ color: "#E1F5EE", fontWeight: "700", fontSize: "15px", margin: 0 }}>EduTrack Pro</p>
            <p style={{ color: "#5DCAA5", fontSize: "10px", margin: 0 }}>Gestion pédagogique</p>
          </div>
        </div>

        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ background: "rgba(29,158,117,0.15)", border: "1px solid rgba(29,158,117,0.3)", color: "#5DCAA5", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "600", textAlign: "center", letterSpacing: "0.5px" }}>
            🎓 ÉTUDIANT — Lecture seule
          </div>
        </div>

        <div style={{ flex: 1, padding: "12px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(29,158,117,0.25), rgba(15,110,86,0.15))", border: "1px solid rgba(29,158,117,0.3)" }}>
            <span style={{ fontSize: "17px" }}>📅</span>
            <span style={{ color: "#E1F5EE", fontSize: "13px", fontWeight: "600" }}>Emploi du temps</span>
            <div style={{ marginLeft: "auto", width: "4px", height: "16px", background: "#1D9E75", borderRadius: "2px" }}/>
          </div>
        </div>

        <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.05)", padding: "10px 12px", borderRadius: "10px", marginBottom: "10px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px", fontWeight: "700", flexShrink: 0 }}>
              {utilisateur?.email?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ color: "#E1F5EE", fontSize: "12px", margin: 0, fontWeight: "600" }}>Étudiant</p>
              <p style={{ color: "#9FE1CB", fontSize: "10px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{utilisateur?.email}</p>
            </div>
          </div>
          <button onClick={() => { deconnecter(); navigate("/login"); }} style={{ width: "100%", padding: "8px", background: "#FCEBEB", color: "#791F1F", border: "1px solid #F09595", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* ===== MAIN ===== */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* TOPBAR */}
        <div style={{ background: bg2, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${brd}`, boxShadow: shadow, flexWrap: "wrap", gap: "10px" }}>
          <div>
            <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: txt }}>📅 Mon emploi du temps</p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              {nbFeriesSemaine > 0 && <span style={{ marginLeft: "8px", background: "#FCEBEB", color: "#791F1F", fontSize: "11px", padding: "2px 8px", borderRadius: "20px", fontWeight: "600" }}>🎉 {nbFeriesSemaine} jour(s) férié(s)</span>}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select value={classeId} onChange={e => setClasseId(e.target.value)} style={{ padding: "7px 12px", borderRadius: "8px", fontSize: "12px", border: `1px solid ${brd}`, background: bg3, color: txt, fontWeight: "500" }}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
            </select>
            <div style={{ display: "flex", background: bg3, borderRadius: "8px", overflow: "hidden", border: `1px solid ${brd}` }}>
              {[{ val: "semaine", label: "📅 Semaine" }, { val: "journee", label: "📆 Journée" }, { val: "liste", label: "📋 Liste" }].map(v => (
                <button key={v.val} onClick={() => setVue(v.val)} style={{ padding: "7px 12px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: "500", background: vue === v.val ? "#0F6E56" : "transparent", color: vue === v.val ? "#fff" : txt2 }}>{v.label}</button>
              ))}
            </div>
            <button onClick={() => setDark(!dark)} style={{ width: "38px", height: "38px", background: bg3, borderRadius: "10px", border: `1px solid ${brd}`, cursor: "pointer", fontSize: "17px" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* BANDEAU STATUT */}
        <div style={{ padding: "10px 24px", background: isPublic ? "#E1F5EE" : "#FCEBEB", borderBottom: `1px solid ${brd}`, display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px" }}>{isPublic ? "📢" : "🔒"}</span>
          <div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: isPublic ? "#085041" : "#791F1F" }}>
              {isPublic ? "Planning publié — Emploi du temps disponible" : "Aucun emploi du temps publié pour cette semaine"}
            </p>
            {!isPublic && <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#A32D2D" }}>Contactez votre administrateur ou consultez plus tard</p>}
          </div>
        </div>

        {/* BANDEAU JOURS FÉRIÉS */}
        {nbFeriesSemaine > 0 && (
          <div style={{ padding: "8px 24px", background: "#FFF3CD", borderBottom: "1px solid #FFD700", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "16px" }}>🎉</span>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#856404" }}>Jours fériés cette semaine :</span>
            {joursFeriesSemaine.filter(Boolean).map((jf, i) => (
              <span key={i} style={{ fontSize: "11px", background: "#FCEBEB", color: "#791F1F", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>
                {jf.type === "ferie" ? "🏖️" : "🎊"} {new Date(jf.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} — {jf.libelle}
              </span>
            ))}
          </div>
        )}

        {/* NAVIGATION SEMAINE */}
        <div style={{ padding: "10px 24px", background: bg3, borderBottom: `1px solid ${brd}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>📅</span>
            <p style={{ fontSize: "13px", color: txt, margin: 0, fontWeight: "600" }}>Semaine du {plageSemaine}</p>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={semainePrecedente} style={{ padding: "7px 12px", borderRadius: "8px", border: `1px solid ${brd}`, background: bg2, color: txt, cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>◀ Précédente</button>
            <button onClick={retourAujourdhui} style={{ padding: "7px 12px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600", boxShadow: "0 2px 8px rgba(15,110,86,0.3)" }}>📅 Aujourd'hui</button>
            <button onClick={semaineSuivante} style={{ padding: "7px 12px", borderRadius: "8px", border: `1px solid ${brd}`, background: bg2, color: txt, cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>Suivante ▶</button>
          </div>
        </div>

        {/* CONTENU */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem" }}>
              <p style={{ fontSize: "48px", margin: "0 0 16px" }}>⏳</p>
              <p style={{ color: txt2, fontSize: "14px" }}>Chargement de l'emploi du temps...</p>
            </div>
          ) : !isPublic ? (
            <div style={{ textAlign: "center", padding: "4rem", background: bg2, borderRadius: "16px", border: `1px solid ${brd}`, boxShadow: shadow }}>
              <p style={{ fontSize: "64px", margin: "0 0 20px" }}>🔒</p>
              <h3 style={{ color: txt, margin: "0 0 10px", fontSize: "18px", fontWeight: "700" }}>Emploi du temps non disponible</h3>
              <p style={{ color: txt2, fontSize: "14px", margin: "0 0 8px" }}>L'administrateur n'a pas encore publié l'emploi du temps.</p>
              <p style={{ color: txt2, fontSize: "13px" }}>Revenez plus tard ou contactez votre administration.</p>
            </div>
          ) : !hasCreneaux ? (
            <div style={{ textAlign: "center", padding: "4rem", background: bg2, borderRadius: "16px", border: `1px solid ${brd}`, boxShadow: shadow }}>
              <p style={{ fontSize: "64px", margin: "0 0 20px" }}>📭</p>
              <h3 style={{ color: txt, margin: "0 0 10px", fontSize: "18px", fontWeight: "700" }}>Aucun cours programmé</h3>
              <p style={{ color: txt2, fontSize: "14px" }}>Aucun créneau n'a été programmé pour cette semaine.</p>
            </div>
          ) : (
            <div>
              {/* VUE SEMAINE */}
              {vue === "semaine" && (
                <div style={{ overflowX: "auto" }}>
                  <div style={{ minWidth: "900px" }}>
                    {/* En-têtes jours */}
                    <div style={{ display: "grid", gridTemplateColumns: "80px repeat(6, 1fr)", gap: "6px", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "11px", color: txt2, fontWeight: "500" }}>Horaire</span>
                      </div>
                      {JOURS.map((jour, i) => {
                        const dateJour   = datesSemaine[i];
                        const estAujourd = dateJour && dateJour.toDateString() === new Date().toDateString();
                        const jourFerie  = getJourFerie(i);
                        return (
                          <div key={jour} style={{
                            background: jourFerie ? `linear-gradient(135deg, ${jourFerie.couleur}CC, ${jourFerie.couleur})` : estAujourd ? "linear-gradient(135deg, #1D9E75, #0F6E56)" : dark ? "#1e2a26" : "#085041",
                            color: "#E1F5EE", padding: "12px 6px", textAlign: "center",
                            borderRadius: "10px", fontSize: "12px", fontWeight: "600",
                            boxShadow: jourFerie ? `0 4px 12px ${jourFerie.couleur}66` : estAujourd ? "0 4px 12px rgba(29,158,117,0.4)" : "none",
                            border: estAujourd && !jourFerie ? "2px solid #1D9E75" : "2px solid transparent"
                          }}>
                            <div>{jour}</div>
                            <div style={{ fontSize: "11px", opacity: 0.9, marginTop: "3px", fontWeight: "400" }}>
                              {dateJour ? formatDateShort(dateJour) : ""}
                            </div>
                            {jourFerie && (
                              <div style={{ fontSize: "9px", marginTop: "3px", background: "rgba(255,255,255,0.25)", borderRadius: "4px", padding: "2px 6px", fontWeight: "700" }}>
                                🎉 {jourFerie.libelle}
                              </div>
                            )}
                            {estAujourd && !jourFerie && (
                              <div style={{ fontSize: "9px", marginTop: "3px", background: "rgba(255,255,255,0.2)", borderRadius: "4px", padding: "1px 6px" }}>Aujourd'hui</div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Lignes horaires */}
                    {HEURES.map((heure, index) => (
                      <div key={heure} style={{ display: "grid", gridTemplateColumns: "80px repeat(6, 1fr)", gap: "6px", marginBottom: "6px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: bg2, borderRadius: "8px", border: `1px solid ${brd}`, padding: "8px 4px" }}>
                          <span style={{ fontSize: "12px", color: txt, fontWeight: "700" }}>{heure}</span>
                          <span style={{ fontSize: "9px", color: txt2, marginTop: "2px" }}>–</span>
                          <span style={{ fontSize: "12px", color: txt2 }}>{["09:30", "12:00", "16:00", "18:00"][index]}</span>
                        </div>
                        {JOURS.map((jour, i) => {
                          const crs = getCreneaux(jour, heure);
                          const jourFerie = getJourFerie(i);
                          return (
                            <div key={jour} style={{
                              background: jourFerie ? `${jourFerie.couleur}10` : bg2,
                              borderRadius: "10px",
                              border: jourFerie ? `1px solid ${jourFerie.couleur}40` : `1px solid ${brd}`,
                              minHeight: "100px", padding: "4px"
                            }}>
                              {jourFerie && crs.length === 0 && (
                                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "92px", gap: "4px" }}>
                                  <span style={{ fontSize: "20px" }}>🎉</span>
                                  <span style={{ fontSize: "9px", color: jourFerie.couleur, fontWeight: "700", textAlign: "center" }}>{jourFerie.libelle}</span>
                                </div>
                              )}
                              {!jourFerie && crs.length === 0 && (
                                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "92px" }}>
                                  <span style={{ fontSize: "10px", color: brd }}>—</span>
                                </div>
                              )}
                              {crs.map((cr, idx) => {
                                const c = getCouleur(cr.matiere);
                                return (
                                  <div key={idx} onClick={() => setCreneauSelec(cr)} style={{ background: c.bg, borderLeft: `4px solid ${c.border}`, borderRadius: "6px", padding: "8px 10px", cursor: "pointer", height: "calc(100% - 8px)" }}>
                                    <p style={{ fontSize: "11px", fontWeight: "700", color: c.txt, margin: "0 0 4px", lineHeight: 1.2 }}>{cr.matiere?.split(" ").slice(0, 2).join(" ")}</p>
                                    <p style={{ fontSize: "10px", color: c.txt, margin: "0 0 6px", opacity: 0.8 }}>{cr.enseignant?.split(" ").slice(-1)[0]}</p>
                                    <span style={{ fontSize: "9px", background: c.border, color: "#fff", padding: "2px 6px", borderRadius: "6px", fontWeight: "600" }}>🏛️ {cr.salle}</span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
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
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "12px" }}>🎉</span>
                        <span style={{ fontSize: "11px", color: txt2 }}>Jour férié</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VUE JOURNÉE */}
              {vue === "journee" && (
                <div>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                    {JOURS.map((jour, i) => {
                      const jourFerie = getJourFerie(i);
                      return (
                        <button key={jour} onClick={() => setJourSelec(jour)} style={{
                          padding: "9px 16px", borderRadius: "10px",
                          border: `1px solid ${jourSelec === jour ? "#0F6E56" : jourFerie ? jourFerie.couleur : brd}`,
                          cursor: "pointer", fontSize: "12px",
                          fontWeight: jourSelec === jour ? "600" : "400",
                          background: jourSelec === jour ? "linear-gradient(135deg, #1D9E75, #0F6E56)" : jourFerie ? `${jourFerie.couleur}15` : bg2,
                          color: jourSelec === jour ? "#fff" : jourFerie ? jourFerie.couleur : txt,
                        }}>
                          <div>{jour} {jourFerie ? "🎉" : ""}</div>
                          <div style={{ fontSize: "10px", opacity: 0.8 }}>{datesSemaine[i] ? formatDateShort(datesSemaine[i]) : ""}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bandeau jour férié */}
                  {(() => {
                    const idx = JOURS.indexOf(jourSelec);
                    const jf  = getJourFerie(idx);
                    if (!jf) return null;
                    return (
                      <div style={{ background: `${jf.couleur}15`, border: `1px solid ${jf.couleur}`, borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
                        <span style={{ fontSize: "24px" }}>🎉</span>
                        <div>
                          <p style={{ fontSize: "14px", fontWeight: "700", color: jf.couleur, margin: "0 0 4px" }}>{jf.libelle}</p>
                          <p style={{ fontSize: "12px", color: txt2, margin: 0 }}>
                            {jf.type === "ferie" ? "Jour férié — " : "Événement spécial — "}
                            {new Date(jf.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  <div style={{ background: bg2, borderRadius: "14px", border: `1px solid ${brd}`, overflow: "hidden", boxShadow: shadow }}>
                    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${brd}`, background: bg3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontSize: "14px", fontWeight: "700", color: txt, margin: 0 }}>📆 {jourSelec}</p>
                      <span style={{ fontSize: "12px", background: bg2, color: txt2, padding: "4px 10px", borderRadius: "20px", border: `1px solid ${brd}` }}>
                        {getTousCreneaux().filter(cr => cr.jour === jourSelec).length} créneau(x)
                      </span>
                    </div>
                    {getTousCreneaux().filter(cr => cr.jour === jourSelec).length === 0 ? (
                      <div style={{ textAlign: "center", padding: "3rem" }}>
                        <p style={{ fontSize: "40px", margin: "0 0 12px" }}>📭</p>
                        <p style={{ color: txt2, fontSize: "13px" }}>Aucun cours ce jour</p>
                      </div>
                    ) : (
                      getTousCreneaux().filter(cr => cr.jour === jourSelec).map((cr, idx) => {
                        const c = getCouleur(cr.matiere);
                        return (
                          <div key={idx} onClick={() => setCreneauSelec(cr)} style={{ display: "flex", gap: "16px", alignItems: "stretch", padding: "16px 20px", borderBottom: `1px solid ${brd}`, cursor: "pointer" }}>
                            <div style={{ minWidth: "90px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                              <p style={{ fontSize: "15px", fontWeight: "700", color: txt, margin: "0 0 4px" }}>{cr.heure_debut?.slice(0, 5)}</p>
                              <div style={{ height: "30px", width: "2px", background: `linear-gradient(180deg, ${c.border}, transparent)`, margin: "0 auto" }}/>
                              <p style={{ fontSize: "12px", color: txt2, margin: "4px 0 0" }}>{cr.heure_fin?.slice(0, 5)}</p>
                            </div>
                            <div style={{ flex: 1, background: c.bg, borderRadius: "12px", borderLeft: `4px solid ${c.border}`, padding: "14px 18px" }}>
                              <p style={{ fontSize: "15px", fontWeight: "700", color: c.txt, margin: "0 0 8px" }}>{cr.matiere}</p>
                              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "12px", color: c.txt }}>👨‍🏫 {cr.enseignant}</span>
                                <span style={{ fontSize: "12px", color: c.txt }}>🏛️ Salle {cr.salle}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* VUE LISTE */}
              {vue === "liste" && (
                <div>
                  {JOURS.map((jour, i) => {
                    const crs = getTousCreneaux().filter(cr => cr.jour === jour);
                    const jourFerie = getJourFerie(i);
                    if (crs.length === 0 && !jourFerie) return null;
                    return (
                      <div key={jour} style={{ marginBottom: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                          <p style={{ fontSize: "12px", fontWeight: "700", color: jourFerie ? jourFerie.couleur : txt2, margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
                            {jour} {datesSemaine[i] ? `— ${formatDateShort(datesSemaine[i])}` : ""} {jourFerie ? "🎉" : ""}
                          </p>
                          <div style={{ flex: 1, height: "1px", background: jourFerie ? jourFerie.couleur : brd }}/>
                          <span style={{ fontSize: "11px", color: txt2 }}>{crs.length} cours</span>
                        </div>
                        {jourFerie && (
                          <div style={{ background: `${jourFerie.couleur}15`, border: `1px solid ${jourFerie.couleur}40`, borderRadius: "8px", padding: "8px 14px", marginBottom: "8px", fontSize: "12px", color: jourFerie.couleur, fontWeight: "600" }}>
                            🎉 {jourFerie.libelle} — {jourFerie.type === "ferie" ? "Jour férié" : "Événement spécial"}
                          </div>
                        )}
                        {crs.map((cr, idx) => {
                          const c = getCouleur(cr.matiere);
                          return (
                            <div key={idx} onClick={() => setCreneauSelec(cr)} style={{ background: bg2, borderRadius: "12px", border: `1px solid ${brd}`, padding: "14px 18px", display: "flex", alignItems: "center", gap: "16px", cursor: "pointer", marginBottom: "8px", borderLeft: `5px solid ${c.border}`, boxShadow: shadow }}>
                              <div style={{ minWidth: "70px", background: c.bg, padding: "8px", borderRadius: "8px", textAlign: "center" }}>
                                <p style={{ fontSize: "13px", fontWeight: "700", color: c.txt, margin: 0 }}>{cr.heure_debut?.slice(0, 5)}</p>
                                <p style={{ fontSize: "11px", color: c.txt, margin: 0, opacity: 0.7 }}>{cr.heure_fin?.slice(0, 5)}</p>
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: "13px", fontWeight: "700", color: c.border, margin: "0 0 4px" }}>{cr.matiere}</p>
                                <div style={{ display: "flex", gap: "12px" }}>
                                  <span style={{ fontSize: "11px", color: txt2 }}>👨‍🏫 {cr.enseignant}</span>
                                  <span style={{ fontSize: "11px", color: txt2 }}>🏛️ {cr.salle}</span>
                                </div>
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

      {/* ===== MODAL DÉTAIL ===== */}
      {creneauSelec && (
        <div onClick={() => setCreneauSelec(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: bg2, borderRadius: "20px", padding: "1.75rem", width: "380px", border: `1px solid ${brd}`, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
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
                    ].map(item => (
                      <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: `1px solid ${brd}` }}>
                        <span style={{ fontSize: "16px" }}>{item.icon}</span>
                        <span style={{ fontSize: "12px", color: txt2, minWidth: "80px" }}>{item.label}</span>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: txt, flex: 1, textAlign: "right" }}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setCreneauSelec(null)} style={{ width: "100%", padding: "12px", background: bg3, color: txt, border: `1px solid ${brd}`, borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}>
                    Fermer
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
