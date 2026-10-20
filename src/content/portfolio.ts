export type SourceLink = { label: string; href: string };

export type ProjectCaseStudy = {
  problem: string;
  decisions: { title: string; description: string; source: SourceLink }[];
  limitation: { description: string; source: SourceLink };
};

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
  caseStudy?: ProjectCaseStudy;
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
  publishedAt?: string;
  draft?: boolean;
  sources?: SourceLink[];
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
  selectedProjectSlugs: ['vinculum', 'faredelta', 'lumawall'],
  additionalProjectSlugs: ['liberty-jewelers', 'aletiq', 'metrox'],
  hero: {
    name: 'Rijan Ghimire',
    headline: 'I build mathematical software, developer tools, and web apps.',
    summary: 'I study Computer Engineering and Mathematics at Southern Miss.',
    status: 'Open to internships and early-career software engineering roles',
    roleLabel: 'Software Engineer',
    quickRead: 'Developer tools and products you can inspect.',
    quote: 'Choose tools for the problem. Design for reliability. Execute with discipline.',
  },
  about: {
    title: 'Engineering Approach',
    description:
      'I build web apps, backend systems, and interactive demos that stay clear and maintainable.',
    body: [
      'I start from constraints: interface clarity, runtime behavior, ownership boundaries, and the cost of future changes. The stack follows those constraints.',
      'My work is end-to-end. I move from UX decisions and frontend architecture to backend workflows, integration details, and reliable operation.',
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
      caseStudy: {
        problem:
          'A math editor needs to turn expressions into geometry while keeping scenes editable after saving, reopening, or sharing them.',
        decisions: [
          {
            title: 'Separate expression validation from numeric evaluation',
            description:
              'TypeScript and mathjs parse expressions and handle symbolic work. A bridge rejects unsupported syntax and sends numeric programs to Rust/WASM. Geometry construction remains in TypeScript, so the computation boundary can move without replacing the whole editor.',
            source: {
              label: 'Rust/WASM boundary',
              href: 'https://github.com/Luseefor/vinculum/blob/b5161fc3a07c5357a7ae6693b49102195f4c8437/docs/architecture/rust-wasm-boundary.md',
            },
          },
          {
            title: 'Keep runtime data out of saved scenes',
            description:
              'Scenes store mathematical definitions. Compiled programs, WASM pointers, and sampled geometry are derived at runtime. Moving numeric evaluation into Rust therefore keeps the existing scene format usable.',
            source: {
              label: 'Scene and engine architecture',
              href: 'https://github.com/Luseefor/vinculum/blob/b5161fc3a07c5357a7ae6693b49102195f4c8437/docs/architecture/core-engine.md',
            },
          },
        ],
        limitation: {
          description:
            'Projects depend on browser storage quotas, and large scenes can exceed the share-link length limit. Multi-user collaboration is not available.',
          source: {
            label: 'Documented editor limits',
            href: 'https://github.com/Luseefor/vinculum/blob/b5161fc3a07c5357a7ae6693b49102195f4c8437/docs/user/limits.md',
          },
        },
      },
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
      caseStudy: {
        problem:
          'Video wallpaper has to work across displays and macOS versions while respecting power use and Reduce Motion.',
        decisions: [
          {
            title: 'Separate native and overlay playback',
            description:
              'Supported macOS builds use an embedded WallpaperKit extension and the system wallpaper store. Older systems and overlay-only builds use a poster image with muted video over it. The app maintains both paths because their OS requirements differ.',
            source: {
              label: 'Playback architecture',
              href: 'https://github.com/Luseefor/LumaWall/blob/cca2e419f13fc82bb3e9ea1f78a022431114cd50/README.md#how-apply-works',
            },
          },
          {
            title: 'Resolve playback through a shared power policy',
            description:
              'The policy chooses a playback tier using battery, thermal, display, and user state. Reduce Motion freezes playback to a static frame, while conditions such as display sleep or Game Mode pause it.',
            source: {
              label: 'Power policy implementation',
              href: 'https://github.com/Luseefor/LumaWall/blob/cca2e419f13fc82bb3e9ea1f78a022431114cd50/Sources/LumaWallCore/PowerPolicy.swift',
            },
          },
        ],
        limitation: {
          description:
            'The app must be built locally. A signed, notarized download is not available, and native playback requires a supported OS and the embedded extension.',
          source: {
            label: 'Build and distribution requirements',
            href: 'https://github.com/Luseefor/LumaWall/blob/cca2e419f13fc82bb3e9ea1f78a022431114cd50/README.md#build',
          },
        },
      },
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
      caseStudy: {
        problem:
          'Flexible-date searches need comparable results across providers, with saved routes and alerts that can refresh without exposing provider credentials to the browser.',
        decisions: [
          {
            title: 'Normalize provider results behind the API',
            description:
              'The browser calls same-origin Next.js routes. FastAPI validates requests and delegates searches through a provider interface. Providers return shared models, so the UI and persistence layer do not need to handle each provider payload.',
            source: {
              label: 'Provider and API architecture',
              href: 'https://github.com/Luseefor/faredelta/blob/edbc77102da6ef0af7902393bde99af4d4f1a645/docs/architecture.md',
            },
          },
          {
            title: 'Refresh tracked routes and suppress repeated alerts',
            description:
              'Tracked routes have a refresh cadence. The job endpoint refreshes due routes with bounded concurrency and backoff. Price alerts fire when a fare falls below the last notified price, rather than repeating the same alert on every refresh.',
            source: {
              label: 'Refresh and alert behavior',
              href: 'https://github.com/Luseefor/faredelta/blob/edbc77102da6ef0af7902393bde99af4d4f1a645/docs/api.md',
            },
          },
        ],
        limitation: {
          description:
            'Travelpayouts returns recently observed cached fares and supports economy searches only. A displayed fare does not establish current seat availability or a bookable price.',
          source: {
            label: 'Provider data constraints',
            href: 'https://github.com/Luseefor/faredelta/blob/edbc77102da6ef0af7902393bde99af4d4f1a645/docs/architecture.md',
          },
        },
      },
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
        'Built a UI system and preview environment with theming, component docs, dashboard demos, and a live playground for evaluating patterns.',
      ownership:
        'Owned the component library architecture, preview shell, theme model, and documentation structure. Built the preview so each component can be opened, themed, and reviewed.',
      result:
        'Provides separate UI, layout-engine, and React-renderer packages. The preview includes component documentation, theme controls, and a layout playground.',
      caseStudy: {
        problem:
          'A dockable workbench needs layout state, command history, and rendering to agree. The UI library also needs a consistent theme contract across components.',
        decisions: [
          {
            title: 'Keep the layout engine independent of React',
            description:
              'A pure TypeScript package owns the layout tree, reducers, serialization, and command history. The React DOM adapter renders split panes and tabs. Consumers can use the engine without the adapter, while the adapter handles web rendering.',
            source: {
              label: 'Package responsibilities and runtime flow',
              href: 'https://github.com/Luseefor/synthex-ui/blob/5df51b2f20e173d017341fc9be7847041518f4d5/docs/mermaid-architecture.md',
            },
          },
          {
            title: 'Make theme tokens the component contract',
            description:
              'Components read CSS custom properties. Theme creation merges base values, an accent preset, and consumer overrides. The workbench inherits those values but allows workbench-specific overrides, so customization can stay outside component code.',
            source: {
              label: 'Theme contract and overrides',
              href: 'https://github.com/Luseefor/synthex-ui/blob/5df51b2f20e173d017341fc9be7847041518f4d5/docs/theming.md',
            },
          },
        ],
        limitation: {
          description:
            'The dockable renderer targets React DOM. The component library has web and native entry points, but the workbench adapter is web-only.',
          source: {
            label: 'Workbench integration',
            href: 'https://github.com/Luseefor/synthex-ui/blob/5df51b2f20e173d017341fc9be7847041518f4d5/docs/workbench.md',
          },
        },
      },
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
        'Building Aletiq as founder and engineer, owning product direction and technical execution.',
      ownership:
        'Own product and engineering work across interface decisions, system implementation, and the technical direction needed to move an early product forward.',
      result:
        'Turned the concept into an active build with working product areas under development.',
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
        'Delivered a commerce stack covering merchandising, checkout, and day-to-day content changes.',
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
        'Produced a working demo covering scene setup, player controls, collision handling, and layered UI state.',
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
        'Owned configuration flows, runtime integration, benchmark execution design, and scorecard logic that turn reliability checks into a repeatable workflow.',
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
      'Component library, theme system, preview environment, and documentation experience in one frontend build.',
    summary:
      'A cross-platform component library and theme system, paired with a framework-independent layout engine and a React DOM adapter for dockable workbenches.',
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
        'How expression validation, numeric evaluation, and saved scenes fit together in Vinculum.',
      dateLabel: 'Implementation note',
      href: '/writing/rust-wasm-computation-boundary',
      sources: [
        {
          label: 'Computation boundary and compatibility tests',
          href: 'https://github.com/Luseefor/vinculum/blob/b5161fc3a07c5357a7ae6693b49102195f4c8437/docs/architecture/rust-wasm-boundary.md',
        },
        {
          label: 'Scene persistence and engine contract',
          href: 'https://github.com/Luseefor/vinculum/blob/b5161fc3a07c5357a7ae6693b49102195f4c8437/docs/architecture/core-engine.md',
        },
      ],
    },
    {
      slug: 'designing-a-themeable-workbench',
      title: 'Designing a themeable workbench',
      summary:
        'How Synthex separates layout state from React rendering and uses theme tokens to customize a workbench.',
      dateLabel: 'Implementation note',
      href: '/writing/designing-a-themeable-workbench',
      sources: [
        {
          label: 'Layout engine and renderer responsibilities',
          href: 'https://github.com/Luseefor/synthex-ui/blob/5df51b2f20e173d017341fc9be7847041518f4d5/docs/mermaid-architecture.md',
        },
        {
          label: 'Workbench rendering and token cascade',
          href: 'https://github.com/Luseefor/synthex-ui/blob/5df51b2f20e173d017341fc9be7847041518f4d5/docs/workbench.md',
        },
        {
          label: 'Theme contract and overrides',
          href: 'https://github.com/Luseefor/synthex-ui/blob/5df51b2f20e173d017341fc9be7847041518f4d5/docs/theming.md',
        },
      ],
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
    : project;
}

export function getProjectAction(project: PortfolioProject) {
  if (project.demoHref) return { href: project.demoHref, label: 'Open live demo' };
  if (project.codeHref && !project.hideRepository)
    return { href: project.codeHref, label: 'Open repository' };
  return { href: `/projects/${project.slug}`, label: 'Read project details' };
}
