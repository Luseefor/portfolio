export const DEFAULT_THEME_ID = 'steel';

export const THEMES = {
  steel: {
    name: 'Steel',
    color: '#b8c7d9',
    glow: 'rgba(184, 199, 217, 0.22)',
  },
  stone: {
    name: 'Stone',
    color: '#b9c7b5',
    glow: 'rgba(185, 199, 181, 0.2)',
  },
  bronze: {
    name: 'Bronze',
    color: '#cdb8a2',
    glow: 'rgba(205, 184, 162, 0.2)',
  },
  mulberry: {
    name: 'Mulberry',
    color: '#b8aebe',
    glow: 'rgba(184, 174, 190, 0.2)',
  },
};

export const LIGHT_ACCENTS: Record<string, string> = {
  steel: '#7b8ea6',
  stone: '#788a76',
  bronze: '#967d63',
  mulberry: '#7d7089',
};

export type SurfacePalette = {
  base: string;
  elevated: string;
  panel: string;
  soft: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderDefault: string;
  borderStrong: string;
  wash: string;
};

const DARK_SURFACE_PALETTE: SurfacePalette = {
  base: '#0b1016',
  elevated: '#121922',
  panel: '#161f2a',
  soft: '#1c2733',
  textPrimary: '#e7edf3',
  textSecondary: '#a2afbc',
  textMuted: '#718090',
  borderDefault: '#263241',
  borderStrong: '#324154',
  wash: '#d9d3c7',
};

const LIGHT_SURFACE_PALETTE: SurfacePalette = {
  base: '#f3f5f8',
  elevated: '#fbfcfd',
  panel: '#f7f9fb',
  soft: '#edf2f6',
  textPrimary: '#12202f',
  textSecondary: '#506070',
  textMuted: '#718090',
  borderDefault: '#d6dee8',
  borderStrong: '#c4d0dc',
  wash: '#e8e2d7',
};

export const getThemeColor = (themeId: string, isDark: boolean) => {
  if (isDark) {
    return THEMES[themeId as keyof typeof THEMES]?.color || THEMES[DEFAULT_THEME_ID].color;
  }

  return (
    LIGHT_ACCENTS[themeId] ||
    THEMES[themeId as keyof typeof THEMES]?.color ||
    LIGHT_ACCENTS[DEFAULT_THEME_ID]
  );
};

export const getSurfacePalette = (isDark: boolean) =>
  isDark ? DARK_SURFACE_PALETTE : LIGHT_SURFACE_PALETTE;

export const hexToRgba = (hex: string, opacity: number) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})`
    : hex;
};
