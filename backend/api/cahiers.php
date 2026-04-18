<?php
// ============================================================
//  EduTrack Pro — Endpoint Cahiers de Texte
//  Fichier : backend/api/cahiers.php
//  Routes :
//    GET  /api/cahiers?id_creneau=X  → Liste/détail cahiers
//    POST /api/cahiers               → Créer un cahier
//    PUT  /api/cahiers?id=X          → Modifier un cahier
//    POST /api/cahiers?id=X&action=signer  → Signer
//    POST /api/cahiers?id=X&action=cloture → Clôturer
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
        // Détail complet d'un cahier avec signatures et travaux
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

        // Récupérer les signatures
        $stmt2 = $pdo->prepare("SELECT * FROM signatures WHERE id_cahier = ?");
        $stmt2->execute([$id]);
        $cahier['signatures'] = $stmt2->fetchAll();

        // Récupérer les travaux
        $stmt3 = $pdo->prepare("SELECT * FROM travaux_demandes WHERE id_cahier = ?");
        $stmt3->execute([$id]);
        $cahier['travaux'] = $stmt3->fetchAll();

        // Décoder le contenu JSON
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
        echo json_encode(["succes" => true, "data" => $stmt->fetchAll()]);
    }
}

// ============================================================
function creerCahier($donnees) {
    $utilisateur = AuthJWT::proteger(['delegue']);

    if (empty($donnees['id_creneau'])) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID créneau requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $stmt = $pdo->prepare("
        INSERT INTO cahiers_texte
        (id_creneau, id_delegue, titre_cours, contenu_json,
         niveau_avancement, statut)
        VALUES (?, ?, ?, ?, ?, 'brouillon')
    ");
    $stmt->execute([
        $donnees['id_creneau'],
        $utilisateur['id'],
        $donnees['titre_cours']        ?? null,
        json_encode($donnees['contenu_json'] ?? []),
        $donnees['niveau_avancement']  ?? null
    ]);

    $id_cahier = $pdo->lastInsertId();

    // Ajouter les travaux si fournis
    if (!empty($donnees['travaux'])) {
        foreach ($donnees['travaux'] as $travail) {
            $pdo->prepare("
                INSERT INTO travaux_demandes (id_cahier, description, date_limite, type)
                VALUES (?, ?, ?, ?)
            ")->execute([
                $id_cahier,
                $travail['description'],
                $travail['date_limite'] ?? null,
                $travail['type'] ?? 'exercice'
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
    $utilisateur = AuthJWT::proteger(['delegue', 'enseignant']);

    if (!$id || empty($donnees['signature_base64']) || empty($donnees['type'])) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID, signature et type requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    // Vérifier que le cahier existe
    $stmt = $pdo->prepare("SELECT * FROM cahiers_texte WHERE id = ?");
    $stmt->execute([$id]);
    $cahier = $stmt->fetch();

    if (!$cahier || $cahier['statut'] === 'cloture') {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "Cahier introuvable ou déjà clôturé."]);
        return;
    }

    // Enregistrer la signature
    $stmt2 = $pdo->prepare("
        INSERT INTO signatures (id_cahier, type_signataire, id_utilisateur, signature_base64)
        VALUES (?, ?, ?, ?)
    ");
    $stmt2->execute([
        $id,
        $donnees['type'],
        $utilisateur['id'],
        $donnees['signature_base64']
    ]);

    // Mettre à jour le statut du cahier
    $nouveau_statut = $donnees['type'] === 'delegue' ? 'signe_delegue' : 'signe_delegue';
    $pdo->prepare("UPDATE cahiers_texte SET statut = ? WHERE id = ?")
        ->execute([$nouveau_statut, $id]);

    echo json_encode(["succes" => true, "message" => "Signature enregistrée avec succès."]);
}

// ============================================================
function cloturerSeance($id, $donnees) {
    $utilisateur = AuthJWT::proteger(['enseignant']);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    // Enregistrer l'heure de fin et clôturer
    $pdo->prepare("
        UPDATE cahiers_texte
        SET heure_fin_reelle = ?, statut = 'cloture'
        WHERE id = ?
    ")->execute([
        $donnees['heure_fin'] ?? date('H:i:s'),
        $id
    ]);

    // Enregistrer la signature de l'enseignant si fournie
    if (!empty($donnees['signature_base64'])) {
        $pdo->prepare("
            INSERT INTO signatures (id_cahier, type_signataire, id_utilisateur, signature_base64)
            VALUES (?, 'enseignant', ?, ?)
        ")->execute([$id, $utilisateur['id'], $donnees['signature_base64']]);
    }

    echo json_encode(["succes" => true, "message" => "Séance clôturée avec succès."]);
}

// ============================================================
function modifierCahier($id, $donnees) {
    $utilisateur = AuthJWT::proteger(['delegue']);

    $db  = new Database();
    $pdo = $db->connecter();

    // Vérifier que le cahier est encore en brouillon
    $stmt = $pdo->prepare("SELECT statut FROM cahiers_texte WHERE id = ?");
    $stmt->execute([$id]);
    $cahier = $stmt->fetch();

    if (!$cahier || $cahier['statut'] !== 'brouillon') {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "Cahier non modifiable."]);
        return;
    }

    $pdo->prepare("
        UPDATE cahiers_texte
        SET titre_cours = ?, contenu_json = ?, niveau_avancement = ?
        WHERE id = ?
    ")->execute([
        $donnees['titre_cours']       ?? null,
        json_encode($donnees['contenu_json'] ?? []),
        $donnees['niveau_avancement'] ?? null,
        $id
    ]);

    echo json_encode(["succes" => true, "message" => "Cahier modifié avec succès."]);
}
