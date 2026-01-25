'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';

export default function TimeLocationCard() {
    const { currentTheme, isDark } = useStore();
    const themeColor = React.useMemo(() => getThemeColor(currentTheme, isDark), [currentTheme, isDark]);
    const [time, setTime] = useState<string>("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: 'America/Chicago'
            }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-8 h-full flex flex-col justify-between relative z-10 transition-colors duration-500">
            {/* Background Map Effect - Simplified SVG */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
                <svg width="100%" height="100%">
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
                        <MapPin size={14} style={{ color: themeColor }} />
                        Currently Studying in
                    </h3>
                    <p className="text-white text-lg font-bold">University of Southern Mississippi</p>
                </div>

                <div className="flex flex-col items-end">
                    <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Clock size={14} style={{ color: themeColor }} />
                        Local Time
                    </h3>
                    {/* Digital Clock Font Style */}
                    <div className="font-mono text-2xl md:text-3xl font-bold tracking-wider text-transparent bg-clip-text"
                        style={{
                            backgroundImage: `linear-gradient(to bottom, white, slate-400)`,
                            textShadow: `0 0 20px ${themeColor}40`
                        }}>
                        {time || "--:--:--"}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">UTC-06:00</div>
                </div>
            </div>

            {/* Status Indicator */}
            <div className="mt-auto">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: themeColor }}></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: themeColor }}></span>
                    </span>
                    <span className="text-sm font-medium text-slate-300">Currently working on: <span className="text-white font-bold">Alethic</span> <span className="text-slate-400 text-xs">- an AI powered reasoning engine for modern recruiting</span></span>
                </div>
            </div>
        </div>
    );
}
