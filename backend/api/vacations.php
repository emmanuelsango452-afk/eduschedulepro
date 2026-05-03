<?php
// ============================================================
//  EduTrack Pro — Endpoint Vacations & Paiements
//  Fichier : backend/api/vacations.php
// ============================================================

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth_jwt.php';

$methode = $_SERVER['REQUEST_METHOD'];
$action  = $_GET['action'] ?? '';
$id      = $_GET['id'] ?? null;
$donnees = json_decode(file_get_contents("php://input"), true);

if ($methode === 'GET' && !$action) {
    listerVacations();
} elseif ($methode === 'POST' && $action === 'generer') {
    genererVacation($donnees);
} elseif ($methode === 'POST' && $action === 'signer') {
    signerVacation($id, $donnees);
} elseif ($methode === 'POST' && $action === 'valider') {
    validerVacation($id, $donnees);
} elseif ($methode === 'POST' && $action === 'approuver') {
    approuverVacation($id, $donnees);
} else {
    http_response_code(405);
    echo json_encode(["succes" => false, "message" => "Méthode non autorisée."]);
}

// ============================================================
function listerVacations() {
    $utilisateur = AuthJWT::proteger();
    $db  = new Database();
    $pdo = $db->connecter();

    $where  = "WHERE 1=1";
    $params = [];

    if ($utilisateur['role'] === 'enseignant') {
        $where   .= " AND v.id_enseignant = (SELECT id FROM enseignants WHERE email = ?)";
        $params[] = $utilisateur['email'];
    } elseif (!empty($_GET['id_enseignant'])) {
        $where   .= " AND v.id_enseignant = ?";
        $params[] = $_GET['id_enseignant'];
    }
    if (!empty($_GET['mois'])) {
        $where   .= " AND v.mois = ?";
        $params[] = $_GET['mois'];
    }
    if (!empty($_GET['annee'])) {
        $where   .= " AND v.annee = ?";
        $params[] = $_GET['annee'];
    }

    $stmt = $pdo->prepare("
        SELECT v.*,
               CONCAT(e.prenom, ' ', e.nom) AS enseignant_nom,
               e.matricule, e.taux_horaire
        FROM vacations v
        JOIN enseignants e ON e.id = v.id_enseignant
        $where
        ORDER BY v.annee DESC, v.mois DESC
    ");
    $stmt->execute($params);
    echo json_encode(["succes" => true, "data" => $stmt->fetchAll()]);
}

// ============================================================
function genererVacation($donnees) {
    $utilisateur = AuthJWT::proteger(['administrateur', 'surveillant']);

    if (empty($donnees['id_enseignant']) || empty($donnees['mois']) || empty($donnees['annee'])) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "Enseignant, mois et année requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $stmt = $pdo->prepare("
        SELECT ct.id AS id_cahier, ct.heure_fin_reelle,
               cr.id AS id_creneau, cr.heure_debut, cr.heure_fin,
               e.taux_horaire
        FROM cahiers_texte ct
        JOIN creneaux cr ON cr.id = ct.id_creneau
        JOIN emploi_temps et ON et.id = cr.id_emploi_temps
        JOIN enseignants e ON e.id = cr.id_enseignant
        WHERE cr.id_enseignant = ?
        AND ct.statut = 'cloture'
        AND MONTH(ct.date_creation) = ?
        AND YEAR(ct.date_creation) = ?
    ");
    $stmt->execute([
        $donnees['id_enseignant'],
        $donnees['mois'],
        $donnees['annee']
    ]);
    $seances = $stmt->fetchAll();

    if (empty($seances)) {
        http_response_code(404);
        echo json_encode(["succes" => false, "message" => "Aucune séance clôturée trouvée pour ce mois."]);
        return;
    }

    $montant_brut   = 0;
    $lignes_details = [];

    foreach ($seances as $seance) {
        $debut   = strtotime($seance['heure_debut']);
        $fin     = strtotime($seance['heure_fin_reelle'] ?? $seance['heure_fin']);
        $duree   = round(($fin - $debut) / 3600, 2);
        $montant = $duree * $seance['taux_horaire'];

        $montant_brut   += $montant;
        $lignes_details[] = [
            'id_creneau'   => $seance['id_creneau'],
            'duree_heures' => $duree,
            'taux'         => $seance['taux_horaire'],
            'montant'      => $montant
        ];
    }

    $retenues    = $montant_brut * TAUX_RETENUE;
    $montant_net = $montant_brut - $retenues;

    $stmt2 = $pdo->prepare("
        INSERT INTO vacations
        (id_enseignant, mois, annee, montant_brut, retenues, montant_net, statut)
        VALUES (?, ?, ?, ?, ?, ?, 'generee')
    ");
    $stmt2->execute([
        $donnees['id_enseignant'],
        $donnees['mois'],
        $donnees['annee'],
        round($montant_brut, 2),
        round($retenues, 2),
        round($montant_net, 2)
    ]);
    $id_vacation = $pdo->lastInsertId();

    foreach ($lignes_details as $ligne) {
        $pdo->prepare("
            INSERT INTO vacation_lignes
            (id_vacation, id_creneau, duree_heures, taux, montant)
            VALUES (?, ?, ?, ?, ?)
        ")->execute([
            $id_vacation,
            $ligne['id_creneau'],
            $ligne['duree_heures'],
            $ligne['taux'],
            $ligne['montant']
        ]);
    }

    http_response_code(201);
    echo json_encode([
        "succes"       => true,
        "message"      => "Fiche de vacation générée avec succès.",
        "id"           => $id_vacation,
        "montant_brut" => round($montant_brut, 2),
        "retenues"     => round($retenues, 2),
        "montant_net"  => round($montant_net, 2),
        "nb_seances"   => count($seances)
    ]);
}

// ============================================================
function signerVacation($id, $donnees) {
    $utilisateur = AuthJWT::proteger(['enseignant']);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    // Vérifier que la fiche existe
    $stmt = $pdo->prepare("SELECT * FROM vacations WHERE id = ?");
    $stmt->execute([$id]);
    $vacation = $stmt->fetch();

    if (!$vacation) {
        http_response_code(404);
        echo json_encode(["succes" => false, "message" => "Fiche introuvable."]);
        return;
    }

    if ($vacation['statut'] !== 'generee') {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "Cette fiche ne peut plus être signée."]);
        return;
    }

    // Mettre à jour le statut
    $pdo->prepare("
        UPDATE vacations SET statut = 'signee_enseignant' WHERE id = ?
    ")->execute([$id]);

    // Enregistrer la signature
    if (!empty($donnees['signature_base64'])) {
        $pdo->prepare("
            INSERT INTO validations
            (id_vacation, id_validateur, role_validateur, visa_base64, commentaire)
            VALUES (?, ?, 'enseignant', ?, ?)
        ")->execute([
            $id,
            $utilisateur['id'],
            $donnees['signature_base64'],
            $donnees['commentaire'] ?? null
        ]);
    }

    echo json_encode([
        "succes"  => true,
        "message" => "Fiche signée par l'enseignant.",
        "statut"  => "signee_enseignant"
    ]);
}

