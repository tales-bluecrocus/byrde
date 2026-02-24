#!/bin/bash
set -e

THEME_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$THEME_DIR/front-end"
OUTPUT="$THEME_DIR/../lakecity-theme.zip"

# Build frontend
echo "Building frontend..."
cd "$FRONTEND_DIR"
npm run build

# Create zip
echo "Packaging theme..."
cd "$THEME_DIR/.."
zip -r "$OUTPUT" lakecity/ \
  -x "lakecity/front-end/node_modules/*" \
  -x "lakecity/.git/*" \
  -x "lakecity/front-end/.vite/*" \
  -x "lakecity/front-end/src/*" \
  -x "lakecity/front-end/public/*" \
  -x "lakecity/front-end/vite.config.*" \
  -x "lakecity/front-end/tsconfig.*" \
  -x "lakecity/front-end/postcss.config.*" \
  -x "lakecity/front-end/tailwind.config.*" \
  -x "lakecity/front-end/components.json" \
  -x "lakecity/front-end/index.html" \
  -x "lakecity/front-end/package.json" \
  -x "lakecity/front-end/package-lock.json" \
  -x "lakecity/front-end/eslint.config.js" \
  -x "lakecity/front-end/.agents/*" \
  -x "lakecity/front-end/.claude/*" \
  -x "lakecity/front-end/README.md" \
  -x "lakecity/front-end/claude.md" \
  -x "lakecity/front-end/content.md" \
  -x "lakecity/front-end/reference.md" \
  -x "lakecity/.agents/*" \
  -x "lakecity/.claude/*" \
  -x "lakecity/CLAUDE.md" \
  -x "lakecity/IMPLEMENTATION.md" \
  -x "lakecity/diagnose.php" \
  -x "lakecity/.gitignore" \
  -x "lakecity/build.sh" \
  -x "*.log"

echo ""
echo "Done: $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"
