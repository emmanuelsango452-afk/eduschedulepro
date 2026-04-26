<?php
// ============================================================
//  EduTrack Pro — Endpoint Cahiers de Texte
//  Fichier : backend/api/cahiers.php
// ============================================================

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth_jwt.php';

$methode = $_SERVER['REQUEST_METHOD'];
$action  = $_GET['action'] ?? '';
$id      = $_GET['id'] ?? null;
$donnees = json_decode(file_get_contents("php://input"), true);

if ($methode === 'GET') {
    listerCahiers($id);
} elseif ($methode === 'POST' && !$id) {
    creerCahier($donnees);
} elseif ($methode === 'POST' && $action === 'signer') {
    signerCahier($id, $donnees);
} elseif ($methode === 'POST' && $action === 'cloture') {
    cloturerSeance($id, $donnees);
} elseif ($methode === 'PUT') {
    modifierCahier($id, $donnees);
} elseif ($methode === 'DELETE') {
    supprimerCahier($id);
} else {
    http_response_code(405);
    echo json_encode(["succes" => false, "message" => "Méthode non autorisée."]);
}

// ============================================================
function listerCahiers($id) {
    $utilisateur = AuthJWT::proteger();
    $db  = new Database();
    $pdo = $db->connecter();

    if ($id) {
        $stmt = $pdo->prepare("
            SELECT ct.*,
                   m.libelle AS matiere,
                   c.libelle AS classe,
                   CONCAT(e.prenom, ' ', e.nom) AS enseignant
            FROM cahiers_texte ct
            JOIN creneaux cr ON cr.id = ct.id_creneau
            JOIN emploi_temps et ON et.id = cr.id_emploi_temps
            JOIN matieres m ON m.id = cr.id_matiere
            JOIN classes c ON c.id = et.id_classe
            JOIN enseignants e ON e.id = cr.id_enseignant
            WHERE ct.id = ?
        ");
        $stmt->execute([$id]);
        $cahier = $stmt->fetch();

        if (!$cahier) {
            http_response_code(404);
            echo json_encode(["succes" => false, "message" => "Cahier introuvable."]);
            return;
        }

        $stmt2 = $pdo->prepare("SELECT * FROM signatures WHERE id_cahier = ?");
        $stmt2->execute([$id]);
        $cahier['signatures'] = $stmt2->fetchAll();

        $stmt3 = $pdo->prepare("SELECT * FROM travaux_demandes WHERE id_cahier = ?");
        $stmt3->execute([$id]);
        $cahier['travaux'] = $stmt3->fetchAll();

        $cahier['contenu_json'] = json_decode($cahier['contenu_json'], true);
        echo json_encode(["succes" => true, "data" => $cahier]);
    } else {
        $where  = "WHERE 1=1";
        $params = [];

        if (!empty($_GET['id_creneau'])) {
            $where   .= " AND ct.id_creneau = ?";
            $params[] = $_GET['id_creneau'];
        }
        if (!empty($_GET['id_classe'])) {
            $where   .= " AND et.id_classe = ?";
            $params[] = $_GET['id_classe'];
        }
        if (!empty($_GET['mois'])) {
            $where   .= " AND MONTH(ct.date_creation) = ?";
            $params[] = $_GET['mois'];
        }

        $stmt = $pdo->prepare("
            SELECT ct.id, ct.titre_cours, ct.statut, ct.date_creation,
                   ct.niveau_avancement, ct.heure_fin_reelle, ct.contenu_json,
                   m.libelle AS matiere, c.libelle AS classe,
                   CONCAT(e.prenom, ' ', e.nom) AS enseignant
            FROM cahiers_texte ct
            JOIN creneaux cr ON cr.id = ct.id_creneau
            JOIN emploi_temps et ON et.id = cr.id_emploi_temps
            JOIN matieres m ON m.id = cr.id_matiere
            JOIN classes c ON c.id = et.id_classe
            JOIN enseignants e ON e.id = cr.id_enseignant
            $where
            ORDER BY ct.date_creation DESC
        ");
        $stmt->execute($params);
        $cahiers = $stmt->fetchAll();

        foreach ($cahiers as &$cahier) {
            $cahier['contenu_json'] = json_decode($cahier['contenu_json'], true);
        }

        echo json_encode(["succes" => true, "data" => $cahiers]);
    }
}

// ============================================================
function creerCahier($donnees) {
    $utilisateur = AuthJWT::proteger();

    if (empty($donnees['id_creneau'])) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID créneau requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $stmt = $pdo->prepare("SELECT id FROM cahiers_texte WHERE id_creneau = ?");
    $stmt->execute([$donnees['id_creneau']]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(["succes" => false, "message" => "Un cahier existe déjà pour ce créneau."]);
        return;
    }

    $stmt2 = $pdo->prepare("
        INSERT INTO cahiers_texte
        (id_creneau, id_delegue, titre_cours, contenu_json, niveau_avancement, statut)
        VALUES (?, ?, ?, ?, ?, 'brouillon')
    ");
    $stmt2->execute([
        $donnees['id_creneau'],
        $utilisateur['id'],
        $donnees['titre_cours']       ?? null,
        json_encode($donnees['contenu_json'] ?? []),
        $donnees['niveau_avancement'] ?? null
    ]);

    $id_cahier = $pdo->lastInsertId();

    if (!empty($donnees['travaux'])) {
        foreach ($donnees['travaux'] as $travail) {
            $pdo->prepare("
                INSERT INTO travaux_demandes (id_cahier, description, date_limite, type)
                VALUES (?, ?, ?, ?)
            ")->execute([
                $id_cahier,
                $travail['description'],
                $travail['date_limite'] ?? null,
                $travail['type']        ?? 'exercice'
            ]);
        }
    }

    http_response_code(201);
    echo json_encode([
        "succes"  => true,
        "message" => "Cahier de texte créé avec succès.",
        "id"      => $id_cahier
    ]);
}

// ============================================================
function signerCahier($id, $donnees) {
    $utilisateur = AuthJWT::proteger();

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $stmt = $pdo->prepare("SELECT * FROM cahiers_texte WHERE id = ?");
    $stmt->execute([$id]);
    $cahier = $stmt->fetch();

    if (!$cahier) {
        http_response_code(404);
        echo json_encode(["succes" => false, "message" => "Cahier introuvable."]);
        return;
    }

    if ($cahier['statut'] === 'cloture') {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "Cahier déjà clôturé."]);
        return;
    }

    $type = $donnees['type'] ?? 'delegue';

    $pdo->prepare("DELETE FROM signatures WHERE id_cahier = ? AND type_signataire = ?")
        ->execute([$id, $type]);

    $pdo->prepare("
        INSERT INTO signatures (id_cahier, type_signataire, id_utilisateur, signature_base64, date_signature)
        VALUES (?, ?, ?, ?, NOW())
    ")->execute([
        $id,
        $type,
        $utilisateur['id'],
        $donnees['signature_base64'] ?? null
    ]);

    $pdo->prepare("UPDATE cahiers_texte SET statut = 'signe_delegue' WHERE id = ?")
        ->execute([$id]);

    echo json_encode([
        "succes"  => true,
        "message" => "Signature enregistrée avec succès.",
        "statut"  => "signe_delegue"
    ]);
}

