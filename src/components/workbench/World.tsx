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
import { CanvasTexture, DoubleSide, Group, PlaneGeometry, SRGBColorSpace, Vector3 } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { heightAt, LABELS, type Surface } from '@/lib/workbench/model';

export type WorldProps = {
  objects: Surface[];
  selected: string;
  onSelect: (id: string) => void;
  dark: boolean;
  playing: boolean;
  reset: number;
  focus: { x: number; z: number; token: number } | null;
  keys: MutableRefObject<Set<string>>;
  onProbe: (x: number, z: number) => void;
};

function CameraAndProbe({
  keys,
  reset,
  dark,
  focus,
  onProbe,
}: Pick<WorldProps, 'keys' | 'reset' | 'focus' | 'dark' | 'onProbe'>) {
  const { camera, gl, invalidate, size } = useThree();
  const narrow = size.width < 500;
  const probe = useRef<Group>(null);
  const position = useRef(new Vector3(0, 0, 11));
  const controlsRef = useRef<OrbitControls | null>(null);
  const lastReport = useRef(0);
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 7;
    controls.maxDistance = 85;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.target.set(0, 1, 0);
    const update = () => invalidate();
    controls.addEventListener('change', update);
    return () => {
      controls.removeEventListener('change', update);
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl, invalidate]);
  useEffect(() => {
    position.current.set(0, 0, 11);
    camera.position.set(narrow ? 30 : 22, narrow ? 34 : 23, narrow ? 38 : 29);
    controlsRef.current?.target.set(0, 2, -3);
    controlsRef.current?.update();
    invalidate();
  }, [reset, camera, invalidate, narrow]);
  useEffect(() => {
    if (!focus) return;
    camera.position.set(focus.x + 13, 16, focus.z + 19);
    controlsRef.current?.target.set(focus.x, 4, focus.z);
    controlsRef.current?.update();
    invalidate();
  }, [focus, camera, invalidate]);
  useFrame(({ clock }, delta) => {
    const k = keys.current;
    const forward =
      Number(k.has('KeyW') || k.has('ArrowUp')) - Number(k.has('KeyS') || k.has('ArrowDown'));
    const right =
      Number(k.has('KeyD') || k.has('ArrowRight')) - Number(k.has('KeyA') || k.has('ArrowLeft'));
    if (forward || right) {
      const direction = camera.getWorldDirection(new Vector3());
      direction.y = 0;
      direction.normalize();
      const lateral = new Vector3().crossVectors(direction, camera.up).normalize();
      const move = direction
        .multiplyScalar(forward)
        .add(lateral.multiplyScalar(right))
        .normalize()
        .multiplyScalar(Math.min(delta, 0.05) * 9);
      const beforeX = position.current.x;
      const beforeZ = position.current.z;
      position.current.add(move);
      position.current.x = Math.max(-38, Math.min(38, position.current.x));
      position.current.z = Math.max(-38, Math.min(38, position.current.z));
      move.set(position.current.x - beforeX, 0, position.current.z - beforeZ);
      controlsRef.current?.target.add(move);
      camera.position.add(move);
      if (clock.elapsedTime - lastReport.current > 0.12) {
        onProbe(position.current.x, position.current.z);
        lastReport.current = clock.elapsedTime;
      }
      if (probe.current) probe.current.rotation.y = Math.atan2(move.x, move.z);
    }
    controlsRef.current?.update();
    if (probe.current) probe.current.position.set(position.current.x, 0.55, position.current.z);
  });
  return (
    <group ref={probe}>
      <mesh castShadow>
        <boxGeometry args={[0.65, 0.32, 0.8]} />
        <meshStandardMaterial color={dark ? '#e4e3dc' : '#303735'} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.3, 0.06]}>
        <sphereGeometry args={[0.23, 16, 12]} />
        <meshStandardMaterial color="#5f98aa" metalness={0.3} roughness={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <ringGeometry args={[0.5, 0.57, 32]} />
        <meshBasicMaterial color={dark ? '#a2c2cb' : '#708c91'} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function Label({ text, dark, height }: { text: string; dark: boolean; height: number }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 96;
    const context = canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, 768, 96);
      context.fillStyle = dark ? '#d6d8d3' : '#333c36';
      context.font = '48px monospace';
      context.textAlign = 'center';
      context.fillText(text, 384, 60);
    }
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, [text, dark]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={[0, height, 0]} scale={[14, 1.75, 1]}>
      <spriteMaterial map={texture} transparent depthTest={false} />
    </sprite>
  );
}

