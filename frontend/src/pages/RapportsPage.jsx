import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = "http://localhost/eduschedulepro/backend/api";

export default function RapportsPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [dark, setDark]               = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage]         = useState("");
  const [pointages, setPointages]     = useState([]);
  const [cahiers, setCahiers]         = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [plannings, setPlannings]     = useState([]);

  const bg     = dark ? "#0d1117" : "#f0faf6";
  const bg2    = dark ? "#161b22" : "#ffffff";
  const bg3    = dark ? "#21262d" : "#e8f5ee";
  const txt    = dark ? "#e6edf3" : "#04342C";
  const txt2   = dark ? "#8b949e" : "#5F5E5A";
  const brd    = dark ? "rgba(255,255,255,0.08)" : "rgba(4,52,44,0.08)";
  const shadow = dark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 12px rgba(4,52,44,0.06)";

  useEffect(() => {
    axios.get(`${API}/pointages.php`,    { headers: { Authorization: `Bearer ${token}` } }).then(res => { if (res.data.succes) setPointages(res.data.data); });
    axios.get(`${API}/cahiers.php`,      { headers: { Authorization: `Bearer ${token}` } }).then(res => { if (res.data.succes) setCahiers(res.data.data); });
    axios.get(`${API}/enseignants.php`,  { headers: { Authorization: `Bearer ${token}` } }).then(res => { if (res.data.succes) setEnseignants(res.data.data); });
    axios.get(`${API}/emploi_temps.php`, { headers: { Authorization: `Bearer ${token}` } }).then(res => { if (res.data.succes) setPlannings(res.data.data); });
  }, [token]);

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };

  const exportCSV = (data, filename) => {
    if (!data.length) { showMsg("⚠️ Aucune donnée à exporter !"); return; }
    const entete = Object.keys(data[0]).join(";");
    const lignes = data.map(row => Object.values(row).map(v => `"${v}"`).join(";"));
    const csv    = [entete, ...lignes].join("\n");
    const blob   = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    showMsg("✅ Export Excel réussi !");
  };

  const exportPDF = (titre, colonnes, lignes) => {
    if (!lignes.length) { showMsg("⚠️ Aucune donnée à exporter !"); return; }
    const contenu = `
      <html><head><title>${titre}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #04342C; font-size: 18px; margin-bottom: 5px; }
        p.date { color: #5F5E5A; font-size: 12px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #04342C; color: white; padding: 8px 10px; text-align: left; }
        td { padding: 7px 10px; border-bottom: 1px solid #e0e0e0; }
        tr:nth-child(even) { background: #f5f5f5; }
        .footer { margin-top: 20px; font-size: 11px; color: #5F5E5A; text-align: center; }
      </style></head>
      <body>
        <h1>${titre}</h1>
        <p class="date">Généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")} — EduTrack Pro ISGE</p>
        <table>
          <thead><tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr></thead>
          <tbody>${lignes.map(l => `<tr>${l.map(c => `<td>${c || "—"}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
        <p class="footer">EduTrack Pro © 2025-2026 — Institut Supérieur de Génie Électrique (ISGE)</p>
      </body></html>
    `;
    const fenetre = window.open("", "_blank");
    fenetre.document.write(contenu);
    fenetre.document.close();
    fenetre.print();
    showMsg("✅ Export PDF réussi !");
  };

  const handlers = {
    presencePDF:    () => exportPDF("📊 Rapport de Présence", ["Matière","Classe","Enseignant","Heure pointage","Statut"], pointages.map(p => [p.matiere, p.classe, p.enseignant, p.heure_pointage_reelle?.slice(0,16), p.statut])),
    presenceExcel:  () => exportCSV(pointages.map(p => ({ "Matière": p.matiere||"", "Classe": p.classe||"", "Enseignant": p.enseignant||"", "Heure pointage": p.heure_pointage_reelle?.slice(0,16)||"", "Statut": p.statut||"" })), "rapport_presence.csv"),
    cahiersPDF:     () => exportPDF("📝 Rapport des Cahiers de Texte", ["Matière","Classe","Enseignant","Date","Statut"], cahiers.map(c => [c.matiere, c.classe, c.enseignant, c.date_creation?.slice(0,10), c.statut])),
    cahiersExcel:   () => exportCSV(cahiers.map(c => ({ "Matière": c.matiere||"", "Classe": c.classe||"", "Enseignant": c.enseignant||"", "Date": c.date_creation?.slice(0,10)||"", "Statut": c.statut||"" })), "rapport_cahiers.csv"),
    vacationsPDF:   () => exportPDF("💰 Rapport des Vacations", ["Enseignant","Spécialité","Statut","Taux horaire"], enseignants.filter(e => e.statut === "vacataire").map(e => [`${e.prenom} ${e.nom}`, e.specialite, e.statut, `${parseFloat(e.taux_horaire||0).toLocaleString("fr-FR")} F`])),
    vacationsExcel: () => exportCSV(enseignants.filter(e => e.statut === "vacataire").map(e => ({ "Nom": e.nom||"", "Prénom": e.prenom||"", "Spécialité": e.specialite||"", "Taux horaire": e.taux_horaire||0 })), "rapport_vacations.csv"),
    emploiPDF: () => {
      const crs = []; plannings.forEach(p => { if (p.creneaux) p.creneaux.forEach(cr => { if (cr) crs.push({...cr, classe: p.classe_libelle}); }); });
      exportPDF("📅 Rapport Emploi du Temps", ["Classe","Jour","Début","Fin","Matière","Enseignant","Salle"], crs.map(cr => [cr.classe, cr.jour, cr.heure_debut?.slice(0,5), cr.heure_fin?.slice(0,5), cr.matiere, cr.enseignant, cr.salle]));
    },
    emploiExcel: () => {
      const crs = []; plannings.forEach(p => { if (p.creneaux) p.creneaux.forEach(cr => { if (cr) crs.push({...cr, classe: p.classe_libelle}); }); });
      exportCSV(crs.map(cr => ({ "Classe": cr.classe||"", "Jour": cr.jour||"", "Début": cr.heure_debut?.slice(0,5)||"", "Fin": cr.heure_fin?.slice(0,5)||"", "Matière": cr.matiere||"", "Enseignant": cr.enseignant||"", "Salle": cr.salle||"" })), "rapport_emploi_temps.csv");
    },
    avancementPDF:   () => exportPDF("📈 Rapport d'Avancement", ["Matière","Classe","Enseignant","Titre cours","Niveau avancement","Date"], cahiers.filter(c => c.statut === "cloture").map(c => [c.matiere, c.classe, c.enseignant, c.titre_cours, c.niveau_avancement, c.date_creation?.slice(0,10)])),
    avancementExcel: () => exportCSV(cahiers.filter(c => c.statut === "cloture").map(c => ({ "Matière": c.matiere||"", "Classe": c.classe||"", "Enseignant": c.enseignant||"", "Titre cours": c.titre_cours||"", "Niveau avancement": c.niveau_avancement||"", "Date": c.date_creation?.slice(0,10)||"" })), "rapport_avancement.csv"),
    auditPDF:   () => exportPDF("🔍 Rapport d'Audit", ["Matière","Classe","Enseignant","Heure","Statut","IP"], pointages.map(p => [p.matiere, p.classe, p.enseignant, p.heure_pointage_reelle?.slice(0,16), p.statut, p.ip_source])),
    auditExcel: () => exportCSV(pointages.map(p => ({ "Matière": p.matiere||"", "Classe": p.classe||"", "Enseignant": p.enseignant||"", "Heure": p.heure_pointage_reelle?.slice(0,16)||"", "Statut": p.statut||"", "IP source": p.ip_source||"" })), "rapport_audit.csv"),
  };

  const menuItems = [
    { label: "Tableau de bord", icon: "⊞",  route: "/dashboard/admin" },
    { label: "Emploi du temps", icon: "📅",  route: "/emploi-temps" },
    { label: "Cahiers de texte",icon: "📝",  route: "/cahiers" },
    { label: "Vacations",       icon: "💰",  route: "/vacations" },
    { label: "Enseignants",     icon: "👨‍🏫", route: "/enseignants" },
    { label: "Rapports",        icon: "📊",  route: "/rapports", active: true },
  ];

  const rapports = [
    {
      icon: "📊", title: "Rapport de présence", desc: "Taux de présence par classe, par semaine et par enseignant",
      color: "#0F6E56", bg: "#E1F5EE", border: "#9FE1CB",
      stats: [`${pointages.length} pointages`, `${pointages.filter(p => p.statut === "retard").length} retards`, `${pointages.filter(p => p.statut === "valide").length} validés`],
      onPDF: handlers.presencePDF, onExcel: handlers.presenceExcel
    },
    {
      icon: "📝", title: "Rapport des cahiers", desc: "État des cahiers de texte par matière et par classe",
      color: "#534AB7", bg: "#EEEDFE", border: "#CECBF6",
      stats: [`${cahiers.filter(c => c.statut === "cloture").length} clôturés`, `${cahiers.filter(c => c.statut === "brouillon").length} brouillons`, `${cahiers.filter(c => c.statut === "signe_delegue").length} signés`],
      onPDF: handlers.cahiersPDF, onExcel: handlers.cahiersExcel
    },
    {
      icon: "💰", title: "Rapport des vacations", desc: "Récapitulatif des paiements et heures par enseignant",
      color: "#BA7517", bg: "#FAEEDA", border: "#E8C97A",
      stats: [`${enseignants.filter(e => e.statut === "vacataire").length} vacataires`, `${enseignants.filter(e => e.statut === "permanent").length} permanents`, `${enseignants.length} total`],
      onPDF: handlers.vacationsPDF, onExcel: handlers.vacationsExcel
    },
    {
      icon: "📅", title: "Rapport emploi du temps", desc: "Vue globale des créneaux planifiés par classe",
      color: "#185FA5", bg: "#E6F1FB", border: "#A8CBF0",
      stats: [`${plannings.length} plannings`, `${plannings.reduce((a, p) => a + (p.creneaux?.length || 0), 0)} créneaux`, `${enseignants.length} enseignants`],
      onPDF: handlers.emploiPDF, onExcel: handlers.emploiExcel
    },
    {
      icon: "📈", title: "Rapport d'avancement", desc: "Progression des programmes pédagogiques par matière",
      color: "#993C1D", bg: "#FAECE7", border: "#E8B89A",
      stats: [`${cahiers.filter(c => c.statut === "cloture").length} séances clôturées`, `${cahiers.length} total`, `${cahiers.filter(c => c.titre_cours).length} avec contenu`],
      onPDF: handlers.avancementPDF, onExcel: handlers.avancementExcel
    },
    {
      icon: "🔍", title: "Rapport d'audit", desc: "Journal complet des activités et connexions",
      color: "#5F5E5A", bg: "#F1EFE8", border: "#C8C5B8",
      stats: [`${pointages.length} scans`, `${pointages.filter(p => p.statut === "retard").length} alertes retard`, `${pointages.filter(p => p.statut === "valide").length} validés`],
      onPDF: handlers.auditPDF, onExcel: handlers.auditExcel
    },
  ];

  const totalRapports = rapports.length;
  const totalDonnees  = pointages.length + cahiers.length + enseignants.length;

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
            <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: txt }}>📊 Rapports</p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>Génération et export des rapports pédagogiques</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {message && (
              <div style={{ padding: "7px 14px", background: message.includes("✅") ? "#E1F5EE" : "#FAEEDA", color: message.includes("✅") ? "#085041" : "#633806", borderRadius: "8px", fontSize: "12px", fontWeight: "600", boxShadow: shadow }}>
                {message}
              </div>
            )}
            <button onClick={() => setDark(!dark)} style={{ width: "38px", height: "38px", background: bg3, borderRadius: "10px", border: `1px solid ${brd}`, cursor: "pointer", fontSize: "17px" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>

          {/* STATS RAPIDES */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "1.5rem" }}>
            {[
              { label: "Types de rapports",  val: totalRapports,  color: "#0F6E56", bg: "#E1F5EE", icon: "📊" },
              { label: "Données disponibles", val: totalDonnees,   color: "#534AB7", bg: "#EEEDFE", icon: "🗃️" },
              { label: "Enseignants",         val: enseignants.length, color: "#BA7517", bg: "#FAEEDA", icon: "👨‍🏫" },
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

          {/* INTRO */}
          <div style={{ background: bg3, borderRadius: "12px", padding: "14px 18px", marginBottom: "1.5rem", display: "flex", gap: "12px", alignItems: "center", border: `1px solid ${brd}` }}>
            <span style={{ fontSize: "20px" }}>💡</span>
            <p style={{ fontSize: "13px", color: txt2, margin: 0 }}>Sélectionnez un rapport ci-dessous et exportez-le en <strong>PDF</strong> pour impression ou en <strong>Excel</strong> pour analyse.</p>
          </div>

          {/* GRILLE RAPPORTS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {rapports.map((r, i) => (
              <div key={i} style={{ background: bg2, borderRadius: "16px", border: `1px solid ${brd}`, overflow: "hidden", boxShadow: shadow, transition: "transform 0.2s, box-shadow 0.2s" }}>
                {/* Header coloré */}
                <div style={{ background: r.bg, padding: "1.25rem", borderBottom: `1px solid ${r.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <span style={{ fontSize: "36px" }}>{r.icon}</span>
                    <div style={{ background: "rgba(255,255,255,0.5)", borderRadius: "6px", padding: "3px 8px", fontSize: "11px", color: r.color, fontWeight: "600" }}>
                      {r.stats[0]}
                    </div>
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: r.color, margin: "0 0 6px" }}>{r.title}</p>
                  <p style={{ fontSize: "12px", color: r.color, margin: 0, opacity: 0.8, lineHeight: 1.4 }}>{r.desc}</p>
                </div>

                {/* Stats */}
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${brd}` }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {r.stats.map((s, j) => (
                      <span key={j} style={{ fontSize: "11px", background: bg3, color: txt2, padding: "3px 10px", borderRadius: "20px", fontWeight: "500" }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Boutons export */}
                <div style={{ padding: "14px 16px", display: "flex", gap: "8px" }}>
                  <button onClick={r.onPDF} style={{
                    flex: 1, padding: "9px", background: r.bg, color: r.color,
                    border: `1px solid ${r.border}`, borderRadius: "8px",
                    fontSize: "12px", cursor: "pointer", fontWeight: "600",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "5px"
                  }}>
                    📄 PDF
                  </button>
                  <button onClick={r.onExcel} style={{
                    flex: 1, padding: "9px", background: "#E1F5EE", color: "#085041",
                    border: "1px solid #9FE1CB", borderRadius: "8px",
                    fontSize: "12px", cursor: "pointer", fontWeight: "600",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "5px"
                  }}>
                    📊 Excel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
