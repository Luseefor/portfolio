export type PortfolioProject = {
  title: string;
  category: string;
  summary: string;
  ownership: string;
  result: string;
  stack: string[];
  demoHref?: string;
  codeHref?: string;
  demoComingSoon?: boolean;
  hideRepository?: boolean;
};

export type ServiceIconKey = 'globe' | 'cpu' | 'server';

export type SocialLink = {
  label: string;
  url: string;
  kind: 'github' | 'linkedin' | 'email';
};

export type ExperienceEntry = {
  role: string;
  company: string;
  period: string;
  bullets: string[];
};

export type SkillGroup = {
  label: string;
  items: string[];
};

export type EducationEntry = {
  institution: string;
  degree: string;
  period: string;
  notes: string;
};

export type ServiceEntry = {
  id: string;
  title: string;
  desc: string;
  icon: ServiceIconKey;
};

export type ActivityMetric = {
  label: string;
  value: string;
};

export type ActivityEvent = {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
};

export type TimelineEntry = {
  period: string;
  title: string;
  organization: string;
  summary: string;
  proof?: string;
};

export const portfolioData = {
  hero: {
    name: 'Rijan Ghimire',
    headline: 'Software engineer building performant web, AI, and systems-driven products.',
    summary:
      'I work across frontend systems, backend logic, and interactive demos with an emphasis on clear user experience and dependable implementation.',
    status: 'Open to internships and early-career software engineering roles',
    roleLabel: 'Software Engineer',
    quote: 'Choose tools for the problem. Design for reliability. Execute with discipline.',
  },
  about: {
    title: 'Engineering Approach',
    description:
      'I build product-grade web experiences, backend systems, and interactive demos with an emphasis on clarity, performance, and maintainability.',
    body: [
      'I start from constraints first: interface clarity, runtime behavior, ownership boundaries, and the cost of making future changes. The stack follows those constraints, not the other way around.',
      'The strongest pattern across my work is end-to-end execution. I am comfortable moving from UX decisions and frontend architecture to backend workflows, integration details, and operational reliability.',
      'I do my best work where product engineering, applied AI, and systems thinking overlap. I choose tools based on tradeoffs, then optimize for correctness, maintainability, and a clean user experience.',
    ],
    stats: [
      { label: 'Focus', value: 'Web + AI' },
      { label: 'Approach', value: 'Product' },
      { label: 'Style', value: 'Systems' },
    ],
  },
  credibility: [
    'Full-stack delivery across product, AI, and systems projects',
    'Comfortable moving from interface polish to backend architecture',
    'Built production-facing work and experimental technical demos',
  ],
  projects: [
    {
      title: 'Synthex UI',
      category: 'Design System / Component Library',
      summary:
        'Built a polished UI system and preview environment with theming, component docs, dashboard demos, and a live playground for evaluating patterns in one place.',
      ownership:
        'Owned the component library architecture, preview shell, theme customization model, documentation structure, and the experience of turning a design system into something people can actually explore.',
      result:
        'Produced a usable design-system showcase that demonstrates component quality, theming control, and product-level frontend engineering beyond isolated component demos.',
      stack: ['React', 'TypeScript', 'Design Systems', 'Theming'],
      demoHref: 'https://synthex-ui.rijan.sh',
      codeHref: 'https://github.com/Luseefor/synthex-ui',
    },
    {
      title: 'Aletiq',
      category: 'Founder-led Product Build',
      summary:
        'Building Aletiq collectively as a founder and engineer, with product direction and technical execution moving together instead of being split across separate roles.',
      ownership:
        'Own product and engineering work across interface decisions, system implementation, and the technical direction needed to move an early product forward.',
      result:
        'Turned a founder-led concept into an active build with real product shape, technical momentum, and a clearer execution path.',
      stack: ['Product Engineering', 'Systems Design', 'Frontend', 'Backend'],
      demoComingSoon: true,
      hideRepository: true,
    },
    {
      title: 'Liberty Jewelers',
      category: 'Production E-commerce',
      summary:
        'Built a custom storefront and internal CMS that gave a live jewelry business a cleaner buying flow and a simpler way to manage products and content.',
      ownership:
        'Owned the customer-facing Next.js experience, CMS tooling, Stripe integration, and the system wiring between storefront actions and internal updates.',
      result:
        'Delivered a production-ready commerce stack that supported merchandising, checkout, and day-to-day content changes without relying on a generic template.',
      stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe'],
      demoHref: 'https://www.libertygoldanddiamonds.com/',
      codeHref: 'https://github.com/Luseefor',
    },
    {
      title: 'Interactive Dungeon Portfolio',
      category: 'Technical Demo',
      summary:
        'Built a third-person WebGL experience that demonstrates camera systems, movement controls, collision handling, and layered UI state in the browser.',
      ownership:
        'Implemented the scene structure, player controller, interaction flow, and the stabilization work needed to hold up across reloads and input edge cases.',
      result:
        'Produced a technical showcase that feels distinctive while still proving systems thinking, rendering work, and frontend engineering under real constraints.',
      stack: ['React Three Fiber', 'Three.js', 'Rapier', 'TypeScript'],
      demoHref: '/interactive',
      hideRepository: true,
    },
    {
      title: 'MetroX',
      category: 'AI Reliability Framework',
      summary:
        'Built a data-driven reliability and safety testing framework for LLM systems and agent contracts with reproducible run snapshots, statistical diagnostics, and gated evaluation workflows.',
      ownership:
        'Owned frontend-first configuration flows, managed runtime integration, benchmark execution design, scorecard logic, and the product surface for turning reliability checks into an operational workflow.',
      result:
        'Turned AI safety and robustness evaluation into a usable framework with benchmark datasets, uncertainty-aware scoring, provider hardening, and report-generation workflows.',
      stack: ['LLM Evaluation', 'Agent Runtime', 'Statistical Diagnostics', 'shadcn/ui'],
      demoComingSoon: true,
      codeHref: 'https://github.com/arpan404/metroX',
    },
  ] as PortfolioProject[],
  featuredProject: {
    title: 'Synthex UI',
    subtitle: 'Component library, theme system, preview environment, and documentation experience in one product-grade frontend build.',
    summary:
      'Synthex UI is the best example of how I approach frontend systems work: not just building components, but building the environment around them so they can be tested, themed, documented, and evaluated like a real product.',
    body: [
      'The project combines the UI system itself with a preview shell, component documentation, dashboard examples, theme customization, and a playground route instead of treating the library as a pile of isolated examples.',
      'I focused on component consistency, theme behavior, navigation structure, and the engineering discipline needed to make the preview experience feel coherent rather than like a disconnected storybook clone.',
    ],
    status: 'Built and live',
    role: 'Frontend Systems Engineer',
    focus: 'Design System · Theme Engine · Docs + Playground',
    domains: 'Component Architecture · DX · Frontend Infrastructure',
  },
  experience: [
    {
      role: 'Founder + Engineer',
      company: 'Aletiq',
      period: '2025 - Present',
      bullets: [
        'Building Aletiq collectively while owning both product and engineering work instead of splitting strategy from implementation.',
        'Driving interface decisions, technical architecture, and early system implementation to turn a founder-led product into an active build with real momentum.',
        'Working across product direction and execution so the system evolves coherently from idea to usable software.',
      ],
    },
    {
      role: 'Lead Developer',
      company: 'Applied Engineering',
      period: '2024 - Present',
      bullets: [
        'Built hardware-integrated web systems where the interface had to stay reliable under operational constraints instead of only looking polished in a demo.',
        'Led implementation across frontend delivery, backend integration, and deployment decisions rather than staying isolated in a single layer of the stack.',
        'Worked on IoT energy tooling and security-sensitive workflows with an emphasis on correctness, maintainability, and steady delivery.',
      ],
    },
    {
      role: 'Full Stack Engineer',
      company: 'Liberty Jewelers',
      period: '2023 - 2024',
      bullets: [
        'Shipped a custom storefront and content workflow for a live commerce business rather than relying on an off-the-shelf template.',
        'Integrated payments, database-backed content management, and the tooling needed to keep product updates moving without constant developer intervention.',
        'Balanced visual polish with the practical demands of performance, maintainability, and everyday business use.',
      ],
    },
  ] satisfies ExperienceEntry[],
  timeline: [
    {
      period: '2025 - Present',
      title: 'Founder + Engineer',
      organization: 'Aletiq',
      summary:
        'Building Aletiq collectively with direct ownership of product decisions, interface quality, and technical implementation across the early product stack.',
      proof: 'founder-led execution · product direction · engineering ownership',
    },
    {
      period: '2024 - Present',
      title: 'Lead Developer',
      organization: 'Applied Engineering',
      summary:
        'Building hardware-integrated web systems, delivery workflows, and reliability-focused product infrastructure across applied engineering projects.',
      proof: 'IoT systems · security-sensitive workflows · frontend to deployment',
    },
    {
      period: '2023 - 2024',
      title: 'Full Stack Engineer',
      organization: 'Liberty Jewelers',
      summary:
        'Shipped a custom storefront, payment flow, and content tooling for a live commerce business that needed real operational usefulness.',
      proof: 'custom commerce stack · CMS workflow · production delivery',
    },
    {
      period: '2022 - Present',
      title: 'Computer Science',
      organization: 'Undergraduate Studies',
      summary:
        'Formal coursework paired with hands-on product, AI, and systems work, with most learning reinforced through building and shipping projects.',
    },
  ] as TimelineEntry[],
  education: [
    {
      institution: 'Undergraduate Computer Science Studies',
      degree: 'Computer Science',
      period: '2022 - Present',
      notes: 'Formal coursework paired with hands-on product, AI, and systems work.',
    },
    {
      institution: 'STEM Foundation',
      degree: 'Science and Mathematics Track',
      period: '2018 - 2022',
      notes: 'Built the analytical base for later software engineering and technical project work.',
    },
  ] satisfies EducationEntry[],
  skills: [
    { label: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'C++'] },
    { label: 'Frontend', items: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'Three.js'] },
    { label: 'Backend', items: ['Node.js', 'FastAPI', 'PostgreSQL', 'REST APIs'] },
    { label: 'AI / ML', items: ['NLP', 'Whisper', 'TensorFlow', 'Applied AI Prototyping'] },
    { label: 'Infra / Tools', items: ['Git', 'Docker', 'Playwright', 'Vitest', 'Vercel'] },
  ] satisfies SkillGroup[],
  services: [
    {
      id: 'product-engineering',
      title: 'Product Engineering',
      desc: 'Ship clean, performant interfaces backed by practical system decisions.',
      icon: 'globe',
    },
    {
      id: 'applied-ai',
      title: 'Applied AI Prototyping',
      desc: 'Turn early AI ideas into working software that people can actually evaluate and use.',
      icon: 'cpu',
    },
    {
      id: 'systems-delivery',
      title: 'Systems Delivery',
      desc: 'Connect frontend, backend, and deployment work into one coherent delivery path.',
      icon: 'server',
    },
  ] satisfies ServiceEntry[],
  activity: {
    metrics: [
      { label: 'Past 90 Days', value: 'Active daily' },
      { label: 'Daily Output', value: '10+ GitHub activities' },
      { label: 'Primary Mode', value: 'Shipping + iteration' },
      { label: 'Current Focus', value: 'Product, AI, and systems work' },
    ] satisfies ActivityMetric[],
    summary:
      'I value steady execution more than occasional bursts. Recent GitHub activity reflects active product work, technical iteration, and the habit of building continuously instead of in short spikes.',
    events: [
      {
        id: 'event-1',
        title: 'Commerce delivery and maintenance',
        description:
          'Shipped and iterated on production-facing storefront systems, payment flow, and content tooling for everyday operational use.',
        dateLabel: 'Recent work',
      },
      {
        id: 'event-2',
        title: 'Applied AI workflow iteration',
        description:
          'Built and refined a lecture-processing pipeline that turns recordings into structured notes and review material.',
        dateLabel: 'Active build',
      },
      {
        id: 'event-3',
        title: 'Interactive systems stabilization',
        description:
          'Built and stabilized a browser-based third-person dungeon demo covering camera, movement, collision, and UI systems.',
        dateLabel: 'Current',
      },
    ] satisfies ActivityEvent[],
  },
  contact: {
    email: 'ghimirerijan199@gmail.com',
    github: 'https://github.com/Luseefor',
    linkedin: 'https://www.linkedin.com/in/rijan-ghimire-37ba4a2b0/',
    resumeHref: '/My Resume - Main.pdf',
    note: 'Available for internships, early-career software engineering roles, and technical collaborations.',
    cta: 'Open to strong teams, internships, and interesting technical work.',
  },
  resume: {
    summary: 'Download the current resume for experience, project context, and technical scope.',
    bullets: [
      'Selected product, AI, and interactive engineering work.',
      'Experience that spans frontend delivery, backend systems, and technical demos.',
      'A concise overview of projects, roles, and tools.',
    ],
  },
  socials: [
    { label: 'GitHub', url: 'https://github.com/Luseefor', kind: 'github' },
    {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/rijan-ghimire-37ba4a2b0/',
      kind: 'linkedin',
    },
    {
      label: 'Email',
      url: 'mailto:ghimirerijan199@gmail.com',
      kind: 'email',
    },
  ] satisfies SocialLink[],
} as const;
