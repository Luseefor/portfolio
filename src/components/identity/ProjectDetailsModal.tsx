'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ProjectDetailsBody } from './project-details/ProjectDetailsBody';
import type { Project } from './project-details/types';

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

              <ProjectDetailsBody project={project} themeColor={themeColor} isDark={isDark} />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
