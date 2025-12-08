#!/bin/bash

# Build script for Chrome Extension
echo "Building Chrome Extension for LinkedIn Recruitment..."

# Create dist directory if it doesn't exist
mkdir -p dist

# Copy all necessary files to dist
cp manifest.json dist/
cp popup.html dist/
cp popup.js dist/
cp content.js dist/
cp background.js dist/
cp icon16.png dist/ 2>/dev/null || echo "Warning: icon16.png not found"
cp icon48.png dist/ 2>/dev/null || echo "Warning: icon48.png not found"
cp icon128.png dist/ 2>/dev/null || echo "Warning: icon128.png not found"

# Create the extension ZIP file for distribution
cd dist
zip -r ../linkedin-recruitment-extension.zip *
cd ..

echo "✅ Extension packaged successfully!"
echo ""
echo "📦 Output files:"
echo "  - dist/            (unpacked extension for development)"
echo "  - linkedin-recruitment-extension.zip  (for distribution)"
echo ""
echo "📝 Installation instructions:"
echo "  1. Open Chrome and go to chrome://extensions/"
echo "  2. Enable 'Developer mode' in the top right"
echo "  3. Click 'Load unpacked' and select the 'dist' folder"
echo "  4. Or drag and drop the .zip file to install"
echo ""
echo "🔗 The extension will be active on LinkedIn profile pages"