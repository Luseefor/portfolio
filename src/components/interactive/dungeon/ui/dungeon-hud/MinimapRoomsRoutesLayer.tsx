'use client';

import { DUNGEON_LAYOUT_GRAPH } from '@/constants/dungeonLayout';
import type { DungeonUiThemePalette } from '../useDungeonUiTheme';
import { ROOM_BY_ID, ROUTE_WIDTH_SCALE, worldToMinimap } from './constants';

type MinimapRoomsRoutesLayerProps = {
  theme: DungeonUiThemePalette;
};

export function MinimapRoomsRoutesLayer({ theme }: MinimapRoomsRoutesLayerProps) {
  return (
    <>
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
    </>
  );
}
