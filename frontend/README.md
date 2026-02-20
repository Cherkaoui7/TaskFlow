# TaskFlow Frontend

Application React 18 avec Vite pour l'interface utilisateur de TaskFlow.

## Prérequis

- Node.js 18+
- npm ou yarn

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Copier le fichier `.env.example` vers `.env` :
```bash
cp .env.example .env
```

3. Configurer l'URL de l'API dans `.env` :
```env
VITE_API_URL=http://localhost:8000/api
```

## Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Build pour la production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`.

## Structure du projet

```
src/
├── components/       # Composants réutilisables
│   ├── common/      # Composants communs (ProtectedRoute, etc.)
│   └── layout/      # Composants de layout (Header, MainLayout)
├── context/         # Context API (AuthContext)
├── pages/           # Pages de l'application
│   ├── Auth/        # Pages d'authentification
│   └── Dashboard/   # Page dashboard
├── services/        # Services API (authService, projectService, taskService)
└── utils/           # Fonctions utilitaires
```

## Technologies utilisées

- React 18
- React Router v6
- Axios
- Tailwind CSS
- React Hot Toast
