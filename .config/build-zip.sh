#!/bin/bash

# Build local do plugin para upload manual no WordPress do cliente
# Uso: ./.config/build-zip.sh

set -e

# Get plugin root directory (parent of .config)
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$PLUGIN_DIR/front-end"
BUILD_DIR="$PLUGIN_DIR/dist-release"
OUTPUT="$PLUGIN_DIR/../byrde.zip"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Building Byrde plugin...${NC}\n"

# Clean old artifacts
echo -e "${GREEN}Cleaning old build...${NC}"
rm -rf "$FRONTEND_DIR/dist"
rm -rf "$BUILD_DIR"
rm -f "$OUTPUT"

# Install dependencies & build frontend
echo -e "${GREEN}Building frontend...${NC}"
cd "$FRONTEND_DIR"
npm ci --silent
npm run build

# Install composer production deps
echo -e "${GREEN}Installing composer dependencies...${NC}"
cd "$PLUGIN_DIR"
composer install --no-dev --optimize-autoloader --quiet

# Assemble distribution
echo -e "${GREEN}Packaging plugin...${NC}"
mkdir -p "$BUILD_DIR"

rsync -a "$PLUGIN_DIR/" "$BUILD_DIR/byrde/" \
  --exclude='.git/' \
  --exclude='.github/' \
  --exclude='.vscode/' \
  --exclude='.config/' \
  --exclude='.agents/' \
  --exclude='.claude/' \
  --exclude='dist-release/' \
  --exclude='plugins/' \
  --exclude='front-end/node_modules/' \
  --exclude='front-end/src/' \
  --exclude='front-end/public/' \
  --exclude='front-end/.vite/' \
  --exclude='front-end/.agents/' \
  --exclude='front-end/.claude/' \
  --exclude='front-end/vite.config.ts' \
  --exclude='front-end/tsconfig*.json' \
  --exclude='front-end/postcss.config.*' \
  --exclude='front-end/tailwind.config.*' \
  --exclude='front-end/components.json' \
  --exclude='front-end/index.html' \
  --exclude='front-end/package.json' \
  --exclude='front-end/package-lock.json' \
  --exclude='front-end/eslint.config.js' \
  --exclude='front-end/jest.config.ts' \
  --exclude='front-end/README.md' \
  --exclude='front-end/claude.md' \
  --exclude='/style.css' \
  --exclude='.gitignore' \
  --exclude='.gitattributes' \
  --exclude='composer.json' \
  --exclude='composer.lock' \
  --exclude='docs/' \
  --exclude='CLAUDE.md' \
  --exclude='README.md' \
  --exclude='*.log' \
  --exclude='video/'

# Create ZIP
cd "$BUILD_DIR"
zip -rq "$OUTPUT" byrde/

# Cleanup temp dir
rm -rf "$BUILD_DIR"

# Show result
SIZE=$(du -h "$OUTPUT" | cut -f1)
echo ""
echo -e "${GREEN}Done: $OUTPUT ($SIZE)${NC}"
echo ""

# Show what's in the zip for verification
echo -e "${BLUE}Contents:${NC}"
zipinfo -1 "$OUTPUT" | head -30
TOTAL=$(zipinfo -1 "$OUTPUT" | wc -l)
if [ "$TOTAL" -gt 30 ]; then
    echo "... and $((TOTAL - 30)) more files"
fi
echo ""