// ============================================================
function cloturerSeance($id, $donnees) {
    $utilisateur = AuthJWT::proteger();

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $stmt = $pdo->prepare("SELECT * FROM cahiers_texte WHERE id = ?");
    $stmt->execute([$id]);
    $cahier = $stmt->fetch();

    if (!$cahier) {
        http_response_code(404);
        echo json_encode(["succes" => false, "message" => "Cahier introuvable."]);
        return;
    }

    $pdo->prepare("
        UPDATE cahiers_texte
        SET heure_fin_reelle = ?, statut = 'cloture'
        WHERE id = ?
    ")->execute([
        $donnees['heure_fin'] ?? date('H:i:s'),
        $id
    ]);

    if (!empty($donnees['signature_base64'])) {
        $pdo->prepare("DELETE FROM signatures WHERE id_cahier = ? AND type_signataire = 'enseignant'")
            ->execute([$id]);
        $pdo->prepare("
            INSERT INTO signatures (id_cahier, type_signataire, id_utilisateur, signature_base64, date_signature)
            VALUES (?, 'enseignant', ?, ?, NOW())
        ")->execute([$id, $utilisateur['id'], $donnees['signature_base64']]);
    }

    echo json_encode([
        "succes"  => true,
        "message" => "Séance clôturée avec succès.",
        "statut"  => "cloture"
    ]);
}

// ============================================================
function modifierCahier($id, $donnees) {
    $utilisateur = AuthJWT::proteger();

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $stmt = $pdo->prepare("SELECT statut FROM cahiers_texte WHERE id = ?");
    $stmt->execute([$id]);
    $cahier = $stmt->fetch();

    if (!$cahier) {
        http_response_code(404);
        echo json_encode(["succes" => false, "message" => "Cahier introuvable."]);
        return;
    }

    if ($cahier['statut'] === 'cloture') {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "Cahier clôturé, modification impossible."]);
        return;
    }

    $pdo->prepare("
        UPDATE cahiers_texte
        SET titre_cours = ?, contenu_json = ?,
            niveau_avancement = ?, heure_fin_reelle = ?
        WHERE id = ?
    ")->execute([
        $donnees['titre_cours']       ?? null,
        json_encode($donnees['contenu_json'] ?? []),
        $donnees['niveau_avancement'] ?? null,
        $donnees['heure_fin']         ?? null,
        $id
    ]);

    echo json_encode(["succes" => true, "message" => "Cahier modifié avec succès."]);
}

// ============================================================
function supprimerCahier($id) {
    $utilisateur = AuthJWT::proteger(['administrateur']);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $pdo->prepare("DELETE FROM signatures WHERE id_cahier = ?")->execute([$id]);
    $pdo->prepare("DELETE FROM travaux_demandes WHERE id_cahier = ?")->execute([$id]);
    $pdo->prepare("DELETE FROM cahiers_texte WHERE id = ?")->execute([$id]);

    echo json_encode(["succes" => true, "message" => "Cahier supprimé avec succès."]);
}
