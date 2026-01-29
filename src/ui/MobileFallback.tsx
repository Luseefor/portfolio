'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { POIData, POI_LIST } from '@/components/POIMarker';
import { isMobileDevice } from '@/lib/device';

interface MobileFallbackProps {
  onPoiSelect: (poi: POIData) => void;
}

export default function MobileFallback({ onPoiSelect }: MobileFallbackProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentPoiIndex, setCurrentPoiIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  if (!isMobile) return null;

  const currentPoi = POI_LIST[currentPoiIndex];

  const handleSwipe = (info: PanInfo) => {
    if (Math.abs(info.offset.x) > 50) {
      if (info.offset.x > 0 && currentPoiIndex > 0) {
        setCurrentPoiIndex(currentPoiIndex - 1);
      } else if (info.offset.x < 0 && currentPoiIndex < POI_LIST.length - 1) {
        setCurrentPoiIndex(currentPoiIndex + 1);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#020410] to-[#0a1628]">
      {/* Welcome overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#020410]/95 p-8"
          >
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10">
                <svg
                  className="h-8 w-8 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 18.5L8.5 22H3v-5.5L6.5 13 3 9.5V4h5.5L12 7.5 15.5 4H21v5.5L17.5 13l3.5 3.5V22h-5.5L12 18.5z"
                  />
                </svg>
              </div>
              <h1 className="mb-3 text-2xl font-black text-white">
                Underwater Explorer
              </h1>
              <p className="mb-6 text-sm leading-relaxed text-white/60">
                This experience is optimized for desktop with mouse and keyboard.
                On mobile, you can browse points of interest in guided mode.
              </p>
              <button
                onClick={() => setShowWelcome(false)}
                className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-6 py-3 text-sm font-bold uppercase tracking-wider text-cyan-300 transition-colors hover:bg-cyan-400/20"
              >
                Start Guided Tour
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background visual */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#03224a] to-[#020410] opacity-60" />
        {/* Animated particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-cyan-400/30"
            initial={{
              x: `${Math.random() * 100}%`,
              y: '100%',
            }}
            animate={{
              y: '-10%',
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 py-8">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-300">
            Guided Tour
          </span>
        </div>
        <div className="mt-2 text-xs text-white/40">
          {currentPoiIndex + 1} of {POI_LIST.length} locations
        </div>
      </div>

      {/* POI Card - Swipeable */}
      <motion.div
        className="relative z-10 px-6"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => handleSwipe(info)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPoi.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#020410]/90 to-[#0a1628]/90 p-6 backdrop-blur-xl"
          >
            {/* Icon */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
              <svg
                className="h-6 w-6 text-cyan-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <h2 className="text-xl font-black text-white">{currentPoi.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {currentPoi.description}
            </p>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-2">
              {currentPoi.actions?.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => action.url && window.open(action.url, '_blank')}
                  className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-cyan-300"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Swipe hint */}
        <div className="mt-4 text-center text-xs text-white/30">
          Swipe left or right to navigate
        </div>
      </motion.div>

      {/* Navigation dots */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center gap-2">
        {POI_LIST.map((poi, idx) => (
          <button
            key={poi.id}
            onClick={() => setCurrentPoiIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentPoiIndex
                ? 'w-6 bg-cyan-400'
                : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
