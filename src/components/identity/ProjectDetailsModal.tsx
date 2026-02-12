'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Github, Layers } from 'lucide-react';

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
  isDark: boolean;
}

export default function ProjectDetailsModal({
  isOpen,
  onClose,
  project,
  themeColor,
  isDark,
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
            className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${
              isDark ? 'bg-black/60' : 'bg-white/70'
            }`}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative ${
                isDark ? 'bg-[#0a0a0a] border border-white/10' : 'bg-white border border-black/10'
              }`}
            >
              {/* Header Gradient */}
              <div className="h-32 w-full relative overflow-hidden">
                <div
                  className={`absolute inset-0 ${
                    isDark
                      ? 'bg-gradient-to-br from-slate-900 to-black'
                      : 'bg-gradient-to-br from-white to-slate-100'
                  }`}
                />
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
                  className={`absolute top-4 right-4 p-2 rounded-full transition-colors backdrop-blur-md ${
                    isDark
                      ? 'bg-black/20 hover:bg-white/10 text-white/70 hover:text-white'
                      : 'bg-white/70 hover:bg-white text-slate-600 hover:text-slate-900 border border-black/10'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 -mt-12 relative z-10">
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg mb-6 ${
                    isDark ? 'bg-[#0a0a0a] border border-white/10' : 'bg-white border border-black/10'
                  }`}
                >
                  <Layers size={32} style={{ color: themeColor }} />
                </div>

                <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {project.title}
                </h2>
                <p className={`mb-8 leading-relaxed max-w-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {project.desc}
                </p>

                {/* Mock Details for "Classy" Vibe */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500">
                      Key Features
                    </h4>
                    <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <li className="flex items-start gap-2">
                        <span
                          className="mt-1.5 w-1 h-1 rounded-full"
                          style={{ backgroundColor: themeColor }}
                        />
                        High-performance architecture
                      </li>
                      <li className="flex items-start gap-2">
                        <span
                          className="mt-1.5 w-1 h-1 rounded-full"
                          style={{ backgroundColor: themeColor }}
                        />
                        Real-time data synchronization
                      </li>
                      <li className="flex items-start gap-2">
                        <span
                          className="mt-1.5 w-1 h-1 rounded-full"
                          style={{ backgroundColor: themeColor }}
                        />
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
                          className={`px-3 py-1 rounded-md text-xs font-mono ${
                            isDark
                              ? 'bg-white/5 border border-white/10 text-slate-300'
                              : 'bg-black/5 border border-black/10 text-slate-600'
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className={`pt-6 flex gap-4 ${
                    isDark ? 'border-t border-white/5' : 'border-t border-black/10'
                  }`}
                >
                  <button
                    className={`flex-1 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-opacity ${
                      isDark ? 'bg-white text-black hover:opacity-90' : 'bg-slate-900 text-white hover:opacity-90'
                    }`}
                  >
                    Live Demo <ExternalLink size={16} />
                  </button>
                  <button
                    className={`flex-1 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                      isDark
                        ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                        : 'bg-black/5 text-slate-900 hover:bg-black/10 border border-black/10'
                    }`}
                  >
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
