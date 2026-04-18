<?php
// ============================================================
//  EduTrack Pro — Endpoint Pointages QR-Code
//  Fichier : backend/api/pointages.php
//  Routes :
//    POST /api/pointages/scan        → Valider scan QR
//    GET  /api/pointages?id_classe=X → Liste des pointages
// ============================================================

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth_jwt.php';

$methode = $_SERVER['REQUEST_METHOD'];
$action  = $_GET['action'] ?? '';
$donnees = json_decode(file_get_contents("php://input"), true);

if ($methode === 'POST' && $action === 'scan') {
    validerScan($donnees);
} elseif ($methode === 'GET') {
    listerPointages();
} else {
    http_response_code(405);
    echo json_encode(["succes" => false, "message" => "Méthode non autorisée."]);
}

// ============================================================
function validerScan($donnees) {
    // L'enseignant doit être connecté
    $utilisateur = AuthJWT::proteger(['enseignant']);

    if (empty($donnees['token_qr'])) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "Token QR requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    // Chercher le créneau correspondant au token
    $stmt = $pdo->prepare("
        SELECT cr.*, m.libelle AS matiere, c.libelle AS classe,
               CONCAT(e.prenom, ' ', e.nom) AS enseignant_nom
        FROM creneaux cr
        JOIN emploi_temps et ON et.id = cr.id_emploi_temps
        JOIN matieres m ON m.id = cr.id_matiere
        JOIN classes c ON c.id = et.id_classe
        JOIN enseignants e ON e.id = cr.id_enseignant
        WHERE cr.qr_token = ?
        AND cr.qr_expire > NOW()
        LIMIT 1
    ");
    $stmt->execute([$donnees['token_qr']]);
    $creneau = $stmt->fetch();

    // Token invalide ou expiré
    if (!$creneau) {
        // Logger la tentative échouée
        loggerPointage($pdo, null, $donnees['token_qr'], 'echec');

        http_response_code(401);
        echo json_encode([
            "succes"  => false,
            "message" => "QR-Code invalide ou expiré."
        ]);
        return;
    }

    // Vérifier que ce créneau n'a pas déjà été pointé
    $stmt2 = $pdo->prepare("
        SELECT COUNT(*) FROM pointages WHERE id_creneau = ?
    ");
    $stmt2->execute([$creneau['id']]);
    if ($stmt2->fetchColumn() > 0) {
        http_response_code(409);
        echo json_encode([
            "succes"  => false,
            "message" => "Ce créneau a déjà été pointé."
        ]);
        return;
    }

    // Vérifier le retard (plus de 30 minutes)
    $heure_prevue = strtotime($creneau['heure_debut']);
    $heure_actuelle = time();
    $retard_minutes = ($heure_actuelle - $heure_prevue) / 60;
    $statut = $retard_minutes > 30 ? 'retard' : 'valide';

    // Enregistrer le pointage
    $stmt3 = $pdo->prepare("
        INSERT INTO pointages
        (id_creneau, heure_pointage_reelle, ip_source, token_utilise, statut)
        VALUES (?, NOW(), ?, ?, ?)
    ");
    $stmt3->execute([
        $creneau['id'],
        $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        $donnees['token_qr'],
        $statut
    ]);

    // Invalider le token QR (usage unique)
    $stmt4 = $pdo->prepare("
        UPDATE creneaux SET qr_token = NULL, qr_expire = NULL WHERE id = ?
    ");
    $stmt4->execute([$creneau['id']]);

    // Alerte si retard
    if ($statut === 'retard') {
        // Ici on pourrait envoyer une notification au surveillant
        // Pour l'instant on le note dans les logs
        $pdo->prepare("
            INSERT INTO logs_activite (id_utilisateur, action, details_json, ip)
            VALUES (?, 'RETARD_POINTE', ?, ?)
        ")->execute([
            $utilisateur['id'],
            json_encode(['creneau_id' => $creneau['id'], 'retard_minutes' => round($retard_minutes)]),
            $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);
    }

    echo json_encode([
        "succes"   => true,
        "message"  => $statut === 'retard'
                      ? "Pointage enregistré avec retard de " . round($retard_minutes) . " minutes."
                      : "Pointage enregistré avec succès.",
        "statut"   => $statut,
        "creneau"  => [
            "matiere"    => $creneau['matiere'],
            "classe"     => $creneau['classe'],
            "heure_debut"=> $creneau['heure_debut'],
            "heure_fin"  => $creneau['heure_fin']
        ]
    ]);
}

// ============================================================
function listerPointages() {
    $utilisateur = AuthJWT::proteger(['administrateur', 'surveillant']);
    $db  = new Database();
    $pdo = $db->connecter();

    $where  = "WHERE 1=1";
    $params = [];

    if (!empty($_GET['id_classe'])) {
        $where   .= " AND et.id_classe = ?";
        $params[] = $_GET['id_classe'];
    }
    if (!empty($_GET['date'])) {
        $where   .= " AND DATE(p.heure_pointage_reelle) = ?";
        $params[] = $_GET['date'];
    }

    $stmt = $pdo->prepare("
        SELECT p.*, cr.jour, cr.heure_debut, cr.heure_fin,
               m.libelle AS matiere, c.libelle AS classe,
               CONCAT(e.prenom, ' ', e.nom) AS enseignant
        FROM pointages p
        JOIN creneaux cr ON cr.id = p.id_creneau
        JOIN emploi_temps et ON et.id = cr.id_emploi_temps
        JOIN matieres m ON m.id = cr.id_matiere
        JOIN classes c ON c.id = et.id_classe
        JOIN enseignants e ON e.id = cr.id_enseignant
        $where
        ORDER BY p.heure_pointage_reelle DESC
    ");
    $stmt->execute($params);

    echo json_encode(["succes" => true, "data" => $stmt->fetchAll()]);
}

// ============================================================
function loggerPointage($pdo, $id_utilisateur, $token, $statut) {
    $pdo->prepare("
        INSERT INTO logs_activite (id_utilisateur, action, details_json, ip)
        VALUES (?, 'SCAN_QR', ?, ?)
    ")->execute([
        $id_utilisateur,
        json_encode(['token' => substr($token, 0, 10) . '...', 'statut' => $statut]),
        $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ]);
}
