#!/bin/bash

# Script to create WordPress plugin ZIP file
# Run: bash create-plugin-zip.sh

echo "Creating 4over Calculator WordPress Plugin ZIP..."

# Set plugin directory name
PLUGIN_DIR="4over-calculator-integration"

# Remove old ZIP if exists
rm -f 4over-calculator-plugin.zip

# Create ZIP file
cd "$(dirname "$0")"
zip -r 4over-calculator-plugin.zip $PLUGIN_DIR/ -x "*.DS_Store" "*.git*"

echo ""
echo "✅ ZIP file created: 4over-calculator-plugin.zip"
echo ""
echo "📦 Upload this ZIP to WordPress:"
echo "   Plugins → Add New → Upload Plugin"
echo ""
echo "🎉 Installation guide: INSTALLATION.md"