function SurfaceObject({
  surface,
  selected,
  dark,
  playing,
  onSelect,
}: {
  surface: Surface;
  selected: boolean;
  dark: boolean;
  playing: boolean;
  onSelect: () => void;
}) {
  const phase = useRef(0);
  const geometry = useMemo(() => {
    const mesh = new PlaneGeometry(6, 6, 32, 32);
    mesh.rotateX(-Math.PI / 2);
    const positions = mesh.attributes.position;
    for (let i = 0; i < positions.count; i++)
      positions.setY(
        i,
        heightAt(
          surface.kind,
          positions.getX(i),
          positions.getZ(i),
          surface.amplitude,
          surface.frequency,
          0,
        ),
      );
    mesh.computeVertexNormals();
    return mesh;
  }, [surface.kind, surface.amplitude, surface.frequency]);
  useEffect(() => {
    phase.current = 0;
    return () => geometry.dispose();
  }, [geometry]);
  useFrame((_, delta) => {
    if (!playing || surface.kind !== 'wave') return;
    phase.current += Math.min(delta, 0.05) * 0.7;
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++)
      positions.setY(
        i,
        heightAt(
          'wave',
          positions.getX(i),
          positions.getZ(i),
          surface.amplitude,
          surface.frequency,
          phase.current,
        ),
      );
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  });
  const color =
    surface.kind === 'wave' ? '#7196a1' : surface.kind === 'gaussian' ? '#b4a281' : '#bd8d78';
  return (
    <group position={[surface.x, 0, surface.z]}>
      <mesh receiveShadow position={[0, -0.14, 0]}>
        <boxGeometry args={[8, 0.25, 8]} />
        <meshStandardMaterial color={dark ? '#1a1a1a' : '#deded2'} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[4.1, selected ? 4.18 : 4.13, 64]} />
        <meshBasicMaterial
          color={selected ? (dark ? '#d9e5dc' : '#354c43') : dark ? '#494949' : '#b1b6a8'}
        />
      </mesh>
      <mesh
        geometry={geometry}
        position={[0, 4.2, 0]}
        castShadow
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
      >
        <meshStandardMaterial color={color} roughness={0.47} metalness={0.12} side={DoubleSide} />
      </mesh>
      <mesh geometry={geometry} position={[0, 4.208, 0]} raycast={() => {}}>
        <meshBasicMaterial
          color={dark ? '#e1eee7' : '#344f51'}
          wireframe
          transparent
          opacity={selected ? 0.21 : 0.09}
        />
      </mesh>
      <Label
        text={`${surface.id.split('-').at(-1)?.toUpperCase()} / ${LABELS[surface.kind]}`}
        dark={dark}
        height={
          5.7 +
          surface.amplitude *
            (surface.kind === 'gaussian' ? 2 : surface.kind === 'saddle' ? 1.5 : 1)
        }
      />
    </group>
  );
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div role="status" style={{ padding: 32 }}>
        The 3D view is unavailable. Object controls, experiments, and exports still work in the
        inspector.
      </div>
    ) : (
      this.props.children
    );
  }
}

export default function World(props: WorldProps) {
  return (
    <SceneBoundary>
      <Canvas
        aria-label="Three-dimensional mathematical field. Use the object list and inspector for keyboard access."
        role="img"
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [25, 25, 32], fov: 44, near: 0.1, far: 220 }}
        gl={{ antialias: true }}
        fallback={
          <p>The 3D view needs WebGL. Use the object inspector and experiment results below.</p>
        }
      >
        <color attach="background" args={[props.dark ? '#080808' : '#e8e9df']} />
        <fog attach="fog" args={[props.dark ? '#080808' : '#e8e9df', 65, 135]} />
        <ambientLight intensity={props.dark ? 1.1 : 1.8} />
        <hemisphereLight args={['#eeeeee', props.dark ? '#808080' : '#859080', 1.4]} />
        <directionalLight
          position={[15, 28, 12]}
          intensity={props.dark ? 2 : 2.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-35}
          shadow-camera-right={35}
          shadow-camera-top={35}
          shadow-camera-bottom={-35}
          shadow-bias={-0.0005}
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.3, 0]}>
          <planeGeometry args={[240, 240]} />
          <meshStandardMaterial color={props.dark ? '#101010' : '#e5e6da'} roughness={1} />
        </mesh>
        <gridHelper
          args={[160, 80, props.dark ? '#393939' : '#a9b2a2', props.dark ? '#242424' : '#c7cebe']}
          position={[0, -0.28, 0]}
        />
        <CameraAndProbe
          keys={props.keys}
          reset={props.reset}
          focus={props.focus}
          dark={props.dark}
          onProbe={props.onProbe}
        />
        {props.objects.map((surface) => (
          <SurfaceObject
            key={surface.id}
            surface={surface}
            selected={props.selected === surface.id}
            dark={props.dark}
            playing={props.playing}
            onSelect={() => props.onSelect(surface.id)}
          />
        ))}
      </Canvas>
    </SceneBoundary>
  );
}
