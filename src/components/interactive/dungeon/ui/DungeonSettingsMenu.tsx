'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useSettings, settingsActions } from '@/lib/settings';

interface DungeonSettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DungeonSettingsMenu({ isOpen, onClose }: DungeonSettingsMenuProps) {
  const settings = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  // Sync local settings with store
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleQualityChange = useCallback((quality: 'low' | 'medium' | 'high') => {
    setLocalSettings((prev) => ({ ...prev, graphicsQuality: quality }));
    settingsActions.setGraphicsQuality(quality);
  }, []);

  const handleVolumeChange = useCallback((value: number) => {
    setLocalSettings((prev) => ({ ...prev, masterVolume: value }));
    settingsActions.setMasterVolume(value);
  }, []);

  const handleSensitivityChange = useCallback((value: number) => {
    setLocalSettings((prev) => ({ ...prev, mouseSensitivity: value }));
    settingsActions.setMouseSensitivity(value);
  }, []);

  const handleExposureChange = useCallback((value: number) => {
    setLocalSettings((prev) => ({ ...prev, exposure: value }));
    settingsActions.setExposure(value);
  }, []);

  const qualityOptions: Array<{ value: 'low' | 'medium' | 'high'; label: string }> = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-[420px] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-stone-900/98 to-stone-950/98 shadow-[0_0_80px_rgba(0,0,0,0.5),0_0_40px_rgba(251,191,36,0.1)] backdrop-blur-xl">
              {/* Header */}
              <div className="border-b border-amber-500/10 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
                      <svg
                        className="h-5 w-5 text-amber-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-amber-50">Settings</h2>
                      <p className="text-xs text-stone-500">Configure your experience</p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-700/50 bg-stone-800/50 text-stone-500 transition-colors hover:border-stone-600 hover:bg-stone-700/50 hover:text-stone-400"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-5 p-6">
                {/* Graphics Quality */}
                <div>
                  <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                    <svg
                      className="h-4 w-4 text-amber-500/70"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Graphics Quality
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {qualityOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleQualityChange(option.value)}
                        className={`rounded-lg border py-2.5 text-sm font-semibold transition-all ${
                          localSettings.graphicsQuality === option.value
                            ? 'border-amber-500/50 bg-amber-500/20 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                            : 'border-stone-700/50 bg-stone-800/50 text-stone-400 hover:border-stone-600 hover:bg-stone-700/50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Master Volume */}
                <div>
                  <label className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-amber-500/70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                      </svg>
                      Master Volume
                    </span>
                    <span className="font-mono text-amber-300">
                      {Math.round(localSettings.masterVolume * 100)}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={localSettings.masterVolume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-700/50 accent-amber-500"
                  />
                </div>

                {/* Mouse Sensitivity */}
                <div>
                  <label className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-amber-500/70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                        />
                      </svg>
                      Mouse Sensitivity
                    </span>
                    <span className="font-mono text-amber-300">
                      {localSettings.mouseSensitivity.toFixed(1)}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={localSettings.mouseSensitivity}
                    onChange={(e) => handleSensitivityChange(parseFloat(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-700/50 accent-amber-500"
                  />
                </div>

                {/* Brightness / Exposure */}
                <div>
                  <label className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-amber-500/70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      Brightness
                    </span>
                    <span className="font-mono text-amber-300">
                      {Math.round((localSettings.exposure ?? 1.0) * 100)}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={localSettings.exposure ?? 1.0}
                    onChange={(e) => handleExposureChange(parseFloat(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-700/50 accent-amber-500"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-amber-500/10 px-6 py-4">
                <p className="text-center text-[10px] uppercase tracking-wider text-stone-600">
                  Press{' '}
                  <kbd className="rounded border border-stone-700 bg-stone-800 px-1.5 py-0.5 text-stone-400">
                    ESC
                  </kbd>{' '}
                  to close
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
