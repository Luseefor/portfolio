'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { POIData } from '@/components/POIMarker';

interface POIPanelProps {
  poi: POIData | null;
  onClose: () => void;
}

type POIAction = { label: string; url?: string; type: 'link' | 'github' | 'custom' };

export default function POIPanel({ poi, onClose }: POIPanelProps) {
  if (!poi) return null;

  const handleAction = (action: POIAction) => {
    if (action.url) {
      window.open(action.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <AnimatePresence>
      {poi && (
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="pointer-events-auto fixed right-6 top-24 z-50 w-[360px] overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#020410]/95 to-[#0a1628]/95 shadow-[0_0_60px_rgba(34,211,238,0.15),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl"
        >
          {/* Header glow line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          {/* Content */}
          <div className="p-6">
            {/* Category tag */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-300">
                Intel Log
              </span>
            </div>

            {/* Title */}
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
              {poi.title}
            </h2>

            {/* Description */}
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              {poi.description}
            </p>

            {/* Divider */}
            <div className="my-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {poi.actions?.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAction(action)}
                  className="group relative flex items-center gap-2 overflow-hidden rounded-xl border border-cyan-400/30 bg-cyan-400/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-cyan-300 transition-all hover:border-cyan-400/50 hover:bg-cyan-400/15 hover:text-cyan-200"
                >
                  {/* Button glow on hover */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent transition-transform group-hover:translate-x-full" />

                  {action.type === 'github' && (
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  )}
                  <span className="relative">{action.label}</span>
                </button>
              ))}

              {/* Close button */}
              <button
                onClick={onClose}
                className="ml-auto flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/50 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white/70"
              >
                <span>Close</span>
                <kbd className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 text-[10px]">
                  ESC
                </kbd>
              </button>
            </div>
          </div>

          {/* Bottom decorative element */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
