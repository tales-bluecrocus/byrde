#!/bin/bash

# Script para auto-incrementar versão seguindo Semantic Versioning
# Uso: 
#   ./.config/bump-version.sh patch   → 1.0.0 → 1.0.1 (bug fixes)
#   ./.config/bump-version.sh minor   → 1.0.0 → 1.1.0 (new features)
#   ./.config/bump-version.sh major   → 1.0.0 → 2.0.0 (breaking changes)

set -e

# Get theme root directory (parent of .config)
THEME_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$THEME_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BUMP_TYPE=$1

# Validate argument
if [[ ! "$BUMP_TYPE" =~ ^(major|minor|patch)$ ]]; then
    echo -e "${RED}❌ Erro: Tipo de bump inválido${NC}"
    echo -e "\nUso:"
    echo -e "  ./.config/bump-version.sh patch   ${YELLOW}# 1.0.0 → 1.0.1 (correções)${NC}"
    echo -e "  ./.config/bump-version.sh minor   ${YELLOW}# 1.0.0 → 1.1.0 (features)${NC}"
    echo -e "  ./.config/bump-version.sh major   ${YELLOW}# 1.0.0 → 2.0.0 (breaking)${NC}"
    exit 1
fi

# Get current version from style.css
CURRENT_VERSION=$(grep -m 1 "Version:" style.css | sed 's/.*Version: *//' | tr -d '\r')

# Parse current version
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

# Calculate new version
case $BUMP_TYPE in
    major)
        NEW_VERSION="$((MAJOR + 1)).0.0"
        ;;
    minor)
        NEW_VERSION="$MAJOR.$((MINOR + 1)).0"
        ;;
    patch)
        NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))"
        ;;
esac

echo -e "${BLUE}🔢 Bump $BUMP_TYPE:${NC}"
echo -e "   ${CURRENT_VERSION} → ${GREEN}${NEW_VERSION}${NC}\n"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Call create-release.sh with the new version
"$SCRIPT_DIR/create-release.sh" "$NEW_VERSION"
