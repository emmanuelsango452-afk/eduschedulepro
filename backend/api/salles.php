<?php
// ============================================================
//  EduTrack Pro — Endpoint Salles
//  Fichier : backend/api/salles.php
// ============================================================

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth_jwt.php';

$methode = $_SERVER['REQUEST_METHOD'];
$id      = $_GET['id'] ?? null;
$donnees = json_decode(file_get_contents("php://input"), true);

switch ($methode) {
    case 'GET':    listerSalles($id); break;
    case 'POST':   creerSalle($donnees); break;
    case 'PUT':    modifierSalle($id, $donnees); break;
    case 'DELETE': supprimerSalle($id); break;
    default:
        http_response_code(405);
        echo json_encode(["succes" => false, "message" => "Méthode non autorisée."]);
}

function listerSalles($id) {
    $utilisateur = AuthJWT::proteger();
    $db = new Database();
    $pdo = $db->connecter();
    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM salles WHERE id = ?");
        $stmt->execute([$id]);
        $salle = $stmt->fetch();
        if (!$salle) {
            http_response_code(404);
            echo json_encode(["succes" => false, "message" => "Salle introuvable."]);
            return;
        }
        echo json_encode(["succes" => true, "data" => $salle]);
    } else {
        $stmt = $pdo->query("SELECT * FROM salles ORDER BY code");
        echo json_encode(["succes" => true, "data" => $stmt->fetchAll()]);
    }
}

function creerSalle($donnees) {
    $utilisateur = AuthJWT::proteger(['administrateur']);
    if (empty($donnees['code'])) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "Code requis."]);
        return;
    }
    $db = new Database();
    $pdo = $db->connecter();
    $stmt = $pdo->prepare("
        INSERT INTO salles (code, capacite, equipements, batiment)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([
        $donnees['code'],
        $donnees['capacite']    ?? 30,
        $donnees['equipements'] ?? null,
        $donnees['batiment']    ?? null
    ]);
    http_response_code(201);
    echo json_encode([
        "succes"  => true,
        "message" => "Salle créée avec succès.",
        "id"      => $pdo->lastInsertId()
    ]);
}

function modifierSalle($id, $donnees) {
    $utilisateur = AuthJWT::proteger(['administrateur']);
    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }
    $db = new Database();
    $pdo = $db->connecter();
    $pdo->prepare("
        UPDATE salles
        SET code = ?, capacite = ?, equipements = ?, batiment = ?
        WHERE id = ?
    ")->execute([
        $donnees['code'],
        $donnees['capacite'],
        $donnees['equipements'],
        $donnees['batiment'],
        $id
    ]);
    echo json_encode(["succes" => true, "message" => "Salle modifiée avec succès."]);
}

function supprimerSalle($id) {
    $utilisateur = AuthJWT::proteger(['administrateur']);
    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }
    $db = new Database();
    $pdo = $db->connecter();
    $pdo->prepare("DELETE FROM salles WHERE id = ?")->execute([$id]);
    echo json_encode(["succes" => true, "message" => "Salle supprimée avec succès."]);
}
