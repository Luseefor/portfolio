'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Download, ExternalLink, Github, Linkedin, Mail } from 'lucide-react';
import PersonalAssistantBlob from '@/components/assistant/PersonalAssistantBlob';
import GitHubActivity from '@/components/portfolio/GitHubActivity';
import PortfolioContactForm from '@/components/portfolio/PortfolioContactForm';
import RouteThemeControl from '@/components/shared/RouteThemeControl';
import { portfolioData } from '@/content/portfolio';
import { useStore } from '@/utils/store';
import { getSurfacePalette, getThemeColor, hexToRgba } from '@/utils/themes';

function SectionLabel({ number, label, accent }: { number: string; label: string; accent: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="font-terminal text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
        {number}
      </span>
      <span className="h-px w-10" style={{ backgroundColor: hexToRgba(accent, 0.5) }} />
      <span className="font-terminal text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
        {label}
      </span>
    </div>
  );
}

function InfoRow({
  label,
  value,
  accent,
  mutedText,
  borderColor,
}: {
  label: string;
  value: string;
  accent: string;
  mutedText: string;
  borderColor: string;
}) {
  return (
    <div className="border-t py-4" style={{ borderColor }}>
      <p className="font-terminal text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
        {label}
      </p>
      <p className="mt-2 text-[15px] leading-7" style={{ color: mutedText }}>
        {value}
      </p>
    </div>
  );
}

function NumberedLabel({ value, accent }: { value: string; accent: string }) {
  return (
    <span
      className="font-terminal text-[11px] font-semibold uppercase tracking-[0.18em]"
      style={{ color: accent }}
    >
      {value}
    </span>
  );
}

