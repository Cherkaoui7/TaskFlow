# TaskFlow - Application de Gestion de Projets et Tâches

Application web full stack pour la gestion collaborative de projets et tâches, développée dans le cadre de la formation OFPPT.

## 🚀 Technologies

- **Backend**: Laravel 12 + Laravel Sanctum (API REST)
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Base de données**: MySQL/PostgreSQL (ou SQLite pour le développement)

## 📋 Fonctionnalités

### Authentification
- Inscription et connexion utilisateur
- Authentification par token (Sanctum)
- Gestion de profil utilisateur

### Gestion des Projets
- Création, modification et suppression de projets
- Gestion des membres (admin/membre)
- Vue liste et vue détail

### Gestion des Tâches
- CRUD complet sur les tâches
- Système de statuts (À faire, En cours, Terminé)
- Priorités (Basse, Moyenne, Haute, Critique)
- Attribution de tâches aux membres
- Vue Kanban (drag & drop)
- Vue liste avec filtres

### Dashboard
- Vue d'ensemble avec statistiques
- Liste des projets récents
- Tâches assignées à l'utilisateur

## 🛠️ Installation

### Prérequis

- PHP 8.2+
- Composer 2.x
- Node.js 18+
- MySQL 8.0+ ou PostgreSQL 13+ (ou SQLite)

### Backend

1. Aller dans le dossier backend :
```bash
cd backend
```

2. Installer les dépendances :
```bash
composer install
```

3. Configurer l'environnement :
```bash
cp .env.example .env
php artisan key:generate
```

4. Configurer la base de données dans `.env` :
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taskflow
DB_USERNAME=root
DB_PASSWORD=
```

5. Exécuter les migrations :
```bash
php artisan migrate
```

6. (Optionnel) Remplir avec des données de test :
```bash
php artisan db:seed
```

7. Lancer le serveur :
```bash
php artisan serve
```

Le backend sera accessible sur `http://localhost:8000`

### Frontend

1. Aller dans le dossier frontend :
```bash
cd frontend
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer l'URL de l'API dans `.env` :
```env
VITE_API_URL=http://localhost:8000/api
```

4. Lancer le serveur de développement :
```bash
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

## 📚 Documentation API

Voir [backend/README.md](backend/README.md) pour la documentation complète de l'API.

### Routes principales

- `POST /api/register` - Inscription
- `POST /api/login` - Connexion
- `GET /api/projects` - Liste des projets
- `POST /api/projects` - Créer un projet
- `GET /api/projects/{id}/tasks` - Liste des tâches d'un projet
- `POST /api/projects/{id}/tasks` - Créer une tâche
- `GET /api/my-tasks` - Mes tâches assignées

## 🧪 Tests

### Backend
```bash
cd backend
php artisan test
```

## 📝 Structure du projet

```
.
├── backend/          # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/
│   │   └── Models/
│   ├── database/
│   │   ├── migrations/
│   │   ├── factories/
│   │   └── seeders/
│   └── routes/
│       └── api.php
├── frontend/         # Application React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── context/
│   └── package.json
└── README.md
```

## 🎯 Prochaines étapes

- [ ] Implémenter la vue Kanban avec drag & drop
- [ ] Ajouter les filtres avancés sur les tâches
- [ ] Page "Mes tâches" complète
- [ ] Gestion du profil utilisateur (édition, photo)
- [ ] Responsive design mobile
- [ ] Tests d'intégration
- [ ] Déploiement en production

## 📄 Licence

Ce projet est développé dans le cadre d'une formation OFPPT.

## 👤 Auteur

Étudiant OFPPT - Développement Full Stack
