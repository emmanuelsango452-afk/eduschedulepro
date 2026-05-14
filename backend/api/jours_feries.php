<?php
// ============================================================
//  EduTrack Pro — Endpoint Jours Fériés
//  Fichier : backend/api/jours_feries.php
// ============================================================

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth_jwt.php';

$methode = $_SERVER['REQUEST_METHOD'];
$id      = $_GET['id'] ?? null;
$donnees = json_decode(file_get_contents("php://input"), true);

if ($methode === 'GET') {
    listerJoursFeries();
} elseif ($methode === 'POST') {
    creerJourFerie($donnees);
} elseif ($methode === 'PUT') {
    modifierJourFerie($id, $donnees);
} elseif ($methode === 'DELETE') {
    supprimerJourFerie($id);
} else {
    http_response_code(405);
    echo json_encode(["succes" => false, "message" => "Méthode non autorisée."]);
}

// ---- Lister tous les jours fériés ----
function listerJoursFeries() {
    AuthJWT::proteger();
    $db  = new Database();
    $pdo = $db->connecter();

    $where  = "WHERE 1=1";
    $params = [];

    // Filtrer par mois/année si fourni
    if (!empty($_GET['mois']) && !empty($_GET['annee'])) {
        $where   .= " AND MONTH(date) = ? AND YEAR(date) = ?";
        $params[] = $_GET['mois'];
        $params[] = $_GET['annee'];
    }

    // Filtrer par semaine si fourni
    if (!empty($_GET['semaine'])) {
        $debutSemaine = $_GET['semaine'];
        $finSemaine   = date('Y-m-d', strtotime($debutSemaine . ' +6 days'));
        $where   .= " AND date BETWEEN ? AND ?";
        $params[] = $debutSemaine;
        $params[] = $finSemaine;
    }

    // Filtrer par année
    if (!empty($_GET['annee']) && empty($_GET['mois'])) {
        $where   .= " AND YEAR(date) = ?";
        $params[] = $_GET['annee'];
    }

    $stmt = $pdo->prepare("
        SELECT jf.*, u.email AS cree_par_email
        FROM jours_feries jf
        LEFT JOIN utilisateurs u ON u.id = jf.cree_par
        $where
        ORDER BY jf.date ASC
    ");
    $stmt->execute($params);
    $jours = $stmt->fetchAll();

    echo json_encode([
        "succes" => true,
        "data"   => $jours
    ]);
}

// ---- Créer un jour férié ----
function creerJourFerie($donnees) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (empty($donnees['date']) || empty($donnees['libelle'])) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "Date et libellé requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    // Vérifier si la date existe déjà
    $stmt = $pdo->prepare("SELECT id FROM jours_feries WHERE date = ?");
    $stmt->execute([$donnees['date']]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(["succes" => false, "message" => "Un jour férié existe déjà pour cette date."]);
        return;
    }

    $stmt = $pdo->prepare("
        INSERT INTO jours_feries (date, libelle, type, couleur, cree_par)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $donnees['date'],
        $donnees['libelle'],
        $donnees['type']    ?? 'ferie',
        $donnees['couleur'] ?? '#E24B4A',
        $utilisateur['id']
    ]);

    echo json_encode([
        "succes"  => true,
        "message" => "Jour férié créé avec succès.",
        "id"      => $pdo->lastInsertId()
    ]);
}

// ---- Modifier un jour férié ----
function modifierJourFerie($id, $donnees) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $stmt = $pdo->prepare("
        UPDATE jours_feries
        SET date = ?, libelle = ?, type = ?, couleur = ?
        WHERE id = ?
    ");
    $stmt->execute([
        $donnees['date'],
        $donnees['libelle'],
        $donnees['type']    ?? 'ferie',
        $donnees['couleur'] ?? '#E24B4A',
        $id
    ]);

    echo json_encode(["succes" => true, "message" => "Jour férié modifié."]);
}

// ---- Supprimer un jour férié ----
function supprimerJourFerie($id) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $pdo->prepare("DELETE FROM jours_feries WHERE id = ?")->execute([$id]);

    echo json_encode(["succes" => true, "message" => "Jour férié supprimé."]);
}
