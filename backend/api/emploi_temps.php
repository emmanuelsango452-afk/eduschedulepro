<?php
// ============================================================
//  EduTrack Pro — Endpoint Emploi du Temps & Créneaux
//  Fichier : backend/api/emploi_temps.php
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
    publierPlanning($id, $donnees);
} elseif ($methode === 'DELETE') {
    supprimerCreneau($id);
} else {
    http_response_code(405);
    echo json_encode(["succes" => false, "message" => "Méthode non autorisée."]);
}

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
        SELECT et.*, c.libelle AS classe_libelle, c.niveau AS classe_niveau
        FROM emploi_temps et
        JOIN classes c ON c.id = et.id_classe
        $where
        ORDER BY et.semaine_debut DESC
    ");
    $stmt->execute($params);
    $plannings = $stmt->fetchAll();

    foreach ($plannings as &$planning) {
        $stmt2 = $pdo->prepare("
            SELECT cr.*, m.libelle AS matiere, s.code AS salle,
                   CONCAT(e.prenom, ' ', e.nom) AS enseignant
            FROM creneaux cr
            JOIN matieres m ON m.id = cr.id_matiere
            JOIN enseignants e ON e.id = cr.id_enseignant
            JOIN salles s ON s.id = cr.id_salle
            WHERE cr.id_emploi_temps = ?
            ORDER BY cr.jour, cr.heure_debut
        ");
        $stmt2->execute([$planning['id']]);
        $planning['creneaux'] = $stmt2->fetchAll();
    }

    // Retourner le statut_publication depuis le premier planning
    $statut = !empty($plannings) ? $plannings[0]['statut_publication'] : null;

    echo json_encode([
        "succes" => true,
        "data" => $plannings,
        "statut_publication" => $statut
    ]);
}

