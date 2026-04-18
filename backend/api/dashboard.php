<?php
// ============================================================
//  EduTrack Pro — Endpoint Dashboard & Statistiques
//  Fichier : backend/api/dashboard.php
//  Routes :
//    GET /api/dashboard/stats?role=X&periode=Y → Statistiques
// ============================================================

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth_jwt.php';

$methode = $_SERVER['REQUEST_METHOD'];

if ($methode !== 'GET') {
    http_response_code(405);
    echo json_encode(["succes" => false, "message" => "Méthode non autorisée."]);
    exit();
}

$utilisateur = AuthJWT::proteger();
$db  = new Database();
$pdo = $db->connecter();

// Retourner les stats selon le rôle
switch ($utilisateur['role']) {
    case 'administrateur':
    case 'surveillant':
        statsAdmin($pdo);
        break;
    case 'enseignant':
        statsEnseignant($pdo, $utilisateur);
        break;
    case 'delegue':
        statsDelegue($pdo, $utilisateur);
        break;
    default:
        http_response_code(403);
        echo json_encode(["succes" => false, "message" => "Accès refusé."]);
}

// ============================================================
function statsAdmin($pdo) {
    $date_today = date('Y-m-d');

    // Séances du jour
    $stmt = $pdo->prepare("
        SELECT COUNT(*) FROM creneaux cr
        JOIN emploi_temps et ON et.id = cr.id_emploi_temps
        WHERE et.semaine_debut <= ? AND DATE_ADD(et.semaine_debut, INTERVAL 6 DAY) >= ?
    ");
    $stmt->execute([$date_today, $date_today]);
    $seances_jour = $stmt->fetchColumn();

    // Pointages du jour
    $stmt2 = $pdo->prepare("
        SELECT COUNT(*) FROM pointages
        WHERE DATE(heure_pointage_reelle) = ?
    ");
    $stmt2->execute([$date_today]);
    $pointages_jour = $stmt2->fetchColumn();

    // Retards du jour
    $stmt3 = $pdo->prepare("
        SELECT COUNT(*) FROM pointages
        WHERE DATE(heure_pointage_reelle) = ?
        AND statut = 'retard'
    ");
    $stmt3->execute([$date_today]);
    $retards = $stmt3->fetchColumn();

    // Cahiers non signés
    $stmt4 = $pdo->query("
        SELECT COUNT(*) FROM cahiers_texte
        WHERE statut = 'brouillon'
    ");
    $cahiers_non_signes = $stmt4->fetchColumn();

    // Vacations en attente
    $stmt5 = $pdo->query("
        SELECT COUNT(*) FROM vacations
        WHERE statut IN ('generee', 'signee_enseignant')
    ");
    $vacations_attente = $stmt5->fetchColumn();

    // Taux de présence semaine
    $taux_presence = $seances_jour > 0
        ? round(($pointages_jour / $seances_jour) * 100)
        : 0;

    // Séances du jour avec détails
    $stmt6 = $pdo->prepare("
        SELECT cr.jour, cr.heure_debut, cr.heure_fin,
               m.libelle AS matiere, c.libelle AS classe,
               CONCAT(e.prenom, ' ', e.nom) AS enseignant,
               CASE
                   WHEN p.statut = 'valide'  THEN 'pointee'
                   WHEN p.statut = 'retard'  THEN 'retard'
                   WHEN p.id IS NULL AND cr.heure_debut < TIME(NOW()) THEN 'absent'
                   ELSE 'a_venir'
               END AS statut_seance
        FROM creneaux cr
        JOIN emploi_temps et ON et.id = cr.id_emploi_temps
        JOIN matieres m ON m.id = cr.id_matiere
        JOIN classes c ON c.id = et.id_classe
        JOIN enseignants e ON e.id = cr.id_enseignant
        LEFT JOIN pointages p ON p.id_creneau = cr.id
        WHERE et.semaine_debut <= ? AND DATE_ADD(et.semaine_debut, INTERVAL 6 DAY) >= ?
        ORDER BY cr.heure_debut
    ");
    $stmt6->execute([$date_today, $date_today]);
    $seances_details = $stmt6->fetchAll();

    echo json_encode([
        "succes" => true,
        "data"   => [
            "kpis" => [
                "seances_jour"       => (int)$seances_jour,
                "pointages_jour"     => (int)$pointages_jour,
                "taux_presence"      => $taux_presence,
                "retards"            => (int)$retards,
                "cahiers_non_signes" => (int)$cahiers_non_signes,
                "vacations_attente"  => (int)$vacations_attente
            ],
            "seances_du_jour" => $seances_details
        ]
    ]);
}

// ============================================================
function statsEnseignant($pdo, $utilisateur) {
    // Récupérer l'id enseignant
    $stmt = $pdo->prepare("SELECT id FROM enseignants WHERE email = ?");
    $stmt->execute([$utilisateur['email']]);
    $enseignant = $stmt->fetch();

    if (!$enseignant) {
        echo json_encode(["succes" => true, "data" => []]);
        return;
    }

    $id_ens = $enseignant['id'];

    // Mes séances de la semaine
    $stmt2 = $pdo->prepare("
        SELECT cr.jour, cr.heure_debut, cr.heure_fin,
               m.libelle AS matiere, c.libelle AS classe,
               CASE WHEN p.id IS NOT NULL THEN 'pointee' ELSE 'non_pointee' END AS statut
        FROM creneaux cr
        JOIN emploi_temps et ON et.id = cr.id_emploi_temps
        JOIN matieres m ON m.id = cr.id_matiere
        JOIN classes c ON c.id = et.id_classe
        LEFT JOIN pointages p ON p.id_creneau = cr.id
        WHERE cr.id_enseignant = ?
        AND et.semaine_debut >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
        ORDER BY cr.jour, cr.heure_debut
    ");
    $stmt2->execute([$id_ens]);
    $mes_seances = $stmt2->fetchAll();

    // Mes fiches de vacation
    $stmt3 = $pdo->prepare("
        SELECT mois, annee, montant_net, statut
        FROM vacations WHERE id_enseignant = ?
        ORDER BY annee DESC, mois DESC LIMIT 6
    ");
    $stmt3->execute([$id_ens]);
    $mes_vacations = $stmt3->fetchAll();

    echo json_encode([
        "succes" => true,
        "data"   => [
            "mes_seances"   => $mes_seances,
            "mes_vacations" => $mes_vacations
        ]
    ]);
}

// ============================================================
function statsDelegue($pdo, $utilisateur) {
    // Cahiers à remplir pour le délégué
    $stmt = $pdo->prepare("
        SELECT ct.id, ct.titre_cours, ct.statut, ct.date_creation,
               m.libelle AS matiere, c.libelle AS classe
        FROM cahiers_texte ct
        JOIN creneaux cr ON cr.id = ct.id_creneau
        JOIN emploi_temps et ON et.id = cr.id_emploi_temps
        JOIN matieres m ON m.id = cr.id_matiere
        JOIN classes c ON c.id = et.id_classe
        WHERE ct.id_delegue = ?
        ORDER BY ct.date_creation DESC LIMIT 10
    ");
    $stmt->execute([$utilisateur['id']]);
    $mes_cahiers = $stmt->fetchAll();

    echo json_encode([
        "succes" => true,
        "data"   => ["mes_cahiers" => $mes_cahiers]
    ]);
}
