/**
 * Settings Store with localStorage persistence
 * Manages quality, mouse sensitivity, and volume settings
 */

export type QualityLevel = 'low' | 'medium' | 'high';

export interface Settings {
  quality: QualityLevel;
  mouseSensitivity: number;
  masterVolume: number;
  showFps: boolean;
  invertY: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  quality: 'medium',
  mouseSensitivity: 1.0,
  masterVolume: 0.8,
  showFps: false,
  invertY: false,
};

const STORAGE_KEY = 'underwater-portfolio-settings';

type Listener = (settings: Settings) => void;
const listeners = new Set<Listener>();

let currentSettings: Settings = DEFAULT_SETTINGS;

// Load from localStorage on init
function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

function notifyListeners(): void {
  listeners.forEach((fn) => fn(currentSettings));
}

// Public API
export function getSettings(): Settings {
  return currentSettings;
}

export function updateSettings(partial: Partial<Settings>): void {
  currentSettings = { ...currentSettings, ...partial };
  saveSettings(currentSettings);
  notifyListeners();
}

export function subscribeSettings(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function resetSettings(): void {
  currentSettings = DEFAULT_SETTINGS;
  saveSettings(currentSettings);
  notifyListeners();
}

// Quality-based configs
export function getQualityConfig(quality: QualityLevel) {
  switch (quality) {
    case 'low':
      return {
        particleCount: 50,
        instanceDensity: 0.5,
        shadowMapSize: 512,
        postProcessing: false,
        offscreenUpdateRate: 200, // ms
      };
    case 'medium':
      return {
        particleCount: 150,
        instanceDensity: 0.8,
        shadowMapSize: 1024,
        postProcessing: true,
        offscreenUpdateRate: 100,
      };
    case 'high':
      return {
        particleCount: 300,
        instanceDensity: 1.0,
        shadowMapSize: 2048,
        postProcessing: true,
        offscreenUpdateRate: 50,
      };
  }
}

// Initialize
if (typeof window !== 'undefined') {
  currentSettings = loadSettings();
}
