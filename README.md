# Kivu Event V1.0.0

## Plateforme de Gestion des Événements d'Entreprise

Kivu Event est une plateforme complète de gestion d'événements d'entreprise, conçue pour simplifier l'organisation de séminaires, conférences et autres événements professionnels. Notre solution permet aux organisateurs d'événements, équipes marketing et responsables RH de gérer efficacement leurs événements en ligne et en présentiel, suivre les participants, obtenir des analyses en temps réel et réduire les tâches administratives.

## 📋 Table des matières
- Fonctionnalités
- Technologies utilisées
- Architecture du projet
- Installation
- Configuration
- Utilisation
- API
- Déploiement
- Contribuer
- Licence
- Contact

## ✨ Fonctionnalités

### Gestion des événements
- Création et gestion d'événements en quelques clics
- Planification détaillée avec dates, lieux et capacités
- Catégorisation des événements (Tech, Formation, Design, etc.)
- Gestion des statuts (brouillon, publié, terminé, annulé)

### Gestion des participants
- Inscription des participants avec formulaires personnalisables
- Suivi des présences en temps réel
- Communication avec les participants (emails, notifications)
- Génération de badges et certificats

### Gestion des lieux
- Catalogue de lieux d'événements
- Informations détaillées (capacité, équipements, disponibilité)
- Réservation et gestion des salles

### Tableau de bord et analyses
- Vue d'ensemble de tous les événements
- Statistiques détaillées sur la participation
- Rapports personnalisables
- Tendances et insights pour améliorer les futurs événements

### Interface utilisateur
- Design moderne et épuré en noir et blanc
- Interface responsive pour desktop et mobile
- Mode clair/sombre
- Animations fluides avec Framer Motion

## 🛠️ Technologies utilisées

### Frontend
- Next.js 14 - Framework React avec App Router
- React - Bibliothèque UI
- TypeScript - Typage statique
- Tailwind CSS - Framework CSS utilitaire
- Framer Motion - Bibliothèque d'animations
- Shadcn UI - Composants UI réutilisables
- Next-themes - Gestion du thème clair/sombre
- Lucide React - Icônes

### Backend
- Node.js - Environnement d'exécution JavaScript
- Express - Framework web pour Node.js
- MySQL - Base de données SQL
- JWT - Authentification par tokens
- Axios - Client HTTP

### Outils de développement
- ESLint - Linting du code
- Prettier - Formatage du code
- Git - Contrôle de version
- npm - Gestionnaire de paquets

## 🏗️ Architecture du projet
```
kivu-event/
├── app/                      # App Router de Next.js
│   ├── (marketing)/          # Routes publiques (landing page)
│   ├── api/                  # Routes API
│   ├── dashboard/            # Interface d'administration
│   ├── events/               # Gestion des événements
│   ├── login/                # Authentification
│   ├── register/             # Création de compte
│   ├── layout.tsx            # Layout principal
│   └── globals.css           # Styles globaux
├── components/               # Composants React réutilisables
├── context/                  # Contextes React (AuthContext, etc.)
├── hooks/                    # Hooks personnalisés
├── lib/                      # Utilitaires et fonctions
├── providers/                # Providers React
├── public/                   # Fichiers statiques
├── middleware.ts             # Middleware Next.js
├── next.config.js            # Configuration Next.js
├── package.json              # Dépendances et scripts
├── tailwind.config.js        # Configuration Tailwind CSS
└── tsconfig.json             # Configuration TypeScript
```

## 🚀 Installation

### Prérequis
- Node.js (v18 ou supérieur)
- npm ou yarn
- MySQL (local ou distant)

### Étapes d'installation
```sh
git clone https://github.com/anelkamd/Kivu-Event-V2
cd kivu-event
npm install --legacy-peer-deps 
```

Configurer les variables d'environnement dans `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
JWT_SECRET=votre_secret_jwt
DB_NAME=kivu_event
DB_USER=votre_utilisateur_db
DB_PASSWORD=votre_mot_de_passe_db
DB_HOST=localhost
DB_PORT=27017
FRONTEND_URL=http://localhost:3000
```

Démarrer l'application :
```sh
npm run dev ( Client )
node server.js ( Server )
```

## 📞 Contact
- **Email:** anelkadevs@gmail.com
- **Twitter:** @Anelka_MD
- **Site web:** [www.kivuevent.com](http://www.kivuevent.com)

© 2024-2025 Kivu Event. Tous droits réservés.

