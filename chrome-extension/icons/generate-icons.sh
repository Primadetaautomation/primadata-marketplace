#!/bin/bash

# Generate icon SVG and convert to PNG sizes
# This script creates simple icons for the Chrome extension

# Create icons directory
mkdir -p ../icons

# Create a simple SVG icon
cat > icon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" fill="#7C3AED" rx="16"/>
  <circle cx="64" cy="45" r="16" fill="white"/>
  <path d="M 40 80 Q 64 65 88 80 L 88 100 L 40 100 Z" fill="white"/>
  <rect x="54" y="85" width="20" height="3" fill="#7C3AED"/>
  <rect x="54" y="92" width="20" height="3" fill="#7C3AED"/>
</svg>
EOF

echo "Icon SVG created!"
echo ""
echo "To convert to PNG, you can use ImageMagick:"
echo "  convert -background transparent icon.svg -resize 16x16 ../icon16.png"
echo "  convert -background transparent icon.svg -resize 48x48 ../icon48.png"
echo "  convert -background transparent icon.svg -resize 128x128 ../icon128.png"
echo ""
echo "Or use an online converter like:"
echo "  - https://cloudconvert.com/svg-to-png"
echo "  - https://svgtopng.com/"
echo ""
echo "Or use the placeholder data URLs in the manifest.json"