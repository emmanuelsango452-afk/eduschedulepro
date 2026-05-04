-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 04 mai 2026 à 16:47
-- Version du serveur : 8.4.7
-- Version de PHP : 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `eduschedulepro`
--

-- --------------------------------------------------------

--
-- Structure de la table `cahiers_texte`
--

DROP TABLE IF EXISTS `cahiers_texte`;
CREATE TABLE IF NOT EXISTS `cahiers_texte` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_creneau` int NOT NULL,
  `id_delegue` int NOT NULL,
  `titre_cours` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contenu_json` json DEFAULT NULL,
  `niveau_avancement` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `heure_fin_reelle` time DEFAULT NULL,
  `statut` enum('brouillon','signe_delegue','cloture') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'brouillon',
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_creneau` (`id_creneau`),
  KEY `id_delegue` (`id_delegue`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `cahiers_texte`
--

INSERT INTO `cahiers_texte` (`id`, `id_creneau`, `id_delegue`, `titre_cours`, `contenu_json`, `niveau_avancement`, `heure_fin_reelle`, `statut`, `date_creation`) VALUES
(1, 1, 5, 'Introduction aux protocoles TCP/IP', '{\"points\": [\"Modèle OSI\", \"Protocole IP\", \"Adressage IPv4\"]}', 'Chapitre 2 / 5 — 40%', '10:05:00', 'cloture', '2026-04-20 21:35:13'),
(2, 2, 5, 'Développement Web — HTML5 et CSS3', '{\"points\": [\"Structure HTML\", \"Sélecteurs CSS\", \"Flexbox\"]}', 'Chapitre 1 / 4 — 25%', '12:25:00', 'cloture', '2026-04-20 21:35:13'),
(3, 3, 6, 'Programmation Orientée Objet — Classes', '{\"points\": [\"Classes et objets\", \"Héritage\", \"Polymorphisme\"]}', 'Chapitre 3 / 6 — 50%', '12:30:00', 'cloture', '2026-04-20 21:35:13'),
(4, 6, 5, NULL, '[]', NULL, '16:45:27', 'cloture', '2026-04-26 16:43:59'),
(5, 7, 5, '', '{\"points\": [], \"observations\": \"\"}', '', '16:49:06', 'cloture', '2026-04-26 16:48:05'),
(6, 13, 5, 'Intelligence artificielle', '{\"points\": [], \"observations\": \"2 absences\"}', 'chapitre 2', '18:57:59', 'cloture', '2026-05-03 18:56:28'),
(7, 20, 5, NULL, '[]', NULL, '19:21:21', 'cloture', '2026-05-03 19:20:57'),
(8, 17, 5, NULL, '[]', NULL, '19:21:58', 'cloture', '2026-05-03 19:21:43'),
(9, 24, 5, NULL, '[]', NULL, '19:25:31', 'cloture', '2026-05-03 19:24:56');

-- --------------------------------------------------------

--
-- Structure de la table `classes`
--

DROP TABLE IF EXISTS `classes`;
CREATE TABLE IF NOT EXISTS `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `niveau` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `annee_academique` varchar(9) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `classes`
--

INSERT INTO `classes` (`id`, `code`, `libelle`, `niveau`, `annee_academique`, `created_at`) VALUES
(1, 'L1-RST', 'Licence 1 Réseaux et Télécoms', 'Licence', '2025-2026', '2026-04-15 23:50:22'),
(2, 'L2-RST', 'Licence 2 Réseaux et Télécoms', 'Licence', '2025-2026', '2026-04-15 23:50:22'),
(3, 'L3-INFO', 'Licence 3 Informatique', 'Licence', '2025-2026', '2026-04-15 23:50:22'),
(4, 'L2-MSI', 'Licence ', 'Master', '2025-2026', '2026-04-23 20:03:15'),
(5, 'L1-MI', 'Licence maintenance', 'Master', '2025-2026', '2026-04-23 20:06:28');

-- --------------------------------------------------------

--
-- Structure de la table `creneaux`
--

