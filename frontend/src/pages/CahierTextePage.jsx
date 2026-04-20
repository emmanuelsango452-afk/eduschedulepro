import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import SignaturePad from "signature_pad";

const API = "http://localhost/eduschedulepro/backend/api";

export default function CahierTextePage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [cahiers, setCahiers]         = useState([]);
  const [selected, setSelected]       = useState(null);
  const [dark, setDark]               = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading]         = useState(true);
  const [onglet, setOnglet]           = useState("detail");
  const [filtre, setFiltre]           = useState("tous");
  const [search, setSearch]           = useState("");
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

  useEffect(() => {
    axios.get(`${API}/cahiers.php`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.succes) setCahiers(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (onglet === "signer" && sigDelRef.current && sigEnsRef.current) {
      sigDelPad.current = new SignaturePad(sigDelRef.current, { penColor: "#0F6E56" });
      sigEnsPad.current = new SignaturePad(sigEnsRef.current, { penColor: "#0F6E56" });
    }
  }, [onglet, selected]);

  const getStatut = (statut) => {
    const cfg = {
      brouillon:     { bg: "#F1EFE8", color: "#5F5E5A", label: "Brouillon",       icon: "📄" },
      signe_delegue: { bg: "#FAEEDA", color: "#633806", label: "Signé délégué",   icon: "✍️" },
      cloture:       { bg: "#E1F5EE", color: "#085041", label: "Clôturé",          icon: "✅" },
    };
    return cfg[statut] || cfg.brouillon;
  };

  const cahiersFiltres = cahiers.filter(c => {
    const matchFiltre = filtre === "tous" || c.statut === filtre;
    const matchSearch = !search ||
      c.matiere?.toLowerCase().includes(search.toLowerCase()) ||
      c.classe?.toLowerCase().includes(search.toLowerCase()) ||
      c.enseignant?.toLowerCase().includes(search.toLowerCase());
    return matchFiltre && matchSearch;
  });

  const stats = {
    total:    cahiers.length,
    brouillon: cahiers.filter(c => c.statut === "brouillon").length,
    signe:    cahiers.filter(c => c.statut === "signe_delegue").length,
    cloture:  cahiers.filter(c => c.statut === "cloture").length,
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
      <div style={{
        width: sidebarOpen ? "220px" : "60px", background: "#04342C",
        transition: "width 0.3s", display: "flex", flexDirection: "column",
        flexShrink: 0, overflow: "hidden"
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

      {/* Contenu */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <div style={{
          background: bg2, padding: "10px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `0.5px solid ${brd}`
        }}>
          <div>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: "500", color: txt }}>Cahiers de texte</p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>{cahiers.length} cahier(s) enregistré(s)</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={() => setDark(!dark)} style={{
              width: "36px", height: "36px", background: bg3, borderRadius: "8px",
              border: `0.5px solid ${brd}`, cursor: "pointer", fontSize: "16px"
            }}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>

        {/* Stats rapides */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px", padding: "1rem 1.25rem 0",
        }}>
          {[
            { label: "Total",          val: stats.total,     color: "#0F6E56", bg: "#E1F5EE", icon: "📚" },
            { label: "Brouillons",     val: stats.brouillon, color: "#5F5E5A", bg: "#F1EFE8", icon: "📄" },
            { label: "Signés délégué", val: stats.signe,     color: "#633806", bg: "#FAEEDA", icon: "✍️" },
            { label: "Clôturés",       val: stats.cloture,   color: "#085041", bg: "#E1F5EE", icon: "✅" },
          ].map((s, i) => (
            <div key={i} onClick={() => setFiltre(["tous", "brouillon", "signe_delegue", "cloture"][i])} style={{
              background: bg2, borderRadius: "10px", border: `0.5px solid ${filtre === ["tous","brouillon","signe_delegue","cloture"][i] ? s.color : brd}`,
              padding: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px",
              transition: "border 0.2s"
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
          <div style={{
            width: "320px", background: bg2, borderRadius: "12px",
            border: `0.5px solid ${brd}`, display: "flex", flexDirection: "column", flexShrink: 0
          }}>
            {/* Recherche */}
            <div style={{ padding: "12px", borderBottom: `0.5px solid ${brd}` }}>
              <input
                type="text" placeholder="🔍 Rechercher..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box", padding: "8px 12px",
                  borderRadius: "8px", border: `0.5px solid ${brd}`,
                  background: bg3, color: txt, fontSize: "12px"
                }}
              />
            </div>

            {/* Liste des cahiers */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              {loading ? (
                <p style={{ color: txt2, fontSize: "13px", textAlign: "center", padding: "2rem" }}>Chargement...</p>
              ) : cahiersFiltres.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <p style={{ fontSize: "32px" }}>📝</p>
                  <p style={{ color: txt2, fontSize: "13px" }}>Aucun cahier trouvé</p>
                </div>
              ) : (
                cahiersFiltres.map((c, i) => {
                  const s = getStatut(c.statut);
                  return (
                    <div key={i} onClick={() => { setSelected(c); setOnglet("detail"); }} style={{
                      background: selected?.id === c.id ? bg3 : "transparent",
                      borderRadius: "10px",
                      border: `0.5px solid ${selected?.id === c.id ? "#0F6E56" : "transparent"}`,
                      padding: "12px", marginBottom: "4px", cursor: "pointer",
                      borderLeft: `3px solid ${selected?.id === c.id ? "#0F6E56" : "transparent"}`,
                      transition: "all 0.2s"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>
                          {c.matiere || "Matière inconnue"}
                        </p>
                        <span style={{ fontSize: "10px", background: s.bg, color: s.color, padding: "2px 7px", borderRadius: "20px", fontWeight: "500" }}>
                          {s.icon} {s.label}
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", color: txt2, margin: "0 0 3px" }}>{c.classe}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>{c.enseignant?.split(" ").slice(-1)[0]}</p>
                        <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>
                          {c.date_creation ? new Date(c.date_creation).toLocaleDateString("fr-FR") : ""}
                        </p>
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
                {/* Header cahier */}
                <div style={{ padding: "16px 20px", borderBottom: `0.5px solid ${brd}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: "500", color: txt, margin: "0 0 3px" }}>{selected.matiere}</p>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: txt2 }}>{selected.classe}</span>
                      <span style={{ color: brd }}>•</span>
                      <span style={{ fontSize: "12px", color: txt2 }}>{selected.enseignant}</span>
                      <span style={{ color: brd }}>•</span>
                      <span style={{
                        fontSize: "11px",
                        background: getStatut(selected.statut).bg,
                        color: getStatut(selected.statut).color,
                        padding: "2px 8px", borderRadius: "20px", fontWeight: "500"
                      }}>
                        {getStatut(selected.statut).icon} {getStatut(selected.statut).label}
                      </span>
                    </div>
                  </div>
                  <button style={{
                    padding: "6px 14px", background: "#E1F5EE", color: "#085041",
                    border: "0.5px solid #9FE1CB", borderRadius: "8px",
                    fontSize: "12px", cursor: "pointer"
                  }}>📄 Exporter PDF</button>
                </div>

                {/* Onglets */}
                <div style={{ display: "flex", gap: "0", borderBottom: `0.5px solid ${brd}` }}>
                  {[
                    { id: "detail",  label: "📄 Contenu" },
                    { id: "signer",  label: "✍️ Signatures" },
                    { id: "travaux", label: "📚 Travaux" },
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

                {/* Contenu onglet */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>

                  {onglet === "detail" && (
                    <div>
                      {/* Infos séance */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
                        {[
                          { label: "Date",       val: selected.date_creation ? new Date(selected.date_creation).toLocaleDateString("fr-FR") : "—", icon: "📅" },
                          { label: "Heure fin",  val: selected.heure_fin_reelle || "En cours", icon: "⏰" },
                          { label: "Avancement", val: selected.niveau_avancement || "—", icon: "📊" },
                        ].map(item => (
                          <div key={item.label} style={{ background: bg3, borderRadius: "10px", padding: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
                            <span style={{ fontSize: "20px" }}>{item.icon}</span>
                            <div>
                              <p style={{ fontSize: "11px", color: txt2, margin: "0 0 3px" }}>{item.label}</p>
                              <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>{item.val}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Titre cours */}
                      <div style={{ background: bg3, borderRadius: "10px", padding: "16px", marginBottom: "12px", borderLeft: "3px solid #0F6E56" }}>
                        <p style={{ fontSize: "12px", color: txt2, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Titre du cours</p>
                        <p style={{ fontSize: "15px", fontWeight: "500", color: txt, margin: 0 }}>
                          {selected.titre_cours || "Non renseigné"}
                        </p>
                      </div>

                      {/* Points vus */}
                      <div style={{ background: bg2, borderRadius: "10px", border: `0.5px solid ${brd}`, padding: "16px", marginBottom: "12px" }}>
                        <p style={{ fontSize: "12px", color: txt2, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Points vus dans le cours</p>
                        {selected.contenu_json?.points ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {selected.contenu_json.points.map((point, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0F6E56", flexShrink: 0 }}/>
                                <p style={{ fontSize: "13px", color: txt, margin: 0 }}>{point}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: "13px", color: txt2, margin: 0 }}>Non renseigné</p>
                        )}
                      </div>

                      {/* Barre progression */}
                      <div style={{ background: bg2, borderRadius: "10px", border: `0.5px solid ${brd}`, padding: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                          <p style={{ fontSize: "12px", color: txt2, margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Avancement programme</p>
                          <p style={{ fontSize: "13px", color: "#0F6E56", margin: 0, fontWeight: "500" }}>
                            {selected.niveau_avancement || "Non renseigné"}
                          </p>
                        </div>
                        <div style={{ height: "8px", background: bg3, borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{
                            height: "100%",
                            width: selected.niveau_avancement?.includes("40%") ? "40%" :
                                   selected.niveau_avancement?.includes("25%") ? "25%" :
                                   selected.niveau_avancement?.includes("50%") ? "50%" : "30%",
                            background: "linear-gradient(90deg, #0F6E56, #1D9E75)",
                            borderRadius: "4px", transition: "width 1s ease"
                          }}/>
                        </div>
                      </div>
                    </div>
                  )}

                  {onglet === "signer" && (
                    <div>
                      <div style={{ background: bg3, borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{ fontSize: "20px" }}>ℹ️</span>
                        <p style={{ fontSize: "13px", color: txt2, margin: 0 }}>
                          Dessinez votre signature dans le cadre ci-dessous puis cliquez sur Valider.
                        </p>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        {/* Sig délégué */}
                        <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>✍️</div>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>Délégué</p>
                              <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>Signature requise</p>
                            </div>
                          </div>
                          <canvas ref={sigDelRef} width={300} height={130} style={{
                            border: `1.5px dashed ${brd}`, borderRadius: "8px",
                            background: bg3, width: "100%", touchAction: "none", cursor: "crosshair"
                          }}/>
                          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                            <button onClick={() => sigDelPad.current?.clear()} style={{
                              flex: 1, padding: "8px", background: bg3, color: txt2,
                              border: `0.5px solid ${brd}`, borderRadius: "8px", fontSize: "12px", cursor: "pointer"
                            }}>🗑️ Effacer</button>
                            <button style={{
                              flex: 1, padding: "8px", background: "#0F6E56", color: "#fff",
                              border: "none", borderRadius: "8px", fontSize: "12px",
                              cursor: "pointer", fontWeight: "500"
                            }}>✅ Valider</button>
                          </div>
                        </div>

                        {/* Sig enseignant */}
                        <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>✍️</div>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>Enseignant</p>
                              <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>Signature requise</p>
                            </div>
                          </div>
                          <canvas ref={sigEnsRef} width={300} height={130} style={{
                            border: `1.5px dashed ${brd}`, borderRadius: "8px",
                            background: bg3, width: "100%", touchAction: "none", cursor: "crosshair"
                          }}/>
                          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                            <button onClick={() => sigEnsPad.current?.clear()} style={{
                              flex: 1, padding: "8px", background: bg3, color: txt2,
                              border: `0.5px solid ${brd}`, borderRadius: "8px", fontSize: "12px", cursor: "pointer"
                            }}>🗑️ Effacer</button>
                            <button style={{
                              flex: 1, padding: "8px", background: "#534AB7", color: "#fff",
                              border: "none", borderRadius: "8px", fontSize: "12px",
                              cursor: "pointer", fontWeight: "500"
                            }}>✅ Valider</button>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button style={{
                          flex: 1, padding: "12px", background: "#0F6E56", color: "#fff",
                          border: "none", borderRadius: "10px", fontSize: "14px",
                          fontWeight: "500", cursor: "pointer"
                        }}>✅ Clôturer la séance</button>
                        <button style={{
                          padding: "12px 20px", background: "#FCEBEB", color: "#791F1F",
                          border: "0.5px solid #F09595", borderRadius: "10px",
                          fontSize: "14px", cursor: "pointer"
                        }}>⚠️ Signaler incident</button>
                      </div>
                    </div>
                  )}

                  {onglet === "travaux" && (
                    <div>
                      <div style={{ background: bg3, borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: 0 }}>Travaux demandés</p>
                        <button style={{
                          padding: "6px 14px", background: "#0F6E56", color: "#fff",
                          border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer"
                        }}>+ Ajouter</button>
                      </div>
                      <div style={{ textAlign: "center", padding: "3rem" }}>
                        <p style={{ fontSize: "32px" }}>📚</p>
                        <p style={{ color: txt2, fontSize: "13px" }}>Aucun travail demandé pour ce cahier</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}