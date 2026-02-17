'use client';

import { useState } from 'react';
import { THEMES } from '@/utils/themes';
import { ThemeDropdownMenu } from './theme-dropdown/ThemeDropdownMenu';
import { ThemeDropdownTrigger } from './theme-dropdown/ThemeDropdownTrigger';
import type { ThemeDropdownProps } from './theme-dropdown/types';

const ThemeDropdown = ({
  currentTheme,
  onThemeChange,
  isDark,
  toggleDark,
  themeColor,
  konamiUnlocked = false,
  konamiEnabled = false,
  onKonamiToggle,
  renderTrigger,
  triggerClassName,
}: ThemeDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentThemeName = THEMES[currentTheme as keyof typeof THEMES]?.name ?? currentTheme.toUpperCase();
  const themeControlsDisabled = konamiEnabled;
  const showKonamiControls = konamiUnlocked && typeof onKonamiToggle === 'function';

  return (
    <div className="relative">
      <ThemeDropdownTrigger
        renderTrigger={renderTrigger}
        triggerClassName={triggerClassName}
        isDark={isDark}
        isOpen={isOpen}
        themeColor={themeColor}
        currentThemeName={currentThemeName}
        onToggle={() => setIsOpen((prev) => !prev)}
      />
      <ThemeDropdownMenu
        currentTheme={currentTheme}
        onThemeChange={onThemeChange}
        isDark={isDark}
        toggleDark={toggleDark}
        konamiEnabled={konamiEnabled}
        onKonamiToggle={onKonamiToggle}
        isOpen={isOpen}
        themeControlsDisabled={themeControlsDisabled}
        showKonamiControls={showKonamiControls}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
};

export default ThemeDropdown;
