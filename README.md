# Bibliogest - Bibliothèque Numérique

Application web Symfony pour la gestion d'une bibliothèque numérique avec interface d'administration.

## Fonctionnalités
- ✅ Catalogue de livres avec recherche et pagination
- ✅ Système d'emprunt de livres
- ✅ Interface d'administration (EasyAdmin)
- ✅ Gestion des auteurs et éditeurs
- ✅ Commentaires sur les livres
- ✅ Authentification utilisateur

## Technologies
- **Backend** : Symfony 7.2 + PHP 8.2
- **Base de données** : PostgreSQL
- **Frontend** : Asset Mapper + Bootstrap
- **Admin** : EasyAdmin 4

## Installation locale

### Prérequis
- PHP 8.2+
- Composer
- Node.js + npm
- PostgreSQL ou SQLite

### Installation
```bash
# Cloner le repository
git clone https://github.com/tiffank1802/bg_27mai.git
cd bg_27mai

# Installer les dépendances
composer install
npm install

# Configurer la base de données
# Modifier .env.local avec vos paramètres DB
cp .env .env.local

# Créer la base et les fixtures
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
php bin/console doctrine:fixtures:load

# Builder les assets
npm run build

# Démarrer le serveur
symfony server:start
```

## Déploiement

### Sur Koyeb (recommandé)
1. Pousser le code sur GitHub
2. Créer une app sur [Koyeb](https://app.koyeb.com)
3. Connecter le repository GitHub
4. Koyeb détecte automatiquement la configuration

### Sur Oracle Cloud Infrastructure
```bash
# Modifier le script avec vos informations OCI
# TENANCY_NAME, USERNAME, REGION dans deploy-oci.sh

# Exécuter le déploiement
./deploy-oci.sh
```

Puis créer une Container Instance dans OCI Console avec :
- Image : `ocir.io/your-tenancy/bibliogest-app:latest`
- Port : 80
- Variables :
  - `APP_ENV=prod`
  - `DATABASE_URL` (URL de votre base OCI)

## Utilisation
- **Site public** : `http://localhost:8000`
- **Admin** : `http://localhost:8000/admin-login` (code : 180201)
- **Utilisateur test** : admin@bibliogest.com

## Architecture
- **MVC** avec contrôleurs Symfony
- **Entités Doctrine** pour la persistence
- **Templates Twig** pour les vues
- **Asset Mapper** pour les ressources front-end
- **EasyAdmin** pour l'administration

## Développement
```bash
# Tests
php bin/phpunit

# Qualité du code
php bin/console cache:clear
composer run-script post-install-cmd

# Assets en développement
npm run watch
```
