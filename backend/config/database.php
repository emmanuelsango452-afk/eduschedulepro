<?php
// ============================================================
//  EduTrack Pro — Connexion à la base de données
//  Fichier : backend/config/database.php
//  Description : Classe de connexion MySQL avec PDO
// ============================================================

class Database {
    // Paramètres de connexion
    private $hote     = "localhost";
    private $nom_bdd  = "eduschedulepro";
    private $login    = "root";
    private $mdp      = "";         // Ton mot de passe WAMP ici
    private $connexion = null;

    // Méthode de connexion — retourne l'objet PDO
    public function connecter() {
        // Si pas encore connecté, on crée la connexion
        if ($this->connexion === null) {
            try {
                $this->connexion = new PDO(
                    "mysql:host=" . $this->hote .
                    ";dbname=" . $this->nom_bdd .
                    ";charset=utf8mb4",
                    $this->login,
                    $this->mdp
                );

                // Afficher les erreurs PDO sous forme d'exceptions
                $this->connexion->setAttribute(
                    PDO::ATTR_ERRMODE,
                    PDO::ERRMODE_EXCEPTION
                );

                // Retourner les résultats sous forme de tableau associatif
                $this->connexion->setAttribute(
                    PDO::ATTR_DEFAULT_FETCH_MODE,
                    PDO::FETCH_ASSOC
                );

            } catch (PDOException $e) {
                // En cas d'erreur, on retourne un message JSON
                http_response_code(500);
                echo json_encode([
                    "succes"  => false,
                    "message" => "Erreur de connexion : " . $e->getMessage()
                ]);
                exit();
            }
        }

        return $this->connexion;
    }
}
