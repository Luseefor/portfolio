'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/utils/store';
import { getThemeColor, hexToRgba } from '@/utils/themes';

type HeatmapPoint = {
  date: string;
  count: number;
};

type HeatmapCell = HeatmapPoint & {
  isPadding?: boolean;
};

type ActivityEvent = {
  id: string;
  actor: string;
  title: string;
  description: string;
  dateLabel: string;
  fullDate: string;
};

type HoverInfo = {
  day: HeatmapPoint;
  x: number;
  y: number;
};

type SnakeCoord = {
  col: number;
  row: number;
};

type SnakeRuntime = {
  head: SnakeCoord;
  trail: SnakeCoord[];
  path: SnakeCoord[];
};

type SnakeState = 'idle' | 'running' | 'to-center' | 'explode' | 'restore';

type ExplosionInfo = {
  burstId: number;
  x: number;
  y: number;
};

type ReturningBit = {
  id: number;
  key: string;
  targetX: number;
  targetY: number;
  delay: number;
  duration: number;
};

type ActivityPayload = {
  selectedYear: number | null;
  availableYears: number[];
  summary: {
    totalCommits: number;
    activeDays: number;
    activeRepos: number;
    publicRepos: number;
  };
  range: {
    from: string | null;
    to: string | null;
  };
  heatmap: HeatmapPoint[];
  events: ActivityEvent[];
};

const EMPTY_PAYLOAD: ActivityPayload = {
  selectedYear: null,
  availableYears: [],
  summary: { totalCommits: 0, activeDays: 0, activeRepos: 0, publicRepos: 1 },
  range: { from: null, to: null },
  heatmap: [],
  events: [],
};

function formatRangeDate(dateStr: string | null) {
  if (!dateStr) return 'n/a';

  const date = new Date(`${dateStr}T00:00:00Z`);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getCellAlpha(count: number, maxCount: number) {
  if (count <= 0) return 0.08;
  if (maxCount <= 1) return 0.3;

  const ratio = count / maxCount;
  if (ratio < 0.34) return 0.35;
  if (ratio < 0.67) return 0.55;
  return 0.8;
}

function normalizeHeatmap(points: HeatmapPoint[]): HeatmapCell[] {
  if (points.length === 0) return [];

  const normalized: HeatmapCell[] = [...points];
  const remainder = normalized.length % 7;
  if (remainder === 0) return normalized;

  const needed = 7 - remainder;
  const lastDate = new Date(`${points[points.length - 1].date}T00:00:00Z`);

  for (let i = 1; i <= needed; i += 1) {
    const padDate = new Date(lastDate);
    padDate.setUTCDate(lastDate.getUTCDate() + i);
    normalized.push({
      date: padDate.toISOString().slice(0, 10),
      count: 0,
      isPadding: true,
    });
  }

  return normalized;
}

function getWeekColumns(points: HeatmapCell[]) {
  const columns: HeatmapCell[][] = [];
  for (let i = 0; i < points.length; i += 7) {
    columns.push(points.slice(i, i + 7));
  }
  return columns;
}

function getCellKey(col: number, row: number) {
  return `${col}:${row}`;
}

function parseCellKey(key: string): SnakeCoord {
  const [col, row] = key.split(':').map(Number);
  return { col, row };
}

function isSameCell(a: SnakeCoord, b: SnakeCoord) {
  return a.col === b.col && a.row === b.row;
}

function manhattanDistance(a: SnakeCoord, b: SnakeCoord) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

function findShortestPath(start: SnakeCoord, target: SnakeCoord, maxCol: number, maxRow: number) {
  if (isSameCell(start, target)) return [];

  const queue: SnakeCoord[] = [start];
  const visited = new Set<string>([getCellKey(start.col, start.row)]);
  const parent = new Map<string, string>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;

    const neighbors: SnakeCoord[] = [
      { col: current.col + 1, row: current.row },
      { col: current.col - 1, row: current.row },
      { col: current.col, row: current.row + 1 },
      { col: current.col, row: current.row - 1 },
    ];

    for (const next of neighbors) {
      if (next.col < 0 || next.col > maxCol || next.row < 0 || next.row > maxRow) continue;
      const nextKey = getCellKey(next.col, next.row);
      if (visited.has(nextKey)) continue;

      visited.add(nextKey);
      parent.set(nextKey, getCellKey(current.col, current.row));

      if (isSameCell(next, target)) {
        const path: SnakeCoord[] = [];
        let cursor = nextKey;
        while (cursor !== getCellKey(start.col, start.row)) {
          path.push(parseCellKey(cursor));
          cursor = parent.get(cursor) ?? getCellKey(start.col, start.row);
        }
        path.reverse();
        return path;
      }

      queue.push(next);
    }
  }

  return [];
}

