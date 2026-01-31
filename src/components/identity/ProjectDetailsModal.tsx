'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Github, Layers, Calendar, Rocket } from 'lucide-react';

interface Project {
  title: string;
  desc: string;
  stack: string[];
}

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  themeColor: string;
}

export default function ProjectDetailsModal({
  isOpen,
  onClose,
  project,
  themeColor,
}: ProjectDetailsModalProps) {
  if (!project) return null;

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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative"
            >
              {/* Header Gradient */}
              <div className="h-32 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black" />
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${themeColor}, transparent)`,
                  }}
                />
                {/* Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />

                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-white/10 text-white/70 hover:text-white transition-colors backdrop-blur-md"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 -mt-12 relative z-10">
                <div className="bg-[#0a0a0a] w-16 h-16 rounded-xl flex items-center justify-center border border-white/10 shadow-lg mb-6">
                  <Layers size={32} style={{ color: themeColor }} />
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">{project.title}</h2>
                <p className="text-slate-400 mb-8 leading-relaxed max-w-lg">{project.desc}</p>

                {/* Mock Details for "Classy" Vibe */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500">
                      Key Features
                    </h4>
                    <ul className="text-sm text-slate-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-400" />
                        High-performance architecture
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-400" />
                        Real-time data synchronization
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-400" />
                        Enterprise-grade security
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500">
                      Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.stack.map((tech, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-slate-300 font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex gap-4">
                  <button className="flex-1 bg-white text-black font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    Live Demo <ExternalLink size={16} />
                  </button>
                  <button className="flex-1 bg-white/5 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border border-white/10">
                    Source Code <Github size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
