import { CuboidCollider, RigidBody } from '@react-three/rapier';

type FloorCollider = {
  id: string;
  size: [number, number, number];
  position: [number, number, number];
};

type PropCollider = {
  id: string;
  args: [number, number, number];
  position: [number, number, number];
};

type Props = {
  floorColliders: FloorCollider[];
  borderColliders: FloorCollider[];
  torchColliders: PropCollider[];
  ambientColliders: PropCollider[];
  potColliders: PropCollider[];
};

export default function DungeonColliderLayer({
  floorColliders,
  borderColliders,
  torchColliders,
  ambientColliders,
  potColliders,
}: Props) {
  return (
    <RigidBody type="fixed" colliders={false} name="dungeon-world-colliders">
      {floorColliders.map((collider) => (
        <CuboidCollider key={collider.id} args={[collider.size[0] / 2, collider.size[1] / 2, collider.size[2] / 2]} position={collider.position} />
      ))}
      {borderColliders.map((collider) => (
        <CuboidCollider key={collider.id} args={[collider.size[0] / 2, collider.size[1] / 2, collider.size[2] / 2]} position={collider.position} />
      ))}
      {torchColliders.map((collider) => (
        <CuboidCollider key={collider.id} args={collider.args} position={collider.position} />
      ))}
      {ambientColliders.map((collider) => (
        <CuboidCollider key={collider.id} args={collider.args} position={collider.position} />
      ))}
      {potColliders.map((collider) => (
        <CuboidCollider key={collider.id} args={collider.args} position={collider.position} />
      ))}
      <CuboidCollider args={[220, 0.2, 220]} position={[0, -0.3, 0]} />
    </RigidBody>
  );
}
