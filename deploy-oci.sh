#!/bin/bash

# Script de déploiement pour Oracle Cloud Infrastructure
# Déploie l'app Symfony sur OCI Container Instances

set -e

# Configuration
TENANCY_NAME="your-tenancy-name"
USERNAME="your-oci-username"
REGION="us-ashburn-1"  # Changez selon votre région
APP_NAME="bibliogest-app"
IMAGE_NAME="ocir.io/${TENANCY_NAME}/${APP_NAME}:latest"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Déploiement de Bibliogest sur Oracle Cloud${NC}"

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

# Se connecter à OCI Registry
echo -e "${YELLOW}🔐 Connexion à OCI Container Registry...${NC}"
echo "Entrez votre OCI Auth Token (généré dans OCI Console > Profile > Auth Tokens):"
read -s AUTH_TOKEN
echo ""

docker login ocir.io -u "${TENANCY_NAME}/${USERNAME}" -p "${AUTH_TOKEN}"

# Builder l'image
echo -e "${YELLOW}🏗️  Construction de l'image Docker...${NC}"
docker build -t ${APP_NAME} .

# Tagger pour OCIR
echo -e "${YELLOW}🏷️  Taggage de l'image...${NC}"
docker tag ${APP_NAME} ${IMAGE_NAME}

# Pousser l'image
echo -e "${YELLOW}📤 Poussée de l'image vers OCIR...${NC}"
docker push ${IMAGE_NAME}

echo -e "${GREEN}✅ Image déployée avec succès sur OCIR${NC}"
echo -e "${GREEN}📍 Image: ${IMAGE_NAME}${NC}"

# Instructions pour Container Instance
echo -e "${YELLOW}📋 Prochaines étapes dans OCI Console:${NC}"
echo "1. Allez sur https://cloud.oracle.com"
echo "2. Container Instances > Create Container Instance"
echo "3. Configuration:"
echo "   - Name: bibliogest-prod"
echo "   - Image: ${IMAGE_NAME}"
echo "   - Ports: 80"
echo "   - Environment Variables:"
echo "     * APP_ENV=prod"
echo "     * SYMFONY_ENV=prod"
echo "     * DATABASE_URL=postgresql://user:pass@host:5432/db"
echo "4. Créer et attendre le déploiement"

echo -e "${GREEN}🎉 Prêt pour le déploiement sur OCI !${NC}"