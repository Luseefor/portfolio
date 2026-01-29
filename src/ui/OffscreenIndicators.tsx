'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { getQualityConfig, getSettings, subscribeSettings } from '@/lib/settings';

export interface ScreenPOI {
  id: string;
  x: number;
  y: number;
  offscreen: boolean;
  angle: number;
  distance: number;
}

interface OffscreenIndicatorsProps {
  screenPois: ScreenPOI[];
  activePoiId: string | null;
}

export default function OffscreenIndicators({
  screenPois,
  activePoiId,
}: OffscreenIndicatorsProps) {
  const [updateRate, setUpdateRate] = useState(100);
  const [visiblePois, setVisiblePois] = useState<ScreenPOI[]>([]);
  const lastUpdateRef = useRef(0);

  // Subscribe to quality settings
  useEffect(() => {
    const update = () => {
      const config = getQualityConfig(getSettings().quality);
      setUpdateRate(config.offscreenUpdateRate);
    };
    update();
    return subscribeSettings(update);
  }, []);

  // Throttled update for offscreen indicators
  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current < updateRate) return;
    lastUpdateRef.current = now;

    // Only show offscreen POIs
    const offscreen = screenPois.filter((p) => p.offscreen);
    setVisiblePois(offscreen);
  }, [screenPois, updateRate]);

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      {visiblePois.map((poi) => {
        const isActive = poi.id === activePoiId;
        const size = isActive ? 'scale-125' : '';
        
        // Calculate arrow rotation to point toward POI
        const arrowRotation = poi.angle * (180 / Math.PI) - 90;

        return (
          <div
            key={poi.id}
            className={`absolute transition-all duration-150 ${size}`}
            style={{
              left: poi.x,
              top: poi.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Arrow indicator */}
            <div
              className="relative"
              style={{ transform: `rotate(${arrowRotation}deg)` }}
            >
              {/* Glow effect */}
              <div className="absolute -inset-2 animate-pulse rounded-full bg-cyan-400/20 blur-md" />
              
              {/* Arrow */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="relative"
              >
                <path
                  d="M12 4L20 20L12 16L4 20L12 4Z"
                  fill={isActive ? '#22d3ee' : '#7dd3fc'}
                  stroke={isActive ? '#06b6d4' : '#38bdf8'}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Distance label */}
            <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan-400/30 bg-[#020410]/80 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-cyan-300">
              {poi.distance.toFixed(0)}m
            </div>
          </div>
        );
      })}
    </div>
  );
}
