'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PORTFOLIO_CONTENT } from './portfolio-template';
import { useStore } from '@/utils/store';
import { getThemeColor, hexToRgba } from '@/utils/themes';

const FuturisticCard = dynamic(() => import('./FuturisticCard'), { ssr: false });
const ProjectDetailsModal = dynamic(() => import('./ProjectDetailsModal'), { ssr: false });

export default function ProjectsSection() {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );
  const themeFade = hexToRgba(themeColor, isDark ? 0.35 : 0.65);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  return (
    <section id="projects" className="relative py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <ProjectDetailsModal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
        themeColor={themeColor}
        isDark={isDark}
      />

      <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[2px] w-12" style={{ backgroundColor: themeColor }} />
            <span className="text-[11px] font-mono uppercase tracking-[0.45em] text-slate-500">
              Selected Works
            </span>
          </div>
        <h2
          className={`font-black tracking-tighter leading-[0.95] ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
          style={{ fontSize: 'clamp(2.25rem, 6.5vw, 4.75rem)' }}
        >
            <span style={{ textShadow: `0 0 30px ${hexToRgba(themeColor, 0.25)}` }}>
              Impact
            </span>{' '}
            & <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(90deg, ${themeColor}, ${themeFade})`,
              }}
            >
              Engineering
            </span>
          </h2>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PORTFOLIO_CONTENT.projects.categories
          .flatMap((c) => c.items)
          .map((project, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedProject(project)}
              className={`group relative rounded-2xl p-8 transition-all cursor-pointer overflow-hidden ${
                isDark
                  ? 'bg-[#0a0a0a] border border-white/10 hover:border-white/20'
                  : 'bg-white/90 border border-black/10 hover:border-black/20'
              }`}
              style={
                {
                  '--theme-color': themeColor,
                } as React.CSSProperties
              }
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className={isDark ? 'text-white' : 'text-slate-900'} size={24} />
              </div>

              <div
                className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: themeColor }}
              />

              <div className="h-full flex flex-col justify-between">
                <div>
                  <h3
                    className={`text-3xl font-bold mb-4 group-hover:text-[var(--theme-color)] transition-colors ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {project.title}
                  </h3>
                  <p
                    className={`text-base leading-relaxed mb-8 font-light ${
                      isDark ? 'text-slate-200' : 'text-slate-600'
                    }`}
                  >
                    {project.desc}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.stack.map((tech, j) => (
                    <span
                      key={j}
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border transition-colors ${
                        isDark
                          ? 'border-white/5 text-slate-500 group-hover:border-white/10 group-hover:text-slate-300'
                          : 'border-black/10 text-slate-500 group-hover:border-black/20 group-hover:text-slate-700'
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </section>
  );
}
