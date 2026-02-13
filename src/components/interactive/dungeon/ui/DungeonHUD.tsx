'use client';

import { motion } from 'framer-motion';
import { CHEST_POIS, DUNGEON_LAYOUT_GRAPH } from '@/constants/dungeonLayout';
import { DUNGEON_BOUNDS } from '@/constants/dungeonBounds';
import { useDungeonInput } from '@/lib/dungeonInput';
import { usePlayerState, playerStateSelectors } from '@/lib/playerState';
import { useDungeonUiTheme } from './useDungeonUiTheme';

interface DungeonHUDProps {
  chestsOpened: number;
  totalChests: number;
  openedChestIds: ReadonlySet<string>;
}

const MINIMAP_WIDTH = 220;
const MINIMAP_HEIGHT = 156;
const MINIMAP_PADDING = 10;
const MINIMAP_GRID_STEP = 18;
const DUNGEON_SPAN_X = Math.max(1, DUNGEON_BOUNDS.maxX - DUNGEON_BOUNDS.minX);
const DUNGEON_SPAN_Z = Math.max(1, DUNGEON_BOUNDS.maxZ - DUNGEON_BOUNDS.minZ);
const ROOM_BY_ID = new Map(DUNGEON_LAYOUT_GRAPH.rooms.map((room) => [room.id, room]));
const MINIMAP_INNER_WIDTH = MINIMAP_WIDTH - MINIMAP_PADDING * 2;
const MINIMAP_INNER_HEIGHT = MINIMAP_HEIGHT - MINIMAP_PADDING * 2;
const ROUTE_WIDTH_SCALE = ((MINIMAP_INNER_WIDTH / DUNGEON_SPAN_X) + (MINIMAP_INNER_HEIGHT / DUNGEON_SPAN_Z)) * 0.5;

function worldToMinimap(x: number, z: number) {
  const nx = (x - DUNGEON_BOUNDS.minX) / DUNGEON_SPAN_X;
  const nz = (z - DUNGEON_BOUNDS.minZ) / DUNGEON_SPAN_Z;
  return {
    x: MINIMAP_PADDING + nx * (MINIMAP_WIDTH - MINIMAP_PADDING * 2),
    y: MINIMAP_PADDING + nz * (MINIMAP_HEIGHT - MINIMAP_PADDING * 2),
  };
}

