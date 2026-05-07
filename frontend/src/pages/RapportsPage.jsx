import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = "http://192.168.200.92/eduschedulepro/backend/api";

export default function RapportsPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [dark, setDark]               = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading]         = useState("");
  const [message, setMessage]         = useState("");

  // Données réelles
  const [pointages, setPointages]     = useState([]);
  const [cahiers, setCahiers]         = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [plannings, setPlannings]     = useState([]);

  const bg   = dark ? "#0d1117" : "#f0faf6";
  const bg2  = dark ? "#161b22" : "#ffffff";
  const bg3  = dark ? "#21262d" : "#e1f5ee";
  const txt  = dark ? "#e6edf3" : "#04342C";
  const txt2 = dark ? "#8b949e" : "#5F5E5A";
  const brd  = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  useEffect(() => {
    axios.get(`${API}/pointages.php`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.data.succes) setPointages(res.data.data); });
    axios.get(`${API}/cahiers.php`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.data.succes) setCahiers(res.data.data); });
    axios.get(`${API}/enseignants.php`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.data.succes) setEnseignants(res.data.data); });
    axios.get(`${API}/emploi_temps.php`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.data.succes) setPlannings(res.data.data); });
  }, [token]);

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };

  // ---- Export CSV générique ----
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

  // ---- Export PDF générique ----
  const exportPDF = (titre, colonnes, lignes) => {
    if (!lignes.length) { showMsg("⚠️ Aucune donnée à exporter !"); return; }
    const contenu = `
      <html>
      <head>
        <title>${titre}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #04342C; font-size: 18px; margin-bottom: 5px; }
          p.date { color: #5F5E5A; font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #04342C; color: white; padding: 8px 10px; text-align: left; }
          td { padding: 7px 10px; border-bottom: 1px solid #e0e0e0; }
          tr:nth-child(even) { background: #f5f5f5; }
          .footer { margin-top: 20px; font-size: 11px; color: #5F5E5A; text-align: center; }
        </style>
      </head>
      <body>
        <h1>${titre}</h1>
        <p class="date">Généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")} — EduTrack Pro ISGE</p>
        <table>
          <thead><tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr></thead>
          <tbody>${lignes.map(l => `<tr>${l.map(c => `<td>${c || "—"}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
        <p class="footer">EduTrack Pro © 2025-2026 — Institut Supérieur de Génie Électrique (ISGE)</p>
      </body>
      </html>
    `;
    const fenetre = window.open("", "_blank");
    fenetre.document.write(contenu);
    fenetre.document.close();
    fenetre.print();
    showMsg("✅ Export PDF réussi !");
  };

  // ---- Handlers par rapport ----
  const handlers = {
    // Rapport présence
    presencePDF: () => {
      exportPDF(
        "📊 Rapport de Présence",
        ["Matière", "Classe", "Enseignant", "Heure pointage", "Statut"],
        pointages.map(p => [p.matiere, p.classe, p.enseignant, p.heure_pointage_reelle?.slice(0,16), p.statut])
      );
    },
    presenceExcel: () => {
      exportCSV(pointages.map(p => ({
        "Matière":         p.matiere || "",
        "Classe":          p.classe || "",
        "Enseignant":      p.enseignant || "",
        "Heure pointage":  p.heure_pointage_reelle?.slice(0,16) || "",
        "Statut":          p.statut || "",
      })), "rapport_presence.csv");
    },

    // Rapport cahiers
    cahiersPDF: () => {
      exportPDF(
        "📝 Rapport des Cahiers de Texte",
        ["Matière", "Classe", "Enseignant", "Date", "Statut"],
        cahiers.map(c => [c.matiere, c.classe, c.enseignant, c.date_creation?.slice(0,10), c.statut])
      );
    },
    cahiersExcel: () => {
      exportCSV(cahiers.map(c => ({
        "Matière":    c.matiere || "",
        "Classe":     c.classe || "",
        "Enseignant": c.enseignant || "",
        "Date":       c.date_creation?.slice(0,10) || "",
        "Statut":     c.statut || "",
      })), "rapport_cahiers.csv");
    },

    // Rapport vacations
    vacationsPDF: () => {
      exportPDF(
        "💰 Rapport des Vacations",
        ["Enseignant", "Spécialité", "Statut", "Taux horaire"],
        enseignants.filter(e => e.statut === "vacataire").map(e => [
          `${e.prenom} ${e.nom}`, e.specialite, e.statut,
          `${parseFloat(e.taux_horaire || 0).toLocaleString("fr-FR")} F`
        ])
      );
    },
    vacationsExcel: () => {
      exportCSV(enseignants.filter(e => e.statut === "vacataire").map(e => ({
        "Nom":          e.nom || "",
        "Prénom":       e.prenom || "",
        "Spécialité":   e.specialite || "",
        "Taux horaire": e.taux_horaire || 0,
      })), "rapport_vacations.csv");
    },

    // Rapport emploi du temps
    emploiPDF: () => {
      const creneaux = [];
      plannings.forEach(p => { if (p.creneaux) p.creneaux.forEach(cr => { if (cr) creneaux.push({...cr, classe: p.classe_libelle}); }); });
      exportPDF(
        "📅 Rapport Emploi du Temps",
        ["Classe", "Jour", "Début", "Fin", "Matière", "Enseignant", "Salle"],
        creneaux.map(cr => [cr.classe, cr.jour, cr.heure_debut?.slice(0,5), cr.heure_fin?.slice(0,5), cr.matiere, cr.enseignant, cr.salle])
      );
    },
    emploiExcel: () => {
      const creneaux = [];
      plannings.forEach(p => { if (p.creneaux) p.creneaux.forEach(cr => { if (cr) creneaux.push({...cr, classe: p.classe_libelle}); }); });
      exportCSV(creneaux.map(cr => ({
        "Classe":     cr.classe || "",
        "Jour":       cr.jour || "",
        "Début":      cr.heure_debut?.slice(0,5) || "",
        "Fin":        cr.heure_fin?.slice(0,5) || "",
        "Matière":    cr.matiere || "",
        "Enseignant": cr.enseignant || "",
        "Salle":      cr.salle || "",
      })), "rapport_emploi_temps.csv");
    },

    // Rapport avancement
    avancementPDF: () => {
      exportPDF(
        "📈 Rapport d'Avancement",
        ["Matière", "Classe", "Enseignant", "Titre cours", "Niveau avancement", "Date"],
        cahiers.filter(c => c.statut === "cloture").map(c => [
          c.matiere, c.classe, c.enseignant, c.titre_cours, c.niveau_avancement, c.date_creation?.slice(0,10)
        ])
      );
    },
    avancementExcel: () => {
      exportCSV(cahiers.filter(c => c.statut === "cloture").map(c => ({
        "Matière":           c.matiere || "",
        "Classe":            c.classe || "",
        "Enseignant":        c.enseignant || "",
        "Titre cours":       c.titre_cours || "",
        "Niveau avancement": c.niveau_avancement || "",
        "Date":              c.date_creation?.slice(0,10) || "",
      })), "rapport_avancement.csv");
    },

    // Rapport audit
    auditPDF: () => {
      exportPDF(
        "🔍 Rapport d'Audit — Pointages",
        ["Matière", "Classe", "Enseignant", "Heure", "Statut", "IP"],
        pointages.map(p => [p.matiere, p.classe, p.enseignant, p.heure_pointage_reelle?.slice(0,16), p.statut, p.ip_source])
      );
    },
    auditExcel: () => {
      exportCSV(pointages.map(p => ({
        "Matière":    p.matiere || "",
        "Classe":     p.classe || "",
        "Enseignant": p.enseignant || "",
        "Heure":      p.heure_pointage_reelle?.slice(0,16) || "",
        "Statut":     p.statut || "",
        "IP source":  p.ip_source || "",
      })), "rapport_audit.csv");
    },
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
      icon: "📊", title: "Rapport de présence",
      desc: "Taux de présence par classe, par semaine et par enseignant",
      color: "#0F6E56", bg: "#E1F5EE",
      stats: [`${pointages.length} pointages`, `${pointages.filter(p => p.statut === "retard").length} retards`, `${pointages.filter(p => p.statut === "valide").length} validés`],
      onPDF: handlers.presencePDF, onExcel: handlers.presenceExcel
    },
    {
      icon: "📝", title: "Rapport des cahiers",
      desc: "État des cahiers de texte par matière et par classe",
      color: "#534AB7", bg: "#EEEDFE",
      stats: [`${cahiers.filter(c => c.statut === "cloture").length} clôturés`, `${cahiers.filter(c => c.statut === "brouillon").length} brouillons`, `${cahiers.filter(c => c.statut === "signe_delegue").length} signés`],
      onPDF: handlers.cahiersPDF, onExcel: handlers.cahiersExcel
    },
    {
      icon: "💰", title: "Rapport des vacations",
      desc: "Récapitulatif des paiements et heures par enseignant",
      color: "#BA7517", bg: "#FAEEDA",
      stats: [`${enseignants.filter(e => e.statut === "vacataire").length} vacataires`, `${enseignants.filter(e => e.statut === "permanent").length} permanents`, `${enseignants.length} total`],
      onPDF: handlers.vacationsPDF, onExcel: handlers.vacationsExcel
    },
    {
      icon: "📅", title: "Rapport emploi du temps",
      desc: "Vue globale des créneaux planifiés par classe",
      color: "#185FA5", bg: "#E6F1FB",
      stats: [`${plannings.length} plannings`, `${plannings.reduce((a, p) => a + (p.creneaux?.length || 0), 0)} créneaux`, `${enseignants.length} enseignants`],
      onPDF: handlers.emploiPDF, onExcel: handlers.emploiExcel
    },
    {
      icon: "📈", title: "Rapport d'avancement",
      desc: "Progression des programmes pédagogiques par matière",
      color: "#993C1D", bg: "#FAECE7",
      stats: [`${cahiers.filter(c => c.statut === "cloture").length} séances clôturées`, `${cahiers.length} total`, `${cahiers.filter(c => c.titre_cours).length} avec contenu`],
      onPDF: handlers.avancementPDF, onExcel: handlers.avancementExcel
    },
    {
      icon: "🔍", title: "Rapport d'audit",
      desc: "Journal complet des activités et connexions",
      color: "#5F5E5A", bg: "#F1EFE8",
      stats: [`${pointages.length} scans`, `${pointages.filter(p => p.statut === "retard").length} alertes retard`, `${pointages.filter(p => p.statut === "valide").length} validés`],
      onPDF: handlers.auditPDF, onExcel: handlers.auditExcel
    },
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
            <p style={{ margin: 0, fontSize: "15px", fontWeight: "500", color: txt }}>Rapports</p>
            <p style={{ margin: 0, fontSize: "12px", color: txt2 }}>Génération et export des rapports</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {message && (
              <div style={{ padding: "6px 12px", background: message.includes("✅") ? "#E1F5EE" : "#FAEEDA", color: message.includes("✅") ? "#085041" : "#633806", borderRadius: "8px", fontSize: "12px", fontWeight: "500" }}>
                {message}
              </div>
            )}
            <button onClick={() => setDark(!dark)} style={{ width: "36px", height: "36px", background: bg3, borderRadius: "8px", border: `0.5px solid ${brd}`, cursor: "pointer", fontSize: "16px" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
          <p style={{ fontSize: "13px", color: txt2, margin: "0 0 1.25rem" }}>
            Sélectionnez un rapport à générer et exporter en PDF ou Excel.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {rapports.map((r, i) => (
              <div key={i} style={{ background: bg2, borderRadius: "14px", border: `0.5px solid ${brd}`, overflow: "hidden" }}>
                <div style={{ background: r.bg, padding: "1.25rem" }}>
                  <p style={{ fontSize: "32px", margin: "0 0 10px" }}>{r.icon}</p>
                  <p style={{ fontSize: "14px", fontWeight: "500", color: r.color, margin: "0 0 6px" }}>{r.title}</p>
                  <p style={{ fontSize: "12px", color: r.color, margin: 0, opacity: 0.8 }}>{r.desc}</p>
                </div>
                <div style={{ padding: "12px 16px", borderBottom: `0.5px solid ${brd}` }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {r.stats.map((s, j) => (
                      <span key={j} style={{ fontSize: "11px", background: bg3, color: txt2, padding: "3px 8px", borderRadius: "20px" }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: "12px 16px", display: "flex", gap: "8px" }}>
                  <button onClick={r.onPDF} style={{
                    flex: 1, padding: "8px", background: r.bg, color: r.color,
                    border: `0.5px solid ${r.color}`, borderRadius: "8px",
                    fontSize: "12px", cursor: "pointer", fontWeight: "500"
                  }}>📄 PDF</button>
                  <button onClick={r.onExcel} style={{
                    flex: 1, padding: "8px", background: "#E1F5EE", color: "#085041",
                    border: "0.5px solid #9FE1CB", borderRadius: "8px",
                    fontSize: "12px", cursor: "pointer", fontWeight: "500"
                  }}>📊 Excel</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
