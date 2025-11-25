#!/usr/bin/env ts-node
/**
 * Design Token Generator (TypeScript)
 * Creates consistent design system tokens for colors, typography, spacing, and more
 */

// Type Definitions
interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSV {
  h: number;
  s: number;
  v: number;
}

interface ColorScale {
  [key: string]: string;
  DEFAULT: string;
}

interface SemanticColor {
  base: string;
  light: string;
  dark: string;
  contrast: string;
}

interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  neutral: ColorScale;
  semantic: {
    success: SemanticColor;
    warning: SemanticColor;
    error: SemanticColor;
    info: SemanticColor;
  };
  surface: {
    background: string;
    foreground: string;
    card: string;
    overlay: string;
    divider: string;
  };
}

interface TypographySystem {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, number>;
  letterSpacing: Record<string, string>;
  textStyles: Record<string, any>;
}

interface DesignTokens {
  meta: {
    version: string;
    style: string;
    generated: string;
  };
  colors: ColorPalette;
  typography: TypographySystem;
  spacing: Record<string, string>;
  sizing: any;
  borders: any;
  shadows: Record<string, string>;
  animation: any;
  breakpoints: Record<string, string>;
  'z-index': Record<string, number>;
}

type Style = 'modern' | 'classic' | 'playful';

/**
 * DesignTokenGenerator Class
 */
class DesignTokenGenerator {
  private baseUnit = 8; // 8pt grid system
  private typeScaleRatio = 1.25; // Major third
  private baseFontSize = 16;

  /**
   * Generate complete design token system
   */
  generateCompleteSystem(brandColor = '#0066CC', style: Style = 'modern'): DesignTokens {
    return {
      meta: {
        version: '1.0.0',
        style,
        generated: 'auto-generated'
      },
      colors: this.generateColorPalette(brandColor),
      typography: this.generateTypographySystem(style),
      spacing: this.generateSpacingSystem(),
      sizing: this.generateSizingTokens(),
      borders: this.generateBorderTokens(style),
      shadows: this.generateShadowTokens(style),
      animation: this.generateAnimationTokens(),
      breakpoints: this.generateBreakpoints(),
      'z-index': this.generateZIndexScale()
    };
  }

  /**
   * Generate comprehensive color palette from brand color
   */
  generateColorPalette(brandColor: string): ColorPalette {
    return {
      primary: this.generateColorScale(brandColor, 'primary'),
      secondary: this.generateColorScale(this.adjustHue(brandColor, 180), 'secondary'),
      neutral: this.generateNeutralScale(),
      semantic: {
        success: {
          base: '#10B981',
          light: '#34D399',
          dark: '#059669',
          contrast: '#FFFFFF'
        },
        warning: {
          base: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
          contrast: '#FFFFFF'
        },
        error: {
          base: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
          contrast: '#FFFFFF'
        },
        info: {
          base: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
          contrast: '#FFFFFF'
        }
      },
      surface: {
        background: '#FFFFFF',
        foreground: '#111827',
        card: '#FFFFFF',
        overlay: 'rgba(0, 0, 0, 0.5)',
        divider: '#E5E7EB'
      }
    };
  }

  /**
   * Generate color scale from base color
   */
  private generateColorScale(baseColor: string, name: string): ColorScale {
    const scale: ColorScale = { DEFAULT: baseColor };
    const rgb = this.hexToRgb(baseColor);
    const hsv = this.rgbToHsv(rgb);

    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

    for (const step of steps) {
      // Adjust lightness based on step
      const factor = (1000 - step) / 1000;
      const newV = step < 500 ? 0.95 : hsv.v * (1 - (step - 500) / 500);
      const newS = hsv.s * (0.3 + 0.7 * (step / 900));

      const newRgb = this.hsvToRgb({ h: hsv.h, s: newS, v: newV });
      scale[step.toString()] = this.rgbToHex(newRgb);
    }

    return scale;
  }

  /**
   * Generate neutral color scale
   */
  private generateNeutralScale(): ColorScale {
    return {
      '50': '#F9FAFB',
      '100': '#F3F4F6',
      '200': '#E5E7EB',
      '300': '#D1D5DB',
      '400': '#9CA3AF',
      '500': '#6B7280',
      '600': '#4B5563',
      '700': '#374151',
      '800': '#1F2937',
      '900': '#111827',
      DEFAULT: '#6B7280'
    };
  }

  /**
   * Generate typography system
   */
  generateTypographySystem(style: Style): TypographySystem {
    const fontFamilies = {
      modern: {
        sans: 'Inter, system-ui, -apple-system, sans-serif',
        serif: 'Merriweather, Georgia, serif',
        mono: 'Fira Code, Monaco, monospace'
      },
      classic: {
        sans: 'Helvetica, Arial, sans-serif',
        serif: 'Times New Roman, Times, serif',
        mono: 'Courier New, monospace'
      },
      playful: {
        sans: 'Poppins, Roboto, sans-serif',
        serif: 'Playfair Display, Georgia, serif',
        mono: 'Source Code Pro, monospace'
      }
    };

    return {
      fontFamily: fontFamilies[style],
      fontSize: this.generateTypeScale(),
      fontWeight: {
        thin: 100,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900
      },
      lineHeight: {
        none: 1,
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em'
      },
      textStyles: this.generateTextStyles()
    };
  }