export default function DungeonHUD({
  chestsOpened,
  totalChests,
  openedChestIds,
}: DungeonHUDProps) {
  const theme = useDungeonUiTheme();
  const isTouchDevice = useDungeonInput((state) => state.isTouchDevice);
  const position = usePlayerState(playerStateSelectors.position);
  const look = usePlayerState(playerStateSelectors.look);
  const speed = usePlayerState(playerStateSelectors.speed);
  const grounded = usePlayerState(playerStateSelectors.grounded);
  const isMoving = usePlayerState(playerStateSelectors.isMoving);
  const playerPoint = worldToMinimap(position.x, position.z);
  const lookMagnitude = Math.hypot(look.x, look.z);
  const lookX = lookMagnitude > 0.0001 ? look.x / lookMagnitude : 0;
  const lookY = lookMagnitude > 0.0001 ? look.z / lookMagnitude : -1;
  const beamNearLength = 4;
  const beamFarLength = 30;
  const beamNearHalfWidth = 2.8;
  const beamFarHalfWidth = 11.5;
  const nearCenterX = playerPoint.x + lookX * beamNearLength;
  const nearCenterY = playerPoint.y + lookY * beamNearLength;
  const farCenterX = playerPoint.x + lookX * beamFarLength;
  const farCenterY = playerPoint.y + lookY * beamFarLength;
  const perpendicularX = -lookY;
  const perpendicularY = lookX;

  return (
    <>
      {/* Top-left: Minimap */}
      <div className="pointer-events-none fixed left-3 top-3 z-30 sm:left-6 sm:top-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-[236px] rounded-xl border bg-gradient-to-br from-stone-900/95 to-stone-800/90 p-2.5 shadow-[0_0_24px_rgba(0,0,0,0.35)] backdrop-blur-md sm:w-[264px] sm:p-3"
          style={{ borderColor: theme.accentBorder }}
        >
          <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.24em]">
            <span style={{ color: theme.accentText }}>Minimap</span>
            <span className="font-mono tracking-[0.12em] text-stone-400">{chestsOpened}/{totalChests}</span>
          </div>
          <svg
            viewBox={`0 0 ${MINIMAP_WIDTH} ${MINIMAP_HEIGHT}`}
            className="h-[138px] w-[194px] rounded-lg border border-stone-700/80 bg-stone-950/90 sm:h-[156px] sm:w-[220px]"
            role="img"
            aria-label="Dungeon minimap"
          >
            <defs>
              <radialGradient id="minimap-bg-glow" cx="50%" cy="50%" r="85%">
                <stop offset="0%" stopColor="rgba(32,38,44,0.35)" />
                <stop offset="100%" stopColor="rgba(6,8,10,0.95)" />
              </radialGradient>
              <filter id="beam-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2.1" />
              </filter>
            </defs>
            <rect
              x={0}
              y={0}
              width={MINIMAP_WIDTH}
              height={MINIMAP_HEIGHT}
              fill="url(#minimap-bg-glow)"
              stroke="rgba(148,163,184,0.22)"
              strokeWidth={1}
              rx={8}
            />
            {Array.from({ length: Math.floor(MINIMAP_WIDTH / MINIMAP_GRID_STEP) }).map((_, index) => {
              const x = (index + 1) * MINIMAP_GRID_STEP;
              return (
                <line
                  key={`grid-v-${x}`}
                  x1={x}
                  y1={1}
                  x2={x}
                  y2={MINIMAP_HEIGHT - 1}
                  stroke="rgba(148,163,184,0.08)"
                  strokeWidth={0.6}
                />
              );
            })}
            {Array.from({ length: Math.floor(MINIMAP_HEIGHT / MINIMAP_GRID_STEP) }).map((_, index) => {
              const y = (index + 1) * MINIMAP_GRID_STEP;
              return (
                <line
                  key={`grid-h-${y}`}
                  x1={1}
                  y1={y}
                  x2={MINIMAP_WIDTH - 1}
                  y2={y}
                  stroke="rgba(148,163,184,0.08)"
                  strokeWidth={0.6}
                />
              );
            })}
            {DUNGEON_LAYOUT_GRAPH.rooms.map((room) => {
              const minX = room.center[0] - room.size.width / 2;
              const maxX = room.center[0] + room.size.width / 2;
              const minZ = room.center[2] - room.size.depth / 2;
              const maxZ = room.center[2] + room.size.depth / 2;
              const topLeft = worldToMinimap(minX, minZ);
              const bottomRight = worldToMinimap(maxX, maxZ);
              return (
                <rect
                  key={room.id}
                  x={topLeft.x}
                  y={topLeft.y}
                  width={Math.max(2, bottomRight.x - topLeft.x)}
                  height={Math.max(2, bottomRight.y - topLeft.y)}
                  fill="none"
                  stroke={theme.accentBorder}
                  strokeWidth={1}
                  rx={2}
                />
              );
            })}
            {DUNGEON_LAYOUT_GRAPH.routes.map((route) => {
              const fromRoom = ROOM_BY_ID.get(route.fromRoomId);
              const toRoom = ROOM_BY_ID.get(route.toRoomId);
              if (!fromRoom || !toRoom) return null;
              const routeStroke = Math.max(2, Math.min(5.5, route.width * ROUTE_WIDTH_SCALE * 0.26));
              const points = [
                [fromRoom.center[0], fromRoom.center[2]],
                ...(route.waypoints ?? []),
                [toRoom.center[0], toRoom.center[2]],
              ]
                .map(([x, z]) => {
                  const point = worldToMinimap(x, z);
                  return `${point.x},${point.y}`;
                })
                .join(' ');
              return (
                <g key={route.id}>
                  <polyline
                    points={points}
                    fill="none"
                    stroke={theme.accentBgStrong}
                    strokeWidth={routeStroke + 2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points={points}
                    fill="none"
                    stroke={theme.accentBorderStrong}
                    strokeWidth={routeStroke}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}
            {CHEST_POIS.map((chest) => {
              const point = worldToMinimap(chest.position[0], chest.position[2]);
              const isOpened = openedChestIds.has(chest.id);
              return (
                <g key={chest.id}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isOpened ? 2.1 : 2.9}
                    fill={isOpened ? 'rgba(107,114,128,0.95)' : theme.accent}
                  />
                  {!isOpened && (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={4.3}
                      fill="none"
                      stroke={theme.accentBorderStrong}
                      strokeWidth={0.9}
                    />
                  )}
                </g>
              );
            })}
            <polygon
              points={`${nearCenterX + perpendicularX * beamNearHalfWidth},${nearCenterY + perpendicularY * beamNearHalfWidth} ${farCenterX + perpendicularX * beamFarHalfWidth},${farCenterY + perpendicularY * beamFarHalfWidth} ${farCenterX - perpendicularX * beamFarHalfWidth},${farCenterY - perpendicularY * beamFarHalfWidth} ${nearCenterX - perpendicularX * beamNearHalfWidth},${nearCenterY - perpendicularY * beamNearHalfWidth}`}
              fill="rgba(255,255,255,0.11)"
              filter="url(#beam-glow)"
            />
            <polygon
              points={`${playerPoint.x},${playerPoint.y} ${farCenterX + perpendicularX * (beamFarHalfWidth * 0.45)},${farCenterY + perpendicularY * (beamFarHalfWidth * 0.45)} ${farCenterX - perpendicularX * (beamFarHalfWidth * 0.45)},${farCenterY - perpendicularY * (beamFarHalfWidth * 0.45)}`}
              fill="rgba(255,255,255,0.18)"
            />
            <circle cx={playerPoint.x} cy={playerPoint.y} r={8} fill="rgba(255,255,255,0.2)" />
            <circle cx={playerPoint.x} cy={playerPoint.y} r={5.2} fill="rgba(255,255,255,0.34)" />
            <circle cx={playerPoint.x} cy={playerPoint.y} r={2.9} fill="rgba(255,255,255,1)" />
            <text
              x={MINIMAP_WIDTH - 13}
              y={14}
              fill="rgba(226,232,240,0.88)"
              fontSize={8}
              fontWeight={700}
              textAnchor="middle"
            >
              N
            </text>
          </svg>
          <div className="mt-2 flex items-center justify-between text-[9px] font-medium uppercase tracking-[0.14em] text-stone-400">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white" />
              <span>You</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.accent }} />
              <span>Unopened</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-stone-500" />
              <span>Opened</span>
            </div>
          </div>
        </motion.div>
      </div>

      {!isTouchDevice && (
        <>
          {/* Top-right: Progress */}
          <div className="pointer-events-none fixed right-6 top-6 z-30">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border bg-gradient-to-r from-stone-900/90 to-stone-800/90 px-4 py-3 shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-md"
              style={{ borderColor: theme.accentBorder }}
            >
              <div className="flex items-center gap-4">
                {/* Treasures found */}
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: theme.accent }}>
                    <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z" />
                  </svg>
                  <span className="font-mono text-sm font-bold tabular-nums" style={{ color: theme.accentText }}>
                    {chestsOpened}/{totalChests}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-6 w-px" style={{ backgroundColor: theme.accentBorder }} />

                {/* Speed */}
                <div className="text-right">
                  <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-stone-500">
                    Speed
                  </div>
                  <div className="font-mono text-sm font-bold tabular-nums text-stone-300">
                    {speed.toFixed(1)}
                    <span className="ml-1 text-[9px] text-stone-500">m/s</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom-left: Controls hint */}
          <div className="pointer-events-none fixed bottom-6 left-6 z-30">
            <div className="space-y-1.5 text-[10px] uppercase tracking-wider text-stone-500">
              <div className="flex items-center gap-2">
                <span className="rounded border border-stone-700 bg-stone-800/80 px-1.5 py-0.5">
                  WASD
                </span>
                <span>Move</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-stone-700 bg-stone-800/80 px-1.5 py-0.5">
                  SHIFT
                </span>
                <span>Run</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-stone-700 bg-stone-800/80 px-1.5 py-0.5">
                  SPACE
                </span>
                <span>Jump</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-stone-700 bg-stone-800/80 px-1.5 py-0.5">
                  Q
                </span>
                <span>Dash</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-stone-700 bg-stone-800/80 px-1.5 py-0.5">
                  C
                </span>
                <span>Roll</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-stone-700 bg-stone-800/80 px-1.5 py-0.5">
                  R
                </span>
                <span>Attack</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-stone-700 bg-stone-800/80 px-1.5 py-0.5">
                  M
                </span>
                <span>Mute / Unmute</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-stone-700 bg-stone-800/80 px-1.5 py-0.5">
                  ESC
                </span>
                <span>Settings</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-stone-700 bg-stone-800/80 px-1.5 py-0.5">
                  Right Click
                </span>
                <span>Unlock Pointer</span>
              </div>
            </div>
          </div>

          {/* Bottom-right: Status indicators */}
          <div className="pointer-events-none fixed bottom-6 right-6 z-30">
            <div className="flex items-center gap-3">
              {/* Grounded indicator */}
              <div
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  grounded
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : ''
                }`}
                style={
                  grounded
                    ? undefined
                    : {
                        borderColor: theme.accentBorderStrong,
                        backgroundColor: theme.accentBgSoft,
                        color: theme.accentText,
                      }
                }
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    grounded ? 'bg-emerald-400' : 'animate-pulse'
                  }`}
                  style={grounded ? undefined : { backgroundColor: theme.accent }}
                />
                {grounded ? 'Grounded' : 'Airborne'}
              </div>

              {/* Moving indicator */}
              {isMoving && (
                <div className="flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
                  Moving
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
