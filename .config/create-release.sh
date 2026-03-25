#!/bin/bash

# Script para criar uma nova versão/release do plugin
# Uso: ./.config/create-release.sh 1.0.1

set -e

# Get plugin root directory (parent of .config)
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PLUGIN_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Validate version argument
if [ -z "$1" ]; then
    echo -e "${RED}Erro: Você deve fornecer o número da versão${NC}"
    echo -e "Uso: ./.config/create-release.sh 1.0.1"
    exit 1
fi

VERSION=$1
TAG="v$VERSION"

# Validate semantic versioning format (X.Y.Z)
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}Erro: Versão inválida. Use formato: X.Y.Z (ex: 1.0.1)${NC}"
    exit 1
fi

echo -e "${BLUE}Criando release $TAG...${NC}\n"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}Erro: Existem mudanças não commitadas.${NC}"
    echo -e "Commit ou stash antes de continuar.\n"
    git status --short
    exit 1
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}Aviso: Você está na branch '$CURRENT_BRANCH', não 'main'${NC}"
    read -p "Deseja continuar? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo -e "${RED}Erro: Tag $TAG já existe!${NC}"
    echo -e "Use: git tag -d $TAG (local) e git push --delete origin $TAG (remoto)"
    exit 1
fi

# Check if CHANGELOG.md mentions this version
if [ -f "CHANGELOG.md" ]; then
    if ! grep -q "\[$VERSION\]" CHANGELOG.md; then
        echo -e "${RED}Erro: CHANGELOG.md não contém uma entrada para a versão $VERSION${NC}"
        echo -e "Adicione uma seção como:"
        echo -e "  ${YELLOW}## [$VERSION] - $(date +%Y-%m-%d)${NC}"
        echo -e "antes de criar a release."
        exit 1
    fi
    echo -e "${GREEN}CHANGELOG.md contém entrada para $VERSION${NC}\n"
fi

# Get current version from byrde.php
CURRENT_VERSION=$(grep -m 1 "Version:" byrde.php | sed 's/.*Version: *//' | tr -d '\r')
echo -e "${BLUE}Versão atual: $CURRENT_VERSION${NC}"
echo -e "${BLUE}Nova versão: $VERSION${NC}\n"

# Confirm before proceeding
read -p "Confirmar criação da release $TAG? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Operação cancelada.${NC}"
    exit 1
fi

# Update version in byrde.php (header + constant)
echo -e "${GREEN}Atualizando versão no byrde.php...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/Version: .*/Version: $VERSION/" byrde.php
    sed -i '' "s/define( 'BYRDE_VERSION', '.*' )/define( 'BYRDE_VERSION', '$VERSION' )/" byrde.php
else
    sed -i "s/Version: .*/Version: $VERSION/" byrde.php
    sed -i "s/define( 'BYRDE_VERSION', '.*' )/define( 'BYRDE_VERSION', '$VERSION' )/" byrde.php
fi

# Verify the change
NEW_VERSION=$(grep -m 1 "Version:" byrde.php | sed 's/.*Version: *//' | tr -d '\r')
if [ "$NEW_VERSION" != "$VERSION" ]; then
    echo -e "${RED}Erro: Falha ao atualizar versão no byrde.php${NC}"
    exit 1
fi

echo -e "${GREEN}Versão atualizada: $CURRENT_VERSION -> $VERSION${NC}\n"

# Commit version bump
echo -e "${GREEN}Commitando mudança de versão...${NC}"
git add byrde.php
if git diff --staged --quiet; then
    echo -e "${YELLOW}Sem mudanças na versão (já está em $VERSION)${NC}\n"
else
    git commit -m "chore: bump version to $VERSION"
fi

# Create annotated tag
echo -e "${GREEN}Criando tag $TAG...${NC}"
git tag -a "$TAG" -m "Release $VERSION"

# Push changes
echo -e "${GREEN}Fazendo push para o GitHub...${NC}"
git push origin "$CURRENT_BRANCH"
git push origin "$TAG"

echo ""
echo -e "${GREEN}Release $TAG criada com sucesso!${NC}"
echo ""
echo -e "${BLUE}Acompanhe o build em:${NC}"
echo -e "   https://github.com/tales-bluecrocus/byrde/actions"
echo ""
echo -e "${BLUE}Após o build completar (~2-3 min), a release estará disponível em:${NC}"
echo -e "   https://github.com/tales-bluecrocus/byrde/releases/tag/$TAG"
echo ""
echo -e "${YELLOW}O WordPress detectará a atualização automaticamente em até 12 horas.${NC}"
echo -e "${YELLOW}Ou force a verificação em: Plugins > Instalados${NC}"
echo ""
