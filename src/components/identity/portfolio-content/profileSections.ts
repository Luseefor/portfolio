import type { ServiceIconKey } from './types';

export const hero = {
  greeting: 'Hello, I am',
  title: 'Rijan Ghimire',
  subtitle: 'Engineer & Mathematician',
  tagline:
    'Architecting intelligent digital ecosystems where engineering precision meets artistic vision.',
  status: 'Available',
};

export const about = {
  title: '01 // ABOUT',
  description:
    'A multidisciplinary engineer focused on high-performance compute and applied AI. I build systems that bridge hardware constraints with software intelligence, delivering optimized solutions for complex problems.',
  stats: [
    { label: 'GPA', value: '4.0' },
    { label: 'Projects', value: '10+' },
    { label: 'Domain', value: 'AI / HW' },
  ],
  highlights: [
    'Systems that ship fast and scale cleanly.',
    'Focused on reliability, performance, and measurable outcomes.',
  ],
};

export const education = {
  title: '03 // EDUCATION',
  items: [
    {
      institution: 'Institution Placeholder',
      degree: 'B.S. in Computer Science (Update)',
      period: '2022 - Present',
      notes: 'Replace with your exact institution and degree details.',
    },
    {
      institution: 'School Placeholder',
      degree: 'Secondary Education (Update)',
      period: '2018 - 2022',
      notes: 'Replace with your exact school and track details.',
    },
  ],
};

export const experience = {
  title: '02 // EXPERIENCE',
  items: [
    {
      role: 'Lead Developer',
      company: 'Applied Engineering',
      period: '2024 - Present',
      description:
        'Architecting IoT energy solutions and secure e-voting infrastructure. Leading deployment of hardware-integrated web platforms.',
    },
    {
      role: 'Full Stack Engineer',
      company: 'Liberty Jewelers',
      period: '2023 - 2024',
      description:
        'Built the digital flagship. Managed payment infrastructure, CMS, and database architecture for high-volume transactions.',
    },
  ],
};

export const projects = {
  title: '04 // WORKS',
  categories: [
    {
      name: 'Full Stack',
      items: [
        { title: 'Liberty Jewelers', desc: 'Enterprise e-commerce with custom CMS.', stack: ['Next.js', 'PostgreSQL', 'Stripe'] },
        { title: 'PayBit', desc: 'Decentralized payment protocol.', stack: ['Python', 'FastAPI', 'Blockchain'] },
      ],
    },
    {
      name: 'R&D',
      items: [
        { title: 'ClassNotes AI', desc: 'Automated lecture intelligence pipeline.', stack: ['Python', 'NLP', 'Whisper'] },
        { title: 'Figuro', desc: 'Generative voice-to-animation engine.', stack: ['TensorFlow', 'React', 'WebGL'] },
        { title: 'IdleOps', desc: 'Low-latency automation framework.', stack: ['C++', 'Python', 'Win32'] },
      ],
    },
  ],
};

export const services = {
  title: '05 // SERVICES',
  items: [
    {
      id: 'SYS-01',
      title: 'Product + Platform',
      desc: 'I build full-stack systems that feel fast, stay reliable, and scale without drama.',
      icon: 'globe' as ServiceIconKey,
    },
    {
      id: 'SYS-02',
      title: 'Data + AI Systems',
      desc: 'RAG, evals, pipelines, and pragmatic ML that ships to production and stays measurable.',
      icon: 'cpu' as ServiceIconKey,
    },
    {
      id: 'SYS-03',
      title: 'Infrastructure + Reliability',
      desc: 'APIs, observability, performance tuning, and secure architecture that holds up in the wild.',
      icon: 'server' as ServiceIconKey,
    },
  ],
};
