<?php
// ============================================================
//  EduTrack Pro — Authentification JWT
//  Fichier : backend/middleware/auth_jwt.php
//  Description : Génération et vérification des tokens JWT
// ============================================================

require_once __DIR__ . '/../config/constants.php';

class AuthJWT {

    // --- Générer un token JWT ---
    public static function genererToken($donnees) {
        // 1. Header
        $header = base64_encode(json_encode([
            "alg" => "HS256",
            "typ" => "JWT"
        ]));

        // 2. Payload (données utilisateur)
        $payload = base64_encode(json_encode([
            "id"    => $donnees['id'],
            "email" => $donnees['email'],
            "role"  => $donnees['role'],
            "exp"   => time() + JWT_EXPIRATION
        ]));

        // 3. Signature
        $signature = base64_encode(hash_hmac(
            'sha256',
            "$header.$payload",
            JWT_SECRET,
            true
        ));

        return "$header.$payload.$signature";
    }

    // --- Vérifier un token JWT ---
    public static function verifierToken($token) {
        // Découper le token en 3 parties
        $parties = explode('.', $token);
        if (count($parties) !== 3) {
            return null;
        }

        [$header, $payload, $signature] = $parties;

        // Vérifier la signature
        $sig_valide = base64_encode(hash_hmac(
            'sha256',
            "$header.$payload",
            JWT_SECRET,
            true
        ));

        if ($signature !== $sig_valide) {
            return null; // Token falsifié
        }

        // Décoder le payload
        $donnees = json_decode(base64_decode($payload), true);

        // Vérifier l'expiration
        if ($donnees['exp'] < time()) {
            return null; // Token expiré
        }

        return $donnees;
    }

    // --- Extraire le token du header Authorization ---
    public static function extraireToken() {
        $headers = apache_request_headers();

        if (!isset($headers['Authorization'])) {
            return null;
        }

        // Format attendu : "Bearer {token}"
        $auth = $headers['Authorization'];
        if (!str_starts_with($auth, 'Bearer ')) {
            return null;
        }

        return substr($auth, 7);
    }

    // --- Protéger une route (vérifier que l'utilisateur est connecté) ---
    public static function proteger($roles_autorises = []) {
        $token = self::extraireToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode([
                "succes"  => false,
                "message" => "Token manquant. Veuillez vous connecter."
            ]);
            exit();
        }

        $utilisateur = self::verifierToken($token);

        if (!$utilisateur) {
            http_response_code(401);
            echo json_encode([
                "succes"  => false,
                "message" => "Token invalide ou expiré."
            ]);
            exit();
        }

        // Vérifier le rôle si nécessaire
        if (!empty($roles_autorises) &&
            !in_array($utilisateur['role'], $roles_autorises)) {
            http_response_code(403);
            echo json_encode([
                "succes"  => false,
                "message" => "Accès refusé. Rôle insuffisant."
            ]);
            exit();
        }

        return $utilisateur;
    }
}
