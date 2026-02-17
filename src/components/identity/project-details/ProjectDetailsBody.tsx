'use client';

import { ExternalLink, Github, Layers } from 'lucide-react';
import type { Project } from './types';

type ProjectDetailsBodyProps = {
  project: Project;
  themeColor: string;
  isDark: boolean;
};

const FEATURE_ITEMS = [
  'High-performance architecture',
  'Real-time data synchronization',
  'Enterprise-grade security',
];

export function ProjectDetailsBody({ project, themeColor, isDark }: ProjectDetailsBodyProps) {
  return (
    <div className="p-8 -mt-12 relative z-10">
      <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg mb-6 ${isDark ? 'bg-[#0a0a0a] border border-white/10' : 'bg-white border border-black/10'}`}>
        <Layers size={32} style={{ color: themeColor }} />
      </div>

      <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{project.title}</h2>
      <p className={`mb-8 leading-relaxed max-w-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{project.desc}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500">Key Features</h4>
          <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {FEATURE_ITEMS.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full" style={{ backgroundColor: themeColor }} />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500">Tech Stack</h4>
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <span key={tech} className={`px-3 py-1 rounded-md text-xs font-mono ${isDark ? 'bg-white/5 border border-white/10 text-slate-300' : 'bg-black/5 border border-black/10 text-slate-600'}`}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={`pt-6 flex gap-4 ${isDark ? 'border-t border-white/5' : 'border-t border-black/10'}`}>
        <button className={`flex-1 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-opacity ${isDark ? 'bg-white text-black hover:opacity-90' : 'bg-slate-900 text-white hover:opacity-90'}`}>
          Live Demo <ExternalLink size={16} />
        </button>
        <button className={`flex-1 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${isDark ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10' : 'bg-black/5 text-slate-900 hover:bg-black/10 border border-black/10'}`}>
          Source Code <Github size={16} />
        </button>
      </div>
    </div>
  );
}
