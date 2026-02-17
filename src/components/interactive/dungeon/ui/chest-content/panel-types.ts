import type { ChestPOI } from '@/constants/dungeonLayout';
import type { ChestContentDefinition } from '@/components/interactive/dungeon/ui/chest-content/registry';
import type { DungeonUiThemePalette } from '@/components/interactive/dungeon/ui/useDungeonUiTheme';

export type ChestPanelTemplateProps = {
  chest: ChestPOI;
  definition: ChestContentDefinition;
  theme: DungeonUiThemePalette;
};
