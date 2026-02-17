import { AdditiveBlending, DoubleSide, SpotLight as SpotLightImpl } from 'three';
import { TORCH_LIGHT_DECAY, TORCH_WALL_FILL_BACK_OFFSET, TORCH_WALL_FILL_HEIGHT, TORCH_WALL_GLOW_SIZE } from '../constants';
import type { TorchVisual } from '../types';

type Props = {
  torchVisuals: TorchVisual[];
  torchLightRefs: React.MutableRefObject<Record<string, SpotLightImpl | null>>;
  wallFillPointLightEnabled: boolean;
};

export default function DungeonTorchLayer({
  torchVisuals,
  torchLightRefs,
  wallFillPointLightEnabled,
}: Props) {
  return (
    <>
      {torchVisuals.map((torch) => (
        <group key={torch.id} position={torch.position} rotation={[0, torch.rotationY, 0]}>
          <primitive object={torch.lightTarget} />
          {torch.object ? (
            <primitive object={torch.object} />
          ) : (
            <group>
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.1, 0.14, 1.2, 12]} />
                <meshStandardMaterial color="#474d4b" roughness={0.9} metalness={0.1} />
              </mesh>
              <mesh position={[0, 1.08, 0.08]}>
                <sphereGeometry args={[0.14, 10, 10]} />
                <meshStandardMaterial color="#ff9a4f" emissive="#ff7f2b" emissiveIntensity={1.3} />
              </mesh>
            </group>
          )}
          <spotLight
            ref={(light) => {
              torchLightRefs.current[torch.id] = light;
            }}
            target={torch.lightTarget}
            position={[0, 0.08, 0.2]}
            intensity={torch.baseIntensity}
            color={torch.glowColor}
            distance={torch.distance}
            angle={0.45}
            penumbra={0.62}
            decay={TORCH_LIGHT_DECAY}
            castShadow={false}
          />
          <mesh position={[0, TORCH_WALL_FILL_HEIGHT, TORCH_WALL_FILL_BACK_OFFSET]} rotation={[0, Math.PI, 0]} renderOrder={2}>
            <planeGeometry args={[TORCH_WALL_GLOW_SIZE, TORCH_WALL_GLOW_SIZE]} />
            <meshBasicMaterial color={torch.glowColor} transparent opacity={torch.wallGlowOpacity} depthWrite={false} side={DoubleSide} blending={AdditiveBlending} />
          </mesh>
          {wallFillPointLightEnabled && (
            <pointLight
              position={[0, TORCH_WALL_FILL_HEIGHT, TORCH_WALL_FILL_BACK_OFFSET]}
              intensity={torch.wallFillIntensity}
              color={torch.glowColor}
              distance={3.4}
              decay={2}
              castShadow={false}
            />
          )}
        </group>
      ))}
    </>
  );
}
