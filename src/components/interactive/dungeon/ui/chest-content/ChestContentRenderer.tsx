'use client';

import type { ChestPanelTemplateProps } from '@/components/interactive/dungeon/ui/chest-content/panel-types';
import AboutPanel from '@/components/interactive/dungeon/ui/chest-content/AboutPanel';
import ExperiencePanel from '@/components/interactive/dungeon/ui/chest-content/ExperiencePanel';
import EducationPanel from '@/components/interactive/dungeon/ui/chest-content/EducationPanel';
import ProjectsPanel from '@/components/interactive/dungeon/ui/chest-content/ProjectsPanel';
import SkillsPanel from '@/components/interactive/dungeon/ui/chest-content/SkillsPanel';
import ServicesPanel from '@/components/interactive/dungeon/ui/chest-content/ServicesPanel';
import ActivityPanel from '@/components/interactive/dungeon/ui/chest-content/ActivityPanel';
import ResumePanel from '@/components/interactive/dungeon/ui/chest-content/ResumePanel';
import ContactPanel from '@/components/interactive/dungeon/ui/chest-content/ContactPanel';
import SocialsPanel from '@/components/interactive/dungeon/ui/chest-content/SocialsPanel';
import FallbackPanel from '@/components/interactive/dungeon/ui/chest-content/FallbackPanel';

export default function ChestContentRenderer(props: ChestPanelTemplateProps) {
  const { definition } = props;

  switch (definition.kind) {
    case 'about':
      return <AboutPanel {...props} />;
    case 'experience':
      return <ExperiencePanel {...props} />;
    case 'education':
      return <EducationPanel {...props} />;
    case 'projects':
      return <ProjectsPanel {...props} />;
    case 'skills':
      return <SkillsPanel {...props} />;
    case 'services':
      return <ServicesPanel {...props} />;
    case 'activity':
      return <ActivityPanel {...props} />;
    case 'resume':
      return <ResumePanel {...props} />;
    case 'contact':
      return <ContactPanel {...props} />;
    case 'socials':
      return <SocialsPanel {...props} />;
    default:
      return <FallbackPanel {...props} />;
  }
}
