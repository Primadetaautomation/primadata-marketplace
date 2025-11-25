---
name: ui-design-system
description: UI design system toolkit for Senior UI Designer including design token generation, component documentation, responsive design calculations, and developer handoff tools. Use for creating design systems, maintaining visual consistency, and facilitating design-dev collaboration.
triggers: [design tokens, design system, component library, UI design, visual design, design consistency, style guide, design patterns, Tailwind, CSS tokens]
version: 1.0.0
agents: [ux-design-expert, frontend-specialist, senior-frontend]
context_levels:
  minimal: Core design system principles and token basics
  detailed: Complete token generation and component patterns
  full: Working scripts, templates, and export formats
---

# UI Design System

Professional toolkit for creating and maintaining scalable design systems with automated token generation and developer handoff.

## Overview
This skill provides comprehensive design system capabilities including programmatic design token generation, color palette creation from brand colors, typography systems, spacing grids, and multi-format exports for seamless design-to-development workflow.

## When to Use This Skill
- Creating a new design system from scratch
- Generating design tokens from brand colors
- Building consistent component libraries
- Maintaining visual consistency across products
- Facilitating design-to-developer handoff
- Implementing responsive design systems
- Setting up Tailwind CSS configurations

## Core Capabilities

### 1. Design Token Generation
Automatically generate comprehensive design token systems:
- **Color Palettes**: Generate 50-900 scales from single brand color
- **Typography**: Modular type scale with font families and weights
- **Spacing**: 8pt grid system with semantic naming
- **Sizing**: Component dimensions and container widths
- **Borders**: Radius and width tokens for different styles
- **Shadows**: Elevation system for depth hierarchy
- **Animation**: Duration and easing tokens
- **Breakpoints**: Responsive design breakpoints
- **Z-Index**: Layering system for overlays and modals

### 2. Style Variations
Three built-in style systems:
- **Modern**: Inter fonts, subtle shadows, 8px base radius
- **Classic**: Helvetica fonts, traditional shadows, 4px base radius
- **Playful**: Poppins fonts, pronounced shadows, 16px base radius

### 3. Color System Generation
Sophisticated color palette generation:
- Primary and secondary color scales (10 shades each)
- Complementary color calculation (180° hue rotation)
- Neutral gray scale (9 shades)
- Semantic colors (success, warning, error, info)
- Surface colors (background, foreground, card, overlay)
- Automatic contrast calculation
- WCAG accessibility compliance

### 4. Typography System
Modular typography scale:
- Base: 16px with 1.25 ratio (Major Third)
- Font families per style (sans, serif, mono)
- Font weights (100-900)
- Line heights (tight to loose)
- Letter spacing (tighter to widest)
- Pre-composed text styles (h1-h6, body, small, caption)

### 5. Spacing & Sizing
8pt grid system:
- Base unit: 8px
- Multipliers: 0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20, 24, 32, 40, 48, 56, 64
- Semantic names: xs, sm, md, lg, xl, 2xl, 3xl
- Component sizing (buttons, inputs, icons)
- Container widths (sm: 640px to 2xl: 1536px)

### 6. Export Formats
Multiple output formats for different use cases:
- **JSON**: For programmatic consumption
- **CSS Variables**: For direct CSS integration
- **SCSS Variables**: For Sass/SCSS projects
- **Summary**: Human-readable overview

## Available Tools

### Python Script: design_token_generator.py
**Location:** `scripts/design_token_generator.py`

**Purpose:** Generate complete design system tokens from a single brand color with scientific color theory algorithms.

**Usage:**
```bash
# JSON output (default)
python scripts/design_token_generator.py "#0066CC" modern json

# CSS variables
python scripts/design_token_generator.py "#FF5733" classic css > tokens.css

# SCSS variables
python scripts/design_token_generator.py "#10B981" playful scss > tokens.scss

# Human-readable summary
python scripts/design_token_generator.py "#8B5CF6" modern summary
```

**Parameters:**
1. **Brand Color** (hex): Primary brand color (e.g., "#0066CC")
2. **Style**: modern | classic | playful
3. **Format**: json | css | scss | summary

**Features:**
- HSV-based color scale generation
- Automatic complementary color calculation
- Modular typography scale (Major Third ratio)
- 8pt spacing grid system
- Responsive breakpoint generation
- Multiple shadow styles
- Animation timing functions
- Z-index scale for layering

**Output Structure:**
```json
{
  "meta": {
    "version": "1.0.0",
    "style": "modern",
    "generated": "auto-generated"
  },
  "colors": { /* comprehensive palette */ },
  "typography": { /* type system */ },
  "spacing": { /* 8pt grid */ },
  "sizing": { /* component sizes */ },
  "borders": { /* radius & width */ },
  "shadows": { /* elevation */ },
  "animation": { /* timing */ },
  "breakpoints": { /* responsive */ },
  "z-index": { /* layering */ }
}
```

### TypeScript Script: design-token-generator.ts
**Location:** `scripts/design-token-generator.ts`

**Purpose:** Same functionality as Python version with TypeScript type safety and Node.js ecosystem integration.

