'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';

type Project = {
  id: string;
  name: string;
  skills: string[];
};

type GraphNode = {
  id: string;
  label: string;
  type: 'project' | 'skill';
  x: number;
  y: number;
};

const BASE_SKILLS = [
  'TypeScript',
  'JavaScript',
  'Python',
  'SQL',
  'Postgres',
  'Redis',
  'Next.js',
  'React',
  'Node.js',
  'FastAPI',
  'Docker',
  'Kubernetes',
  'AWS',
  'CI/CD',
  'Observability',
  'Security',
  'Testing',
  'Performance',
  'System Design',
  'Vector DBs',
  'RAG',
  'ETL',
];

const PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Realtime Analytics Suite',
    skills: ['TypeScript', 'React', 'Node.js', 'Postgres', 'Redis', 'Observability', 'Performance'],
  },
  {
    id: 'p2',
    name: 'RAG Knowledge Engine',
    skills: ['Python', 'FastAPI', 'Vector DBs', 'RAG', 'ETL', 'AWS', 'Security'],
  },
  {
    id: 'p3',
    name: 'Infra Automation Platform',
    skills: ['Python', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Security', 'System Design'],
  },
  {
    id: 'p4',
    name: 'Experimentation Framework',
    skills: ['TypeScript', 'Next.js', 'Postgres', 'Testing', 'Performance', 'Observability'],
  },
  {
    id: 'p5',
    name: 'Developer Experience Hub',
    skills: ['React', 'Next.js', 'Node.js', 'Testing', 'CI/CD', 'Performance'],
  },
  {
    id: 'p6',
    name: 'Data Ops Pipeline',
    skills: ['Python', 'SQL', 'ETL', 'Postgres', 'AWS', 'Observability'],
  },
];

