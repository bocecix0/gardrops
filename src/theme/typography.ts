// Enhanced typography system for the LookSee app
export const typography = {
  // Font families with better hierarchy
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    extraBold: 'System',
  },
  
  // Enhanced font sizes with better visual hierarchy
  fontSize: {
    xs: 12,      // Captions, fine print
    sm: 14,      // Secondary text, labels
    base: 16,    // Body text
    lg: 18,      // Subheadings
    xl: 20,      // Headings
    '2xl': 24,   // Section titles
    '3xl': 30,   // Page titles
    '4xl': 36,   // Hero titles
    '5xl': 48,   // Display titles
  },
  
  // Enhanced font weights for better visual hierarchy
  fontWeight: {
    thin: '100',
    extraLight: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
    black: '900',
  },
  
  // Enhanced line heights for better readability
  lineHeight: {
    tight: 1.2,      // For large display text
    snug: 1.3,       // For headings
    normal: 1.5,     // For body text
    relaxed: 1.6,    // For paragraphs
    loose: 1.75,     // For long form content
  },
  
  // Enhanced letter spacing for better visual appeal
  letterSpacing: {
    tighter: -0.5,   // For large display text
    tight: -0.25,    // For headings
    normal: 0,       // For body text
    wide: 0.5,       // For labels
    wider: 1,        // For all caps
    widest: 2,       // For special cases
  },
};