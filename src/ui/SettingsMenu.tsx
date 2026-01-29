'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  getSettings,
  updateSettings,
  resetSettings,
  subscribeSettings,
  QualityLevel,
  Settings,
} from '@/lib/settings';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsMenu({ isOpen, onClose }: SettingsMenuProps) {
  const [settings, setSettings] = useState<Settings>(getSettings());

  useEffect(() => {
    return subscribeSettings(setSettings);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleQualityChange = (quality: QualityLevel) => {
    updateSettings({ quality });
  };

  const handleSensitivityChange = (value: number) => {
    updateSettings({ mouseSensitivity: value });
  };

  const handleVolumeChange = (value: number) => {
    updateSettings({ masterVolume: value });
  };

  const handleToggle = (key: keyof Settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#020410]/98 to-[#0a1628]/98 shadow-[0_0_80px_rgba(34,211,238,0.15)] backdrop-blur-xl"
          >
            {/* Header */}
            <div className="border-b border-white/5 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-white">
                    Settings
                  </h2>
                  <p className="mt-1 text-xs text-white/40">
                    Configure your experience
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6 px-6 py-5">
              {/* Graphics Quality */}
              <div>
                <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/70">
                  Graphics Quality
                </label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as QualityLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => handleQualityChange(level)}
                      className={`flex-1 rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                        settings.quality === level
                          ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-300'
                          : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mouse Sensitivity */}
              <div>
                <label className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/70">
                  <span>Mouse Sensitivity</span>
                  <span className="font-mono text-white/50">
                    {settings.mouseSensitivity.toFixed(1)}
                  </span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={settings.mouseSensitivity}
                  onChange={(e) => handleSensitivityChange(parseFloat(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400"
                />
              </div>

              {/* Master Volume */}
              <div>
                <label className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/70">
                  <span>Master Volume</span>
                  <span className="font-mono text-white/50">
                    {Math.round(settings.masterVolume * 100)}%
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.masterVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Show FPS Counter</span>
                  <button
                    onClick={() => handleToggle('showFps')}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      settings.showFps ? 'bg-cyan-400' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        settings.showFps ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Invert Y-Axis</span>
                  <button
                    onClick={() => handleToggle('invertY')}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      settings.invertY ? 'bg-cyan-400' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        settings.invertY ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 px-6 py-4">
              <button
                onClick={resetSettings}
                className="text-xs font-semibold text-white/40 transition-colors hover:text-white/70"
              >
                Reset to Defaults
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
