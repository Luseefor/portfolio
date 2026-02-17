'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun, Zap } from 'lucide-react';
import { THEMES } from '@/utils/themes';
import type { ThemeDropdownProps } from './types';

type ThemeDropdownMenuProps = Pick<
  ThemeDropdownProps,
  'currentTheme' | 'onThemeChange' | 'isDark' | 'toggleDark' | 'konamiEnabled' | 'onKonamiToggle'
> & {
  isOpen: boolean;
  themeControlsDisabled: boolean;
  showKonamiControls: boolean;
  onClose: () => void;
};

export function ThemeDropdownMenu({
  currentTheme,
  onThemeChange,
  isDark,
  toggleDark,
  konamiEnabled,
  onKonamiToggle,
  isOpen,
  themeControlsDisabled,
  showKonamiControls,
  onClose,
}: ThemeDropdownMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute right-0 top-full z-[110] mt-4 w-56 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${isDark ? 'border-white/10 bg-black/80' : 'border-black/5 bg-white/90'}`}
          >
            <div className="mb-2 flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-900/40'}`}>Appearance</span>
                <button
                  disabled={themeControlsDisabled}
                  onClick={toggleDark}
                  className={`flex h-6 w-12 items-center rounded-full p-1 transition-colors ${isDark ? 'bg-white/10' : 'bg-black/10'} ${themeControlsDisabled ? 'cursor-not-allowed opacity-40' : ''}`}
                >
                  <motion.div
                    animate={{ x: isDark ? 24 : 0 }}
                    className={`h-4 w-4 rounded-full flex items-center justify-center ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}
                  >
                    {isDark ? <Moon size={8} /> : <Sun size={8} />}
                  </motion.div>
                </button>
              </div>

              <div className="flex flex-col gap-3 px-1">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-900/40'}`}>System Accent</span>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(THEMES).map(([id, theme]) => (
                    <button
                      key={id}
                      disabled={themeControlsDisabled}
                      onClick={() => {
                        onThemeChange(id);
                        onClose();
                      }}
                      className={`group relative flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                        currentTheme === id
                          ? isDark
                            ? 'border-white/30 bg-white/10'
                            : 'border-black/20 bg-black/5'
                          : 'border-transparent'
                      } ${themeControlsDisabled ? 'cursor-not-allowed opacity-40' : ''}`}
                    >
                      <div className="h-4 w-4 rounded-full transition-transform group-hover:scale-125" style={{ backgroundColor: theme.color, boxShadow: `0 0 10px ${theme.color}` }} />
                    </button>
                  ))}
                </div>
              </div>

              {themeControlsDisabled ? (
                <p className={`px-1 text-[9px] uppercase tracking-[0.2em] font-terminal ${isDark ? 'text-red-300/70' : 'text-red-700/70'}`}>
                  Theme controls disabled while Konami mode is active.
                </p>
              ) : null}

              {showKonamiControls ? (
                <div className={`mt-1 rounded-xl border px-3 py-2 ${isDark ? 'border-red-500/25 bg-red-900/10' : 'border-red-500/25 bg-red-50'}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-red-300/80' : 'text-red-700/80'}`}>
                      <Zap size={11} />
                      Konami Mode
                    </span>
                    <button
                      onClick={() => onKonamiToggle?.(!konamiEnabled)}
                      className={`flex h-6 w-12 items-center rounded-full p-1 transition-colors ${
                        konamiEnabled ? 'bg-red-500/70' : isDark ? 'bg-white/10' : 'bg-black/10'
                      }`}
                    >
                      <motion.div
                        animate={{ x: konamiEnabled ? 24 : 0 }}
                        className={`h-4 w-4 rounded-full ${konamiEnabled ? 'bg-red-50' : isDark ? 'bg-white' : 'bg-slate-900'}`}
                      />
                    </button>
                  </div>
                  <p className={`text-[9px] uppercase tracking-[0.2em] font-terminal ${isDark ? 'text-red-300/70' : 'text-red-700/70'}`}>
                    {konamiEnabled ? 'BLACKSITE ACTIVE' : 'BLACKSITE STANDBY'}
                  </p>
                </div>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
