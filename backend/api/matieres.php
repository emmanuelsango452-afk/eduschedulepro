<?php
// ============================================================
//  EduTrack Pro — Endpoint Matières
//  Fichier : backend/api/matieres.php
// ============================================================

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth_jwt.php';

$methode = $_SERVER['REQUEST_METHOD'];
$id      = $_GET['id'] ?? null;
$donnees = json_decode(file_get_contents("php://input"), true);

switch ($methode) {
    case 'GET':    listerMatieres($id); break;
    case 'POST':   creerMatiere($donnees); break;
    case 'PUT':    modifierMatiere($id, $donnees); break;
    case 'DELETE': supprimerMatiere($id); break;
    default:
        http_response_code(405);
        echo json_encode(["succes" => false, "message" => "Méthode non autorisée."]);
}

function listerMatieres($id) {
    $utilisateur = AuthJWT::proteger();
    $db = new Database();
    $pdo = $db->connecter();
    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM matieres WHERE id = ?");
        $stmt->execute([$id]);
        $matiere = $stmt->fetch();
        if (!$matiere) {
            http_response_code(404);
            echo json_encode(["succes" => false, "message" => "Matière introuvable."]);
            return;
        }
        echo json_encode(["succes" => true, "data" => $matiere]);
    } else {
        $stmt = $pdo->query("SELECT * FROM matieres ORDER BY libelle");
        echo json_encode(["succes" => true, "data" => $stmt->fetchAll()]);
    }
}

function creerMatiere($donnees) {
    $utilisateur = AuthJWT::proteger(['administrateur']);
    if (empty($donnees['code']) || empty($donnees['libelle'])) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "Code et libellé requis."]);
        return;
    }
    $db = new Database();
    $pdo = $db->connecter();
    $stmt = $pdo->prepare("
        INSERT INTO matieres (code, libelle, volume_horaire_total, coefficient)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([
        $donnees['code'],
        $donnees['libelle'],
        $donnees['volume_horaire_total'] ?? 40,
        $donnees['coefficient'] ?? 2
    ]);
    http_response_code(201);
    echo json_encode([
        "succes"  => true,
        "message" => "Matière créée avec succès.",
        "id"      => $pdo->lastInsertId()
    ]);
}

function modifierMatiere($id, $donnees) {
    $utilisateur = AuthJWT::proteger(['administrateur']);
    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }
    $db = new Database();
    $pdo = $db->connecter();
    $pdo->prepare("
        UPDATE matieres
        SET code = ?, libelle = ?, volume_horaire_total = ?, coefficient = ?
        WHERE id = ?
    ")->execute([
        $donnees['code'],
        $donnees['libelle'],
        $donnees['volume_horaire_total'],
        $donnees['coefficient'],
        $id
    ]);
    echo json_encode(["succes" => true, "message" => "Matière modifiée avec succès."]);
}

function supprimerMatiere($id) {
    $utilisateur = AuthJWT::proteger(['administrateur']);
    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }
    $db = new Database();
    $pdo = $db->connecter();
    $pdo->prepare("DELETE FROM matieres WHERE id = ?")->execute([$id]);
    echo json_encode(["succes" => true, "message" => "Matière supprimée avec succès."]);
}
