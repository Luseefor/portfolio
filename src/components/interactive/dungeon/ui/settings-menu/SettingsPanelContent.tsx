'use client';

import type { Settings } from '@/lib/settings';
import type { DungeonUiThemePalette } from '../useDungeonUiTheme';
import { QualitySetting } from './QualitySetting';
import { RangeSetting } from './RangeSetting';
import { SettingsFooter } from './SettingsFooter';

type SettingsPanelContentProps = {
  localSettings: Settings;
  theme: DungeonUiThemePalette;
  onQualityChange: (quality: 'low' | 'medium' | 'high') => void;
  onVolumeChange: (value: number) => void;
  onSensitivityChange: (value: number) => void;
  onExposureChange: (value: number) => void;
};

const VOLUME_ICON = 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z';
const SENSITIVITY_ICON = 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122';
const EXPOSURE_ICON = 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z';

export function SettingsPanelContent({
  localSettings,
  theme,
  onQualityChange,
  onVolumeChange,
  onSensitivityChange,
  onExposureChange,
}: SettingsPanelContentProps) {
  return (
    <>
      <div className="space-y-5 p-6">
        <QualitySetting graphicsQuality={localSettings.graphicsQuality} onChange={onQualityChange} theme={theme} />
        <RangeSetting
          label="Master Volume"
          valueText={`${Math.round(localSettings.masterVolume * 100)}%`}
          min={0}
          max={1}
          step={0.01}
          value={localSettings.masterVolume}
          iconPath={VOLUME_ICON}
          theme={theme}
          onChange={onVolumeChange}
        />
        <RangeSetting
          label="Mouse Sensitivity"
          valueText={localSettings.mouseSensitivity.toFixed(1)}
          min={0.1}
          max={3}
          step={0.1}
          value={localSettings.mouseSensitivity}
          iconPath={SENSITIVITY_ICON}
          theme={theme}
          onChange={onSensitivityChange}
        />
        <RangeSetting
          label="Brightness"
          valueText={`${Math.round((localSettings.exposure ?? 1.0) * 100)}%`}
          min={0.5}
          max={2}
          step={0.05}
          value={localSettings.exposure ?? 1.0}
          iconPath={EXPOSURE_ICON}
          theme={theme}
          onChange={onExposureChange}
        />
      </div>
      <SettingsFooter theme={theme} />
    </>
  );
}
