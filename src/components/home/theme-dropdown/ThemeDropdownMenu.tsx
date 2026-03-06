'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { THEMES } from '@/utils/themes';
import type { ThemeDropdownProps } from './types';

type ThemeDropdownMenuProps = Pick<
  ThemeDropdownProps,
  'currentTheme' | 'onThemeChange' | 'isDark' | 'toggleDark'
> & {
  isOpen: boolean;
  onClose: () => void;
};

export function ThemeDropdownMenu({
  currentTheme,
  onThemeChange,
  isDark,
  toggleDark,
  isOpen,
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
            className={`absolute right-0 top-full z-[110] mt-4 w-56 rounded-[1.5rem] border p-4 shadow-2xl backdrop-blur-xl ${
              isDark ? 'border-white/10 bg-[#121922]/95' : 'border-slate-300/70 bg-white/95'
            }`}
          >
            <div className="mb-2 flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${
                    isDark ? 'text-white/45' : 'text-slate-500'
                  }`}
                >
                  Appearance
                </span>
                <button
                  onClick={toggleDark}
                  className={`flex h-6 w-12 items-center rounded-full p-1 transition-colors ${
                    isDark ? 'bg-white/10' : 'bg-slate-200'
                  }`}
                >
                  <motion.div
                    animate={{ x: isDark ? 24 : 0 }}
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${
                      isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
                    }`}
                  >
                    {isDark ? <Moon size={8} /> : <Sun size={8} />}
                  </motion.div>
                </button>
              </div>

              <div className="flex flex-col gap-3 px-1">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${
                    isDark ? 'text-white/45' : 'text-slate-500'
                  }`}
                >
                  Accent
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(THEMES).map(([id, theme]) => (
                    <button
                      key={id}
                      onClick={() => {
                        onThemeChange(id);
                        onClose();
                      }}
                      className={`group relative flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                        currentTheme === id
                          ? isDark
                            ? 'border-white/25 bg-white/10'
                            : 'border-slate-400/80 bg-slate-100'
                          : 'border-transparent'
                      }`}
                    >
                      <div
                        className="h-4 w-4 rounded-full transition-transform group-hover:scale-110"
                        style={{ backgroundColor: theme.color }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
