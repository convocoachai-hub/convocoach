// Shared design tokens — extracted from page.tsx
// Must match C tokens across Navbar.tsx, Footer.tsx, and page.tsx exactly.

export const C = {
  cream:   '#F3EDE2',
  ink:     '#0F0C09',
  red:     '#D13920',
  warm1:   '#E8E0D2',
  warm2:   '#D4CBBA',
  muted:   '#8A8074',
  mutedLt: '#BFB8AC',
  amber:   '#B87A10',
} as const;

export const EO = { duration: 0.75, ease: [0.16, 1, 0.3, 1] } as const;

// Section wrapper (matches landing page exactly)
export const WRAP: React.CSSProperties = { maxWidth: 1120, margin: '0 auto', padding: '80px 28px' };

// Labels
export const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 800, letterSpacing: '0.14em',
  textTransform: 'uppercase', fontFamily: 'monospace',
  color: C.red, display: 'block', marginBottom: 16,
};
export const LABEL_DIM: React.CSSProperties = { ...LABEL, color: `${C.cream}35` };

// Heading style — matches landing page h2
export const H2: React.CSSProperties = {
  fontFamily: "'Bricolage Grotesque', sans-serif",
  fontSize: 'clamp(36px, 5vw, 56px)',
  fontWeight: 900, color: C.ink,
  letterSpacing: '-0.03em', lineHeight: 1.02,
  marginBottom: 48,
};

export const H2_DARK: React.CSSProperties = { ...H2, color: C.cream };

// Body
export const BODY: React.CSSProperties = {
  fontSize: 15, color: C.muted, lineHeight: 1.75,
};
export const BODY_DARK: React.CSSProperties = { ...BODY, color: `${C.cream}50` };
