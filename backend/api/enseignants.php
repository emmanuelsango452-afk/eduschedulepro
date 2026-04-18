<?php
// ============================================================
//  EduTrack Pro — Endpoint Enseignants
//  Fichier : backend/api/enseignants.php
//  Routes :
//    GET    /api/enseignants          → Liste tous les enseignants
//    GET    /api/enseignants?id=X     → Détail d'un enseignant
//    POST   /api/enseignants          → Créer un enseignant (admin)
//    PUT    /api/enseignants?id=X     → Modifier un enseignant (admin)
//    DELETE /api/enseignants?id=X     → Supprimer un enseignant (admin)
// ============================================================

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth_jwt.php';

$methode = $_SERVER['REQUEST_METHOD'];
$id      = $_GET['id'] ?? null;
$donnees = json_decode(file_get_contents("php://input"), true);

switch ($methode) {
    case 'GET':    listerEnseignants($id); break;
    case 'POST':   creerEnseignant($donnees); break;
    case 'PUT':    modifierEnseignant($id, $donnees); break;
    case 'DELETE': supprimerEnseignant($id); break;
    default:
        http_response_code(405);
        echo json_encode(["succes" => false, "message" => "Méthode non autorisée."]);
}

// ============================================================
function listerEnseignants($id) {
    $utilisateur = AuthJWT::proteger();
    $db  = new Database();
    $pdo = $db->connecter();

    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM enseignants WHERE id = ?");
        $stmt->execute([$id]);
        $enseignant = $stmt->fetch();
        if (!$enseignant) {
            http_response_code(404);
            echo json_encode(["succes" => false, "message" => "Enseignant introuvable."]);
            return;
        }
        echo json_encode(["succes" => true, "data" => $enseignant]);
    } else {
        // Filtres optionnels
        $where  = "WHERE 1=1";
        $params = [];

        if (!empty($_GET['statut'])) {
            $where   .= " AND statut = ?";
            $params[] = $_GET['statut'];
        }
        if (!empty($_GET['specialite'])) {
            $where   .= " AND specialite LIKE ?";
            $params[] = "%" . $_GET['specialite'] . "%";
        }

        $stmt = $pdo->prepare("SELECT * FROM enseignants $where ORDER BY nom, prenom");
        $stmt->execute($params);
        echo json_encode(["succes" => true, "data" => $stmt->fetchAll()]);
    }
}

// ============================================================
function creerEnseignant($donnees) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (empty($donnees['nom']) || empty($donnees['prenom']) || empty($donnees['email'])) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "Nom, prénom et email requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    // Générer un matricule automatique
    $matricule = "ENS" . str_pad(rand(1, 999), 3, "0", STR_PAD_LEFT);

    $stmt = $pdo->prepare("
        INSERT INTO enseignants
        (matricule, nom, prenom, email, specialite, statut, taux_horaire, telephone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $matricule,
        $donnees['nom'],
        $donnees['prenom'],
        $donnees['email'],
        $donnees['specialite']   ?? null,
        $donnees['statut']       ?? 'vacataire',
        $donnees['taux_horaire'] ?? 6500.00,
        $donnees['telephone']    ?? null
    ]);

    // Créer aussi un compte utilisateur pour l'enseignant
    $mot_de_passe_hash = password_hash("password", PASSWORD_BCRYPT);
    $id_enseignant     = $pdo->lastInsertId();

    $stmt2 = $pdo->prepare("
        INSERT INTO utilisateurs (email, mot_de_passe_hash, role, id_lien, actif)
        VALUES (?, ?, 'enseignant', ?, 1)
    ");
    $stmt2->execute([$donnees['email'], $mot_de_passe_hash, $id_enseignant]);

    http_response_code(201);
    echo json_encode([
        "succes"  => true,
        "message" => "Enseignant créé avec succès.",
        "id"      => $id_enseignant,
        "matricule" => $matricule
    ]);
}

// ============================================================
function modifierEnseignant($id, $donnees) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $stmt = $pdo->prepare("
        UPDATE enseignants
        SET nom = ?, prenom = ?, email = ?, specialite = ?,
            statut = ?, taux_horaire = ?, telephone = ?
        WHERE id = ?
    ");
    $stmt->execute([
        $donnees['nom'],
        $donnees['prenom'],
        $donnees['email'],
        $donnees['specialite']   ?? null,
        $donnees['statut']       ?? 'vacataire',
        $donnees['taux_horaire'] ?? 6500.00,
        $donnees['telephone']    ?? null,
        $id
    ]);

    echo json_encode(["succes" => true, "message" => "Enseignant modifié avec succès."]);
}

// ============================================================
function supprimerEnseignant($id) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $stmt = $pdo->prepare("DELETE FROM enseignants WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["succes" => true, "message" => "Enseignant supprimé avec succès."]);
}
