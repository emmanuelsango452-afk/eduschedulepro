<?php
// ============================================================
//  EduTrack Pro — Endpoint Utilisateurs
//  Fichier : backend/api/utilisateurs.php
// ============================================================

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth_jwt.php';

$methode = $_SERVER['REQUEST_METHOD'];
$id      = $_GET['id'] ?? null;
$donnees = json_decode(file_get_contents("php://input"), true);

switch ($methode) {
    case 'GET':    listerUtilisateurs($id); break;
    case 'POST':   creerUtilisateur($donnees); break;
    case 'PUT':    modifierUtilisateur($id, $donnees); break;
    case 'DELETE': supprimerUtilisateur($id); break;
    default:
        http_response_code(405);
        echo json_encode(["succes" => false, "message" => "Méthode non autorisée."]);
}

function listerUtilisateurs($id) {
    $utilisateur = AuthJWT::proteger(['administrateur']);
    $db  = new Database();
    $pdo = $db->connecter();

    if ($id) {
        $stmt = $pdo->prepare("SELECT id, email, role, actif FROM utilisateurs WHERE id = ?");
        $stmt->execute([$id]);
        $u = $stmt->fetch();
        if (!$u) { http_response_code(404); echo json_encode(["succes" => false, "message" => "Utilisateur introuvable."]); return; }
        echo json_encode(["succes" => true, "data" => $u]);
    } else {
        $stmt = $pdo->query("SELECT id, email, role, actif FROM utilisateurs ORDER BY role, email");
        echo json_encode(["succes" => true, "data" => $stmt->fetchAll()]);
    }
}

function creerUtilisateur($donnees) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (empty($donnees['email']) || empty($donnees['role'])) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "Email et rôle requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    // Vérifier si email déjà utilisé
    $stmt = $pdo->prepare("SELECT id FROM utilisateurs WHERE email = ?");
    $stmt->execute([$donnees['email']]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(["succes" => false, "message" => "Cet email est déjà utilisé."]);
        return;
    }

    $mot_de_passe_hash = password_hash(
        $donnees['mot_de_passe'] ?? 'password',
        PASSWORD_BCRYPT
    );

    $stmt2 = $pdo->prepare("
        INSERT INTO utilisateurs (email, mot_de_passe_hash, role, actif)
        VALUES (?, ?, ?, ?)
    ");
    $stmt2->execute([
        $donnees['email'],
        $mot_de_passe_hash,
        $donnees['role'],
        $donnees['actif'] ?? 1
    ]);

    http_response_code(201);
    echo json_encode([
        "succes"  => true,
        "message" => "Utilisateur créé avec succès.",
        "id"      => $pdo->lastInsertId()
    ]);
}

function modifierUtilisateur($id, $donnees) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    // Mise à jour avec ou sans mot de passe
    if (!empty($donnees['mot_de_passe'])) {
        $hash = password_hash($donnees['mot_de_passe'], PASSWORD_BCRYPT);
        $pdo->prepare("
            UPDATE utilisateurs
            SET email = ?, role = ?, actif = ?, mot_de_passe_hash = ?
            WHERE id = ?
        ")->execute([
            $donnees['email'],
            $donnees['role'],
            $donnees['actif'] ?? 1,
            $hash,
            $id
        ]);
    } else {
        $pdo->prepare("
            UPDATE utilisateurs
            SET email = ?, role = ?, actif = ?
            WHERE id = ?
        ")->execute([
            $donnees['email'] ?? null,
            $donnees['role']  ?? null,
            $donnees['actif'] ?? 1,
            $id
        ]);
    }

    echo json_encode(["succes" => true, "message" => "Utilisateur modifié avec succès."]);
}

function supprimerUtilisateur($id) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $pdo->prepare("DELETE FROM utilisateurs WHERE id = ?")->execute([$id]);

    echo json_encode(["succes" => true, "message" => "Utilisateur supprimé avec succès."]);
}
