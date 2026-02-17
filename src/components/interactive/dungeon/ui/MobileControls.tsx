'use client';

import { useDungeonInput } from '@/lib/dungeonInput';
import { useDungeonUiTheme } from './useDungeonUiTheme';
import { MobileActionButtons } from './mobile-controls/MobileActionButtons';
import { MobileJoystick } from './mobile-controls/MobileJoystick';
import { MobileLookPad } from './mobile-controls/MobileLookPad';
import { MobileSettingsButton } from './mobile-controls/MobileSettingsButton';
import { useMobileJoystick } from './mobile-controls/useMobileJoystick';
import { useMobileLookPad } from './mobile-controls/useMobileLookPad';

interface MobileControlsProps {
  visible: boolean;
  blocked: boolean;
  canInteract: boolean;
  onInteract: () => void;
  onOpenSettings: () => void;
}

export default function MobileControls({
  visible,
  blocked,
  canInteract,
  onInteract,
  onOpenSettings,
}: MobileControlsProps) {
  const theme = useDungeonUiTheme();
  const setKeys = useDungeonInput((state) => state.setKeys);
  const setMoveAxis = useDungeonInput((state) => state.setMoveAxis);
  const addLookDelta = useDungeonInput((state) => state.addLookDelta);
  const joystick = useMobileJoystick({ visible, blocked, setKeys, setMoveAxis });
  const lookPad = useMobileLookPad({ blocked, addLookDelta });

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 select-none">
      <MobileSettingsButton theme={theme} onOpenSettings={onOpenSettings} />
      <MobileJoystick
        theme={theme}
        stickOffset={joystick.stickOffset}
        joystickRef={joystick.joystickRef}
        onPointerDown={joystick.handleJoystickPointerDown}
        onPointerMove={joystick.handleJoystickPointerMove}
        onPointerUp={joystick.handleJoystickPointerRelease}
        onPointerCancel={joystick.handleJoystickPointerRelease}
      />
      <MobileLookPad
        onPointerDown={lookPad.handleLookPointerDown}
        onPointerMove={lookPad.handleLookPointerMove}
        onPointerUp={lookPad.handleLookPointerRelease}
        onPointerCancel={lookPad.handleLookPointerRelease}
      />
      <MobileActionButtons
        theme={theme}
        blocked={blocked}
        canInteract={canInteract}
        onInteract={onInteract}
        onPulseAction={joystick.pulseAction}
      />
    </div>
  );
}
