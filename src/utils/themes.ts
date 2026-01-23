export const THEMES = {
    emerald: {
        name: 'Emerald',
        color: '#10b981',
        glow: 'rgba(16, 185, 129, 0.4)'
    },
    amber: {
        name: 'Orange',
        color: '#f97316',
        glow: 'rgba(249, 115, 22, 0.4)'
    },
    cobalt: {
        name: 'Cobalt',
        color: '#3b82f6',
        glow: 'rgba(59, 130, 246, 0.4)'
    },
    crimson: {
        name: 'Crimson',
        color: '#ef4444',
        glow: 'rgba(239, 68, 68, 0.4)'
    }
};

export const LIGHT_ACCENTS: Record<string, string> = {
    emerald: '#059669',
    amber: '#ea580c',
    cobalt: '#2563eb',
    crimson: '#dc2626'
};

export const getThemeColor = (themeId: string, isDark: boolean) => {
    if (isDark) return THEMES[themeId as keyof typeof THEMES]?.color || THEMES.emerald.color;
    return LIGHT_ACCENTS[themeId] || THEMES[themeId as keyof typeof THEMES]?.color || THEMES.emerald.color;
};