// ============================================================
function validerVacation($id, $donnees) {
    $utilisateur = AuthJWT::proteger(['surveillant']);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $pdo->prepare("
        UPDATE vacations SET statut = 'validee_surveillant' WHERE id = ?
    ")->execute([$id]);

    $pdo->prepare("
        INSERT INTO validations
        (id_vacation, id_validateur, role_validateur, visa_base64, commentaire)
        VALUES (?, ?, 'surveillant', ?, ?)
    ")->execute([
        $id,
        $utilisateur['id'],
        $donnees['visa_base64']  ?? null,
        $donnees['commentaire']  ?? null
    ]);

    echo json_encode(["succes" => true, "message" => "Fiche validée par le surveillant."]);
}

// ============================================================
function approuverVacation($id, $donnees) {
    $utilisateur = AuthJWT::proteger(['comptable']);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["succes" => false, "message" => "ID requis."]);
        return;
    }

    $db  = new Database();
    $pdo = $db->connecter();

    $pdo->prepare("
        UPDATE vacations SET statut = 'approuvee_comptable' WHERE id = ?
    ")->execute([$id]);

    $pdo->prepare("
        INSERT INTO validations
        (id_vacation, id_validateur, role_validateur, commentaire)
        VALUES (?, ?, 'comptable', ?)
    ")->execute([
        $id,
        $utilisateur['id'],
        $donnees['commentaire'] ?? null
    ]);

    echo json_encode(["succes" => true, "message" => "Fiche approuvée. Paiement autorisé."]);
}
