'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Component,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import {
  BoxGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  OrthographicCamera,
  PlaneGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { APPROACH, canStand, moveRover, nearTable, TABLE, type Point } from '@/lib/fieldwork/game';
import { heightAt } from '@/lib/workbench/model';
import type { GameBridge } from './types';

type Props = {
  bridge: MutableRefObject<GameBridge>;
  frequency: number;
  calibrated: boolean;
  dark: boolean;
  onMove: (point: Point) => void;
  onInspect: () => void;
  onBlocked: () => void;
};
type Block = [number, number, number, number, number, number];
function mergedBoxes(blocks: Block[]) {
  const parts = blocks.map(([w, h, d, x, y, z]) => new BoxGeometry(w, h, d).translate(x, y, z));
  const merged = mergeGeometries(parts)!;
  for (const part of parts) part.dispose();
  return merged;
}

function Architecture({ dark }: { dark: boolean }) {
  const geometry = useMemo(() => {
    const stone: Block[] = [
      [38, 0.6, 30, 0, -0.3, 0],
      [38, 0.3, 0.4, 0, 0.15, -14.7],
      [0.4, 0.3, 30, -18.7, 0.15, 0],
      [11, 0.9, 7, TABLE.x, 0.45, TABLE.z],
      [11.5, 0.3, 7.5, TABLE.x, 1.05, TABLE.z],
      [9.4, 0.3, 0.25, TABLE.x, 1.8, -7.1],
      [9.4, 0.3, 0.25, TABLE.x, 1.8, -0.9],
      [0.25, 0.3, 6.3, -12.7, 1.8, TABLE.z],
      [0.25, 0.3, 6.3, -3.3, 1.8, TABLE.z],
      [11, 0.3, 8, 8.5, 0.15, -8],
      [7, 0.5, 1, 8.5, 0.8, -10],
      [7, 0.25, 1.4, 8.5, 1.15, -10],
    ];
    for (const x of [-17, 0, 17]) stone.push([0.7, 2, 0.7, x, 1, -13.5]);
    for (const x of [-17, 17]) stone.push([0.7, 2, 0.7, x, 1, 12.5]);
    const graphite: Block[] = [
      [0.35, 4.8, 0.35, 4, 2.4, -11],
      [0.35, 4.8, 0.35, 13, 2.4, -11],
      [0.35, 4.8, 0.35, 4, 2.4, -5],
      [0.35, 4.8, 0.35, 13, 2.4, -5],
      [9.5, 0.3, 0.35, 8.5, 4.8, -11],
      [9.5, 0.3, 0.35, 8.5, 4.8, -5],
    ];
    const rust: Block[] = [
      [0.055, 0.015, 26, 0, 0.012, 0],
      [34, 0.015, 0.055, 0, 0.012, 5],
      [0.06, 0.015, 7, -8, 0.012, 4.1],
      [17, 0.1, 0.12, -8.5, 1.35, -13.5],
      [17, 0.1, 0.12, 8.5, 1.35, -13.5],
      [0.6, 0.02, 0.15, -17, 2.02, -13.5],
      [0.6, 0.02, 0.15, 17, 2.02, -13.5],
    ];
    for (let i = 0; i < 13; i++) rust.push([0.45, 0.2, 7.2, 3.8 + i * 0.78, 5.05, -8]);
    for (let i = 0; i < 5; i++) stone.push([0.7, 0.24, 3, 2 + i * 2.6, 0.12, 10.5]);
    return [mergedBoxes(stone), mergedBoxes(graphite), mergedBoxes(rust)];
  }, []);
  useEffect(() => () => geometry.forEach((g) => g.dispose()), [geometry]);
  return (
    <group>
      {geometry.map((g, i) => (
        <mesh key={i} geometry={g} castShadow receiveShadow>
          <meshStandardMaterial
            color={
              i === 0
                ? dark
                  ? '#292929'
                  : '#e6dfce'
                : i === 1
                  ? '#454440'
                  : dark
                    ? '#a8755e'
                    : '#ac6b4d'
            }
            roughness={1}
          />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.61, 0]} receiveShadow>
        <planeGeometry args={[250, 250]} />
        <meshBasicMaterial color={dark ? '#080808' : '#faf8f2'} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 5]}>
        <ringGeometry args={[0.7, 0.74, 48]} />
        <meshBasicMaterial color={dark ? '#a8755e' : '#ac6b4d'} />
      </mesh>
    </group>
  );
}