function creerPlanning($donnees) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (empty($donnees['id_classe'])) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "Classe requise."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $semaine = $donnees['semaine_debut'] ?? date('Y-m-d', strtotime('monday this week'));

    $stmt = $pdo->prepare("SELECT id FROM emploi_temps WHERE id_classe = ? AND semaine_debut = ?");
    $stmt->execute([$donnees['id_classe'], $semaine]);
    $existing = $stmt->fetch();

    if ($existing) {
        $id_planning = $existing['id'];
    } else {
        $stmt2 = $pdo->prepare("
            INSERT INTO emploi_temps (id_classe, semaine_debut, statut_publication, cree_par)
            VALUES (?, ?, 'brouillon', ?)
        ");
        $stmt2->execute([$donnees['id_classe'], $semaine, $utilisateur['id']]);
        $id_planning = $pdo->lastInsertId();
    }

    if (!empty($donnees['creneaux'])) {
        foreach ($donnees['creneaux'] as $creneau) {

            // Détecter conflit enseignant
            $stmtConflict = $pdo->prepare("
                SELECT COUNT(*) FROM creneaux cr
                JOIN emploi_temps et ON et.id = cr.id_emploi_temps
                WHERE cr.id_enseignant = ?
                AND cr.jour = ?
                AND et.semaine_debut = ?
                AND (
                    (cr.heure_debut < ? AND cr.heure_fin > ?) OR
                    (cr.heure_debut >= ? AND cr.heure_debut < ?) OR
                    (cr.heure_fin > ? AND cr.heure_fin <= ?)
                )
            ");
            $stmtConflict->execute([
                $creneau['id_enseignant'], $creneau['jour'], $semaine,
                $creneau['heure_fin'], $creneau['heure_debut'],
                $creneau['heure_debut'], $creneau['heure_fin'],
                $creneau['heure_debut'], $creneau['heure_fin']
            ]);

            if ($stmtConflict->fetchColumn() > 0) {
                http_response_code(409);
                echo json_encode([
                    "succes"  => false,
                    "message" => "⚠️ Conflit détecté : enseignant déjà occupé le " . $creneau['jour'] . " à " . $creneau['heure_debut']
                ]);
                return;
            }

            // Détecter conflit salle
            $stmtSalle = $pdo->prepare("
                SELECT COUNT(*) FROM creneaux cr
                JOIN emploi_temps et ON et.id = cr.id_emploi_temps
                WHERE cr.id_salle = ?
                AND cr.jour = ?
                AND et.semaine_debut = ?
                AND (
                    (cr.heure_debut < ? AND cr.heure_fin > ?) OR
                    (cr.heure_debut >= ? AND cr.heure_debut < ?) OR
                    (cr.heure_fin > ? AND cr.heure_fin <= ?)
                )
            ");
            $stmtSalle->execute([
                $creneau['id_salle'], $creneau['jour'], $semaine,
                $creneau['heure_fin'], $creneau['heure_debut'],
                $creneau['heure_debut'], $creneau['heure_fin'],
                $creneau['heure_debut'], $creneau['heure_fin']
            ]);

            if ($stmtSalle->fetchColumn() > 0) {
                http_response_code(409);
                echo json_encode([
                    "succes"  => false,
                    "message" => "⚠️ Conflit détecté : salle déjà occupée le " . $creneau['jour'] . " à " . $creneau['heure_debut']
                ]);
                return;
            }

            // Insérer le créneau
            $stmt3 = $pdo->prepare("
                INSERT INTO creneaux
                (id_emploi_temps, id_matiere, id_enseignant, id_salle, jour, heure_debut, heure_fin, qr_token, qr_expire)
                VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)
            ");
            $stmt3->execute([
                $id_planning,
                $creneau['id_matiere'],
                $creneau['id_enseignant'],
                $creneau['id_salle'],
                $creneau['jour'],
                $creneau['heure_debut'],
                $creneau['heure_fin'],
            ]);

            // Générer token QR automatique
            $id_creneau = $pdo->lastInsertId();
            $pdo->prepare("
                UPDATE creneaux
                SET qr_token  = CONCAT('TOKEN_', id, '_TEST'),
                    qr_expire = DATE_ADD(NOW(), INTERVAL 365 DAY)
                WHERE id = ?
            ")->execute([$id_creneau]);
        }
    }

    http_response_code(201);
    echo json_encode([
        "succes"  => true,
        "message" => "Créneau créé avec succès.",
        "id"      => $id_planning
    ]);
}

function publierPlanning($id, $donnees) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $stmt = $pdo->prepare("SELECT statut_publication FROM emploi_temps WHERE id = ?");
    $stmt->execute([$id]);
    $planning = $stmt->fetch();

    if (!$planning) {
        http_response_code(404);
        echo json_encode(["succes" => false, "message" => "Planning introuvable."]);
        return;
    }

    $nouveau_statut = $planning['statut_publication'] === 'publie' ? 'brouillon' : 'publie';
    $pdo->prepare("UPDATE emploi_temps SET statut_publication = ? WHERE id = ?")
        ->execute([$nouveau_statut, $id]);

    echo json_encode([
        "succes"  => true,
        "message" => $nouveau_statut === 'publie' ? "Planning publié !" : "Planning dépublié.",
        "statut"  => $nouveau_statut
    ]);
}

function genererQRCode($id_creneau) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (!$id_creneau) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID créneau requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $stmt = $pdo->prepare("
        SELECT cr.*, m.libelle AS matiere, c.libelle AS classe,
               CONCAT(e.prenom, ' ', e.nom) AS enseignant
        FROM creneaux cr
        JOIN emploi_temps et ON et.id = cr.id_emploi_temps
        JOIN matieres m ON m.id = cr.id_matiere
        JOIN classes c ON c.id = et.id_classe
        JOIN enseignants e ON e.id = cr.id_enseignant
        WHERE cr.id = ?
    ");
    $stmt->execute([$id_creneau]);
    $creneau = $stmt->fetch();

    if (!$creneau) {
        http_response_code(404);
        echo json_encode(["succes" => false, "message" => "Créneau introuvable."]);
        return;
    }

    echo json_encode([
        "succes"  => true,
        "token"   => $creneau['qr_token'],
        "expire"  => $creneau['qr_expire'],
        "creneau" => $creneau,
        "qr_url"  => "http://localhost:5173/scanner?token=" . $creneau['qr_token']
    ]);
}

function supprimerCreneau($id) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $pdo->prepare("DELETE FROM creneaux WHERE id = ?")->execute([$id]);

    echo json_encode(["succes" => true, "message" => "Créneau supprimé."]);
}