  /**
   * Generate modular type scale
   */
  private generateTypeScale(): Record<string, string> {
    const scale: Record<string, string> = {};
    const sizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
    const baseIndex = sizes.indexOf('base');

    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i];
      if (size === 'base') {
        scale[size] = `${this.baseFontSize}px`;
      } else if (i < baseIndex) {
        const factor = Math.pow(this.typeScaleRatio, baseIndex - i);
        scale[size] = `${Math.round(this.baseFontSize / factor)}px`;
      } else {
        const factor = Math.pow(this.typeScaleRatio, i - baseIndex);
        scale[size] = `${Math.round(this.baseFontSize * factor)}px`;
      }
    }

    return scale;
  }

  /**
   * Generate pre-composed text styles
   */
  private generateTextStyles(): Record<string, any> {
    return {
      h1: {
        fontSize: '48px',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.02em'
      },
      h2: {
        fontSize: '36px',
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: '-0.01em'
      },
      h3: {
        fontSize: '28px',
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '0'
      },
      h4: {
        fontSize: '24px',
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '0'
      },
      h5: {
        fontSize: '20px',
        fontWeight: 600,
        lineHeight: 1.5,
        letterSpacing: '0'
      },
      h6: {
        fontSize: '16px',
        fontWeight: 600,
        lineHeight: 1.5,
        letterSpacing: '0.01em'
      },
      body: {
        fontSize: '16px',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0'
      },
      small: {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0'
      },
      caption: {
        fontSize: '12px',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0.01em'
      }
    };
  }

  /**
   * Generate spacing system based on 8pt grid
   */
  generateSpacingSystem(): Record<string, string> {
    const spacing: Record<string, string> = {};
    const multipliers = [0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20, 24, 32, 40, 48, 56, 64];

    for (let i = 0; i < multipliers.length; i++) {
      spacing[i.toString()] = `${Math.round(this.baseUnit * multipliers[i])}px`;
    }

    // Add semantic spacing
    spacing.xs = spacing['1'];    // 4px
    spacing.sm = spacing['2'];    // 8px
    spacing.md = spacing['4'];    // 16px
    spacing.lg = spacing['6'];    // 24px
    spacing.xl = spacing['8'];    // 32px
    spacing['2xl'] = spacing['12']; // 48px
    spacing['3xl'] = spacing['16']; // 64px

    return spacing;
  }

  /**
   * Generate sizing tokens for components
   */
  private generateSizingTokens(): any {
    return {
      container: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      components: {
        button: {
          sm: { height: '32px', paddingX: '12px' },
          md: { height: '40px', paddingX: '16px' },
          lg: { height: '48px', paddingX: '20px' }
        },
        input: {
          sm: { height: '32px', paddingX: '12px' },
          md: { height: '40px', paddingX: '16px' },
          lg: { height: '48px', paddingX: '20px' }
        },
        icon: {
          sm: '16px',
          md: '20px',
          lg: '24px',
          xl: '32px'
        }
      }
    };
  }

  /**
   * Generate border tokens
   */
  private generateBorderTokens(style: Style): any {
    const radiusValues = {
      modern: {
        none: '0',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px'
      },
      classic: {
        none: '0',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        full: '9999px'
      },
      playful: {
        none: '0',
        sm: '8px',
        DEFAULT: '16px',
        md: '20px',
        lg: '24px',
        xl: '32px',
        full: '9999px'
      }
    };

    return {
      radius: radiusValues[style],
      width: {
        none: '0',
        thin: '1px',
        DEFAULT: '1px',
        medium: '2px',
        thick: '4px'
      }
    };
  }

  /**
   * Generate shadow tokens
   */
  private generateShadowTokens(style: Style): Record<string, string> {
    const shadowStyles = {
      modern: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
      },
      classic: {
        none: 'none',
        sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
        DEFAULT: '0 2px 4px rgba(0, 0, 0, 0.1)',
        md: '0 4px 8px rgba(0, 0, 0, 0.1)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
        xl: '0 16px 32px rgba(0, 0, 0, 0.1)'
      },
      playful: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }
    };

    return shadowStyles[style];
  }

  /**
   * Generate animation tokens
   */
  private generateAnimationTokens(): any {
    return {
      duration: {
        instant: '0ms',
        fast: '150ms',
        DEFAULT: '250ms',
        slow: '350ms',
        slower: '500ms'
      },
      easing: {
        linear: 'linear',
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
        spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 }
        },
        slideUp: {
          from: { transform: 'translateY(10px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 }
        },
        scale: {
          from: { transform: 'scale(0.95)' },
          to: { transform: 'scale(1)' }
        }
      }
    };
  }

  /**
   * Generate responsive breakpoints
   */
  private generateBreakpoints(): Record<string, string> {
    return {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    };
  }

  /**
   * Generate z-index scale
   */
  private generateZIndexScale(): Record<string, number> {
    return {
      hide: -1,
      base: 0,
      dropdown: 1000,
      sticky: 1020,
      overlay: 1030,
      modal: 1040,
      popover: 1050,
      tooltip: 1060,
      notification: 1070
    };
  }

  /**
   * Export tokens in various formats
   */
  exportTokens(tokens: DesignTokens, format: 'json' | 'css' | 'scss' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(tokens, null, 2);
    } else if (format === 'css') {
      return this.exportAsCSS(tokens);
    } else if (format === 'scss') {
      return this.exportAsSCSS(tokens);
    }
    return JSON.stringify(tokens, null, 2);
  }

  /**
   * Export as CSS variables
   */
  private exportAsCSS(tokens: DesignTokens): string {
    const css: string[] = [':root {'];

    const flattenDict = (obj: any, prefix = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flattenDict(value, prefix ? `${prefix}-${key}` : key);
        } else {
          css.push(`  --${prefix}-${key}: ${value};`);
        }
      }
    };

    flattenDict(tokens);
    css.push('}');

    return css.join('\n');
  }

  /**
   * Export as SCSS variables
   */
  private exportAsSCSS(tokens: DesignTokens): string {
    const scss: string[] = ['// Design Tokens (SCSS)', ''];

    const flattenDict = (obj: any, prefix = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flattenDict(value, prefix ? `${prefix}-${key}` : key);
        } else {
          scss.push(`$${prefix}-${key}: ${value};`);
        }
      }
    };

    flattenDict(tokens);

    return scss.join('\n');
  }

  // Color conversion utilities
  private hexToRgb(hex: string): RGB {
    const cleanHex = hex.replace('#', '');
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16)
    };
  }

  private rgbToHex(rgb: RGB): string {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  private rgbToHsv(rgb: RGB): HSV {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === r) {
        h = ((g - b) / delta) % 6;
      } else if (max === g) {
        h = (b - r) / delta + 2;
      } else {
        h = (r - g) / delta + 4;
      }
      h *= 60;
      if (h < 0) h += 360;
    }

    const s = max === 0 ? 0 : delta / max;
    const v = max;

    return { h: h / 360, s, v };
  }

  private hsvToRgb(hsv: HSV): RGB {
    const h = hsv.h * 360;
    const s = hsv.s;
    const v = hsv.v;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }

    return {
      r: (r + m) * 255,
      g: (g + m) * 255,
      b: (b + m) * 255
    };
  }

  private adjustHue(hexColor: string, degrees: number): string {
    const rgb = this.hexToRgb(hexColor);
    const hsv = this.rgbToHsv(rgb);
    hsv.h = (hsv.h + degrees / 360) % 1;
    const newRgb = this.hsvToRgb(hsv);
    return this.rgbToHex(newRgb);
  }
}