function WaveTable({
  frequency,
  calibrated,
  dark,
  onInspect,
}: Pick<Props, 'frequency' | 'calibrated' | 'dark' | 'onInspect'>) {
  const geometries = useMemo(() => {
    const surface = new PlaneGeometry(8.6, 5.4, 40, 28);
    surface.rotateX(-Math.PI / 2);
    const vertices = surface.attributes.position;
    for (let i = 0; i < vertices.count; i++)
      vertices.setY(
        i,
        0.65 *
          heightAt(
            'wave',
            (vertices.getX(i) * 6) / 8.6,
            (vertices.getZ(i) * 6) / 5.4,
            1,
            frequency,
          ),
      );
    surface.computeVertexNormals();
    surface.computeBoundingSphere();
    const lines: number[] = [];
    const point = (x: number, z: number) => [
      x,
      0.65 * heightAt('wave', (x * 6) / 8.6, (z * 6) / 5.4, 1, frequency) + 0.015,
      z,
    ];
    for (let z = 0; z <= 14; z++)
      for (let x = 0; x < 40; x++)
        lines.push(
          ...point(-4.3 + (x * 8.6) / 40, -2.7 + (z * 5.4) / 14),
          ...point(-4.3 + ((x + 1) * 8.6) / 40, -2.7 + (z * 5.4) / 14),
        );
    for (let x = 0; x <= 20; x++)
      for (let z = 0; z < 28; z++)
        lines.push(
          ...point(-4.3 + (x * 8.6) / 20, -2.7 + (z * 5.4) / 28),
          ...point(-4.3 + (x * 8.6) / 20, -2.7 + ((z + 1) * 5.4) / 28),
        );
    const grid = new BufferGeometry();
    grid.setAttribute('position', new Float32BufferAttribute(lines, 3));
    return { surface, grid };
  }, [frequency]);
  useEffect(
    () => () => {
      geometries.surface.dispose();
      geometries.grid.dispose();
    },
    [geometries],
  );
  return (
    <group position={[TABLE.x, 1.85, TABLE.z]}>
      <mesh
        geometry={geometries.surface}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onInspect();
        }}
      >
        <meshStandardMaterial color={dark ? '#497187' : '#6c97ad'} roughness={0.9} />
      </mesh>
      <lineSegments geometry={geometries.grid} raycast={() => {}}>
        <lineBasicMaterial color={dark ? '#b3c9d4' : '#d7e3e7'} transparent opacity={0.8} />
      </lineSegments>
      <mesh position={[0, -0.35, 3.55]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[2.1, 0.5, 0.65]} />
        <meshStandardMaterial color={dark ? '#aaa79e' : '#d9d2c0'} roughness={0.8} />
      </mesh>
      <mesh position={[-0.6, -0.05, 3.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.15, 16]} />
        <meshStandardMaterial color="#ae8960" roughness={0.65} />
      </mesh>
      <mesh position={[0.6, -0.12, 3.9]}>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial color={calibrated ? '#86ae8e' : '#b77651'} />
      </mesh>
    </group>
  );
}