DROP TABLE IF EXISTS `creneaux`;
CREATE TABLE IF NOT EXISTS `creneaux` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_emploi_temps` int NOT NULL,
  `id_matiere` int NOT NULL,
  `id_enseignant` int NOT NULL,
  `id_salle` int NOT NULL,
  `jour` enum('Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi') COLLATE utf8mb4_unicode_ci NOT NULL,
  `heure_debut` time NOT NULL,
  `heure_fin` time NOT NULL,
  `qr_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_expire` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `qr_token` (`qr_token`),
  KEY `id_emploi_temps` (`id_emploi_temps`),
  KEY `id_matiere` (`id_matiere`),
  KEY `id_enseignant` (`id_enseignant`),
  KEY `id_salle` (`id_salle`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `creneaux`
--

INSERT INTO `creneaux` (`id`, `id_emploi_temps`, `id_matiere`, `id_enseignant`, `id_salle`, `jour`, `heure_debut`, `heure_fin`, `qr_token`, `qr_expire`, `created_at`) VALUES
(1, 1, 1, 1, 1, 'Lundi', '08:00:00', '10:00:00', 'TOKEN_1_TEST', '2027-04-27 09:32:06', '2026-04-15 23:50:23'),
(2, 1, 2, 2, 3, 'Lundi', '10:30:00', '12:30:00', 'TOKEN_2_TEST', '2027-04-27 09:32:06', '2026-04-15 23:50:23'),
(3, 1, 4, 5, 3, 'Mardi', '08:00:00', '10:00:00', 'TOKEN_3_TEST', '2027-04-27 09:32:06', '2026-04-15 23:50:23'),
(4, 1, 3, 3, 1, 'Mercredi', '10:30:00', '12:30:00', 'TOKEN_4_TEST', '2027-04-27 09:32:06', '2026-04-15 23:50:23'),
(5, 1, 5, 4, 1, 'Jeudi', '14:00:00', '16:00:00', 'TOKEN_5_TEST', '2027-04-27 09:32:06', '2026-04-15 23:50:23'),
(6, 2, 1, 1, 2, 'Lundi', '14:00:00', '16:00:00', 'TOKEN_6_TEST', '2027-04-27 09:32:06', '2026-04-15 23:50:23'),
(7, 2, 3, 3, 2, 'Mardi', '10:30:00', '12:30:00', 'TOKEN_7_TEST', '2027-04-27 09:32:06', '2026-04-15 23:50:23'),
(9, 1, 6, 3, 5, 'Vendredi', '08:00:00', '10:00:00', 'TOKEN_9_TEST', '2027-04-27 09:32:06', '2026-04-23 20:10:43'),
(10, 3, 6, 4, 4, 'Mercredi', '08:00:00', '10:00:00', 'TOKEN_10_TEST', '2027-04-27 09:32:06', '2026-04-26 17:19:45'),
(11, 4, 2, 1, 4, 'Vendredi', '08:00:00', '10:00:00', 'TOKEN_11_TEST', '2027-04-27 09:34:32', '2026-04-26 17:20:26'),
(12, 3, 5, 6, 3, 'Samedi', '08:00:00', '10:00:00', 'TOKEN_12_TEST', '2027-04-27 09:32:06', '2026-04-26 17:21:39'),
(13, 5, 6, 6, 5, 'Lundi', '08:00:00', '10:00:00', 'TOKEN_13_TEST', '2027-04-27 09:32:06', '2026-04-27 09:12:23'),
(14, 5, 2, 1, 2, 'Mercredi', '08:00:00', '10:00:00', 'TOKEN_14_TEST', '2027-04-27 09:32:06', '2026-04-27 09:24:05'),
(15, 5, 2, 1, 2, 'Vendredi', '08:00:00', '10:00:00', 'TOKEN_15_TEST', '2027-04-27 09:35:26', '2026-04-27 09:35:26'),
(16, 6, 6, 2, 1, 'Samedi', '08:00:00', '10:00:00', 'TOKEN_16_TEST', '2027-04-27 09:38:33', '2026-04-27 09:38:33'),
(17, 7, 6, 4, 3, 'Jeudi', '08:00:00', '10:00:00', 'TOKEN_17_TEST', '2027-04-27 09:38:52', '2026-04-27 09:38:52'),
(18, 6, 6, 3, 1, 'Mardi', '08:00:00', '10:00:00', 'TOKEN_18_TEST', '2027-04-27 09:39:30', '2026-04-27 09:39:30'),
(20, 8, 2, 1, 2, 'Mercredi', '08:00:00', '10:00:00', 'TOKEN_20_TEST', '2027-04-30 09:03:08', '2026-04-30 09:03:08'),
(21, 8, 2, 1, 2, 'Vendredi', '08:00:00', '10:00:00', 'TOKEN_21_TEST', '2027-04-30 09:03:08', '2026-04-30 09:03:08'),
(22, 8, 2, 1, 1, 'Lundi', '08:00:00', '10:00:00', 'TOKEN_22_TEST', '2027-05-03 18:17:37', '2026-05-03 18:17:37'),
(23, 8, 6, 6, 5, 'Mardi', '08:00:00', '10:00:00', 'TOKEN_23_TEST', '2027-05-03 18:19:51', '2026-05-03 18:19:51'),
(24, 9, 4, 5, 3, 'Lundi', '08:00:00', '10:00:00', 'TOKEN_24_TEST', '2027-05-03 19:22:59', '2026-05-03 19:22:59');

-- --------------------------------------------------------

--
-- Structure de la table `emploi_temps`
--

DROP TABLE IF EXISTS `emploi_temps`;
CREATE TABLE IF NOT EXISTS `emploi_temps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_classe` int NOT NULL,
  `semaine_debut` date NOT NULL,
  `statut_publication` enum('brouillon','publie') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'brouillon',
  `cree_par` int NOT NULL,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_planning` (`id_classe`,`semaine_debut`),
  KEY `cree_par` (`cree_par`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `emploi_temps`
--

INSERT INTO `emploi_temps` (`id`, `id_classe`, `semaine_debut`, `statut_publication`, `cree_par`, `date_creation`) VALUES
(1, 1, '2026-04-14', 'publie', 1, '2026-04-15 23:50:23'),
(2, 2, '2026-04-14', 'publie', 1, '2026-04-15 23:50:23'),
(3, 4, '2026-04-14', 'publie', 1, '2026-04-26 17:19:45'),
(4, 5, '2026-04-14', 'publie', 1, '2026-04-26 17:20:19'),
(5, 1, '2026-04-27', 'publie', 1, '2026-04-27 09:12:23'),
(6, 2, '2026-04-27', 'publie', 1, '2026-04-27 09:38:33'),
(7, 4, '2026-04-27', 'publie', 1, '2026-04-27 09:38:52'),
(8, 1, '2026-05-04', 'publie', 1, '2026-04-30 09:03:08'),
(9, 4, '2026-05-04', 'publie', 1, '2026-05-03 19:22:59');

-- --------------------------------------------------------

--
-- Structure de la table `enseignants`
--

DROP TABLE IF EXISTS `enseignants`;
CREATE TABLE IF NOT EXISTS `enseignants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `matricule` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specialite` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('vacataire','permanent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'vacataire',
  `taux_horaire` decimal(10,2) NOT NULL DEFAULT '0.00',
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricule` (`matricule`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `enseignants`
--

INSERT INTO `enseignants` (`id`, `matricule`, `nom`, `prenom`, `email`, `specialite`, `statut`, `taux_horaire`, `telephone`, `created_at`) VALUES
(1, 'ENS001', 'BERE', 'Cédric', 'cbere@isge.bf', 'Réseaux', 'permanent', 8000.00, NULL, '2026-04-15 23:50:22'),
(2, 'ENS002', 'KABORE', 'Ibrahim', 'ikabore@isge.bf', 'Programmation', 'vacataire', 6500.00, NULL, '2026-04-15 23:50:22'),
(3, 'ENS003', 'TRAORE', 'Aminata', 'atraore@isge.bf', 'Bases de données', 'vacataire', 7000.00, NULL, '2026-04-15 23:50:22'),
(4, 'ENS004', 'OUEDRAOGO', 'Seydou', 'souedraogo@isge.bf', 'Sécurité', 'permanent', 8500.00, NULL, '2026-04-15 23:50:22'),
(5, 'ENS005', 'SOME', 'Patricia', 'psome@isge.bf', 'Développement Web', 'vacataire', 6500.00, NULL, '2026-04-15 23:50:22'),
(6, 'ENS876', 'Emmanuel', 'Sango', 'emmanuelsango452@gmail.com', 'trg', 'permanent', 4658.00, NULL, '2026-04-26 17:21:16');

-- --------------------------------------------------------

--
-- Structure de la table `logs_activite`
--

DROP TABLE IF EXISTS `logs_activite`;
CREATE TABLE IF NOT EXISTS `logs_activite` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_utilisateur` int DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details_json` json DEFAULT NULL,
  `ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_heure` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_utilisateur` (`id_utilisateur`),
  KEY `idx_action` (`action`),
  KEY `idx_date_heure` (`date_heure`)
) ENGINE=InnoDB AUTO_INCREMENT=178 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `logs_activite`
--

INSERT INTO `logs_activite` (`id`, `id_utilisateur`, `action`, `details_json`, `ip`, `date_heure`) VALUES
(1, 1, 'LOGIN', NULL, '::1', '2026-04-18 10:10:39'),
(2, 1, 'LOGIN', NULL, '::1', '2026-04-20 21:06:03'),
(3, 1, 'LOGIN', NULL, '::1', '2026-04-20 21:18:20'),
(4, 2, 'LOGIN', NULL, '::1', '2026-04-20 21:48:28'),
(5, 5, 'LOGIN', NULL, '::1', '2026-04-20 21:50:53'),
(6, 5, 'LOGIN', NULL, '::1', '2026-04-20 21:51:04'),
(7, 5, 'LOGIN', NULL, '::1', '2026-04-20 21:51:22'),
(8, 5, 'LOGIN', NULL, '::1', '2026-04-20 22:03:10'),
(9, 5, 'LOGIN', NULL, '::1', '2026-04-20 22:05:45'),
(10, 1, 'LOGIN', NULL, '::1', '2026-04-21 07:08:39'),
(11, 7, 'LOGIN', NULL, '::1', '2026-04-21 07:15:57'),
(12, 7, 'LOGIN', NULL, '::1', '2026-04-21 07:16:56'),
(13, 7, 'LOGIN', NULL, '::1', '2026-04-21 07:17:41'),
(14, 7, 'LOGIN', NULL, '::1', '2026-04-21 07:23:53'),
(15, 7, 'LOGIN', NULL, '::1', '2026-04-21 07:26:13'),
(16, 7, 'LOGIN', NULL, '::1', '2026-04-21 07:26:19'),
(17, 1, 'LOGIN', NULL, '::1', '2026-04-21 07:28:59'),
(18, 7, 'LOGIN', NULL, '::1', '2026-04-21 07:33:04'),
(19, 7, 'LOGIN', NULL, '::1', '2026-04-21 07:35:12'),
(20, 7, 'LOGIN', NULL, '::1', '2026-04-21 07:36:05'),
(21, 8, 'LOGIN', NULL, '::1', '2026-04-21 07:44:02'),
(22, 2, 'LOGIN', NULL, '::1', '2026-04-21 07:51:43'),
(23, 8, 'LOGIN', NULL, '::1', '2026-04-21 07:51:57'),
(24, 5, 'LOGIN', NULL, '::1', '2026-04-21 07:52:05'),
(25, 1, 'LOGIN', NULL, '::1', '2026-04-21 07:52:48'),
(26, 1, 'LOGIN', NULL, '::1', '2026-04-21 07:53:20'),
(27, 1, 'LOGIN', NULL, '::1', '2026-04-21 07:53:30'),
(28, 1, 'LOGIN', NULL, '::1', '2026-04-21 08:07:29'),
(29, 2, 'LOGIN', NULL, '::1', '2026-04-21 16:38:24'),
(30, 5, 'LOGIN', NULL, '::1', '2026-04-21 16:46:07'),
(31, 5, 'LOGIN', NULL, '::1', '2026-04-21 16:46:25'),
(32, 5, 'LOGIN', NULL, '::1', '2026-04-21 16:48:45'),
(33, 1, 'LOGIN', NULL, '::1', '2026-04-22 07:15:31'),
(34, 7, 'LOGIN', NULL, '::1', '2026-04-22 07:26:47'),
(35, 5, 'LOGIN', NULL, '::1', '2026-04-22 07:27:07'),
(36, 1, 'LOGIN', NULL, '::1', '2026-04-22 07:27:30'),
(37, 1, 'LOGIN', NULL, '::1', '2026-04-23 19:26:51'),
(38, 1, 'LOGIN', NULL, '::1', '2026-04-23 19:42:25'),
(39, 1, 'LOGIN', NULL, '::1', '2026-04-23 19:59:16'),
(40, 5, 'LOGIN', NULL, '::1', '2026-04-26 16:43:34'),
(41, 7, 'LOGIN', NULL, '::1', '2026-04-26 16:50:36'),
(42, 7, 'LOGIN', NULL, '::1', '2026-04-26 16:50:45'),
(43, 7, 'LOGIN', NULL, '::1', '2026-04-26 16:51:13'),
(44, 7, 'LOGIN', NULL, '::1', '2026-04-26 16:53:48'),
(45, 2, 'LOGIN', NULL, '::1', '2026-04-26 17:00:37'),
(46, 1, 'LOGIN', NULL, '::1', '2026-04-26 17:15:45'),
(47, 2, 'LOGIN', NULL, '::1', '2026-04-26 17:15:57'),
(48, 9, 'LOGIN', NULL, '::1', '2026-04-26 17:17:27'),
(49, 1, 'LOGIN', NULL, '::1', '2026-04-26 17:19:15'),
(50, 9, 'LOGIN', NULL, '::1', '2026-04-26 17:22:09'),
(51, 1, 'LOGIN', NULL, '::1', '2026-04-26 17:23:46'),
(52, 9, 'LOGIN', NULL, '::1', '2026-04-26 17:24:45'),
(53, 1, 'LOGIN', NULL, '::1', '2026-04-26 17:33:40'),
(54, 14, 'LOGIN', NULL, '::1', '2026-04-26 17:43:55'),
(55, 1, 'LOGIN', NULL, '::1', '2026-04-26 17:44:16'),
(56, 8, 'LOGIN', NULL, '::1', '2026-04-26 17:46:35'),
(57, 1, 'LOGIN', NULL, '::1', '2026-04-26 17:47:03'),
(58, 8, 'LOGIN', NULL, '::1', '2026-04-26 17:47:59'),
(59, 5, 'LOGIN', NULL, '::1', '2026-04-26 17:48:12'),
(60, 5, 'LOGIN', NULL, '::1', '2026-04-26 17:48:53'),
(61, 1, 'LOGIN', NULL, '::1', '2026-04-26 17:49:00'),
(62, 8, 'LOGIN', NULL, '::1', '2026-04-26 17:49:37'),
(63, 1, 'LOGIN', NULL, '::1', '2026-04-26 17:51:18'),
(64, 3, 'LOGIN', NULL, '::1', '2026-04-26 17:51:42'),
(65, 7, 'LOGIN', NULL, '::1', '2026-04-26 17:52:29'),
(66, 8, 'LOGIN', NULL, '::1', '2026-04-26 17:53:14'),
(67, 1, 'LOGIN', NULL, '::1', '2026-04-26 17:54:30'),
(68, 2, 'LOGIN', NULL, '::1', '2026-04-27 08:25:45'),
(69, 1, 'LOGIN', NULL, '::1', '2026-04-27 08:26:34'),
(70, 2, 'LOGIN', NULL, '::1', '2026-04-27 08:27:03'),
(71, 2, 'SCAN_QR', '{\"token\": \"abc123def4...\", \"statut\": \"echec\"}', '::1', '2026-04-27 08:27:11'),
(72, 1, 'LOGIN', NULL, '::1', '2026-04-27 08:28:47'),
(73, 2, 'LOGIN', NULL, '::1', '2026-04-27 08:29:10'),
(74, 2, 'SCAN_QR', '{\"token\": \"abc123def4...\", \"statut\": \"echec\"}', '::1', '2026-04-27 08:29:17'),
(75, 2, 'RETARD_POINTE', '{\"creneau_id\": 11, \"retard_minutes\": 35}', '::1', '2026-04-27 08:35:06'),
(76, 2, 'SCAN_QR', '{\"token\": \"TOKEN_TEST...\", \"statut\": \"retard\"}', '::1', '2026-04-27 08:35:06'),
(77, 1, 'LOGIN', NULL, '::1', '2026-04-27 08:48:56'),
(78, 1, 'LOGIN', NULL, '::1', '2026-04-27 08:50:48'),
(79, 1, 'LOGIN', NULL, '::1', '2026-04-27 08:51:48'),
(80, 16, 'LOGIN', NULL, '::1', '2026-04-27 08:52:40'),
(81, 16, 'RETARD_POINTE', '{\"creneau_id\": 3, \"retard_minutes\": 53}', '::1', '2026-04-27 08:52:50'),
(82, 16, 'SCAN_QR', '{\"token\": \"TOKEN_3_TE...\", \"statut\": \"retard\"}', '::1', '2026-04-27 08:52:50'),
(83, 1, 'LOGIN', NULL, '::1', '2026-04-27 08:53:02'),
(84, 11, 'LOGIN', NULL, '::1', '2026-04-27 09:13:38'),
(85, 11, 'SCAN_QR', '{\"token\": \"TOKEN_13_T...\", \"statut\": \"echec\"}', '::1', '2026-04-27 09:13:47'),
(86, 11, 'SCAN_QR', '{\"token\": \"TOKEN_13_T...\", \"statut\": \"echec\"}', '::1', '2026-04-27 09:13:54'),
(87, 1, 'LOGIN', NULL, '::1', '2026-04-27 09:14:04'),
(88, 11, 'LOGIN', NULL, '::1', '2026-04-27 09:14:53'),
(89, 11, 'SCAN_QR', '{\"token\": \"TOKEN_13_T...\", \"statut\": \"echec\"}', '::1', '2026-04-27 09:15:01'),
(90, 1, 'LOGIN', NULL, '::1', '2026-04-27 09:16:16'),
(91, 11, 'LOGIN', NULL, '::1', '2026-04-27 09:16:32'),
(92, 11, 'RETARD_POINTE', '{\"creneau_id\": 13, \"retard_minutes\": 77}', '::1', '2026-04-27 09:16:41'),
(93, 11, 'SCAN_QR', '{\"token\": \"TOKEN_13_T...\", \"statut\": \"retard\"}', '::1', '2026-04-27 09:16:41'),
(94, 1, 'LOGIN', NULL, '::1', '2026-04-27 09:23:42'),
(95, 2, 'LOGIN', NULL, '::1', '2026-04-27 09:24:22'),
(96, 2, 'RETARD_POINTE', '{\"creneau_id\": 14, \"retard_minutes\": 85}', '::1', '2026-04-27 09:24:33'),
(97, 2, 'SCAN_QR', '{\"token\": \"TOKEN_14_T...\", \"statut\": \"retard\"}', '::1', '2026-04-27 09:24:33'),
(98, 1, 'LOGIN', NULL, '::1', '2026-04-27 09:25:03'),
(99, 11, 'LOGIN', NULL, '::1', '2026-04-27 09:30:15'),
(100, 1, 'LOGIN', NULL, '::1', '2026-04-27 09:30:49'),
(101, 2, 'LOGIN', NULL, '::1', '2026-04-27 09:31:06'),
(102, 2, 'SCAN_QR', '{\"token\": \"TOKEN_14_T...\", \"statut\": \"echec\"}', '::1', '2026-04-27 09:31:11'),
(103, 2, 'SCAN_QR', '{\"token\": \"TOKEN_14_T...\", \"statut\": \"echec\"}', '::1', '2026-04-27 09:31:21'),
(104, 1, 'LOGIN', NULL, '::1', '2026-04-27 09:33:05'),
(105, 2, 'LOGIN', NULL, '::1', '2026-04-27 09:33:22'),
(106, 1, 'LOGIN', NULL, '::1', '2026-04-27 09:35:01'),
(107, 2, 'LOGIN', NULL, '::1', '2026-04-27 09:35:37'),
(108, 9, 'LOGIN', NULL, '::1', '2026-04-27 09:37:24'),
(109, 1, 'LOGIN', NULL, '::1', '2026-04-27 09:38:14'),
(110, 9, 'LOGIN', NULL, '::1', '2026-04-27 09:39:42'),
(111, 1, 'LOGIN', NULL, '::1', '2026-04-27 10:47:54'),
(112, 9, 'LOGIN', NULL, '::1', '2026-04-27 10:48:17'),
(113, 7, 'LOGIN', NULL, '::1', '2026-04-27 10:48:58'),
(114, 8, 'LOGIN', NULL, '::1', '2026-04-27 10:49:04'),
(115, 5, 'LOGIN', NULL, '::1', '2026-04-27 10:49:10'),
(116, 9, 'LOGIN', NULL, '::1', '2026-04-27 10:49:15'),
(117, 1, 'LOGIN', NULL, '::1', '2026-04-27 11:00:07'),
(118, 9, 'LOGIN', NULL, '::1', '2026-04-27 11:03:30'),
(119, 1, 'LOGIN', NULL, '::1', '2026-04-27 11:03:55'),
(120, 2, 'LOGIN', NULL, '::1', '2026-04-30 08:37:19'),
(121, 1, 'LOGIN', NULL, '::1', '2026-04-30 08:38:03'),
(122, 1, 'LOGIN', NULL, '::1', '2026-04-30 09:10:24'),
(123, 1, 'LOGIN', NULL, '::1', '2026-04-30 09:10:35'),
(124, 11, 'LOGIN', NULL, '::1', '2026-04-30 09:10:42'),
(125, 5, 'LOGIN', NULL, '::1', '2026-04-30 09:10:48'),
(126, 7, 'LOGIN', NULL, '::1', '2026-04-30 09:11:50'),
(127, 7, 'LOGIN', NULL, '::1', '2026-04-30 09:12:04'),
(128, 8, 'LOGIN', NULL, '::1', '2026-04-30 09:19:04'),
(129, 5, 'LOGIN', NULL, '::1', '2026-04-30 09:19:18'),
(130, 5, 'LOGIN', NULL, '::1', '2026-04-30 09:19:39'),
(131, 9, 'LOGIN', NULL, '::1', '2026-04-30 09:20:24'),
(132, 1, 'LOGIN', NULL, '::1', '2026-04-30 11:05:45'),
(133, 1, 'LOGIN', NULL, '::1', '2026-05-03 18:15:24'),
(134, 2, 'LOGIN', NULL, '::1', '2026-05-03 18:17:53'),
(135, 2, 'LOGIN', NULL, '::1', '2026-05-03 18:18:20'),
(136, 1, 'LOGIN', NULL, '::1', '2026-05-03 18:19:05'),
(137, 11, 'LOGIN', NULL, '::1', '2026-05-03 18:20:07'),
(138, 11, 'LOGIN', NULL, '::1', '2026-05-03 18:20:53'),
(139, 2, 'LOGIN', NULL, '::1', '2026-05-03 18:21:30'),
(140, 5, 'LOGIN', NULL, '::1', '2026-05-03 18:21:51'),
(141, 5, 'LOGIN', NULL, '::1', '2026-05-03 18:22:11'),
(142, 1, 'LOGIN', NULL, '::1', '2026-05-03 18:26:17'),
(143, 2, 'LOGIN', NULL, '::1', '2026-05-03 18:26:44'),
(144, 2, 'LOGIN', NULL, '::1', '2026-05-03 18:27:00'),
(145, 1, 'LOGIN', NULL, '::1', '2026-05-03 18:27:26'),
(146, 16, 'LOGIN', NULL, '::1', '2026-05-03 18:29:13'),
(147, 16, 'LOGIN', NULL, '::1', '2026-05-03 18:35:18'),
(148, 16, 'LOGIN', NULL, '::1', '2026-05-03 18:37:39'),
(149, 1, 'LOGIN', NULL, '::1', '2026-05-03 18:43:39'),
(150, 16, 'LOGIN', NULL, '::1', '2026-05-03 18:48:17'),
(151, 7, 'LOGIN', NULL, '::1', '2026-05-03 18:48:39'),
(152, 8, 'LOGIN', NULL, '::1', '2026-05-03 18:49:08'),
(153, 1, 'LOGIN', NULL, '::1', '2026-05-03 18:49:47'),
(154, 8, 'LOGIN', NULL, '::1', '2026-05-03 18:52:23'),
(155, 1, 'LOGIN', NULL, '::1', '2026-05-03 18:52:42'),
(156, 5, 'LOGIN', NULL, '::1', '2026-05-03 18:55:40'),
(157, 1, 'LOGIN', NULL, '::1', '2026-05-03 18:58:12'),
(158, 2, 'LOGIN', NULL, '::1', '2026-05-03 18:58:53'),
(159, 2, 'LOGIN', NULL, '::1', '2026-05-03 18:59:08'),
(160, 16, 'LOGIN', NULL, '::1', '2026-05-03 19:17:23'),
(161, 1, 'LOGIN', NULL, '::1', '2026-05-03 19:17:43'),
(162, 5, 'LOGIN', NULL, '::1', '2026-05-03 19:20:33'),
(163, 1, 'LOGIN', NULL, '::1', '2026-05-03 19:22:13'),
(164, 5, 'LOGIN', NULL, '::1', '2026-05-03 19:23:35'),
(165, 5, 'LOGIN', NULL, '::1', '2026-05-03 19:24:37'),
(166, 16, 'LOGIN', NULL, '::1', '2026-05-03 19:25:17'),
(167, 1, 'LOGIN', NULL, '::1', '2026-05-03 19:25:43'),
(168, 7, 'LOGIN', NULL, '::1', '2026-05-03 19:26:14'),
(169, 1, 'LOGIN', NULL, '::1', '2026-05-03 19:26:32'),
(170, 16, 'LOGIN', NULL, '::1', '2026-05-03 19:28:07'),
(171, 7, 'LOGIN', NULL, '::1', '2026-05-03 19:28:26'),
(172, 8, 'LOGIN', NULL, '::1', '2026-05-03 19:28:58'),
(173, 5, 'LOGIN', NULL, '::1', '2026-05-03 19:29:29'),
(174, 2, 'LOGIN', NULL, '::1', '2026-05-03 19:29:38'),
(175, 7, 'LOGIN', NULL, '::1', '2026-05-03 19:29:46'),
(176, 5, 'LOGIN', NULL, '::1', '2026-05-03 19:30:01'),
(177, 1, 'LOGIN', NULL, '::1', '2026-05-03 19:40:50');

-- --------------------------------------------------------

--
-- Structure de la table `matieres`
--

DROP TABLE IF EXISTS `matieres`;
CREATE TABLE IF NOT EXISTS `matieres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `volume_horaire_total` int NOT NULL DEFAULT '0',
  `coefficient` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `matieres`
--

INSERT INTO `matieres` (`id`, `code`, `libelle`, `volume_horaire_total`, `coefficient`, `created_at`) VALUES
(1, 'RES301', 'Réseaux Informatiques', 60, 3, '2026-04-15 23:50:22'),
(2, 'PROG201', 'Programmation Orientée Objet', 45, 3, '2026-04-15 23:50:22'),
(3, 'BD301', 'Bases de Données Avancées', 40, 2, '2026-04-15 23:50:22'),
(4, 'WEB201', 'Développement Web', 50, 3, '2026-04-15 23:50:22'),
(5, 'SYS101', 'Systèmes d exploitation', 40, 2, '2026-04-15 23:50:22'),
(6, 'RES65', 'Management', 42, 3, '2026-04-23 20:03:57');

-- --------------------------------------------------------

--
-- Structure de la table `pointages`
--

DROP TABLE IF EXISTS `pointages`;
CREATE TABLE IF NOT EXISTS `pointages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_creneau` int NOT NULL,
  `heure_pointage_reelle` datetime NOT NULL,
  `ip_source` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_utilise` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('valide','retard','echec') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'valide',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_creneau` (`id_creneau`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `pointages`
--

INSERT INTO `pointages` (`id`, `id_creneau`, `heure_pointage_reelle`, `ip_source`, `token_utilise`, `statut`, `created_at`) VALUES
(2, 3, '2026-04-27 08:52:50', '::1', 'TOKEN_3_TEST', 'retard', '2026-04-27 08:52:50'),
(3, 13, '2026-04-27 09:16:41', '::1', 'TOKEN_13_TEST', 'retard', '2026-04-27 09:16:41'),
(4, 14, '2026-04-27 09:24:33', '::1', 'TOKEN_14_TEST', 'retard', '2026-04-27 09:24:33');

-- --------------------------------------------------------

--
-- Structure de la table `salles`
--

DROP TABLE IF EXISTS `salles`;
CREATE TABLE IF NOT EXISTS `salles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacite` int NOT NULL DEFAULT '30',
  `equipements` text COLLATE utf8mb4_unicode_ci,
  `batiment` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `salles`
--

INSERT INTO `salles` (`id`, `code`, `capacite`, `equipements`, `batiment`, `created_at`) VALUES
(1, 'A01', 40, 'Tableau, Vidéoprojecteur', 'Bâtiment A', '2026-04-15 23:50:23'),
(2, 'A02', 35, 'Tableau, Vidéoprojecteur', 'Bâtiment A', '2026-04-15 23:50:23'),
(3, 'LABO-1', 25, 'Postes informatiques, Réseau local', 'Bâtiment B', '2026-04-15 23:50:23'),
(4, 'AMPHI-C', 120, 'Système audio, Grand écran', 'Bâtiment C', '2026-04-15 23:50:23'),
(5, 'B54', 35, 'Tableau', 'BâtimentD', '2026-04-23 20:04:30');

-- --------------------------------------------------------

--
-- Structure de la table `signatures`
--

DROP TABLE IF EXISTS `signatures`;
CREATE TABLE IF NOT EXISTS `signatures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_cahier` int NOT NULL,
  `type_signataire` enum('delegue','enseignant') COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_utilisateur` int NOT NULL,
  `signature_base64` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `horodatage` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_signature` (`id_cahier`,`type_signataire`),
  KEY `id_utilisateur` (`id_utilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `travaux_demandes`
--

DROP TABLE IF EXISTS `travaux_demandes`;
CREATE TABLE IF NOT EXISTS `travaux_demandes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_cahier` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_limite` date DEFAULT NULL,
  `type` enum('devoir','exercice','projet','lecture') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'exercice',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_cahier` (`id_cahier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mot_de_passe_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('administrateur','enseignant','delegue','surveillant','comptable','etudiant') COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_lien` int DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `token_reset` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_expire` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `email`, `mot_de_passe_hash`, `role`, `id_lien`, `actif`, `token_reset`, `token_expire`, `created_at`) VALUES
(1, 'admin@isge.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'administrateur', NULL, 1, NULL, NULL, '2026-04-15 23:50:23'),
(2, 'cbere@isge.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'enseignant', 1, 1, NULL, NULL, '2026-04-15 23:50:23'),
(3, 'ikabore@isge.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'enseignant', 2, 1, NULL, NULL, '2026-04-15 23:50:23'),
(4, 'atraore@isge.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'enseignant', 3, 1, NULL, NULL, '2026-04-15 23:50:23'),
(5, 'delegue.l1@isge.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'delegue', 1, 1, NULL, NULL, '2026-04-15 23:50:23'),
(6, 'delegue.l2@isge.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'delegue', 2, 1, NULL, NULL, '2026-04-15 23:50:23'),
(7, 'surveillant@isge.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'surveillant', NULL, 1, NULL, NULL, '2026-04-15 23:50:23'),
(8, 'comptable@isge.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'comptable', NULL, 1, NULL, NULL, '2026-04-15 23:50:23'),
(9, 'etudiant@isge.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'etudiant', NULL, 1, NULL, NULL, '2026-04-26 17:10:21'),
(11, 'emmanuelsango452@gmail.com', '$2y$10$Z227hNkEFX.BTk0/bFVe1elTDckZaLSN.5yzc7q58O9Mz.vn2mtLm', 'enseignant', 6, 1, NULL, NULL, '2026-04-26 17:21:16'),
(12, 'etudiant2@isge.bf', '$2y$10$JAZbYadk315vVW2WN1Bj2eGu5kjgA2D7FoZRIv4kxccI7KBDfmlvC', 'delegue', NULL, 1, NULL, NULL, '2026-04-26 17:36:12'),
(13, 'etudiant3@isge.bf', '$2y$10$lHBMDy/9xETxsCg7sOtl5enj1AQPlWlax7F8NqqXCYJF88jFwypR.', 'delegue', NULL, 1, NULL, NULL, '2026-04-26 17:36:33'),
(14, 'etudiant5@isge.bf', '$2y$10$gPjnSRE.tnaGlaW/rEsL..J3fEWfH1kAa383xVLGU0Xbo0Zf9JPm.', 'delegue', NULL, 1, NULL, NULL, '2026-04-26 17:42:12'),
(15, 'etudiant7@isge.bf', '$2y$10$eHwsgD5xy9pAY2Kqoj6kqeEX5Hr.tdl/1eArQfZSZc8RIHYMvGiEC', 'etudiant', NULL, 1, NULL, NULL, '2026-04-26 17:44:36'),
(16, 'psome@isge.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'enseignant', NULL, 1, NULL, NULL, '2026-04-27 08:51:29'),
(17, 'souedraogo@isge.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'enseignant', NULL, 1, NULL, NULL, '2026-05-03 18:47:45');

-- --------------------------------------------------------

--
-- Structure de la table `vacations`
--

DROP TABLE IF EXISTS `vacations`;
CREATE TABLE IF NOT EXISTS `vacations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_enseignant` int NOT NULL,
  `mois` tinyint NOT NULL,
  `annee` year NOT NULL,
  `montant_brut` decimal(12,2) NOT NULL DEFAULT '0.00',
  `retenues` decimal(12,2) NOT NULL DEFAULT '0.00',
  `montant_net` decimal(12,2) NOT NULL DEFAULT '0.00',
  `statut` enum('generee','signee_enseignant','validee_surveillant','approuvee_comptable') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'generee',
  `date_generation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_vacation` (`id_enseignant`,`mois`,`annee`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `vacations`
--

INSERT INTO `vacations` (`id`, `id_enseignant`, `mois`, `annee`, `montant_brut`, `retenues`, `montant_net`, `statut`, `date_generation`) VALUES
(1, 2, 4, '2026', 156000.00, 7800.00, 148200.00, 'approuvee_comptable', '2026-04-20 21:42:31'),
(2, 3, 4, '2026', 112000.00, 5600.00, 106400.00, 'approuvee_comptable', '2026-04-20 21:42:31'),
(3, 5, 4, '2026', 98000.00, 4900.00, 93100.00, 'approuvee_comptable', '2026-04-20 21:42:31'),
(4, 2, 3, '2026', 143000.00, 7150.00, 135850.00, 'approuvee_comptable', '2026-04-20 21:42:31'),
(5, 4, 4, '2026', 204000.00, 10200.00, 193800.00, 'approuvee_comptable', '2026-04-20 21:42:31'),
(17, 5, 5, '2026', 74295.00, 3714.75, 70580.25, 'approuvee_comptable', '2026-05-03 19:27:42');

-- --------------------------------------------------------

--
-- Structure de la table `vacation_lignes`
--

DROP TABLE IF EXISTS `vacation_lignes`;
CREATE TABLE IF NOT EXISTS `vacation_lignes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_vacation` int NOT NULL,
  `id_creneau` int NOT NULL,
  `duree_heures` decimal(5,2) NOT NULL,
  `taux` decimal(10,2) NOT NULL,
  `montant` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_vacation` (`id_vacation`),
  KEY `id_creneau` (`id_creneau`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `vacation_lignes`
--

INSERT INTO `vacation_lignes` (`id`, `id_vacation`, `id_creneau`, `duree_heures`, `taux`, `montant`) VALUES
(1, 17, 24, 11.43, 6500.00, 74295.00);

-- --------------------------------------------------------

--
-- Structure de la table `validations`
--

DROP TABLE IF EXISTS `validations`;
CREATE TABLE IF NOT EXISTS `validations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_vacation` int NOT NULL,
  `id_validateur` int NOT NULL,
  `role_validateur` enum('enseignant','surveillant','comptable') COLLATE utf8mb4_unicode_ci NOT NULL,
  `visa_base64` longtext COLLATE utf8mb4_unicode_ci,
  `date_validation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `commentaire` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `id_vacation` (`id_vacation`),
  KEY `id_validateur` (`id_validateur`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `validations`
--

INSERT INTO `validations` (`id`, `id_vacation`, `id_validateur`, `role_validateur`, `visa_base64`, `date_validation`, `commentaire`) VALUES
(1, 2, 8, 'comptable', NULL, '2026-04-26 17:46:45', 'Approuvé par le comptable'),
(2, 5, 8, 'comptable', NULL, '2026-04-26 17:46:51', 'Approuvé par le comptable'),
(3, 1, 7, 'surveillant', 'data:image/png;base64,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', '2026-04-26 17:52:43', 'Validé'),
(4, 1, 7, 'surveillant', NULL, '2026-04-26 17:52:57', 'Validé'),
(5, 1, 8, 'comptable', NULL, '2026-04-26 17:53:17', 'Approuvé par le comptable'),
(6, 3, 7, 'surveillant', 'data:image/png;base64,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', '2026-05-03 18:48:50', 'Validé'),
(7, 3, 8, 'comptable', NULL, '2026-05-03 18:49:12', 'Approuvé par le comptable'),
(8, 17, 16, 'enseignant', 'data:image/png;base64,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', '2026-05-03 19:28:17', 'Validé'),
(9, 17, 7, 'surveillant', 'data:image/png;base64,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', '2026-05-03 19:28:43', 'Validé'),
(10, 17, 8, 'comptable', NULL, '2026-05-03 19:29:09', 'Approuvé par le comptable');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `cahiers_texte`
--
ALTER TABLE `cahiers_texte`
  ADD CONSTRAINT `cahiers_texte_ibfk_1` FOREIGN KEY (`id_creneau`) REFERENCES `creneaux` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cahiers_texte_ibfk_2` FOREIGN KEY (`id_delegue`) REFERENCES `utilisateurs` (`id`) ON DELETE RESTRICT;

--
-- Contraintes pour la table `creneaux`
--
ALTER TABLE `creneaux`
  ADD CONSTRAINT `creneaux_ibfk_1` FOREIGN KEY (`id_emploi_temps`) REFERENCES `emploi_temps` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `creneaux_ibfk_2` FOREIGN KEY (`id_matiere`) REFERENCES `matieres` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `creneaux_ibfk_3` FOREIGN KEY (`id_enseignant`) REFERENCES `enseignants` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `creneaux_ibfk_4` FOREIGN KEY (`id_salle`) REFERENCES `salles` (`id`) ON DELETE RESTRICT;

--
-- Contraintes pour la table `emploi_temps`
--
ALTER TABLE `emploi_temps`
  ADD CONSTRAINT `emploi_temps_ibfk_1` FOREIGN KEY (`id_classe`) REFERENCES `classes` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `emploi_temps_ibfk_2` FOREIGN KEY (`cree_par`) REFERENCES `utilisateurs` (`id`) ON DELETE RESTRICT;

--
-- Contraintes pour la table `logs_activite`
--
ALTER TABLE `logs_activite`
  ADD CONSTRAINT `logs_activite_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `pointages`
--
ALTER TABLE `pointages`
  ADD CONSTRAINT `pointages_ibfk_1` FOREIGN KEY (`id_creneau`) REFERENCES `creneaux` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `signatures`
--
ALTER TABLE `signatures`
  ADD CONSTRAINT `signatures_ibfk_1` FOREIGN KEY (`id_cahier`) REFERENCES `cahiers_texte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `signatures_ibfk_2` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id`) ON DELETE RESTRICT;

--
-- Contraintes pour la table `travaux_demandes`
--
ALTER TABLE `travaux_demandes`
  ADD CONSTRAINT `travaux_demandes_ibfk_1` FOREIGN KEY (`id_cahier`) REFERENCES `cahiers_texte` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `vacations`
--
ALTER TABLE `vacations`
  ADD CONSTRAINT `vacations_ibfk_1` FOREIGN KEY (`id_enseignant`) REFERENCES `enseignants` (`id`) ON DELETE RESTRICT;

--
-- Contraintes pour la table `vacation_lignes`
--
ALTER TABLE `vacation_lignes`
  ADD CONSTRAINT `vacation_lignes_ibfk_1` FOREIGN KEY (`id_vacation`) REFERENCES `vacations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `vacation_lignes_ibfk_2` FOREIGN KEY (`id_creneau`) REFERENCES `creneaux` (`id`) ON DELETE RESTRICT;

--
-- Contraintes pour la table `validations`
--
ALTER TABLE `validations`
  ADD CONSTRAINT `validations_ibfk_1` FOREIGN KEY (`id_vacation`) REFERENCES `vacations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `validations_ibfk_2` FOREIGN KEY (`id_validateur`) REFERENCES `utilisateurs` (`id`) ON DELETE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
