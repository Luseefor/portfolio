import type { SocialLink } from './types';

export const stack = {
  title: '06 // STACK',
  technologies: ['C++', 'Python', 'Rust', 'Next.js', 'React', 'PyTorch', 'CUDA', 'IoT'],
};

export const activity = {
  title: '07 // ENGINEERING ACTIVITY',
  focusAreas: ['Commits', 'Active days', 'Repo velocity', 'Public code signals'],
};

export const resume = {
  title: '08 // RESUME',
  summary: 'Open the latest resume packet for role-ready details and project highlights.',
  url: '/My Resume - Main.pdf',
  bullets: [
    'Systems engineering and full-stack delivery highlights.',
    'Architecture, reliability, and measurable impact outcomes.',
    'Current role timeline and technical execution scope.',
  ],
};

export const contact = {
  title: '09 // CONTACT',
  email: 'ghimirerijan199@gmail.com',
  github: 'https://github.com/Luseefor',
  linkedin: 'https://www.linkedin.com/in/rijan-ghimire-37ba4a2b0/',
  cta: "Let's build the future.",
};

export const socials = {
  title: '10 // SOCIALS',
  links: [
    { label: 'GitHub', url: 'https://github.com/Luseefor', kind: 'github' as const },
    {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/rijan-ghimire-37ba4a2b0/',
      kind: 'linkedin' as const,
    },
    {
      label: 'Email',
      url: 'mailto:ghimirerijan199@gmail.com',
      kind: 'email' as const,
    },
  ] as SocialLink[],
};
