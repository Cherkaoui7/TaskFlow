# TaskFlow Backend API

API REST Laravel 12 pour l'application TaskFlow - Gestion de projets et tâches.

## Prérequis

- PHP 8.2+
- Composer 2.x
- MySQL 8.0+ ou PostgreSQL 13+ (ou SQLite pour le développement)
- Node.js 18+ (pour les assets frontend)

## Installation

1. Installer les dépendances Composer :
```bash
composer install
```

2. Copier le fichier `.env.example` vers `.env` :
```bash
cp .env.example .env
```

3. Générer la clé d'application :
```bash
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

6. (Optionnel) Remplir la base de données avec des données de test :
```bash
php artisan db:seed
```

7. Installer Laravel Sanctum :
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

## Lancer le serveur de développement

```bash
php artisan serve
```

L'API sera accessible sur `http://localhost:8000`

## Routes API

### Authentification (publiques)
- `POST /api/register` - Inscription
- `POST /api/login` - Connexion

### Routes protégées (nécessitent un token Sanctum)
- `POST /api/logout` - Déconnexion
- `GET /api/user` - Profil utilisateur connecté

### Projets
- `GET /api/projects` - Liste des projets
- `POST /api/projects` - Créer un projet
- `GET /api/projects/{id}` - Détails d'un projet
- `PUT /api/projects/{id}` - Modifier un projet
- `DELETE /api/projects/{id}` - Supprimer un projet
- `POST /api/projects/{id}/members` - Ajouter un membre
- `DELETE /api/projects/{id}/members/{userId}` - Retirer un membre

### Tâches
- `GET /api/projects/{id}/tasks` - Liste des tâches d'un projet
- `POST /api/projects/{id}/tasks` - Créer une tâche
- `GET /api/tasks/{id}` - Détails d'une tâche
- `PUT /api/tasks/{id}` - Modifier une tâche
- `PATCH /api/tasks/{id}/status` - Changer le statut d'une tâche
- `DELETE /api/tasks/{id}` - Supprimer une tâche
- `GET /api/my-tasks` - Toutes les tâches assignées à l'utilisateur connecté

## Authentification

L'API utilise Laravel Sanctum pour l'authentification par token.

Pour utiliser les routes protégées, inclure le header :
```
Authorization: Bearer {token}
```

Le token est retourné lors de l'inscription ou de la connexion.

## Structure de la base de données

- `users` - Utilisateurs
- `projects` - Projets
- `project_user` - Table pivot pour les membres des projets
- `tasks` - Tâches
- `comments` - Commentaires sur les tâches (V2)

## Tests

```bash
php artisan test
```
