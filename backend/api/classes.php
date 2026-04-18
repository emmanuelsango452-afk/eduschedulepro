<?php
// ============================================================
//  EduTrack Pro — Endpoint Classes
//  Fichier : backend/api/classes.php
//  Routes :
//    GET    /api/classes          → Liste toutes les classes
//    GET    /api/classes?id=X     → Détail d'une classe
//    POST   /api/classes          → Créer une classe (admin)
//    PUT    /api/classes?id=X     → Modifier une classe (admin)
//    DELETE /api/classes?id=X     → Supprimer une classe (admin)
// ============================================================

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth_jwt.php';

$methode = $_SERVER['REQUEST_METHOD'];
$id      = $_GET['id'] ?? null;
$donnees = json_decode(file_get_contents("php://input"), true);

switch ($methode) {
    case 'GET':    listerClasses($id); break;
    case 'POST':   creerClasse($donnees); break;
    case 'PUT':    modifierClasse($id, $donnees); break;
    case 'DELETE': supprimerClasse($id); break;
    default:
        http_response_code(405);
        echo json_encode(["succes" => false, "message" => "Méthode non autorisée."]);
}

// ============================================================
function listerClasses($id) {
    $utilisateur = AuthJWT::proteger();
    $db  = new Database();
    $pdo = $db->connecter();

    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM classes WHERE id = ?");
        $stmt->execute([$id]);
        $classe = $stmt->fetch();
        if (!$classe) {
            http_response_code(404);
            echo json_encode(["succes" => false, "message" => "Classe introuvable."]);
            return;
        }
        echo json_encode(["succes" => true, "data" => $classe]);
    } else {
        $annee = $_GET['annee'] ?? ANNEE_ACADEMIQUE;
        $stmt  = $pdo->prepare("SELECT * FROM classes WHERE annee_academique = ? ORDER BY niveau, libelle");
        $stmt->execute([$annee]);
        echo json_encode(["succes" => true, "data" => $stmt->fetchAll()]);
    }
}

// ============================================================
function creerClasse($donnees) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (empty($donnees['code']) || empty($donnees['libelle']) || empty($donnees['niveau'])) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "Code, libellé et niveau requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $stmt = $pdo->prepare("
        INSERT INTO classes (code, libelle, niveau, annee_academique)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([
        $donnees['code'],
        $donnees['libelle'],
        $donnees['niveau'],
        $donnees['annee_academique'] ?? ANNEE_ACADEMIQUE
    ]);

    http_response_code(201);
    echo json_encode([
        "succes"  => true,
        "message" => "Classe créée avec succès.",
        "id"      => $pdo->lastInsertId()
    ]);
}

// ============================================================
function modifierClasse($id, $donnees) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $stmt = $pdo->prepare("
        UPDATE classes SET code = ?, libelle = ?, niveau = ?
        WHERE id = ?
    ");
    $stmt->execute([
        $donnees['code'],
        $donnees['libelle'],
        $donnees['niveau'],
        $id
    ]);

    echo json_encode(["succes" => true, "message" => "Classe modifiée avec succès."]);
}

// ============================================================
function supprimerClasse($id) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $stmt = $pdo->prepare("DELETE FROM classes WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["succes" => true, "message" => "Classe supprimée avec succès."]);
}
