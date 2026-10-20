'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  Float32BufferAttribute,
  InstancedMesh,
  Object3D,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  CELL_SIZE,
  LANDMARKS,
  pendulumAngle,
  signalHeight,
  surveyCell,
  type LandmarkId,
} from '@/lib/fieldwork/world';
import type { GameBridge } from './types';
import type { MutableRefObject } from 'react';
import type { Point } from '@/lib/fieldwork/game';

export type StudyValues = {
  length: number;
  time: number;
  descent: Point;
  harmonics: number;
  knot: number;
};
type Props = {
  bridge: MutableRefObject<GameBridge>;
  dark: boolean;
  values: StudyValues;
  onSelect: (id: LandmarkId) => void;
  onGuide: () => void;
};
type Block = [number, number, number, number, number, number];
function boxes(blocks: Block[]) {
  const parts = blocks.map(([w, h, d, x, y, z]) => new BoxGeometry(w, h, d).translate(x, y, z));
  const geometry = mergeGeometries(parts)!;
  parts.forEach((p) => p.dispose());
  return geometry;
}
function GroundLabel({
  x,
  z,
  title,
  subtitle,
  dark,
  onClick,
}: {
  x: number;
  z: number;
  title: string;
  subtitle: string;
  dark: boolean;
  onClick?: () => void;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = dark ? '#dfd8c5' : '#534b3c';
    ctx.font = '500 56px monospace';
    ctx.fillText(title, 12, 88);
    ctx.globalAlpha = 0.8;
    ctx.font = '28px monospace';
    ctx.fillText(subtitle, 12, 151);
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    return map;
  }, [title, subtitle, dark]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh
      position={[x, 0.055, z]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
    >
      <planeGeometry args={[14, 3.5]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
function GuideSign({ dark, onGuide }: Pick<Props, 'dark' | 'onGuide'>) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = dark ? '#c1ab86' : '#dcc8a4';
    ctx.fillRect(0, 0, 512, 160);
    ctx.fillStyle = '#39372e';
    ctx.textAlign = 'center';
    ctx.font = '500 58px monospace';
    ctx.fillText('FIELD GUIDE', 256, 72);
    ctx.font = '28px monospace';
    ctx.fillText('CLICK / ESC', 256, 125);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, [dark]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group
      position={[-4, 0, 16]}
      rotation={[0, 0.7, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onGuide();
      }}
    >
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.16, 2, 0.16]} />
        <meshStandardMaterial color="#8c7a5b" roughness={1} />
      </mesh>
      <mesh position={[0, 2.6, 0]} castShadow>
        <boxGeometry args={[6.5, 2.1, 0.18]} />
        <meshStandardMaterial color="#c9b38e" roughness={1} />
      </mesh>
      <mesh position={[0, 2.6, 0.1]}>
        <planeGeometry args={[6.5, 2.03]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}
function SurveyScenery({ bridge, dark }: Pick<Props, 'bridge' | 'dark'>) {
  const trees = useRef<InstancedMesh>(null),
    trunks = useRef<InstancedMesh>(null),
    rocks = useRef<InstancedMesh>(null),
    arches = useRef<InstancedMesh>(null),
    roads = useRef<InstancedMesh>(null);
  const cell = useRef('');
  const geometries = useMemo(
    () => ({
      road: boxes([
        [64, 0.018, 3, 32, 0.009, 9],
        [3, 0.018, 64, 0, 0.009, 32],
      ]),
      arch: boxes([
        [0.5, 5, 0.5, -2.2, 2.5, 0],
        [0.5, 5, 0.5, 2.2, 2.5, 0],
        [4.9, 0.6, 0.5, 0, 5, 0],
      ]),
      crown: new CylinderGeometry(1.7, 2.1, 2.8, 7).translate(0, 3.7, 0),
      trunk: new CylinderGeometry(0.22, 0.32, 3.2, 7).translate(0, 1.6, 0),
    }),
    [],
  );
  useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries]);
  useFrame(() => {
    const cx = Math.floor(bridge.current.position.x / CELL_SIZE),
      cz = Math.floor(bridge.current.position.z / CELL_SIZE),
      key = `${cx}:${cz}`;
    if (
      cell.current === key ||
      !trees.current ||
      !trunks.current ||
      !rocks.current ||
      !arches.current ||
      !roads.current
    )
      return;
    cell.current = key;
    const counts = { tree: 0, rock: 0, arch: 0 };
    const matrix = new Object3D();
    let roadIndex = 0;
    for (let x = cx - 3; x <= cx + 3; x++)
      for (let z = cz - 3; z <= cz + 3; z++) {
        matrix.position.set(x * CELL_SIZE, 0, z * CELL_SIZE);
        matrix.updateMatrix();
        roads.current.setMatrixAt(roadIndex++, matrix.matrix);
      }
    roads.current.instanceMatrix.needsUpdate = true;
    roads.current.computeBoundingSphere();
    const object = new Object3D();
    for (let x = cx - 3; x <= cx + 3; x++)
      for (let z = cz - 3; z <= cz + 3; z++)
        for (const p of surveyCell(x, z)) {
          object.position.set(p.x, p.kind === 'rock' ? 0.4 : 0, p.z);
          object.rotation.set(0, p.turn, p.kind === 'rock' ? 0.25 : 0);
          object.scale.setScalar(p.scale);
          object.updateMatrix();
          if (p.kind === 'tree') {
            trees.current.setMatrixAt(counts.tree, object.matrix);
            trunks.current.setMatrixAt(counts.tree++, object.matrix);
          } else if (p.kind === 'rock') rocks.current.setMatrixAt(counts.rock++, object.matrix);
          else arches.current.setMatrixAt(counts.arch++, object.matrix);
        }
    for (const [mesh, count] of [
      [trees.current, counts.tree],
      [trunks.current, counts.tree],
      [rocks.current, counts.rock],
      [arches.current, counts.arch],
    ] as const) {
      mesh.count = count;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  });
  return (
    <group>
      <instancedMesh ref={roads} args={[geometries.road, undefined, 49]} receiveShadow>
        <meshStandardMaterial color={dark ? '#272724' : '#e1d6bf'} roughness={1} />
      </instancedMesh>
      <instancedMesh ref={trees} args={[geometries.crown, undefined, 294]} castShadow>
        <meshStandardMaterial color={dark ? '#525b49' : '#929a70'} roughness={1} flatShading />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[geometries.trunk, undefined, 294]} castShadow>
        <meshStandardMaterial color="#83725a" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={rocks} args={[undefined, undefined, 98]} castShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={dark ? '#62605a' : '#c7b99d'} roughness={1} />
      </instancedMesh>
      <instancedMesh ref={arches} args={[geometries.arch, undefined, 49]} castShadow>
        <meshStandardMaterial color={dark ? '#827b6a' : '#c6b694'} roughness={1} />
      </instancedMesh>
    </group>
  );
}
function Campus({ dark }: { dark: boolean }) {
  const geometry = useMemo(() => {
    const paving: Block[] = [
      [6, 0.025, 86, 0, 0.012, -5],
      [72, 0.025, 5, 0, 0.012, 9],
      [5, 0.025, 26, -27, 0.012, 22],
      [28, 0.025, 4, -17, 0.012, -19],
    ];
    const stone: Block[] = [
      [14, 0.3, 10, 26, 0.15, -5],
      [14, 0.3, 14, -27, 0.15, 26],
      [20, 0.22, 8, 5, 0.11, -34],
      [12, 0.3, 12, -31, 0.15, -27],
    ];
    const rust: Block[] = [],
      green: Block[] = [],
      wood: Block[] = [];
    // Low planters, benches and survey pegs define spaces without enclosing the ground.
    for (const [x, z] of [
      [-19, 8],
      [16, 17],
      [15, -22],
      [-40, 8],
      [-20, -23],
      [36, -16],
      [-16, 35],
    ]) {
      stone.push([3.2, 0.55, 2, x, 0.275, z]);
      green.push([2.8, 0.65, 1.6, x, 0.65, z]);
      rust.push([0.12, 2.4, 0.12, x + 2, 1.2, z]);
    }
    for (const [x, z] of [
      [16, 15],
      [-16, 25],
      [-21, -18],
      [17, -26],
    ]) {
      stone.push([3, 0.6, 0.7, x, 0.3, z]);
      wood.push([3.2, 0.2, 1, x, 0.7, z]);
    }
    for (let i = -4; i <= 4; i++) {
      rust.push([0.12, 0.035, 0.7, 3, 0.04, 9 + i * 7]);
      if (i !== 0) rust.push([0.7, 0.035, 0.12, i * 8, 0.04, 6]);
    }
    // Pendulum frame, signal instrument base and knot plinth.
    stone.push(
      [0.55, 7, 0.55, 20, 3.5, -5],
      [0.55, 7, 0.55, 32, 3.5, -5],
      [12.55, 0.55, 0.55, 26, 7, -5],
      [7, 0.5, 2, 5, 0.45, -34],
      [4, 1.3, 4, -31, 0.95, -27],
    );
    return [boxes(paving), boxes(stone), boxes(rust), boxes(green), boxes(wood)];
  }, []);
  useEffect(() => () => geometry.forEach((g) => g.dispose()), [geometry]);
  return (
    <group>
      {geometry.map((g, i) => (
        <mesh key={i} geometry={g} castShadow={i !== 0} receiveShadow>
          <meshStandardMaterial
            color={
              [
                dark ? '#272724' : '#e1d6bf',
                dark ? '#686357' : '#c9bea6',
                '#b66b43',
                dark ? '#66704f' : '#87936a',
                '#af8158',
              ][i]
            }
            roughness={1}
          />
        </mesh>
      ))}
      {[
        [0, 9, 12],
        [26, -5, 8],
        [-27, 26, 9],
        [5, -34, 11],
        [-31, -27, 8],
      ].map(([x, z, r], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.035, z]}>
          <ringGeometry args={[r - 0.06, r, 64]} />
          <meshBasicMaterial color={dark ? '#776d57' : '#b4a487'} transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}
export default function WorldScenery({ bridge, dark, values, onSelect, onGuide }: Props) {
  const dish = useMemo(() => {
    const surface = new PlaneGeometry(10, 10, 24, 24);
    surface.rotateX(-Math.PI / 2);
    const vertices = surface.attributes.position;
    for (let i = 0; i < vertices.count; i++)
      vertices.setY(i, 0.3 + 0.055 * (vertices.getX(i) ** 2 + vertices.getZ(i) ** 2));
    surface.computeVertexNormals();
    return surface;
  }, []);
  const contour = useMemo(() => {
    const points: number[] = [];
    for (const r of [1, 2, 3, 4, 5])
      for (let i = 0; i < 96; i++) {
        for (const a of [i, i + 1]) {
          const angle = (a * Math.PI) / 48;
          points.push(-27 + Math.cos(angle) * r, 0.315 + 0.055 * r * r, 26 + Math.sin(angle) * r);
        }
      }
    return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(points, 3));
  }, []);
  useEffect(
    () => () => {
      dish.dispose();
      contour.dispose();
    },
    [dish, contour],
  );
  const signals = useMemo(() => {
    const parts: [Block[], Block[]] = [[], []];
    for (let i = 0; i < 25; i++) {
      const h = 2.4 + signalHeight((i / 24) * Math.PI * 2, values.harmonics) * 1.8;
      parts[i % 2].push([0.38, h, 0.65, -8 + (i * 2) / 3, h / 2, 0]);
    }
    return parts.map(boxes);
  }, [values.harmonics]);
  useEffect(() => () => signals.forEach((g) => g.dispose()), [signals]);
  const knotValues = [
    [2, 3],
    [2, 5],
    [3, 4],
  ][values.knot];
  return (
    <group>
      <Campus dark={dark} />
      <GuideSign dark={dark} onGuide={onGuide} />
      <SurveyScenery bridge={bridge} dark={dark} />
      {LANDMARKS.map((l) => (
        <GroundLabel
          key={l.id}
          x={l.x}
          z={l.approach.z + 3}
          title={`${l.number} / ${l.name.toUpperCase()}`}
          subtitle="CLICK TO APPROACH   /   E TO EXPLORE"
          dark={dark}
          onClick={() => onSelect(l.id)}
        />
      ))}
      <GroundLabel
        x={5}
        z={18}
        title="FIELDWORK / RESEARCH GROUNDS"
        subtitle="WASD / DRIVE    DRAG / ORBIT    ESC / FIELD GUIDE"
        dark={dark}
        onClick={onGuide}
      />
      <group
        position={[26, 6.7, -5]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect('motion');
        }}
      >
        {[2, values.length, 4.8].map((length, i) => (
          <group
            key={i}
            position={[(i - 1) * 3.6, 0, 0]}
            rotation={[0, 0, pendulumAngle(length, values.time)]}
          >
            <mesh position={[0, -length / 2, 0]} castShadow>
              <cylinderGeometry args={[0.035, 0.035, length, 8]} />
              <meshStandardMaterial color="#4c4940" />
            </mesh>
            <mesh position={[0, -length, 0]} castShadow>
              <sphereGeometry args={[0.65, 16, 12]} />
              <meshStandardMaterial color={i === 1 ? '#ba6e44' : '#b5a07d'} roughness={0.65} />
            </mesh>
          </group>
        ))}
      </group>
      <mesh
        geometry={dish}
        position={[-27, 0, 26]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect('optimization');
        }}
      >
        <meshStandardMaterial color={dark ? '#64745b' : '#a4b38a'} roughness={1} side={2} />
      </mesh>
      <lineSegments geometry={contour} raycast={() => {}}>
        <lineBasicMaterial color={dark ? '#adba9b' : '#63794f'} transparent opacity={0.65} />
      </lineSegments>
      <mesh
        position={[
          -27 + values.descent.x,
          0.65 + 0.055 * (values.descent.x ** 2 + values.descent.z ** 2),
          26 + values.descent.z,
        ]}
        castShadow
      >
        <sphereGeometry args={[0.4, 16, 12]} />
        <meshStandardMaterial color="#b66b43" roughness={0.7} />
      </mesh>
      <group
        position={[5, 0.5, -34]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect('signal');
        }}
      >
        {signals.map((geometry, i) => (
          <mesh key={i} geometry={geometry} castShadow>
            <meshStandardMaterial color={i ? '#b87a50' : '#6d9199'} roughness={0.85} />
          </mesh>
        ))}
      </group>
      <mesh
        position={[-31, 5, -27]}
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect('topology');
        }}
      >
        <torusKnotGeometry args={[2.4, 0.3, 96, 8, knotValues[0], knotValues[1]]} />
        <meshStandardMaterial color="#bd794d" roughness={0.65} />
      </mesh>
    </group>
  );
}
