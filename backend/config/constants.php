<?php
// ============================================================
//  EduTrack Pro — Configuration CORS et constantes
//  Fichier : backend/config/constants.php
//  Description : Headers CORS + constantes globales du projet
// ============================================================

// --- Headers CORS ---
// Permet à React (frontend) de communiquer avec PHP (backend)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 3600");

// Gérer les requêtes OPTIONS (pre-flight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Constantes JWT ---
define("JWT_SECRET",     "EduTrackPro_2025_CleSecrete_ISGE"); // Change cette clé !
define("JWT_EXPIRATION", 86400);   // Durée du token : 24h en secondes

// --- Constantes QR-Code ---
define("QR_FENETRE_MINUTES", 15);  // Fenêtre de validité QR : ±15 minutes
define("QR_SECRET",     "QR_EduTrack_2025_ISGE");             // Clé de chiffrement QR

// --- Constantes application ---
define("APP_NOM",        "EduTrack Pro");
define("APP_VERSION",    "1.0.0");
define("ANNEE_ACADEMIQUE", "2025-2026");

// --- Taux de retenue (vacation) ---
define("TAUX_RETENUE",   0.05);    // 5% de retenue sur le montant brut
