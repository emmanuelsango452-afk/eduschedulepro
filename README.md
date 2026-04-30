# 📚 EduTrack Pro — Système de Gestion Pédagogique

> Projet de fin d'année — Institut Supérieur de Génie Électrique (ISGE)  
> Année académique 2025-2026

---

## 🎯 Présentation

**EduTrack Pro** est une application web complète de gestion pédagogique développée pour l'ISGE. Elle permet de gérer les emplois du temps, le pointage des enseignants via QR-Code, les cahiers de texte numériques et les fiches de vacation.

---

## 🛠️ Technologies utilisées

| Côté | Technologie |
|------|-------------|
| Frontend | React 18 + Vite |
| Backend | PHP 8.3 |
| Base de données | MySQL 8.4 (WAMP) |
| Authentification | JWT (JSON Web Token) |
| Styles | CSS-in-JS (inline styles) |
| Graphiques | Chart.js |
| Signature | SignaturePad |
| QR Scanner | jsQR |
| Export Excel | CSV natif |

---

## 👥 Rôles et accès

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Administrateur | admin@isge.bf | password |
| Enseignant | cbere@isge.bf | password |
| Délégué | delegue.l1@isge.bf | password |
| Surveillant | surveillant@isge.bf | password |
| Comptable | comptable@isge.bf | password |
| Étudiant | etudiant@isge.bf | password |

---

## ✨ Fonctionnalités principales

### 📅 Emploi du temps
- Création et gestion des créneaux par semaine
- 3 vues : Semaine, Journée, Liste
- Navigation entre semaines (◀ ▶)
- Filtres par classe, enseignant, matière
- Détection automatique des conflits
- Publication/dépublication du planning
- Export PDF
- Génération QR-Code par créneau

### 📱 Pointage QR-Code
- Scan caméra ou saisie manuelle du token
- Affichage des infos de la séance avant confirmation
- Détection automatique des retards (> 30 min)
- Vérification du jour du cours
- Token à usage unique
- Logs de toutes les tentatives

### 📝 Cahiers de texte
- Création par le délégué après pointage QR
- Saisie du contenu pédagogique
- Signature numérique (canvas HTML5)
- Workflow : Brouillon → Signé délégué → Clôturé
- Verrouillage après clôture

### 💰 Fiches de vacation
- Génération automatique depuis les cahiers clôturés
- Workflow 4 étapes : Généré → Signé enseignant → Visé surveillant → Approuvé comptable
- Calcul automatique des montants

### 👨‍🏫 Gestion des enseignants
- CRUD complet
- Filtres vacataire/permanent
- Export Excel (CSV)

### 🗂️ Référentiels
- Gestion des classes, matières et salles

### 👥 Gestion des utilisateurs
- CRUD tous rôles
- Activation/désactivation des comptes

---

## 🚀 Installation

### Prérequis
- WAMP (Windows) avec MySQL 8+ et PHP 8.3+
- Node.js 18+
- Git

### Étapes

**1. Cloner le projet**
```bash
git clone https://github.com/emmanuelsango452-afk/eduschedulepro.git
cd eduschedulepro
```

**2. Importer la base de données**
```
Ouvrir phpMyAdmin → http://localhost/phpmyadmin
Créer une base : eduschedulepro
Importer le fichier : database/eduschedulepro.sql
```

**3. Configurer le backend**
```
Copier le dossier backend/ dans C:\wamp64\www\eduschedulepro\
```

**4. Installer les dépendances frontend**
```bash
cd frontend
npm install
```

**5. Lancer l'application**
```bash
# Terminal 1 — Démarrer WAMP
# Terminal 2 — Lancer React
cd frontend
npm run dev
```

**6. Accéder à l'application**
```
http://localhost:5173
```

---

## 📁 Structure du projet

```
eduschedulepro/
├── backend/
│   ├── api/
│   │   ├── auth.php
│   │   ├── cahiers.php
│   │   ├── classes.php
│   │   ├── dashboard.php
│   │   ├── emploi_temps.php
│   │   ├── enseignants.php
│   │   ├── matieres.php
│   │   ├── pointages.php
│   │   ├── salles.php
│   │   ├── utilisateurs.php
│   │   └── vacations.php
│   ├── config/
│   │   ├── constants.php
│   │   └── database.php
│   └── middleware/
│       └── auth_jwt.php
├── frontend/
│   └── src/
│       ├── context/
│       │   └── AuthContext.jsx
│       └── pages/
│           ├── LoginPage.jsx
│           ├── DashboardAdminPage.jsx
│           ├── DashboardEnseignantPage.jsx
│           ├── DashboardDeleguePage.jsx
│           ├── DashboardSurveillantPage.jsx
│           ├── DashboardComptablePage.jsx
│           ├── DashboardEtudiantPage.jsx
│           ├── EmploiTempsPage.jsx
│           ├── CahierTextePage.jsx
│           ├── VacationPage.jsx
│           ├── EnseignantsPage.jsx
│           ├── ReferentielsPage.jsx
│           ├── UtilisateursPage.jsx
│           ├── QRScannerPage.jsx
│           └── RapportsPage.jsx
└── database/
    └── eduschedulepro.sql
```

---

## 🔒 Sécurité

- Authentification JWT avec expiration
- Tokens QR à usage unique valides 1 an
- Vérification du jour lors du pointage
- Protection des routes par rôle
- Logs de toutes les activités

---

## 👨‍💻 Développé par

**Emmanuel SANGO** — Licence Informatique  
Institut Supérieur de Génie Électrique (ISGE)  
Ouagadougou, Burkina Faso — 2025-2026

---

## 📄 Licence

Projet académique — Tous droits réservés © ISGE 2026
