<?php
// ============================================================
//  EduTrack Pro — Endpoint Authentification
//  Fichier : backend/api/auth.php
//  Routes :
//    POST /api/auth/login  → Connexion
//    POST /api/auth/logout → Déconnexion
// ============================================================

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth_jwt.php';

// Récupérer la méthode HTTP et l'action
$methode = $_SERVER['REQUEST_METHOD'];
$action  = $_GET['action'] ?? '';

// Récupérer les données JSON envoyées
$donnees = json_decode(file_get_contents("php://input"), true);

// --- Routage ---
if ($methode === 'POST' && $action === 'login') {
    login($donnees);
} elseif ($methode === 'POST' && $action === 'logout') {
    logout();
} else {
    http_response_code(404);
    echo json_encode([
        "succes"  => false,
        "message" => "Route introuvable."
    ]);
}

// ============================================================
//  FONCTION : Connexion
// ============================================================
function login($donnees) {
    // Vérifier que email et password sont fournis
    if (empty($donnees['email']) || empty($donnees['password'])) {
        http_response_code(400);
        echo json_encode([
            "succes"  => false,
            "message" => "Email et mot de passe requis."
        ]);
        return;
    }

    $email    = trim($donnees['email']);
    $password = $donnees['password'];

    // Connexion BDD
    $db  = new Database();
    $pdo = $db->connecter();

    // Chercher l'utilisateur par email
    $stmt = $pdo->prepare("
        SELECT id, email, mot_de_passe_hash, role, actif
        FROM utilisateurs
        WHERE email = ?
        LIMIT 1
    ");
    $stmt->execute([$email]);
    $utilisateur = $stmt->fetch();

    // Vérifier si l'utilisateur existe
    if (!$utilisateur) {
        http_response_code(401);
        echo json_encode([
            "succes"  => false,
            "message" => "Email ou mot de passe incorrect."
        ]);
        return;
    }

    // Vérifier si le compte est actif
    if (!$utilisateur['actif']) {
        http_response_code(403);
        echo json_encode([
            "succes"  => false,
            "message" => "Compte désactivé. Contactez l'administrateur."
        ]);
        return;
    }

    // Vérifier le mot de passe
    if (!password_verify($password, $utilisateur['mot_de_passe_hash'])) {
        http_response_code(401);
        echo json_encode([
            "succes"  => false,
            "message" => "Email ou mot de passe incorrect."
        ]);
        return;
    }

    // Générer le token JWT
    $token = AuthJWT::genererToken([
        'id'    => $utilisateur['id'],
        'email' => $utilisateur['email'],
        'role'  => $utilisateur['role']
    ]);

    // Logger la connexion
    $stmt = $pdo->prepare("
        INSERT INTO logs_activite (id_utilisateur, action, ip, date_heure)
        VALUES (?, 'LOGIN', ?, NOW())
    ");
    $stmt->execute([
        $utilisateur['id'],
        $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ]);

    // Retourner le token et les infos utilisateur
    http_response_code(200);
    echo json_encode([
        "succes"      => true,
        "message"     => "Connexion réussie.",
        "token"       => $token,
        "utilisateur" => [
            "id"    => $utilisateur['id'],
            "email" => $utilisateur['email'],
            "role"  => $utilisateur['role']
        ]
    ]);
}

// ============================================================
//  FONCTION : Déconnexion
// ============================================================
function logout() {
    // Vérifier que l'utilisateur est connecté
    $utilisateur = AuthJWT::proteger();

    // Logger la déconnexion
    $db  = new Database();
    $pdo = $db->connecter();

    $stmt = $pdo->prepare("
        INSERT INTO logs_activite (id_utilisateur, action, ip, date_heure)
        VALUES (?, 'LOGOUT', ?, NOW())
    ");
    $stmt->execute([
        $utilisateur['id'],
        $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ]);

    http_response_code(200);
    echo json_encode([
        "succes"  => true,
        "message" => "Déconnexion réussie."
    ]);
}
