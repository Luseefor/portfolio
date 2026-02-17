import { activity, contact, resume, socials, stack } from './portfolio-content/metaSections';
import { about, education, experience, hero, projects, services } from './portfolio-content/profileSections';
import type { ServiceIconKey, SocialLink } from './portfolio-content/types';

export type { ServiceIconKey, SocialLink };

export const PORTFOLIO_CONTENT = {
  hero,
  about,
  education,
  experience,
  projects,
  services,
  stack,
  activity,
  resume,
  contact,
  socials,
};
