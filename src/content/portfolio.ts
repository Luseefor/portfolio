export type PortfolioProject = {
  slug: string;
  status: string;
  role: string;
  focus: string;
  domains: string;
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

export type WritingPost = {
  slug: string;
  title: string;
  summary: string;
  dateLabel: string;
  href: string;
  body?: string[];
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
  seo: {
    title: 'Rijan Ghimire | Software Engineer',
    description:
      'Software engineer studying Computer Engineering and Mathematics at Southern Miss. Explore developer tools, mathematical software, web products, and engineering notes. Open to internships and early-career roles.',
    keywords: [
      'Rijan Ghimire',
      'software engineer',
      'internships',
      'TypeScript',
      'React',
      'Next.js',
      'developer tools',
      'mathematical software',
      'Synthex UI',
      'Vinculum',
    ],
  },
  location: 'Hattiesburg, Mississippi',
  selectedProjectSlugs: [
    'vinculum',
    'lumawall',
    'faredelta',
    'liberty-jewelers',
    'aletiq',
    'metrox',
  ],
  hero: {
    name: 'Rijan Ghimire',
    headline:
      'Software engineer building mathematical software, developer tools, and web products.',
    summary:
      'I study Computer Engineering and Mathematics at Southern Miss and build across frontend systems, backend services, and native apps.',
    status: 'Open to internships and early-career software engineering roles',
    roleLabel: 'Software Engineer',
    quickRead: 'Developer tools, mathematical software, and products you can inspect.',
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
    '3 public Synthex packages: UI system, layout engine, and React adapter',
    'Browser-local projects, recoverable scenes, and URL sharing in Vinculum',
    'Native macOS playback, scheduling, and power policies in LumaWall',
  ],
  projects: [
    {
      slug: 'vinculum',
      title: 'Vinculum',
      category: 'Mathematical Software',
      status: 'Public editor',
      role: 'Software Engineer',
      focus: 'Math editor · Persistence · Rust/WASM computation',
      domains: 'Mathematical software · Developer tools',
      summary:
        'A local-first workspace for editing equations, curves, surfaces, and vector fields in 2D and 3D.',
      ownership:
        'Built the editor workflow, scene persistence, expression validation, sharing, and export systems. The documented computation boundary moves real numeric expressions and vector-field grid sampling into Rust/WASM.',
      result:
        'Supports browser-local projects, recoverable scenes, URL sharing, and JSON, PNG, and SVG exports. Symbolic algebra and several sampling algorithms remain in TypeScript.',
      stack: ['TypeScript', 'React', 'Rust', 'WebAssembly', 'Three.js'],
      demoHref: 'https://vinculum.rijan.sh/editor',
      codeHref: 'https://github.com/Luseefor/vinculum',
    },
    {
      slug: 'lumawall',
      title: 'LumaWall',
      category: 'Native macOS App',
      status: 'Source available · Build locally',
      role: 'Software Engineer',
      focus: 'Per-display playback · Scheduling · Power policy',
      domains: 'Native applications · Media systems',
      summary:
        'Local video wallpapers for macOS, with per-display playback, scheduled playlists, and power-aware controls.',
      ownership:
        'Built native and overlay playback paths with shared video decoding, playlist scheduling, and power and Reduce Motion policies.',
      result:
        'Provides a local-build app with per-display wallpaper assignments. A signed, notarized download is not yet available.',
      stack: ['Swift', 'macOS', 'WallpaperKit'],
      codeHref: 'https://github.com/Luseefor/LumaWall',
    },
    {
      slug: 'faredelta',
      title: 'FareDelta',
      category: 'Full-stack Web Product',
      status: 'Public beta',
      role: 'Full Stack Engineer',
      focus: 'Flexible-date search · Fare history · Alerts',
      domains: 'Data pipelines · Web products',
      summary:
        'Flexible-date flight search with saved routes, fare history, and price alerts using cached fare observations.',
      ownership:
        'Built a Next.js interface and API proxy backed by FastAPI and PostgreSQL, with provider normalization, scheduled refreshes, and route tracking.',
      result:
        'Supports flexible-date comparisons and price alerts. Observed fares are cached provider data and do not guarantee live inventory or booking availability.',
      stack: ['Next.js', 'TypeScript', 'FastAPI', 'PostgreSQL'],
      demoHref: 'https://faredelta.rijan.sh',
      codeHref: 'https://github.com/Luseefor/faredelta',
    },
    {
      slug: 'synthex-ui',
      title: 'Synthex UI',
      status: 'Built and live',
      role: 'Frontend Systems Engineer',
      focus: 'Component library · Theme system · Layout engine',
      domains: 'Developer tools · Frontend infrastructure',
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
      slug: 'aletiq',
      title: 'Aletiq',
      status: 'In development',
      role: 'Founder + Engineer',
      focus: 'Product direction · Full-stack implementation',
      domains: 'Product engineering · Systems design',
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
      slug: 'liberty-jewelers',
      title: 'Liberty Jewelers',
      status: 'Delivered storefront',
      role: 'Full Stack Engineer',
      focus: 'Storefront · CMS · Payments',
      domains: 'E-commerce · Content management',
      category: 'Production E-commerce',
      summary:
        'Built a custom storefront and internal CMS that gave a live jewelry business a cleaner buying flow and a simpler way to manage products and content.',
      ownership:
        'Owned the customer-facing Next.js experience, CMS tooling, Stripe integration, and the system wiring between storefront actions and internal updates.',
      result:
        'Delivered a production-ready commerce stack that supported merchandising, checkout, and day-to-day content changes without relying on a generic template.',
      stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe'],
      demoHref: 'https://www.libertygoldanddiamonds.com/',
    },
    {
      slug: 'interactive-dungeon-portfolio',
      title: 'Interactive Dungeon Portfolio',
      status: 'Technical demo',
      role: 'Software Engineer',
      focus: 'Camera · Movement · Collision · UI state',
      domains: 'Browser graphics · Interactive systems',
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
      slug: 'metrox',
      title: 'MetroX',
      status: 'Framework in development',
      role: 'Software Engineer',
      focus: 'Evaluation workflows · Runtime integration · Scorecards',
      domains: 'Applied AI · Reliability engineering',
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
    slug: 'synthex-ui',
    title: 'Synthex UI',
    subtitle:
      'Component library, theme system, preview environment, and documentation experience in one product-grade frontend build.',
    summary:
      'A cross-platform component library and theme system, paired with a framework-independent layout engine and a React DOM adapter for dockable workbenches.',
    body: [
      'The project combines the UI system itself with a preview shell, component documentation, dashboard examples, theme customization, and a playground route instead of treating the library as a pile of isolated examples.',
      'I focused on component consistency, theme behavior, navigation structure, and the engineering discipline needed to make the preview experience feel coherent rather than like a disconnected storybook clone.',
    ],
    status: 'Built and live',
    role: 'Frontend Systems Engineer',
    focus: 'Design System · Theme Engine · Docs + Playground',
    domains: 'Component Architecture · DX · Frontend Infrastructure',
  },
  writing: [
    {
      slug: 'rust-wasm-computation-boundary',
      title: 'Drawing the Rust/WASM boundary in Vinculum',
      summary:
        'Planned engineering note on expression validation, bounded grid sampling, and compatibility with saved scenes.',
      dateLabel: 'Planned post',
      href: '/writing/rust-wasm-computation-boundary',
    },
    {
      slug: 'designing-a-themeable-workbench',
      title: 'Designing a themeable workbench',
      summary:
        'Planned notes on separating a layout engine from its React adapter and keeping a component library consistent.',
      dateLabel: 'Planned post',
      href: '/writing/designing-a-themeable-workbench',
    },
  ] as WritingPost[],
  experience: [
    {
      role: 'Founder + Engineer',
      company: 'Aletiq',
      period: '2025 - Present',
      bullets: [
        'Build TODO(metric): product workflows shipped for Aletiq.',
        'Deliver TODO(metric): interface and backend milestones from product design through implementation.',
        'Validate TODO(metric): product decisions through user feedback or testing.',
      ],
    },
    {
      role: 'Software Engineering Projects',
      company: 'Applied Engineering Experience',
      period: 'Jan 2023 - May 2024',
      bullets: [
        'Reduced administrative workload by 70% with an NFC attendance and school management platform (resume-reported).',
        'Automated TODO(metric): library tracking and reporting workflows across inventory, borrowing, and fines.',
        'Prototyped TODO(metric): energy-monitoring installations using embedded sensors and microcontrollers.',
        'Secured TODO(metric): student voting sessions with authentication and encrypted workflows.',
      ],
    },
    {
      role: 'Full Stack Engineer',
      company: 'Liberty Jewelers',
      period: '2023 - 2024',
      bullets: [
        'Shipped TODO(metric): storefront and checkout workflows for a jewelry business.',
        'Automated TODO(metric): product updates through database-backed content tooling.',
        'Improved TODO(metric): storefront performance against a measured baseline.',
      ],
    },
  ] satisfies ExperienceEntry[],
  timeline: [
    {
      period: '2025 - Present',
      title: 'Founder + Engineer',
      organization: 'Aletiq',
      summary:
        'Build TODO(metric): product workflows shipped across interface and backend systems.',
      proof: 'Product direction · Engineering ownership',
    },
    {
      period: '2024 - Present',
      title: 'Computer Engineering + Mathematics',
      organization: 'University of Southern Mississippi',
      summary:
        'Pursue 2 B.S. degree programs while building mathematical software, developer tools, and native apps.',
      proof: 'Vinculum · Synthex UI · LumaWall · FareDelta',
    },
    {
      period: 'Jan 2023 - May 2024',
      title: 'Software Engineering Projects',
      organization: 'Applied Engineering Experience',
      summary:
        'Reduced administrative workload by 70% with an NFC attendance and school management platform (resume-reported).',
      proof: 'NFC attendance · Role-based dashboards · Assignment workflows',
    },
    {
      period: '2023 - 2024',
      title: 'Full Stack Engineer',
      organization: 'Liberty Jewelers',
      summary:
        'Shipped TODO(metric): commerce workflows across the storefront, payments, and content management.',
      proof: 'Custom storefront · CMS · Checkout',
    },
  ] as TimelineEntry[],
  education: [
    {
      institution: 'University of Southern Mississippi',
      degree: 'B.S. Computer Engineering + B.S. Mathematics',
      period: '2024 - Present',
      notes: 'Dual degree studies alongside hands-on software and hardware projects.',
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
    linkedin: 'https://www.linkedin.com/in/rijanghimire/',
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
      url: 'https://www.linkedin.com/in/rijanghimire/',
      kind: 'linkedin',
    },
    {
      label: 'Email',
      url: 'mailto:ghimirerijan199@gmail.com',
      kind: 'email',
    },
  ] satisfies SocialLink[],
} as const;

/** Merge the featured narrative into its project record without duplicating project facts. */
export function getPortfolioProject(slug: string) {
  const project = portfolioData.projects.find((entry) => entry.slug === slug);
  if (!project) return undefined;
  return project.slug === portfolioData.featuredProject.slug
    ? { ...project, ...portfolioData.featuredProject }
    : { ...project, body: [] as string[] };
}

export function getProjectAction(project: PortfolioProject) {
  if (project.demoHref) return { href: project.demoHref, label: 'Open live demo' };
  if (project.codeHref && !project.hideRepository)
    return { href: project.codeHref, label: 'Open repository' };
  return { href: `/projects/${project.slug}`, label: 'Read project details' };
}
