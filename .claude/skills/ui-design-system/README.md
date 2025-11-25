# UI Design System Skill

Automated design token generation for scalable design systems.

## Quick Start

### Python Version
```bash
# JSON output (default)
python scripts/design_token_generator.py "#0066CC" modern json

# CSS variables
python scripts/design_token_generator.py "#FF5733" classic css > tokens.css

# SCSS variables
python scripts/design_token_generator.py "#10B981" playful scss > tokens.scss

# Summary view
python scripts/design_token_generator.py "#8B5CF6" modern summary
```

### TypeScript Version
```bash
# JSON output
ts-node scripts/design-token-generator.ts --color="#0066CC" --style=modern --format=json

# CSS variables
ts-node scripts/design-token-generator.ts --color="#FF5733" --style=classic --format=css

# SCSS variables
ts-node scripts/design-token-generator.ts --color="#10B981" --style=playful --format=scss
```

## Features

- **Complete Token System**: Colors, typography, spacing, sizing, borders, shadows, animation
- **3 Style Variations**: Modern (Inter), Classic (Helvetica), Playful (Poppins)
- **Color Palette Generation**: 10-shade scales from single brand color
- **8pt Spacing Grid**: Industry-standard spacing system
- **Modular Typography**: 1.25 ratio (Major Third) type scale
- **Multiple Export Formats**: JSON, CSS, SCSS

## Styles Comparison

| Feature | Modern | Classic | Playful |
|---------|--------|---------|---------|
| Font | Inter | Helvetica | Poppins |
| Radius | 8px | 4px | 16px |
| Shadow | Subtle | Traditional | Bold |

## Sample Output

```
============================================================
DESIGN SYSTEM TOKENS
============================================================

🎨 Style: modern
🎨 Brand Color: #0066CC

📊 Generated Tokens:
  • Colors: 4 palettes
  • Typography: 6 categories
  • Spacing: 31 values
  • Shadows: 8 styles
  • Breakpoints: 6 sizes

💾 Export formats available: json, css, scss
```

## Integration Examples

### Tailwind CSS
```javascript
const tokens = require('./tokens.json');

module.exports = {
  theme: {
    colors: tokens.colors,
    spacing: tokens.spacing,
    fontSize: tokens.typography.fontSize
  }
}
```

### CSS Variables
```css
@import './tokens.css';

.button {
  background: var(--primary-500);
  padding: var(--spacing-md);
  border-radius: var(--radius-DEFAULT);
}
```

## Documentation

See [SKILL.md](./SKILL.md) for complete documentation.
