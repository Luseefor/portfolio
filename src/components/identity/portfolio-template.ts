export const PORTFOLIO_CONTENT = {
  // Basic Identity
  hero: {
    greeting: 'Hello, I am',
    title: 'Rijan Ghimire',
    subtitle: 'Engineer & Mathematician',
    tagline:
      'Architecting intelligent digital ecosystems where engineering precision meets artistic vision.',
    status: 'Available',
  },

  // About Section
  about: {
    title: '01 // ABOUT',
    description:
      'A multidisciplinary engineer focused on high-performance compute and applied AI. I build systems that bridge hardware constraints with software intelligence, delivering optimized solutions for complex problems.',
    stats: [
      { label: 'GPA', value: '4.0' },
      { label: 'Projects', value: '10+' },
      { label: 'Domain', value: 'AI / HW' },
    ],
  },

  // Experience
  experience: {
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
  },

  // Projects
  projects: {
    title: '03 // WORKS',
    categories: [
      {
        name: 'Full Stack',
        items: [
          {
            title: 'Liberty Jewelers',
            desc: 'Enterprise e-commerce with custom CMS.',
            stack: ['Next.js', 'PostgreSQL', 'Stripe'],
          },
          {
            title: 'PayBit',
            desc: 'Decentralized payment protocol.',
            stack: ['Python', 'FastAPI', 'Blockchain'],
          },
        ],
      },
      {
        name: 'R&D',
        items: [
          {
            title: 'ClassNotes AI',
            desc: 'Automated lecture intelligence pipeline.',
            stack: ['Python', 'NLP', 'Whisper'],
          },
          {
            title: 'Figuro',
            desc: 'Generative voice-to-animation engine.',
            stack: ['TensorFlow', 'React', 'WebGL'],
          },
          {
            title: 'IdleOps',
            desc: 'Low-latency automation framework.',
            stack: ['C++', 'Python', 'Win32'],
          },
        ],
      },
    ],
  },

  // Tech Stack
  stack: {
    title: '04 // STACK',
    technologies: ['C++', 'Python', 'Rust', 'Next.js', 'React', 'PyTorch', 'CUDA', 'IoT'],
  },

  // Contact
  contact: {
    title: '05 // CONTACT',
    email: 'ghimirerijan199@gmail.com',
    github: 'github.com/Luseefor',
    twitter: '@Luseefor',
    cta: "Let's build the future.",
  },
};