**Usage:**
```bash
# JSON output
ts-node scripts/design-token-generator.ts --color="#0066CC" --style=modern --format=json

# CSS output
ts-node scripts/design-token-generator.ts --color="#FF5733" --style=classic --format=css

# Tailwind config generation
ts-node scripts/design-token-generator.ts --color="#10B981" --style=modern --format=tailwind
```

**TypeScript Advantages:**
- Type-safe token definitions
- Better IDE autocomplete
- Easy integration with build tools
- Native async/await support
- Direct Tailwind config generation

## Design System Best Practices

### Color System
1. **Start with Brand**: Use primary brand color as foundation
2. **Test Contrast**: Ensure WCAG AA compliance (4.5:1 for text)
3. **Semantic Meaning**: Consistent color usage (green=success, red=error)
4. **Accessible Palette**: Provide sufficient contrast options
5. **Dark Mode Ready**: Generate complementary dark mode tokens

### Typography
1. **Modular Scale**: Use mathematical ratios (1.25, 1.333, 1.414)
2. **Readable Base**: Start with 16px base font size
3. **Line Height**: 1.5 for body text, 1.2-1.3 for headings
4. **Font Loading**: Optimize web font performance
5. **Hierarchy**: Clear visual hierarchy through size and weight

### Spacing
1. **8pt Grid**: Base all spacing on 8px multiples
2. **Consistent Usage**: Use same spacing values throughout
3. **Semantic Names**: Use xs, sm, md instead of numbers alone
4. **Component Spacing**: Define padding/margin per component
5. **Responsive**: Adjust spacing at different breakpoints

### Components
1. **Atomic Design**: Build from atoms → molecules → organisms
2. **Composition**: Combine simple components into complex ones
3. **Variants**: Define clear size/style variants
4. **States**: Document hover, focus, active, disabled states
5. **Accessibility**: Include ARIA attributes and keyboard navigation

### Developer Handoff
1. **Token Export**: Provide tokens in dev-friendly formats
2. **Documentation**: Include usage examples and guidelines
3. **Code Snippets**: Share component implementation code
4. **Design-Dev Sync**: Regular sync meetings
5. **Version Control**: Track design system changes in Git

## Integration Examples

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
const tokens = require('./tokens.json');

module.exports = {
  theme: {
    colors: tokens.colors,
    spacing: tokens.spacing,
    fontSize: tokens.typography.fontSize,
    fontFamily: tokens.typography.fontFamily,
    borderRadius: tokens.borders.radius,
    boxShadow: tokens.shadows,
  }
}
```

### CSS Variables
```css
/* Import generated tokens.css */
@import './tokens.css';

.button {
  background-color: var(--primary-500);
  color: var(--neutral-50);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-DEFAULT);
  box-shadow: var(--shadow-sm);
}
```

### React Component
```typescript
import tokens from './tokens.json';

const Button = ({ variant = 'primary', size = 'md' }) => ({
  backgroundColor: tokens.colors.primary[500],
  padding: `${tokens.spacing[size]} ${tokens.spacing[size * 1.5]}`,
  borderRadius: tokens.borders.radius.DEFAULT,
});
```

## Context Levels

### Level 1 - Minimal (Always Loaded)
- Core design system principles
- Token categories overview
- Basic color theory
- 8pt grid concept

### Level 2 - Detailed (Load on Request)
- Complete token generation methodology
- Color scale algorithms
- Typography scale mathematics
- Component sizing patterns
- Export format specifications

### Level 3 - Full (Scripts and Examples)
- Working Python and TypeScript scripts
- Sample token outputs
- Integration examples (Tailwind, CSS, React)
- Complete design system templates

## Style Comparison

| Feature | Modern | Classic | Playful |
|---------|--------|---------|---------|
| Font Stack | Inter, system-ui | Helvetica, Arial | Poppins, Roboto |
| Base Radius | 8px | 4px | 16px |
| Shadow Style | Subtle, layered | Traditional, simple | Pronounced, bold |
| Best For | SaaS, Apps | Corporate, Formal | Creative, Consumer |

## Integration with Other Skills

Works well with:
- **ux-researcher-designer**: Use persona insights to inform design decisions
- **frontend-specialist**: Apply design tokens in component implementation
- **accessibility-specialist**: Ensure WCAG compliance with color contrast
- **testing-fundamentals**: Visual regression testing for design consistency

## References

**Design Systems:**
- Material Design (Google)
- Human Interface Guidelines (Apple)
- Lightning Design System (Salesforce)
- Polaris (Shopify)
- Carbon Design System (IBM)

**Tools & Frameworks:**
- Tailwind CSS
- Styled System
- Theme UI
- Style Dictionary

**Color Theory:**
- HSV/HSL Color Models
- WCAG Contrast Guidelines
- Color Accessibility Tools

**Typography:**
- Modular Scale Calculator
- Type Scale (typescale.com)
- Web Font Performance Best Practices

## Version History

**v1.0.0** - Initial release
- Automated design token generation
- Three style variations (modern, classic, playful)
- Python and TypeScript implementations
- Multiple export formats (JSON, CSS, SCSS)
- 8pt spacing grid system
- Modular typography scale (1.25 ratio)
- HSV-based color generation
- Responsive breakpoints
- Z-index layering system

---

**Maintained by:** Primadata Enhanced Toolkit
**Source:** Based on claude-skills repository by Alireza Rezvani
**Last Updated:** November 2025