function Rover({ rover }: { rover: MutableRefObject<Group | null> }) {
  return (
    <group ref={rover} scale={1.1}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1.2, 0.45, 1.7]} />
        <meshStandardMaterial color="#e6deca" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.97, -0.15]} castShadow>
        <boxGeometry args={[0.85, 0.15, 0.95]} />
        <meshStandardMaterial color="#faf3dd" roughness={1} />
      </mesh>
      {[-0.75, 0.75].flatMap((x) =>
        [-0.58, 0.58].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0.42, z]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.42, 0.42, 0.38, 12]} />
              <meshStandardMaterial color="#323332" roughness={1} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.18, 0.18, 0.4, 12]} />
              <meshStandardMaterial color="#a78a62" roughness={0.8} />
            </mesh>
          </group>
        )),
      )}
      <mesh position={[-0.32, 1.65, -0.4]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 1.3, 8]} />
        <meshStandardMaterial color="#5a5750" roughness={1} />
      </mesh>
      <mesh position={[-0.32, 2.28, -0.4]} castShadow>
        <boxGeometry args={[0.5, 0.4, 0.4]} />
        <meshStandardMaterial color="#b19364" roughness={0.7} />
      </mesh>
      <mesh position={[-0.32, 2.28, -0.62]}>
        <circleGeometry args={[0.105, 12]} />
        <meshStandardMaterial color="#252e30" roughness={0.4} />
      </mesh>
      <mesh position={[0.43, 1.85, 0.5]}>
        <cylinderGeometry args={[0.025, 0.025, 2, 6]} />
        <meshStandardMaterial color="#625c51" />
      </mesh>
      <mesh position={[0.64, 2.65, 0.5]}>
        <boxGeometry args={[0.45, 0.28, 0.025]} />
        <meshStandardMaterial color="#b66546" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <circleGeometry args={[1.05, 24]} />
        <meshBasicMaterial color="#171717" transparent opacity={0.11} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Controller({ bridge, onMove, onBlocked }: Pick<Props, 'bridge' | 'onMove' | 'onBlocked'>) {
  const { camera, gl, scene, size, invalidate } = useThree();
  const rover = useRef<Group>(null);
  const controls = useRef<OrbitControls | null>(null);
  const forward = new Vector3(),
    right = new Vector3();
  const report = useRef(0);
  const lastReported = useRef<Point>({ x: NaN, z: NaN });
  useEffect(() => {
    const state = bridge.current;
    const orbit = new OrbitControls(camera, gl.domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.1;
    orbit.enablePan = false;
    orbit.minPolarAngle = 0.35;
    orbit.maxPolarAngle = 1.2;
    orbit.minZoom = 7;
    orbit.maxZoom = 55;
    controls.current = orbit;
    const changed = () => invalidate();
    orbit.addEventListener('change', changed);
    const reset = () => {
      camera.position.set(30, 32, 34);
      orbit.target.set(-1, 0, -1);
      if (camera instanceof OrthographicCamera) {
        camera.zoom = Math.min(size.width / (size.width < 600 ? 31 : 48), size.height / 32);
        camera.updateProjectionMatrix();
      }
      orbit.update();
      invalidate();
    };
    reset();
    state.resetView = reset;
    state.wake = invalidate;
    return () => {
      orbit.dispose();
      controls.current = null;
      delete state.resetView;
      delete state.wake;
    };
  }, [camera, gl, invalidate, bridge, size.width, size.height]);
  function step(seconds: number) {
    const state = bridge.current;
    const held = state.keys;
    let direction: Point = { x: 0, z: 0 };
    const up =
      Number(held.has('KeyW') || held.has('ArrowUp')) -
      Number(held.has('KeyS') || held.has('ArrowDown'));
    const across =
      Number(held.has('KeyD') || held.has('ArrowRight')) -
      Number(held.has('KeyA') || held.has('ArrowLeft'));
    if (up || across) {
      state.destination = null;
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      right.crossVectors(forward, camera.up).normalize();
      direction = { x: forward.x * up + right.x * across, z: forward.z * up + right.z * across };
    } else if (state.destination) {
      direction = {
        x: state.destination.x - state.position.x,
        z: state.destination.z - state.position.z,
      };
      if (Math.hypot(direction.x, direction.z) < 0.15) {
        state.destination = null;
        direction = { x: 0, z: 0 };
      }
    }
    const previous = state.position;
    const next = moveRover(previous, direction, seconds);
    const travelled = Math.hypot(next.x - previous.x, next.z - previous.z);
    if (travelled > 0) {
      state.position = next;
      if (rover.current)
        rover.current.rotation.y = Math.atan2(-(next.x - previous.x), -(next.z - previous.z));
      const orbit = controls.current;
      if (orbit && Math.hypot(next.x - orbit.target.x, next.z - orbit.target.z) > 13) {
        const dx = (next.x - orbit.target.x) * 0.025,
          dz = (next.z - orbit.target.z) * 0.025;
        orbit.target.x += dx;
        orbit.target.z += dz;
        camera.position.x += dx;
        camera.position.z += dz;
      }
    } else if (state.destination && (direction.x || direction.z)) {
      state.destination = null;
      onBlocked();
    }
    if (rover.current) rover.current.position.set(state.position.x, 0, state.position.z);
    controls.current?.update();
    report.current += seconds;
    if (
      (report.current >= 0.1 || (!state.destination && !up && !across)) &&
      (state.position.x !== lastReported.current.x || state.position.z !== lastReported.current.z)
    ) {
      onMove({ ...state.position });
      lastReported.current = { ...state.position };
      report.current = 0;
    }
    return Boolean(up || across || state.destination);
  }
  // The skill client uses the same simulation step as real gameplay.
  useEffect(() => {
    const state = bridge.current;
    state.advance = (milliseconds) => {
      if (!Number.isFinite(milliseconds) || milliseconds < 0) return;
      state.manual = true;
      const count = Math.max(1, Math.ceil(Math.min(milliseconds, 10000) / (1000 / 60)));
      for (let i = 0; i < count; i++) step(Math.min(milliseconds, 10000) / count / 1000);
      gl.render(scene, camera);
    };
    return () => {
      delete state.advance;
    };
  });
  useFrame((_, delta) => {
    const state = bridge.current;
    if (!state.manual && step(Math.min(delta, 1 / 30))) invalidate();
    state.metrics = {
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
      frames: state.metrics.frames + 1,
    };
  });
  return <Rover rover={rover} />;
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div style={{ padding: 32 }}>
        The 3D view could not start. Use the accessible instrument controls below to complete the
        experiment.
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function ResearchScene(props: Props) {
  const down = useRef<{ x: number; y: number } | null>(null);
  return (
    <SceneBoundary>
      <Canvas
        orthographic
        frameloop="demand"
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [30, 32, 34], zoom: 20, near: 0.1, far: 180 }}
        gl={{ antialias: true, powerPreference: 'low-power' }}
        role="img"
        aria-label="Research courtyard with a survey rover and an interactive blue wave table"
        fallback={
          <p>The 3D view needs WebGL. The accessible instrument controls remain available below.</p>
        }
      >
        <color attach="background" args={[props.dark ? '#080808' : '#faf8f2']} />
        <ambientLight intensity={props.dark ? 1.1 : 1.7} />
        <directionalLight
          position={[-12, 28, 16]}
          intensity={props.dark ? 2.4 : 3.1}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={24}
          shadow-camera-bottom={-24}
          shadow-camera-near={1}
          shadow-camera-far={80}
          shadow-normalBias={0.06}
          shadow-bias={-0.0002}
        />
        <Architecture dark={props.dark} />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.005, 0]}
          onPointerDown={(event) => {
            down.current = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY };
          }}
          onPointerUp={(event) => {
            if (
              down.current &&
              Math.hypot(
                event.nativeEvent.clientX - down.current.x,
                event.nativeEvent.clientY - down.current.y,
              ) < 5
            ) {
              const next = { x: event.point.x, z: event.point.z };
              if (canStand(next)) {
                props.bridge.current.destination = next;
                props.bridge.current.manual = false;
                props.bridge.current.wake?.();
              }
            }
            down.current = null;
          }}
        >
          <planeGeometry args={[36, 28]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <WaveTable
          frequency={props.frequency}
          calibrated={props.calibrated}
          dark={props.dark}
          onInspect={() => {
            if (nearTable(props.bridge.current.position)) props.onInspect();
            else {
              props.bridge.current.destination = { ...APPROACH };
              props.bridge.current.manual = false;
              props.bridge.current.wake?.();
            }
          }}
        />
        <Controller bridge={props.bridge} onMove={props.onMove} onBlocked={props.onBlocked} />
      </Canvas>
    </SceneBoundary>
  );
}
