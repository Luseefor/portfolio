import type React from 'react';

export interface ThemeDropdownProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  isDark: boolean;
  toggleDark: () => void;
  themeColor: string;
  renderTrigger?: (params: {
    isOpen: boolean;
    themeColor: string;
    currentThemeName: string;
  }) => React.ReactNode;
  triggerClassName?: string;
}
