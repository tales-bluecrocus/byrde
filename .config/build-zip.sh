#!/bin/bash

# Script para gerar ZIP do tema manualmente (para distribuição/teste)
# Uso: ./.config/build-zip.sh

set -e

# Get theme root directory
THEME_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$THEME_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get version from style.css
VERSION=$(grep -m 1 "Version:" style.css | sed 's/.*Version: *//' | tr -d '\r')
THEME_NAME="byrde"
ZIP_NAME="${THEME_NAME}-${VERSION}.zip"
BUILD_DIR="dist-zip"

echo -e "${BLUE}📦 Gerando ZIP do tema...${NC}"
echo -e "${BLUE}Versão: ${VERSION}${NC}\n"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Aviso: Existem mudanças não commitadas${NC}"
    read -p "Deseja continuar? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Clean previous build
if [ -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}🧹 Limpando build anterior...${NC}"
    rm -rf "$BUILD_DIR"
fi

# Install dependencies
echo -e "${GREEN}📥 Instalando dependências Node...${NC}"
npm ci --silent

echo -e "${GREEN}📥 Instalando dependências Composer (produção)...${NC}"
composer install --no-dev --optimize-autoloader --quiet

# Build assets
echo -e "${GREEN}🔨 Compilando assets...${NC}"
npm run build

# Create build directory
mkdir -p "$BUILD_DIR"

echo -e "${GREEN}📋 Copiando arquivos do tema...${NC}"

# Copy theme files excluding development files
rsync -a --progress "$THEME_DIR/" "$BUILD_DIR/$THEME_NAME" \
    --exclude='.git/' \
    --exclude='.github/' \
    --exclude='.vscode/' \
    --exclude='node_modules/' \
    --exclude="$BUILD_DIR" \
    --exclude='.gitignore' \
    --exclude='.gitattributes' \
    --exclude='package.json' \
    --exclude='package-lock.json' \
    --exclude='composer.json' \
    --exclude='composer.lock' \
    --exclude='phpcs.xml' \
    --exclude='.config/' \
    --exclude='assets/' \
    --exclude='README.md' \
    --exclude='*.zip'

# Create ZIP
echo -e "${GREEN}🗜️  Criando arquivo ZIP...${NC}"
cd "$BUILD_DIR"
zip -r -q "../../$ZIP_NAME" "$THEME_NAME"
cd ..

# Cleanup
echo -e "${GREEN}🧹 Limpando arquivos temporários...${NC}"
rm -rf "$BUILD_DIR"

# Reinstall dev dependencies if needed
if [ -f "composer.json" ]; then
    echo -e "${GREEN}🔄 Restaurando dependências de desenvolvimento...${NC}"
    composer install --quiet
fi

# Show result
FILE_SIZE=$(du -h "../../$ZIP_NAME" | cut -f1)
echo ""
echo -e "${GREEN}✅ ZIP criado com sucesso!${NC}"
echo -e "${BLUE}📦 Arquivo: ${ZIP_NAME}${NC}"
echo -e "${BLUE}📏 Tamanho: ${FILE_SIZE}${NC}"
echo ""
echo -e "${YELLOW}💡 Para testar:${NC}"
echo -e "   1. Faça upload no WordPress: Aparência → Temas → Adicionar novo → Enviar tema"
echo -e "   2. Ou extraia localmente: unzip ${ZIP_NAME}"
echo ""