export default function EngineeringActivitySection() {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );
  const themeFade = hexToRgba(themeColor, isDark ? 0.35 : 0.65);

  const currentYear = React.useMemo(() => new Date().getUTCFullYear(), []);
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);
  const [data, setData] = React.useState<ActivityPayload>(EMPTY_PAYLOAD);
  const [loading, setLoading] = React.useState(true);
  const [hoverInfo, setHoverInfo] = React.useState<HoverInfo | null>(null);
  const [snakeState, setSnakeState] = React.useState<SnakeState>('idle');
  const [snakeRuntime, setSnakeRuntime] = React.useState<SnakeRuntime | null>(null);
  const [consumedKeys, setConsumedKeys] = React.useState<Set<string>>(new Set());
  const [legendClicks, setLegendClicks] = React.useState(0);
  const [explosionInfo, setExplosionInfo] = React.useState<ExplosionInfo | null>(null);
  const [returningBits, setReturningBits] = React.useState<ReturningBit[]>([]);
  const heatmapRef = React.useRef<HTMLDivElement | null>(null);
  const cellRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const legendClickTimerRef = React.useRef<number | null>(null);
  const explodeStartTimerRef = React.useRef<number | null>(null);
  const explodeEndTimerRef = React.useRef<number | null>(null);
  const poofResetTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const response = await fetch(`/api/engineering-activity?year=${selectedYear}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          setData(EMPTY_PAYLOAD);
          return;
        }

        const payload = (await response.json()) as ActivityPayload;
        if (!cancelled) {
          setData(payload);
          if (payload.selectedYear && payload.selectedYear !== selectedYear) {
            setSelectedYear(payload.selectedYear);
          }
        }
      } catch (error) {
        console.error('Activity fetch failed:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [selectedYear]);

  const normalizedHeatmap = React.useMemo(() => normalizeHeatmap(data.heatmap), [data.heatmap]);
  const maxCount = React.useMemo(
    () => normalizedHeatmap.reduce((max, day) => Math.max(max, day.count), 0),
    [normalizedHeatmap],
  );
  const weekColumns = React.useMemo(() => getWeekColumns(normalizedHeatmap), [normalizedHeatmap]);
  const activeCellKeys = React.useMemo(() => {
    const keys = new Set<string>();
    weekColumns.forEach((week, col) => {
      week.forEach((day, row) => {
        if (day.count > 0 && !day.isPadding) {
          keys.add(getCellKey(col, row));
        }
      });
    });
    return keys;
  }, [weekColumns]);
  const gridMaxCol = React.useMemo(() => Math.max(weekColumns.length - 1, 0), [weekColumns.length]);
  const centerCoord = React.useMemo<SnakeCoord>(
    () => ({ col: Math.floor(gridMaxCol / 2), row: 3 }),
    [gridMaxCol],
  );
  const snakeHeadKey = React.useMemo(() => {
    if (!snakeRuntime) return null;
    return getCellKey(snakeRuntime.head.col, snakeRuntime.head.row);
  }, [snakeRuntime]);
  const snakeTrailKeys = React.useMemo(() => {
    if (!snakeRuntime) return new Set<string>();
    const keys = new Set<string>();
    snakeRuntime.trail.slice(1).forEach((segment) => keys.add(getCellKey(segment.col, segment.row)));
    return keys;
  }, [snakeRuntime]);
  const legendPulseIndex = React.useMemo(() => {
    if (!snakeRuntime) return 0;
    return (snakeRuntime.head.col + snakeRuntime.head.row) % 5;
  }, [snakeRuntime]);
  const remainingLitKeys = React.useMemo(() => {
    const keys = new Set<string>();
    activeCellKeys.forEach((key) => {
      if (!consumedKeys.has(key)) keys.add(key);
    });
    return keys;
  }, [activeCellKeys, consumedKeys]);
  const events = React.useMemo(() => data.events.slice(0, 4), [data.events]);
  const resolveCellPoint = React.useCallback((cellKey: string) => {
    const parent = heatmapRef.current;
    const cell = cellRefs.current[cellKey];
    if (!parent) {
      return { x: 0, y: 0 };
    }
    if (!cell) {
      return { x: parent.clientWidth / 2, y: parent.clientHeight / 2 };
    }

    const parentRect = parent.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    return {
      x: cellRect.left - parentRect.left + cellRect.width / 2,
      y: cellRect.top - parentRect.top + cellRect.height / 2,
    };
  }, []);
  const resetSnake = React.useCallback(() => {
    if (legendClickTimerRef.current) {
      window.clearTimeout(legendClickTimerRef.current);
      legendClickTimerRef.current = null;
    }
    if (explodeStartTimerRef.current) {
      window.clearTimeout(explodeStartTimerRef.current);
      explodeStartTimerRef.current = null;
    }
    if (explodeEndTimerRef.current) {
      window.clearTimeout(explodeEndTimerRef.current);
      explodeEndTimerRef.current = null;
    }
    if (poofResetTimerRef.current) {
      window.clearTimeout(poofResetTimerRef.current);
      poofResetTimerRef.current = null;
    }
    setSnakeState('idle');
    setSnakeRuntime(null);
    setConsumedKeys(new Set());
    setLegendClicks(0);
    setExplosionInfo(null);
    setReturningBits([]);
  }, []);
  const triggerSnakeExplosion = React.useCallback(() => {
    const centerKey = getCellKey(centerCoord.col, centerCoord.row);
    const centerPoint = resolveCellPoint(centerKey);
    const burstId = Date.now();

    setSnakeState('explode');
    setSnakeRuntime(null);
    setHoverInfo(null);
    setExplosionInfo({ burstId, ...centerPoint });

    if (explodeStartTimerRef.current) {
      window.clearTimeout(explodeStartTimerRef.current);
    }
    explodeStartTimerRef.current = window.setTimeout(() => {
      const consumedList = Array.from(consumedKeys);
      if (consumedList.length === 0) {
        resetSnake();
        return;
      }

      const bits: ReturningBit[] = consumedList.map((key, index) => {
        const target = resolveCellPoint(key);
        return {
          id: burstId + index,
          key,
          targetX: target.x,
          targetY: target.y,
          delay: Math.random() * 0.28,
          duration: 0.42 + Math.random() * 0.24,
        };
      });
      setReturningBits(bits);
      setSnakeState('restore');
    }, 380);

    if (explodeEndTimerRef.current) {
      window.clearTimeout(explodeEndTimerRef.current);
    }
    explodeEndTimerRef.current = window.setTimeout(() => {
      setExplosionInfo(null);
    }, 760);
  }, [centerCoord, resolveCellPoint, consumedKeys, resetSnake]);
  const startSnakeEasterEgg = React.useCallback(() => {
    if (snakeState !== 'idle' || activeCellKeys.size === 0 || weekColumns.length === 0) return;

    const availableTargets = Array.from(activeCellKeys);
    const randomStartKey = availableTargets[Math.floor(Math.random() * availableTargets.length)];
    const start = randomStartKey ? parseCellKey(randomStartKey) : centerCoord;

    setHoverInfo(null);
    const startKey = getCellKey(start.col, start.row);
    setConsumedKeys(activeCellKeys.has(startKey) ? new Set([startKey]) : new Set());
    setExplosionInfo(null);
    setReturningBits([]);
    setLegendClicks(0);
    setSnakeRuntime({ head: start, trail: [start], path: [] });
    setSnakeState('running');
  }, [snakeState, activeCellKeys, weekColumns.length, centerCoord]);
  const handleLegendClick = React.useCallback(() => {
    if (snakeState !== 'idle') return;

    setLegendClicks((prev) => {
      const next = prev + 1;
      if (next >= 2) {
        startSnakeEasterEgg();
        return 0;
      }
      return next;
    });

    if (legendClickTimerRef.current) {
      window.clearTimeout(legendClickTimerRef.current);
    }
    legendClickTimerRef.current = window.setTimeout(() => setLegendClicks(0), 900);
  }, [snakeState, startSnakeEasterEgg]);
  const glassPanelStyle = {
    background: isDark
      ? 'linear-gradient(145deg, rgba(8,14,18,0.70), rgba(5,10,16,0.56))'
      : 'linear-gradient(145deg, rgba(255,255,255,0.85), rgba(241,245,249,0.72))',
    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)',
    boxShadow: isDark
      ? `0 22px 45px -24px rgba(0,0,0,0.92), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 30px -18px ${themeColor}`
      : `0 22px 45px -24px rgba(15,23,42,0.2), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 30px -18px ${themeColor}`,
  };

  React.useEffect(() => {
    if ((snakeState !== 'running' && snakeState !== 'to-center') || !snakeRuntime) return;

    const tick = window.setTimeout(() => {
      let nextRuntime: SnakeRuntime = snakeRuntime;
      let nextState: SnakeState = snakeState;
      let cellToConsume: string | null = null;
      let shouldExplode = false;

      if (nextRuntime.path.length === 0) {
        if (nextState === 'running') {
          const remaining = Array.from(remainingLitKeys);
          if (remaining.length === 0) {
            nextState = 'to-center';
            nextRuntime = {
              ...nextRuntime,
              path: findShortestPath(nextRuntime.head, centerCoord, gridMaxCol, 6),
            };
          } else {
            const randomTarget = parseCellKey(remaining[Math.floor(Math.random() * remaining.length)]);
            let path = findShortestPath(nextRuntime.head, randomTarget, gridMaxCol, 6);

            if (path.length === 0) {
              const nearest = remaining
                .map((key) => parseCellKey(key))
                .sort(
                  (a, b) =>
                    manhattanDistance(nextRuntime.head, a) - manhattanDistance(nextRuntime.head, b),
                )[0];
              path = nearest ? findShortestPath(nextRuntime.head, nearest, gridMaxCol, 6) : [];
            }

            nextRuntime = { ...nextRuntime, path };
          }
        } else if (isSameCell(nextRuntime.head, centerCoord)) {
          shouldExplode = true;
        } else {
          nextRuntime = {
            ...nextRuntime,
            path: findShortestPath(nextRuntime.head, centerCoord, gridMaxCol, 6),
          };
        }
      }

      if (!shouldExplode && nextRuntime.path.length > 0) {
        const [nextHead, ...restPath] = nextRuntime.path;
        const nextTrail = [nextHead, ...nextRuntime.trail].slice(0, 6);
        nextRuntime = { head: nextHead, trail: nextTrail, path: restPath };

        if (nextState === 'running') {
          const currentKey = getCellKey(nextHead.col, nextHead.row);
          if (remainingLitKeys.has(currentKey)) {
            cellToConsume = currentKey;
          }
        } else if (nextState === 'to-center' && isSameCell(nextHead, centerCoord) && restPath.length === 0) {
          shouldExplode = true;
        }
      }

      setSnakeRuntime(nextRuntime);
      if (nextState !== snakeState) {
        setSnakeState(nextState);
      }

      if (cellToConsume) {
        setConsumedKeys((prev) => {
          if (prev.has(cellToConsume)) return prev;
          const next = new Set(prev);
          next.add(cellToConsume);
          return next;
        });
      }

      if (shouldExplode) {
        triggerSnakeExplosion();
      }
    }, 56);

    return () => {
      window.clearTimeout(tick);
    };
  }, [
    snakeState,
    snakeRuntime,
    remainingLitKeys,
    centerCoord,
    gridMaxCol,
    triggerSnakeExplosion,
  ]);

  React.useEffect(() => {
    if (snakeState !== 'restore') return;
    if (returningBits.length > 0 || consumedKeys.size > 0) return;

    poofResetTimerRef.current = window.setTimeout(() => {
      resetSnake();
    }, 180);

    return () => {
      if (poofResetTimerRef.current) {
        window.clearTimeout(poofResetTimerRef.current);
        poofResetTimerRef.current = null;
      }
    };
  }, [snakeState, returningBits.length, consumedKeys.size, resetSnake]);

  React.useEffect(() => {
    resetSnake();
    setHoverInfo(null);
  }, [selectedYear, data.heatmap, resetSnake]);

  React.useEffect(() => {
    return () => {
      if (legendClickTimerRef.current) {
        window.clearTimeout(legendClickTimerRef.current);
      }
      if (explodeStartTimerRef.current) {
        window.clearTimeout(explodeStartTimerRef.current);
      }
      if (explodeEndTimerRef.current) {
        window.clearTimeout(explodeEndTimerRef.current);
      }
      if (poofResetTimerRef.current) {
        window.clearTimeout(poofResetTimerRef.current);
      }
    };
  }, []);

  return (
    <section id="activity" className="relative py-32 px-6 md:px-12 max-w-6xl mx-auto">
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-4"
        >
          <div className="h-[2px] w-12" style={{ backgroundColor: themeColor }} />
          <span className="text-[11px] font-mono uppercase tracking-[0.45em] text-slate-500">
            06 // Activity
          </span>
        </motion.div>

        <h2
          className={`font-black tracking-tighter leading-[0.95] ${isDark ? 'text-white' : 'text-slate-900'}`}
          style={{ fontSize: 'clamp(2.25rem, 6.5vw, 4.75rem)' }}
        >
          Engineering{' '}
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: `linear-gradient(90deg, ${themeColor}, ${themeFade})` }}
          >
            Activity
          </span>
        </h2>

        <p className={`mt-6 max-w-3xl text-base md:text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Public GitHub activity from {formatRangeDate(data.range.from)} to{' '}
          {formatRangeDate(data.range.to)}, showing shipping cadence and recent engineering events.
        </p>
      </div>

      <div className="overflow-hidden rounded-[28px] border backdrop-blur-2xl" style={glassPanelStyle}>
        <div
          className={`grid grid-cols-1 md:grid-cols-3 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}
        >
          <div
            className={`px-6 py-8 ${isDark ? 'border-white/10 md:border-r' : 'border-black/10 md:border-r'}`}
          >
            <p className={`text-5xl font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {data.summary.totalCommits}
            </p>
            <p className="mt-3 text-xs font-mono uppercase tracking-[0.3em] text-slate-500">
              Engineering events - {data.selectedYear ?? selectedYear}
            </p>
          </div>
          <div
            className={`px-6 py-8 ${isDark ? 'border-white/10 md:border-r' : 'border-black/10 md:border-r'}`}
          >
            <p className={`text-5xl font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {data.summary.activeDays}
            </p>
            <p className="mt-3 text-xs font-mono uppercase tracking-[0.3em] text-slate-500">
              Active engineering days
            </p>
          </div>
          <div className="px-6 py-8">
            <p className={`text-5xl font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {data.summary.activeRepos}/{data.summary.publicRepos}
            </p>
            <p className="mt-3 text-xs font-mono uppercase tracking-[0.3em] text-slate-500">
              Active repos / public repos
            </p>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-8">
          <div className="relative w-full" ref={heatmapRef} data-testid="activity-heatmap-root">
            <div className="mb-5 flex justify-end">
              <select
                value={data.selectedYear ?? selectedYear}
                onChange={(event) => {
                  setHoverInfo(null);
                  setSelectedYear(Number(event.target.value));
                }}
                className={`rounded-xl border px-4 py-2 text-sm font-mono tracking-[0.08em] backdrop-blur-xl focus:outline-none ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}
                style={{
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.12)',
                  background: isDark ? 'rgba(10,18,24,0.68)' : 'rgba(255,255,255,0.72)',
                }}
              >
                {(data.availableYears.length > 0 ? data.availableYears : [selectedYear]).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {hoverInfo && snakeState === 'idle' && (
              <div
                className="pointer-events-none absolute z-20 w-[230px] rounded-xl border px-4 py-3 backdrop-blur-xl"
                style={{
                  left: hoverInfo.x,
                  top: hoverInfo.y - 16,
                  transform: 'translate(-40%, -100%)',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.15)',
                  background: isDark ? 'rgba(5,10,16,0.92)' : 'rgba(255,255,255,0.92)',
                  boxShadow: isDark
                    ? '0 24px 50px -24px rgba(0,0,0,0.9)'
                    : '0 24px 50px -24px rgba(15,23,42,0.25)',
                }}
              >
                <p className={`text-xl font-semibold leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {hoverInfo.day.count} {hoverInfo.day.count === 1 ? 'event' : 'events'}
                </p>
                <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {new Date(`${hoverInfo.day.date}T00:00:00Z`).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}

            {snakeState === 'explode' && explosionInfo && (
              <>
                <motion.div
                  key={`ring-a-${explosionInfo.burstId}`}
                  className="pointer-events-none absolute z-30 h-10 w-10 rounded-full border"
                  initial={{ opacity: 0.95, scale: 0.15 }}
                  animate={{ opacity: 0, scale: 6 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    left: explosionInfo.x,
                    top: explosionInfo.y,
                    transform: 'translate(-50%, -50%)',
                    borderColor: `${themeColor}c8`,
                    boxShadow: `0 0 28px -6px ${themeColor}`,
                  }}
                />
                <motion.div
                  key={`ring-b-${explosionInfo.burstId}`}
                  className="pointer-events-none absolute z-30 h-8 w-8 rounded-full border"
                  initial={{ opacity: 0.9, scale: 0.2 }}
                  animate={{ opacity: 0, scale: 4.8 }}
                  transition={{ duration: 0.45, delay: 0.05, ease: 'easeOut' }}
                  style={{
                    left: explosionInfo.x,
                    top: explosionInfo.y,
                    transform: 'translate(-50%, -50%)',
                    borderColor: `${themeColor}aa`,
                  }}
                />
                {Array.from({ length: 14 }).map((_, index) => {
                  const angle = (index / 14) * Math.PI * 2;
                  const distance = 42 + (index % 4) * 9;
                  return (
                    <motion.div
                      key={`spark-${explosionInfo.burstId}-${index}`}
                      className="pointer-events-none absolute z-30 h-1.5 w-1.5 rounded-full"
                      initial={{
                        opacity: 0.95,
                        x: explosionInfo.x,
                        y: explosionInfo.y,
                        scale: 1,
                      }}
                      animate={{
                        opacity: 0,
                        x: explosionInfo.x + Math.cos(angle) * distance,
                        y: explosionInfo.y + Math.sin(angle) * distance,
                        scale: 0.1,
                      }}
                      transition={{ duration: 0.42, ease: 'easeOut' }}
                      style={{
                        backgroundColor: themeColor,
                        boxShadow: `0 0 10px ${themeColor}`,
                      }}
                    />
                  );
                })}
              </>
            )}

            {returningBits.map((bit) => (
              <motion.div
                key={bit.id}
                className="pointer-events-none absolute z-20 h-1.5 w-1.5 rounded-full"
                initial={{
                  x: explosionInfo?.x ?? 0,
                  y: explosionInfo?.y ?? 0,
                  opacity: 1,
                  scale: 1.1,
                }}
                animate={{
                  x: bit.targetX,
                  y: bit.targetY,
                  opacity: 0.85,
                  scale: 0.55,
                }}
                transition={{ duration: bit.duration, delay: bit.delay, ease: [0.22, 1, 0.36, 1] }}
                onAnimationComplete={() => {
                  setReturningBits((prev) => prev.filter((entry) => entry.id !== bit.id));
                  setConsumedKeys((prev) => {
                    if (!prev.has(bit.key)) return prev;
                    const next = new Set(prev);
                    next.delete(bit.key);
                    return next;
                  });
                }}
                style={{
                  left: 0,
                  top: 0,
                  backgroundColor: themeColor,
                  boxShadow: `0 0 10px ${themeColor}`,
                }}
              />
            ))}

            <div className="mt-1 w-full">
              <div
                className="grid w-full gap-[4px]"
                style={{ gridTemplateColumns: `repeat(${Math.max(weekColumns.length, 1)}, minmax(0, 1fr))` }}
              >
                {weekColumns.map((week, weekIdx) => (
                  <div key={`week-${weekIdx}`} className="grid grid-rows-7 gap-[4px]">
                    {week.map((day, rowIdx) => {
                      const cellKey = getCellKey(weekIdx, rowIdx);
                      const isConsumed = consumedKeys.has(cellKey);
                      const effectiveCount = isConsumed ? 0 : day.count;
                      const alpha = getCellAlpha(effectiveCount, maxCount);
                      const isHovered = hoverInfo?.day.date === day.date;
                      const isSnakeHead = snakeHeadKey === cellKey;
                      const isSnakeTrail = snakeTrailKeys.has(cellKey);
                      const isInteractive = !day.isPadding;
                      return (
                        <div
                          key={day.date}
                          ref={(node) => {
                            cellRefs.current[cellKey] = node;
                          }}
                          className="aspect-square w-full rounded-[3px] border transition-transform hover:scale-[1.08]"
                          onMouseEnter={(event) => {
                            if (!isInteractive || snakeState !== 'idle') return;
                            const parentRect = heatmapRef.current?.getBoundingClientRect();
                            const cellRect = event.currentTarget.getBoundingClientRect();
                            if (!parentRect) return;
                            setHoverInfo({
                              day,
                              x: cellRect.left - parentRect.left + cellRect.width / 2,
                              y: cellRect.top - parentRect.top,
                            });
                          }}
                          onMouseMove={(event) => {
                            if (!isInteractive || snakeState !== 'idle') return;
                            const parentRect = heatmapRef.current?.getBoundingClientRect();
                            const cellRect = event.currentTarget.getBoundingClientRect();
                            if (!parentRect) return;
                            setHoverInfo({
                              day,
                              x: cellRect.left - parentRect.left + cellRect.width / 2,
                              y: cellRect.top - parentRect.top,
                            });
                          }}
                          onMouseLeave={() => {
                            if (!isInteractive || snakeState !== 'idle') return;
                            setHoverInfo(null);
                          }}
                          style={{
                            borderColor: isSnakeHead
                              ? `${themeColor}ee`
                              : isHovered
                                ? `${themeColor}bb`
                                : isDark
                                  ? 'rgba(255,255,255,0.06)'
                                  : 'rgba(15,23,42,0.12)',
                            backgroundColor:
                              isSnakeHead
                                ? '#d1fae5'
                                : isSnakeTrail
                                  ? `${themeColor}b3`
                                  : effectiveCount === 0
                                ? isDark
                                  ? 'rgba(15, 23, 42, 0.7)'
                                  : 'rgba(226, 232, 240, 0.7)'
                                : `${themeColor}${Math.round(alpha * 255)
                                    .toString(16)
                                    .padStart(2, '0')}`,
                            boxShadow: isSnakeHead
                              ? `0 0 18px -1px ${themeColor}`
                              : isSnakeTrail
                                ? `0 0 14px -3px ${themeColor}`
                                : isHovered
                                  ? `0 0 18px -2px ${themeColor}`
                                  : effectiveCount > 0
                                    ? `0 0 12px -3px ${themeColor}${Math.round(alpha * 180).toString(16).padStart(2, '0')}`
                                    : 'none',
                            opacity: day.isPadding ? 0.72 : 1,
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              data-testid="activity-legend-trigger"
              onClick={handleLegendClick}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleLegendClick();
                }
              }}
              className="mt-5 flex cursor-pointer select-none justify-end items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-slate-500"
            >
              <span>
                {snakeState === 'running' || snakeState === 'to-center'
                  ? 'Snake'
                  : snakeState === 'explode'
                    ? 'Burst'
                    : snakeState === 'restore'
                      ? 'Return'
                    : legendClicks === 1
                      ? 'Armed'
                      : 'Lower'}
              </span>
              {[0, 1, 2, 3, 4].map((index) => {
                const baseAlpha = [0.12, 0.28, 0.45, 0.65, 0.85][index];
                const trailDistance = (legendPulseIndex - index + 5) % 5;
                const isSnakeActive = snakeState !== 'idle';
                const snakeAlpha =
                  isSnakeActive
                    ? trailDistance === 0
                      ? 0.98
                      : trailDistance === 1
                        ? 0.75
                        : trailDistance === 2
                          ? 0.55
                          : trailDistance === 3
                            ? 0.35
                            : 0.2
                    : baseAlpha;

                return (
                  <div
                    key={index}
                    className="h-4 w-4 rounded-[3px] border transition-all duration-75"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.12)',
                      backgroundColor: `${themeColor}${Math.round(snakeAlpha * 255)
                        .toString(16)
                        .padStart(2, '0')}`,
                      boxShadow:
                        isSnakeActive && trailDistance === 0
                          ? `0 0 10px -2px ${themeColor}`
                          : 'none',
                    }}
                  />
                );
              })}
              <span>
                {snakeState === 'running' || snakeState === 'to-center'
                  ? 'Hunting'
                  : snakeState === 'explode'
                    ? 'Bursting'
                    : snakeState === 'restore'
                      ? 'Restoring'
                      : 'Higher'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 mx-auto max-w-5xl space-y-3">
        {loading && (
          <div className="rounded-3xl border px-5 py-4 backdrop-blur-2xl" style={glassPanelStyle}>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>Loading GitHub activity...</p>
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="rounded-3xl border px-5 py-4 backdrop-blur-2xl" style={glassPanelStyle}>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              No GitHub activity found for this account and year.
            </p>
          </div>
        )}

        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <div className="rounded-3xl border px-4 py-3 backdrop-blur-2xl" style={glassPanelStyle}>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,90px),1fr,72px] md:items-start">
                <p className={`text-base font-mono lowercase ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {event.actor}
                </p>
                <div>
                  <p className={`text-xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {event.title}
                  </p>
                  <p className={`mt-0.5 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {event.description}
                  </p>
                </div>
                <p className="text-left text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 md:pt-1 md:text-right">
                  {event.dateLabel}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
