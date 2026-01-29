/**
 * Device Detection Utilities
 * Used for mobile fallback and adaptive UI
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTouch: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  hasPointerLock: boolean;
  pixelRatio: number;
}

let cachedDeviceInfo: DeviceInfo | null = null;

export function getDeviceInfo(): DeviceInfo {
  if (cachedDeviceInfo) return cachedDeviceInfo;
  
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTouch: false,
      isIOS: false,
      isAndroid: false,
      hasPointerLock: true,
      pixelRatio: 1,
    };
  }

  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobile = isIOS || isAndroid || (isTouch && window.innerWidth < 768);
  const hasPointerLock = 'pointerLockElement' in document;
  const pixelRatio = window.devicePixelRatio || 1;

  cachedDeviceInfo = {
    isMobile,
    isTouch,
    isIOS,
    isAndroid,
    hasPointerLock,
    pixelRatio,
  };

  return cachedDeviceInfo;
}

export function isMobileDevice(): boolean {
  return getDeviceInfo().isMobile;
}

export function isTouchDevice(): boolean {
  return getDeviceInfo().isTouch;
}

export function supportsPointerLock(): boolean {
  return getDeviceInfo().hasPointerLock && !getDeviceInfo().isMobile;
}
