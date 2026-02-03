'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';

export default function TimeLocationCard() {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZone: 'America/Chicago',
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 h-full flex flex-col justify-between relative z-10 transition-colors duration-500">
      <div className="space-y-6">
        <div>
          <h3 className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
            <MapPin size={12} style={{ color: themeColor }} />
            Location // US_LOG
          </h3>
          <p
            className="text-white font-bold leading-tight"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
          >
            MS, USA
          </p>
          <div className="font-mono text-[8px] text-slate-500 mt-1 uppercase tracking-widest opacity-40">
            31° 19' 37.56" N | 89° 17' 25.08" W
          </div>
        </div>

        <div>
          <h3 className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
            <Clock size={12} style={{ color: themeColor }} />
            Local Time
          </h3>
          <div
            className="font-mono font-bold tracking-tighter text-transparent bg-clip-text"
            style={{
              backgroundImage: `linear-gradient(to bottom, white, #94a3b8)`,
              textShadow: `0 0 20px ${themeColor}40`,
              fontSize: 'clamp(1.5rem, 6vw, 2rem)'
            }}
          >
            {time || '--:--:--'}
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-1 opacity-50 tracking-widest uppercase">CST // UTC-06</div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-auto pt-4">
        <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded border border-white/5 bg-white/[0.02]">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: themeColor }}
            ></span>
            <span
              className="relative inline-flex rounded-full h-1.5 w-1.5"
              style={{ backgroundColor: themeColor }}
            ></span>
          </span>
          <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">
            Uplink: <span className="text-white">Alethic</span>
          </span>
        </div>
      </div>
    </div>
  );
}
