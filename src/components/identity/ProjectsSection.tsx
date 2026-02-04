'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PORTFOLIO_CONTENT } from './portfolio-template';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';

const FuturisticCard = dynamic(() => import('./FuturisticCard'), { ssr: false });
const ProjectDetailsModal = dynamic(() => import('./ProjectDetailsModal'), { ssr: false });

export default function ProjectsSection() {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );
  const [selectedProject, setSelectedProject] = useState<any>(null);

  return (
    <section id="projects" className="relative py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <ProjectDetailsModal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
        themeColor={themeColor}
      />

      <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[2px] w-12" style={{ backgroundColor: themeColor }} />
            <span className="text-sm font-mono uppercase tracking-widest text-slate-400">
              Selected Works
            </span>
          </div>
          <h2
            className="font-black text-white tracking-tighter leading-tight"
            style={{ fontSize: 'clamp(2.25rem, 8vw, 5.5rem)' }}
          >
            Impact & <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: `linear-gradient(to right, ${themeColor}, white)` }}
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
              className="group relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="text-white" size={24} />
              </div>

              <div
                className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: themeColor }}
              />

              <div className="h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-slate-200 text-base leading-relaxed mb-8 font-light">{project.desc}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.stack.map((tech, j) => (
                    <span
                      key={j}
                      className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border border-white/5 text-slate-500 group-hover:border-white/10 group-hover:text-slate-300 transition-colors"
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
