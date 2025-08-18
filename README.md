<p align="center">
  <img src="./public/logo.png" width="100" alt="Kivu Event Logo" />
</p>

<h1 align="center">Kivu Event V0.1</h1>

<p align="center">
  <img src="./public/cover.png" alt="Kivu Event Dashboard" />
</p>

<p align="center">
  🔗 Application de Gestion des Événements d’Entreprise (Organisation des séminaires, conférences, et suivi des participants)
</p>

<p align="center"><strong>✨ Built by Anelka</strong></p>

---
# Kivu Event - Plateforme de Gestion d'Événements

## 📝 Description
Kivu Event est une plateforme web complète de gestion d'événements conçue pour faciliter l'organisation, la promotion et la gestion des événements dans la région des Grands Lacs africains. Elle permet aux organisateurs de créer et gérer des événements, et aux participants de s'inscrire et interagir.

## 🚀 Fonctionnalités principales

### Pour les Organisateurs
- Création et gestion d'événements
- Gestion des inscriptions et des participants
- Tableau de bord analytique
- Gestion des lieux et intervenants
- Système de paiement intégré

### Pour les Participants
- Recherche et découverte d'événements
- Inscription et paiement en ligne
- QR Code pour check-in
- Historique des participations
- Système de feedback

## 🛠 Technologies utilisées

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Context API pour la gestion d'état

### Backend
- Node.js
- Express.js
- MySQL
- JSON Web Tokens (JWT)
- Bcrypt pour la sécurité


## 🗄️ Structure du projet

```
kivu-event/
├── app/                    # Pages et routes Next.js
├── components/            # Composants React réutilisables
├── config/               # Configuration (DB, etc.)
├── context/              # Contextes React
├── controllers/          # Contrôleurs Express
├── models/              # Modèles de données
├── routes/              # Routes API Express
├── services/            # Services métier
└── public/              # Fichiers statiques
```

## 🔐 Variables d'environnement requises

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=kivu_event
DB_PORT=3306

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Events
- `GET /api/events` - Liste des événements
- `POST /api/events/create` - Créer un événement
- `GET /api/events/:id` - Détails d'un événement
- `PUT /api/events/:id` - Modifier un événement
- `DELETE /api/events/:id` - Supprimer un événement


Pour plus d'informations techniques, consultez notre documentation API.

# Guide d'installation et configuration de Kivu Event

## 🚀 Installation en local

### Prérequis
- Node.js (v22 ou supérieur)
- MySQL (v8.0 ou supérieur)
- Git

### 1. Cloner le projet
```bash
git clone https://github.com/anelkamd/kivu-event.git
cd kivu-event
```

### 2. Installation des dépendances
```bash
npm install --force
# ou avec yarn
yarn install --force
```

### 3. Configuration de la base de données

1. Créer une base de données MySQL :
```bash
mysql -u root -p
CREATE DATABASE kivu_event;
```

2. Importer le schéma :
```bash
mysql -u root -p kivu_event < database/schema.sql
```

### 4. Configuration des variables d'environnement

1. Copier le fichier d'exemple :
```bash
cp .env.example .env
```

2. Modifier le fichier .env avec vos informations :
````properties
# Database Configuration
DB_HOST=localhost
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
DB_NAME=kivu_event
DB_PORT=3306

# Authentication
JWT_SECRET=votre_secret_jwt
JWT_EXPIRATION=7d
REFRESH_TOKEN_SECRET=votre_secret_refresh_token
REFRESH_TOKEN_EXPIRATION=30d

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASSWORD=votre_mot_de_passe_app
EMAIL_FROM=Kivu Event <votre_email@gmail.com>

# File Upload
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880  # 5MB
````

### 5. Lancer l'application

1. Backend (Express) :
```bash
# Terminal 1
node server.js
# L'API sera disponible sur http://localhost:5000
```

2. Frontend (Next.js) :
```bash
# Terminal 2
npm run dev
# L'application sera disponible sur http://localhost:3000
```

## 🔧 Configuration avancée

### Configuration de la base de données
Le fichier de configuration se trouve dans database.js. Vous pouvez modifier :
- Le pool de connexions
- Les timeouts
- Les paramètres de sécurité

### Configuration du serveur mail
1. Créer un compte Gmail
2. Activer l'authentification à 2 facteurs
3. Générer un mot de passe d'application
4. Utiliser ce mot de passe dans `SMTP_PASSWORD`

### Configuration des uploads
1. Créer le dossier uploads :
```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

2. Configuration Nginx (optionnel) :
````nginx
location /uploads {
    alias /path/to/kivu-event/public/uploads;
    try_files $uri $uri/ =404;
}
````

## 🛠 Scripts disponibles

```bash
npm run dev          # Lance le serveur de développement Next.js
node server.js      # Lance le serveur Express
npm run build       # Build l'application Next.js
npm run start       # Lance l'application en production
npm run lint        # Vérifie le code avec ESLint
npm run test        # Lance les tests
```

## 📝 Notes importantes

1. **Base de données** :
   - Assurez-vous que MySQL est en cours d'exécution
   - Les tables seront créées automatiquement au premier démarrage

2. **Sécurité** :
   - Ne jamais commit le fichier .env
   - Changer les secrets JWT en production
   - Utiliser HTTPS en production

3. **Uploads** :
   - Vérifier les permissions du dossier uploads
   - Limiter la taille des fichiers (5MB par défaut)

4. **Production** :
   - Utiliser PM2 ou similar pour le processus Node.js
   - Configurer un reverse proxy (Nginx recommandé)
   - Activer la compression gzip

## 🐛 Résolution des problèmes courants

1. **Erreur de connexion MySQL** :
```bash
sudo service mysql restart
mysql -u root -p  # Vérifier la connexion
```

2. **Erreur de ports** :
```bash
sudo lsof -i :3000  # Vérifier si le port 3000 est utilisé
sudo lsof -i :5000  # Vérifier si le port 5000 est utilisé
```

3. **Problèmes d'upload** :
```bash
sudo chown -R $USER:$USER public/uploads
sudo chmod 755 public/uploads

# Commande sous Linux !
```

## 👥 Contribution
Les contributions sont les bienvenues ! Consultez nos guidelines de contribution pour plus d'informations.

## 📄 Licence
Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 📞 Contact
- Email: anelkadevs@gmail.com
- Site Web: https://kivuevent.com

---