/**
 * Main execution
 */
function main() {
  const generator = new DesignTokenGenerator();

  // Parse arguments
  const args = process.argv.slice(2);
  const brandColor = args.find(arg => arg.startsWith('--color='))?.split('=')[1] || args[0] || '#0066CC';
  const styleArg = args.find(arg => arg.startsWith('--style='))?.split('=')[1] || args[1] || 'modern';
  const formatArg = args.find(arg => arg.startsWith('--format='))?.split('=')[1] || args[2] || 'json';

  const style = (styleArg as Style);
  const outputFormat = formatArg as 'json' | 'css' | 'scss' | 'summary';

  // Generate tokens
  const tokens = generator.generateCompleteSystem(brandColor, style);

  // Output
  if (outputFormat === 'summary') {
    console.log('='.repeat(60));
    console.log('DESIGN SYSTEM TOKENS');
    console.log('='.repeat(60));
    console.log(`\n🎨 Style: ${style}`);
    console.log(`🎨 Brand Color: ${brandColor}`);
    console.log('\n📊 Generated Tokens:');
    console.log(`  • Colors: ${Object.keys(tokens.colors).length} palettes`);
    console.log(`  • Typography: ${Object.keys(tokens.typography).length} categories`);
    console.log(`  • Spacing: ${Object.keys(tokens.spacing).length} values`);
    console.log(`  • Shadows: ${Object.keys(tokens.shadows).length} styles`);
    console.log(`  • Breakpoints: ${Object.keys(tokens.breakpoints).length} sizes`);
    console.log('\n💾 Export formats available: json, css, scss');
  } else {
    console.log(generator.exportTokens(tokens, outputFormat as 'json' | 'css' | 'scss'));
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { DesignTokenGenerator, DesignTokens, Style };
