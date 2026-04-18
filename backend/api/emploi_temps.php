<?php
// ============================================================
//  EduTrack Pro — Endpoint Emploi du Temps & Créneaux
//  Fichier : backend/api/emploi_temps.php
//  Routes :
//    GET  /api/emploi-temps?id_classe=X&semaine=Y → Planning
//    POST /api/emploi-temps                        → Créer planning
//    PUT  /api/emploi-temps?id=X&action=publier    → Publier
//    GET  /api/emploi-temps?action=qr&id_creneau=X → QR-Code
// ============================================================

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth_jwt.php';

$methode = $_SERVER['REQUEST_METHOD'];
$action  = $_GET['action'] ?? '';
$id      = $_GET['id'] ?? null;
$donnees = json_decode(file_get_contents("php://input"), true);

if ($methode === 'GET' && $action === 'qr') {
    genererQRCode($_GET['id_creneau'] ?? null);
} elseif ($methode === 'GET') {
    listerPlannings();
} elseif ($methode === 'POST') {
    creerPlanning($donnees);
} elseif ($methode === 'PUT' && $action === 'publier') {
    publierPlanning($id);
} else {
    http_response_code(405);
    echo json_encode(["succes" => false, "message" => "Méthode non autorisée."]);
}

// ============================================================
function listerPlannings() {
    $utilisateur = AuthJWT::proteger();
    $db  = new Database();
    $pdo = $db->connecter();

    $where  = "WHERE 1=1";
    $params = [];

    if (!empty($_GET['id_classe'])) {
        $where   .= " AND et.id_classe = ?";
        $params[] = $_GET['id_classe'];
    }
    if (!empty($_GET['semaine'])) {
        $where   .= " AND et.semaine_debut = ?";
        $params[] = $_GET['semaine'];
    }
    // Les étudiants ne voient que les plannings publiés
    if ($utilisateur['role'] === 'etudiant') {
        $where .= " AND et.statut_publication = 'publie'";
    }

    $stmt = $pdo->prepare("
        SELECT
            et.*,
            c.libelle AS classe_libelle,
            c.niveau  AS classe_niveau,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id',           cr.id,
                    'jour',         cr.jour,
                    'heure_debut',  cr.heure_debut,
                    'heure_fin',    cr.heure_fin,
                    'matiere',      m.libelle,
                    'enseignant',   CONCAT(e.prenom, ' ', e.nom),
                    'salle',        s.code,
                    'qr_expire',    cr.qr_expire
                )
            ) AS creneaux
        FROM emploi_temps et
        JOIN classes   c ON c.id = et.id_classe
        LEFT JOIN creneaux cr ON cr.id_emploi_temps = et.id
        LEFT JOIN matieres  m ON m.id = cr.id_matiere
        LEFT JOIN enseignants e ON e.id = cr.id_enseignant
        LEFT JOIN salles s ON s.id = cr.id_salle
        $where
        GROUP BY et.id
        ORDER BY et.semaine_debut DESC
    ");
    $stmt->execute($params);
    $plannings = $stmt->fetchAll();

    // Décoder le JSON des créneaux
    foreach ($plannings as &$planning) {
        $planning['creneaux'] = json_decode($planning['creneaux'], true);
    }

    echo json_encode(["succes" => true, "data" => $plannings]);
}

// ============================================================
function creerPlanning($donnees) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (empty($donnees['id_classe']) || empty($donnees['semaine_debut'])) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "Classe et semaine requises."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    // Créer l'en-tête du planning
    $stmt = $pdo->prepare("
        INSERT INTO emploi_temps (id_classe, semaine_debut, statut_publication, cree_par)
        VALUES (?, ?, 'brouillon', ?)
    ");
    $stmt->execute([
        $donnees['id_classe'],
        $donnees['semaine_debut'],
        $utilisateur['id']
    ]);
    $id_planning = $pdo->lastInsertId();

    // Créer les créneaux si fournis
    if (!empty($donnees['creneaux'])) {
        foreach ($donnees['creneaux'] as $creneau) {
            // Détecter les conflits avant d'insérer
            if (detecterConflit($pdo, $creneau, $id_planning)) {
                http_response_code(409);
                echo json_encode([
                    "succes"  => false,
                    "message" => "Conflit détecté pour le créneau " .
                                 $creneau['jour'] . " " . $creneau['heure_debut']
                ]);
                return;
            }

            // Générer le token QR
            $qr_token  = genererTokenQR($id_planning, $creneau);
            $qr_expire = date('Y-m-d H:i:s',
                strtotime($creneau['heure_debut']) + (QR_FENETRE_MINUTES * 60));

            $stmt2 = $pdo->prepare("
                INSERT INTO creneaux
                (id_emploi_temps, id_matiere, id_enseignant, id_salle,
                 jour, heure_debut, heure_fin, qr_token, qr_expire)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt2->execute([
                $id_planning,
                $creneau['id_matiere'],
                $creneau['id_enseignant'],
                $creneau['id_salle'],
                $creneau['jour'],
                $creneau['heure_debut'],
                $creneau['heure_fin'],
                $qr_token,
                $qr_expire
            ]);
        }
    }

    http_response_code(201);
    echo json_encode([
        "succes"  => true,
        "message" => "Planning créé avec succès.",
        "id"      => $id_planning
    ]);
}

// ============================================================
function publierPlanning($id) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $stmt = $pdo->prepare("
        UPDATE emploi_temps
        SET statut_publication = 'publie'
        WHERE id = ?
    ");
    $stmt->execute([$id]);

    echo json_encode(["succes" => true, "message" => "Planning publié avec succès."]);
}

// ============================================================
function genererQRCode($id_creneau) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (!$id_creneau) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID créneau requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $stmt = $pdo->prepare("SELECT * FROM creneaux WHERE id = ?");
    $stmt->execute([$id_creneau]);
    $creneau = $stmt->fetch();

    if (!$creneau) {
        http_response_code(404);
        echo json_encode(["succes" => false, "message" => "Créneau introuvable."]);
        return;
    }

    echo json_encode([
        "succes"    => true,
        "token"     => $creneau['qr_token'],
        "expire"    => $creneau['qr_expire'],
        "qr_url"    => "http://localhost/eduschedulepro/scan?token=" . $creneau['qr_token']
    ]);
}

// ============================================================
//  Fonctions utilitaires
// ============================================================

function genererTokenQR($id_planning, $creneau) {
    $data  = $id_planning . '|' . $creneau['jour'] . '|' . $creneau['heure_debut'];
    return hash_hmac('sha256', $data, QR_SECRET);
}

function detecterConflit($pdo, $creneau, $id_planning_actuel) {
    // Vérifier si l'enseignant est déjà occupé sur ce créneau
    $stmt = $pdo->prepare("
        SELECT COUNT(*) FROM creneaux cr
        JOIN emploi_temps et ON et.id = cr.id_emploi_temps
        WHERE cr.id_enseignant = ?
        AND cr.jour = ?
        AND et.id != ?
        AND (
            (cr.heure_debut <= ? AND cr.heure_fin > ?) OR
            (cr.heure_debut < ? AND cr.heure_fin >= ?)
        )
    ");
    $stmt->execute([
        $creneau['id_enseignant'],
        $creneau['jour'],
        $id_planning_actuel,
        $creneau['heure_debut'], $creneau['heure_debut'],
        $creneau['heure_fin'],   $creneau['heure_fin']
    ]);
    return $stmt->fetchColumn() > 0;
}