export default function Home() {
  const { currentTheme, isDark } = useStore();
  const reduceMotion = useReducedMotion();
  const accent = getThemeColor(currentTheme, isDark);
  const palette = getSurfacePalette(isDark);
  const marqueeSkills = [
    'TypeScript',
    'React',
    'Next.js',
    'Python',
    'PostgreSQL',
    'Three.js',
    'Node.js',
    'Tailwind CSS',
    'Framer Motion',
    'Whisper',
    'TensorFlow',
    'Docker',
    'SQL',
    'FastAPI',
    'Vitest',
    'Playwright',
  ];
  const selectedProjects = portfolioData.projects.filter(
    (project) => project.title !== portfolioData.featuredProject.title,
  );
  const featuredProjectData =
    portfolioData.projects.find((project) => project.title === portfolioData.featuredProject.title) ??
    portfolioData.projects[0];

  const subtleBorder = hexToRgba(palette.borderDefault, isDark ? 0.82 : 1);
  const strongBorder = hexToRgba(palette.borderStrong, isDark ? 0.95 : 1);
  const mutedText = palette.textSecondary;
  const metaText = palette.textMuted;

  const pageStyle: CSSProperties = {
    backgroundColor: palette.base,
    color: palette.textPrimary,
  };

  const cardStyle: CSSProperties = {
    borderColor: subtleBorder,
    backgroundColor: isDark ? hexToRgba(palette.elevated, 0.54) : hexToRgba('#ffffff', 0.92),
    boxShadow: `0 14px 36px ${hexToRgba('#000000', isDark ? 0.12 : 0.03)}`,
  };

  const inputStyle: CSSProperties = {
    backgroundColor: isDark ? hexToRgba(palette.base, 0.62) : hexToRgba('#ffffff', 0.96),
    borderColor: subtleBorder,
    color: palette.textPrimary,
  };
  const revealTransition = reduceMotion ? { duration: 0 } : { duration: 0.24 };
  const heroStagger = {
    hidden: {},
    show: {
      transition: {
        delayChildren: 0.04,
        staggerChildren: 0.07,
      },
    },
  };
  const heroItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.34 } },
  };

  return (
    <main className="min-h-screen" style={pageStyle}>
      <div className="mx-auto max-w-5xl px-5 pb-24 pt-6 md:px-8 lg:px-10">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 focus:rounded-full focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950"
          style={{ backgroundColor: accent }}
        >
          Skip to content
        </a>

        <header className="border-b pb-5" style={{ borderColor: subtleBorder }}>
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
              <span className="text-sm font-semibold uppercase tracking-[0.22em]">
                Rijan Ghimire
              </span>
            </Link>

            <nav className="hidden items-center gap-6 text-sm md:flex" style={{ color: mutedText }}>
              <a href="#projects">Projects</a>
              <a href="#experience">Timeline</a>
              <a href="#activity">Activity</a>
              <a href="#skills">Skills</a>
              <a href="#contact">Contact</a>
              <Link href="/interactive">Demo</Link>
            </nav>

            <RouteThemeControl />
          </div>
        </header>

        <motion.section
          id="content"
          className="py-12 md:py-16"
          initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={revealTransition}
        >
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <motion.div
              variants={reduceMotion ? undefined : heroStagger}
              initial={reduceMotion ? undefined : 'hidden'}
              animate={reduceMotion ? undefined : 'show'}
            >
              <motion.p
                variants={reduceMotion ? undefined : heroItem}
                className="font-terminal text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: accent }}
              >
                {portfolioData.hero.roleLabel}
              </motion.p>
              <motion.h1 variants={reduceMotion ? undefined : heroItem} className="mt-5 max-w-4xl font-display text-[3rem] font-semibold leading-[0.92] tracking-tight sm:text-[4.4rem] lg:text-[5rem]">
                {portfolioData.hero.name}
              </motion.h1>
              <motion.p variants={reduceMotion ? undefined : heroItem} className="mt-6 max-w-3xl text-[1.2rem] leading-[1.5] sm:text-[1.45rem]" style={{ color: mutedText }}>
                {portfolioData.hero.headline}
              </motion.p>
              <motion.p variants={reduceMotion ? undefined : heroItem} className="mt-5 max-w-2xl text-[16px] leading-8" style={{ color: mutedText }}>
                {portfolioData.hero.summary}
              </motion.p>
              {portfolioData.hero.quote ? (
                <motion.p
                  variants={reduceMotion ? undefined : heroItem}
                  className="mt-7 max-w-2xl border-l pl-5 text-[15px] italic leading-8"
                  style={{ borderColor: strongBorder, color: metaText }}
                >
                  {portfolioData.hero.quote}
                </motion.p>
              ) : null}

              <motion.div variants={reduceMotion ? undefined : heroItem} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                <motion.a
                  href="#projects"
                  whileHover={reduceMotion ? undefined : { y: -1 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  className="inline-flex min-h-12 items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-950 transition"
                  style={{ backgroundColor: accent }}
                >
                  View Projects
                </motion.a>
                <motion.a
                  href={portfolioData.contact.resumeHref}
                  download="Rijan-Ghimire-Resume.pdf"
                  whileHover={reduceMotion ? undefined : { x: 1 }}
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold transition"
                  style={{ color: mutedText }}
                >
                  Download Resume
                  <Download size={16} />
                </motion.a>
                <motion.div whileHover={reduceMotion ? undefined : { x: 1 }}>
                <Link
                  href="/interactive"
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
                  style={{ color: mutedText }}
                >
                  Open Interactive Demo
                  <ExternalLink size={16} />
                </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.aside
              className="lg:pt-2"
              initial={reduceMotion ? undefined : { opacity: 0, x: 12 }}
              animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              transition={reduceMotion ? undefined : { duration: 0.38, delay: 0.18 }}
            >
              <div className="border-t pt-5" style={{ borderColor: strongBorder }}>
                <p
                  className="font-terminal text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: accent }}
                >
                  Quick Read
                </p>
                <p className="mt-4 max-w-lg font-display text-[1.75rem] font-semibold leading-[1.06] sm:text-[2rem]">
                  Product-minded execution with enough systems depth to own the difficult parts.
                </p>
              </div>

              <div className="mt-4">
                <InfoRow
                  label="Availability"
                  value={portfolioData.hero.status}
                  accent={accent}
                  mutedText={mutedText}
                  borderColor={subtleBorder}
                />
                <InfoRow
                  label="Location"
                  value="United States"
                  accent={accent}
                  mutedText={mutedText}
                  borderColor={subtleBorder}
                />
                <InfoRow
                  label="Email"
                  value={portfolioData.contact.email}
                  accent={accent}
                  mutedText={mutedText}
                  borderColor={subtleBorder}
                />
              </div>

              <div className="border-t pt-4" style={{ borderColor: subtleBorder }}>
                <p
                  className="font-terminal text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: accent }}
                >
                  Profiles
                </p>
                <div className="mt-3 flex flex-wrap gap-6">
                  <a
                    className="inline-flex items-center gap-2 text-sm font-medium"
                    style={{ color: mutedText }}
                    href={portfolioData.contact.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Github size={15} />
                    GitHub
                  </a>
                  <a
                    className="inline-flex items-center gap-2 text-sm font-medium"
                    style={{ color: mutedText }}
                    href={portfolioData.contact.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Linkedin size={15} />
                    LinkedIn
                  </a>
                </div>
              </div>
            </motion.aside>
          </div>
        </motion.section>

        <motion.section
          className="relative overflow-hidden border-y py-5"
          style={{ borderColor: subtleBorder, color: metaText }}
          initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={revealTransition}
        >
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20"
            style={{
              background: `linear-gradient(to right, ${palette.base} 0%, ${hexToRgba(palette.base, 0)} 100%)`,
            }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20"
            style={{
              background: `linear-gradient(to left, ${palette.base} 0%, ${hexToRgba(palette.base, 0)} 100%)`,
            }}
          />
          <motion.div
            className="flex items-center gap-0 text-base"
            animate={
              reduceMotion
                ? undefined
                : {
                    x: ['0%', '-50%'],
                  }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: 14,
                    ease: 'linear',
                    repeat: Infinity,
                  }
            }
          >
            {[...marqueeSkills, ...marqueeSkills].map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex min-w-[10.5rem] items-center justify-center"
              >
                {index > 0 ? (
                  <span
                    className="mr-8 h-[3px] w-[3px] rounded-full"
                    style={{ backgroundColor: hexToRgba('#b67742', 0.72) }}
                  />
                ) : null}
                <span
                  className="font-display text-[0.92rem] italic tracking-[0.005em]"
                  style={{ color: hexToRgba(palette.textSecondary, 0.58) }}
                >
                  {item}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className="grid gap-6 border-y py-8 md:grid-cols-3"
          style={{ borderColor: subtleBorder }}
          initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={revealTransition}
        >
          {portfolioData.credibility.map((item) => (
            <p key={item} className="text-[15px] leading-8" style={{ color: mutedText }}>
              {item}
            </p>
          ))}
        </motion.section>

        <motion.section
          id="projects"
          className="py-14 md:py-16"
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={revealTransition}
        >
          <SectionLabel number="01" label="Featured Project" accent={accent} />
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <h2 className="font-display text-[2.35rem] font-semibold leading-[0.96] sm:text-[3rem] md:text-[3.6rem]">
                {portfolioData.featuredProject.title}
              </h2>
              <p className="mt-4 text-[1.05rem] leading-8" style={{ color: mutedText }}>
                {portfolioData.featuredProject.subtitle}
              </p>
              <p className="mt-5 text-[16px] leading-8" style={{ color: mutedText }}>
                {portfolioData.featuredProject.summary}
              </p>
              <div className="mt-6 space-y-4">
                {portfolioData.featuredProject.body.map((paragraph) => (
                  <p key={paragraph} className="text-[15px] leading-8" style={{ color: mutedText }}>
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-5">
                {featuredProjectData?.demoHref?.startsWith('http') ? (
                  <a
                    href={featuredProjectData.demoHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold"
                    style={{ color: accent }}
                  >
                    Open live demo
                    <ExternalLink size={14} />
                  </a>
                ) : featuredProjectData?.demoHref ? (
                  <Link
                    href={featuredProjectData.demoHref}
                    className="inline-flex items-center gap-2 text-sm font-semibold"
                    style={{ color: accent }}
                  >
                    Open live demo
                    <ExternalLink size={14} />
                  </Link>
                ) : (
                  <a
                    href={portfolioData.contact.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold"
                    style={{ color: accent }}
                  >
                    Open live demo
                    <ExternalLink size={14} />
                  </a>
                )}
                <a
                  href={featuredProjectData?.codeHref ?? portfolioData.contact.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: accent }}
                >
                  Open repository
                  <Github size={14} />
                </a>
              </div>
            </div>

            <div>
              <InfoRow
                label="Status"
                value={portfolioData.featuredProject.status}
                accent={accent}
                mutedText={mutedText}
                borderColor={strongBorder}
              />
              <InfoRow
                label="Role"
                value={portfolioData.featuredProject.role}
                accent={accent}
                mutedText={mutedText}
                borderColor={subtleBorder}
              />
              <InfoRow
                label="Focus"
                value={portfolioData.featuredProject.focus}
                accent={accent}
                mutedText={mutedText}
                borderColor={subtleBorder}
              />
              <InfoRow
                label="Domains"
                value={portfolioData.featuredProject.domains}
                accent={accent}
                mutedText={mutedText}
                borderColor={subtleBorder}
              />
            </div>
          </div>

          <div className="mt-14">
            <SectionLabel number="02" label="Selected Systems" accent={accent} />
            {selectedProjects.map((project, index) => (
              <motion.article
                key={project.title}
                className={`grid gap-6 border-t py-8 md:grid-cols-[0.14fr_0.3fr_0.56fr] md:gap-10 ${
                  index === selectedProjects.length - 1 ? 'border-b' : ''
                }`}
                style={{ borderColor: subtleBorder }}
                initial={reduceMotion ? undefined : { opacity: 0, y: 6 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.2 }
                }
              >
                <div className="hidden md:block">
                  <NumberedLabel value={`${String(index + 1).padStart(2, '0')}`} accent={accent} />
                </div>

                <div>
                  <p
                    className="mb-2 font-terminal text-[11px] font-semibold uppercase tracking-[0.18em] md:hidden"
                    style={{ color: accent }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <p
                    className="font-terminal text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: accent }}
                  >
                    {project.category}
                  </p>
                  <h3 className="mt-3 font-display text-[1.85rem] font-semibold leading-none sm:text-[2.1rem]">
                    {project.title}
                  </h3>
                  <p className="mt-4 text-xs uppercase tracking-[0.18em]" style={{ color: metaText }}>
                    {project.stack.join(' / ')}
                  </p>
                </div>

                <div>
                  <p className="text-[16px] leading-8" style={{ color: mutedText }}>
                    {project.summary}
                  </p>
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                      <p className="font-semibold">What I owned</p>
                      <p className="mt-2 text-sm leading-7" style={{ color: mutedText }}>
                        {project.ownership}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Result</p>
                      <p className="mt-2 text-sm leading-7" style={{ color: mutedText }}>
                        {project.result}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-5">
                    {project.demoComingSoon ? (
                      <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: accent }}>
                        Live demo coming soon
                      </span>
                    ) : (project.demoHref ?? '').startsWith('http') ? (
                      <a
                        href={project.demoHref ?? portfolioData.contact.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold"
                        style={{ color: accent }}
                      >
                        Open live demo
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <Link
                        href={project.demoHref ?? '/'}
                        className="inline-flex items-center gap-2 text-sm font-semibold"
                        style={{ color: accent }}
                      >
                        Open live demo
                        <ExternalLink size={14} />
                      </Link>
                    )}
                    {!project.hideRepository ? (
                      <a
                        href={project.codeHref ?? portfolioData.contact.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold"
                        style={{ color: accent }}
                      >
                        Open repository
                        <Github size={14} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="experience"
          className="py-14 md:py-16"
          initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={revealTransition}
        >
          <SectionLabel number="03" label="Execution Timeline" accent={accent} />
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div>
              <h2 className="font-display text-[2.2rem] font-semibold leading-[0.98] sm:text-[2.8rem]">
                Career progression with visible technical ownership.
              </h2>
              <p className="mt-5 text-[16px] leading-8" style={{ color: mutedText }}>
                The timeline exists to show continuity across shipped work, applied engineering,
                and formal study.
              </p>
            </div>

            <div>
              {portfolioData.timeline.map((entry, index) => (
                <article
                  key={`${entry.period}-${entry.title}`}
                  className={`grid gap-4 border-t py-7 md:grid-cols-[0.24fr_0.76fr] ${
                    index === portfolioData.timeline.length - 1 ? 'border-b' : ''
                  }`}
                  style={{ borderColor: subtleBorder }}
                >
                  <div>
                    <p
                      className="font-terminal text-[11px] font-semibold uppercase tracking-[0.18em]"
                      style={{ color: accent }}
                    >
                      {entry.period}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-display text-[1.8rem] font-semibold leading-none">
                      {entry.title}
                    </h3>
                    <p className="mt-2 text-base" style={{ color: mutedText }}>
                      {entry.organization}
                    </p>
                    <p className="mt-4 text-[15px] leading-8" style={{ color: mutedText }}>
                      {entry.summary}
                    </p>
                    {entry.proof ? (
                      <p className="mt-4 text-xs uppercase tracking-[0.18em]" style={{ color: metaText }}>
                        {entry.proof}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id="activity"
          className="py-14 md:py-16"
          initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={revealTransition}
        >
          <SectionLabel number="04" label="Engineering Activity" accent={accent} />
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div>
              <h2 className="font-display text-[2.2rem] font-semibold leading-[0.98] sm:text-[2.8rem]">
                Active build rhythm, not archived output.
              </h2>
              <p className="mt-5 text-[16px] leading-8" style={{ color: mutedText }}>
                {portfolioData.activity.summary}
              </p>
            </div>

            <GitHubActivity
              accent={accent}
              subtleBorder={subtleBorder}
              mutedText={mutedText}
              metaText={metaText}
              githubUrl={portfolioData.contact.github}
            />
          </div>
        </motion.section>

        <motion.section
          id="skills"
          className="py-14 md:py-16"
          initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={revealTransition}
        >
          <SectionLabel number="05" label="Capability Map" accent={accent} />
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-5">
            {portfolioData.skills.map((group) => (
              <article key={group.label} className="border-t pt-4" style={{ borderColor: subtleBorder }}>
                <h3 className="font-display text-[1.6rem] font-semibold leading-none">
                  {group.label}
                </h3>
                <ul className="mt-5 space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="text-[15px] leading-7" style={{ color: mutedText }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="contact"
          className="py-14 md:py-16"
          initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={revealTransition}
        >
          <SectionLabel number="06" label="Contact" accent={accent} />
          <div className="grid items-start gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div>
              <h2 className="font-display text-[2.25rem] font-semibold leading-[0.96] sm:text-[3rem] md:text-[3.5rem]">
                Ready for internships, early-career roles, and serious technical work.
              </h2>
              <p className="mt-5 text-[16px] leading-8" style={{ color: mutedText }}>
                {portfolioData.contact.note}
              </p>

              <div className="mt-8 space-y-5">
                <InfoRow
                  label="Email"
                  value={portfolioData.contact.email}
                  accent={accent}
                  mutedText={mutedText}
                  borderColor={subtleBorder}
                />
                <div className="border-t pt-4" style={{ borderColor: subtleBorder }}>
                  <p
                    className="font-terminal text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: accent }}
                  >
                    Direct channels
                  </p>
                  <div className="mt-4 flex flex-col gap-3">
                    <a
                      className="inline-flex items-center gap-2 text-sm font-medium"
                      style={{ color: mutedText }}
                      href={`mailto:${portfolioData.contact.email}`}
                    >
                      <Mail size={15} />
                      Email
                    </a>
                    <a
                      className="inline-flex items-center gap-2 text-sm font-medium"
                      style={{ color: mutedText }}
                      href={portfolioData.contact.github}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Github size={15} />
                      GitHub
                    </a>
                    <a
                      className="inline-flex items-center gap-2 text-sm font-medium"
                      style={{ color: mutedText }}
                      href={portfolioData.contact.linkedin}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Linkedin size={15} />
                      LinkedIn
                    </a>
                  </div>
                </div>
                <div className="border-t pt-4" style={{ borderColor: subtleBorder }}>
                  <p
                    className="font-terminal text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: accent }}
                  >
                    Resume
                  </p>
                  <a
                    href={portfolioData.contact.resumeHref}
                    download="Rijan-Ghimire-Resume.pdf"
                    className="mt-4 inline-flex min-h-12 items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-950"
                    style={{ backgroundColor: accent }}
                  >
                    Download Resume
                    <Download size={16} />
                  </a>
                </div>
              </div>
            </div>

            <PortfolioContactForm
              accent={accent}
              surfaceStyle={cardStyle}
              inputStyle={inputStyle}
              mutedTextStyle={{ color: mutedText }}
              labelStyle={{ color: metaText }}
            />
          </div>
        </motion.section>
      </div>
      <PersonalAssistantBlob />
    </main>
  );
}