export default function CapabilityMatrix() {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );
  const toRgba = React.useCallback((hex: string, alpha: number) => {
    const cleaned = hex.replace('#', '');
    if (cleaned.length !== 6) return `rgba(16,185,129,${alpha})`;
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

  const [activeProject, setActiveProject] = React.useState<string | null>(null);
  const [activeSkill, setActiveSkill] = React.useState<string | null>(null);
  const [transform, setTransform] = React.useState({ x: 0, y: 0, scale: 1 });

  const graphRef = React.useRef<HTMLDivElement | null>(null);
  const isDraggingRef = React.useRef(false);
  const lastPointerRef = React.useRef<{ x: number; y: number } | null>(null);
  const activePointersRef = React.useRef(new Map<number, { x: number; y: number }>());
  const lastPinchDistanceRef = React.useRef<number | null>(null);

  const graphData = React.useMemo(() => {
    const skillSet = new Set(BASE_SKILLS);
    PROJECTS.forEach((project) => project.skills.forEach((skill) => skillSet.add(skill)));
    const skills = Array.from(skillSet);

    const width = 1600;
    const height = 900;
    const centerX = width / 2;
    const centerY = height / 2;
    const projectRadius = 260;
    const skillRadius = 430;

    const projectNodes: GraphNode[] = PROJECTS.map((project, index) => {
      const angle = (index / PROJECTS.length) * Math.PI * 2 - Math.PI / 2;
      return {
        id: project.id,
        label: project.name,
        type: 'project',
        x: centerX + Math.cos(angle) * projectRadius,
        y: centerY + Math.sin(angle) * projectRadius,
      };
    });

    const skillNodes: GraphNode[] = skills.map((skill, index) => {
      const angle = (index / skills.length) * Math.PI * 2 - Math.PI / 2;
      return {
        id: `skill:${skill}`,
        label: skill,
        type: 'skill',
        x: centerX + Math.cos(angle) * skillRadius,
        y: centerY + Math.sin(angle) * skillRadius,
      };
    });

    const nodes = [...projectNodes, ...skillNodes];
    const edges = PROJECTS.flatMap((project) =>
      project.skills.map((skill) => ({ from: project.id, to: `skill:${skill}` })),
    );

    return { nodes, edges, width, height };
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = graphRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    element.style.setProperty('--glow-x', `${x}%`);
    element.style.setProperty('--glow-y', `${y}%`);

    if (activePointersRef.current.has(event.pointerId)) {
      activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }

    if (isDraggingRef.current && lastPointerRef.current) {
      const dx = event.clientX - lastPointerRef.current.x;
      const dy = event.clientY - lastPointerRef.current.y;
      setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
    }

    if (activePointersRef.current.size === 2) {
      const points = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      if (lastPinchDistanceRef.current) {
        const delta = dist / lastPinchDistanceRef.current;
        setTransform((prev) => ({
          ...prev,
          scale: Math.min(2.6, Math.max(0.6, prev.scale * delta)),
        }));
      }
      lastPinchDistanceRef.current = dist;
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (activePointersRef.current.size === 1) {
      isDraggingRef.current = true;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(event.pointerId);
    if (activePointersRef.current.size < 2) {
      lastPinchDistanceRef.current = null;
    }
    if (activePointersRef.current.size === 0) {
      isDraggingRef.current = false;
      lastPointerRef.current = null;
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = -event.deltaY * 0.0015;
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(2.6, Math.max(0.6, prev.scale * (1 + delta))),
    }));
  };

  const isEdgeActive = (from: string, to: string) => {
    if (activeProject) return from === activeProject;
    if (activeSkill) return to === `skill:${activeSkill}`;
    return true;
  };

  const isNodeDimmed = (node: GraphNode) => {
    if (activeProject) {
      if (node.type === 'project') return node.id !== activeProject;
      return !PROJECTS.find((project) => project.id === activeProject)?.skills.includes(node.label);
    }
    if (activeSkill) {
      if (node.type === 'skill') return node.label !== activeSkill;
      return !PROJECTS.find((project) => project.id === node.id)?.skills.includes(activeSkill);
    }
    return false;
  };

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  return (
    <section id="about" className="mb-28">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-[2px]" style={{ backgroundColor: themeColor }} />
            <span className="font-terminal text-[11px] tracking-[0.45em] uppercase text-slate-500">
              System Modules
            </span>
          </div>
          <h2
            className="font-black tracking-tight leading-[0.95]"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)' }}
          >
            <span className="text-white">Signal</span>{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: `linear-gradient(90deg, ${themeColor}, #e7fff2)` }}
            >
              Map
            </span>
          </h2>
        </div>
      </div>

      <div className="mt-10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="text-white/70 text-[11px] md:text-xs font-mono uppercase tracking-[0.28em]">
              Projects // Skill Mesh
            </div>
          </div>

          <div
            ref={graphRef}
            className="relative mt-8 h-[620px] md:h-[700px] rounded-3xl overflow-hidden"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => {
              setActiveProject(null);
              setActiveSkill(null);
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            onTouchStart={(event) => event.preventDefault()}
            onTouchMove={(event) => event.preventDefault()}
            style={{
              touchAction: 'none',
              backgroundImage: `radial-gradient(620px circle at var(--glow-x, 50%) var(--glow-y, 50%), ${toRgba(
                themeColor,
                0.2,
              )}, transparent 60%), radial-gradient(circle at 15% 20%, ${toRgba(
                themeColor,
                0.1,
              )}, transparent 35%), radial-gradient(circle at 80% 80%, ${toRgba(
                themeColor,
                0.08,
              )}, transparent 40%)`,
              backgroundColor: 'transparent',
            }}
          >
            <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-slate-300">
              <button
                type="button"
                className="h-7 w-7 rounded-full border border-white/10 flex items-center justify-center hover:text-white"
                onClick={() =>
                  setTransform((prev) => ({ ...prev, scale: Math.min(2.6, prev.scale + 0.1) }))
                }
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                className="h-7 w-7 rounded-full border border-white/10 flex items-center justify-center hover:text-white"
                onClick={() =>
                  setTransform((prev) => ({ ...prev, scale: Math.max(0.6, prev.scale - 0.1) }))
                }
              >
                <ZoomOut size={14} />
              </button>
            </div>

            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                transformOrigin: '50% 50%',
              }}
            >
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox={`0 0 ${graphData.width} ${graphData.height}`}
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={toRgba(themeColor, 0.15)} />
                    <stop offset="50%" stopColor={toRgba(themeColor, 0.6)} />
                    <stop offset="100%" stopColor={toRgba(themeColor, 0.2)} />
                  </linearGradient>
                  <filter id="nodeGlow">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {graphData.edges.map((edge) => {
                  const a = graphData.nodes.find((node) => node.id === edge.from);
                  const b = graphData.nodes.find((node) => node.id === edge.to);
                  if (!a || !b) return null;
                  const active = isEdgeActive(edge.from, edge.to);
                  const dx = b.x - a.x;
                  const dy = b.y - a.y;
                  const length = Math.hypot(dx, dy) || 1;
                  const nx = -dy / length;
                  const ny = dx / length;
                  const projectIndex = PROJECTS.findIndex((project) => project.id === edge.from);
                  const projectSpread =
                    PROJECTS.length > 1 ? projectIndex - (PROJECTS.length - 1) / 2 : 0;
                  const bundleOffset = projectSpread * 6;
                  const c1x = a.x + dx * 0.2 + nx * bundleOffset;
                  const c1y = a.y + dy * 0.2 + ny * bundleOffset;
                  const c2x = a.x + dx * 0.7 + nx * bundleOffset;
                  const c2y = a.y + dy * 0.7 + ny * bundleOffset;
                  return (
                    <motion.path
                      key={`${edge.from}-${edge.to}`}
                      d={`M ${a.x} ${a.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${b.x} ${b.y}`}
                      stroke={active ? 'url(#edgeGradient)' : toRgba(themeColor, 0.12)}
                      strokeOpacity={active ? 0.8 : 0.22}
                      strokeWidth={active ? 1.8 : 0.9}
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.6, ease: 'easeInOut' }}
                    />
                  );
                })}

                {graphData.nodes.map((node) => {
                  const isProject = node.type === 'project';
                  const dimmed = isNodeDimmed(node);
                  const radius = isProject ? 14 : 7;
                  const isActive =
                    (activeProject && node.id === activeProject) ||
                    (activeSkill && node.label === activeSkill);
                  const distToCenter = Math.hypot(
                    node.x - graphData.width / 2,
                    node.y - graphData.height / 2,
                  );
                  const depthFade = clamp(1 - distToCenter / (graphData.width * 0.7), 0.35, 1);
                  const labelVisibility = isProject
                    ? 1
                    : clamp((transform.scale - 0.7) / 0.5, 0, 1) * depthFade;
                  const isHighlightedSkill =
                    node.type === 'skill' &&
                    ((activeProject &&
                      PROJECTS.find((project) => project.id === activeProject)?.skills.includes(
                        node.label,
                      )) ||
                      (activeSkill && node.label === activeSkill));
                  return (
                    <motion.g
                      key={node.id}
                      onClick={() => {
                        if (node.type === 'project') {
                          setActiveProject(node.id);
                          setActiveSkill(null);
                        } else {
                          setActiveSkill(node.label);
                          setActiveProject(null);
                        }
                      }}
                      style={{
                        cursor: 'pointer',
                        opacity: dimmed ? 0.12 : depthFade,
                      }}
                      animate={{ scale: isActive ? 1.15 : 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius}
                        fill={isProject ? toRgba(themeColor, 0.18) : toRgba(themeColor, 0.06)}
                        stroke={isProject ? themeColor : toRgba(themeColor, 0.25)}
                        strokeWidth={isProject ? 1.6 : 1}
                        filter={isProject ? 'url(#nodeGlow)' : undefined}
                      />
                      <text
                        x={node.x}
                        y={node.y + 22}
                        textAnchor="middle"
                        fill={
                          isProject
                            ? '#ffffff'
                            : isHighlightedSkill
                              ? '#ffffff'
                              : toRgba(themeColor, 0.65)
                        }
                        fontSize={isProject ? 12.5 : isHighlightedSkill ? 12.5 : 11}
                        fontWeight={isProject ? 600 : isHighlightedSkill ? 600 : 500}
                        style={{
                          textShadow: '0 0 18px rgba(0,0,0,0.7)',
                          opacity: isHighlightedSkill ? 1 : labelVisibility,
                        }}
                      >
                        {node.label}
                      </text>
                    </motion.g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
