'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Download, Github, Linkedin, Mail } from 'lucide-react';
import PersonalAssistantBlob from '@/components/assistant/PersonalAssistantBlob';
import CopyEmailButton from '@/components/portfolio/CopyEmailButton';
import ProjectActions from '@/components/portfolio/ProjectActions';
import GitHubActivity from '@/components/portfolio/GitHubActivity';
import PortfolioContactForm from '@/components/portfolio/PortfolioContactForm';
import RouteThemeControl from '@/components/shared/RouteThemeControl';
import { portfolioData } from '@/content/portfolio';
import { useStore } from '@/utils/store';
import { getSurfacePalette, getThemeColor, hexToRgba } from '@/utils/themes';
function SectionLabel({
  number,
  label,
  accent,
}: {
  number: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span
        className="font-terminal text-[10px] uppercase tracking-[0.18em]"
        style={{ color: accent }}
      >
        {number}
      </span>
      <span className="h-px w-10" style={{ backgroundColor: hexToRgba(accent, 0.5) }} />
      <span
        className="font-terminal text-[10px] uppercase tracking-[0.18em]"
        style={{ color: accent }}
      >
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
      <p
        className="font-terminal text-[10px] uppercase tracking-[0.18em]"
        style={{ color: accent }}
      >
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

  const accent = getThemeColor(currentTheme, isDark);
  const palette = getSurfacePalette(isDark);
  const selectedProjects = portfolioData.selectedProjectSlugs.flatMap((slug) =>
    portfolioData.projects.filter((project) => project.slug === slug),
  );
  const featuredProjectData = portfolioData.projects.find(
    (project) => project.slug === portfolioData.featuredProject.slug,
  )!;
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

            <nav className="hidden items-center gap-4 text-sm lg:flex" style={{ color: mutedText }}>
              <a href="#projects">Projects</a>
              <a href="#writing">Writing</a>
              <a href="#experience">Background</a>
              <a href="#activity">Activity</a>
              <a href="#skills">Skills</a>
              <a href="#contact">Contact</a>
              <Link href="/interactive" prefetch={false}>
                Demo
              </Link>
            </nav>

            <RouteThemeControl />
          </div>
        </header>

        <section id="content" className="py-12 md:py-16">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <p
                className="font-terminal text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: accent }}
              >
                {portfolioData.hero.roleLabel}
              </p>
              <h1 className="mt-5 max-w-4xl font-display text-[3rem] font-semibold leading-[0.92] tracking-tight sm:text-[4.4rem] lg:text-[5rem]">
                {portfolioData.hero.name}
              </h1>
              <p
                className="mt-6 max-w-3xl text-[1.2rem] leading-[1.5] sm:text-[1.45rem]"
                style={{ color: mutedText }}
              >
                {portfolioData.hero.headline}
              </p>
              <p className="mt-5 max-w-2xl text-[16px] leading-8" style={{ color: mutedText }}>
                {portfolioData.hero.summary}
              </p>
              {portfolioData.hero.quote ? (
                <p
                  className="mt-7 max-w-2xl border-l pl-5 text-[15px] italic leading-8"
                  style={{ borderColor: strongBorder, color: metaText }}
                >
                  {portfolioData.hero.quote}
                </p>
              ) : null}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                <a
                  href="#projects"
                  className="inline-flex min-h-12 items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-950 transition"
                  style={{ backgroundColor: accent }}
                >
                  View Projects
                </a>
                <a
                  href={portfolioData.contact.resumeHref}
                  download="Rijan-Ghimire-Resume.pdf"
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold transition"
                  style={{ color: mutedText }}
                >
                  Download Resume
                  <Download size={16} />
                </a>
                <CopyEmailButton email={portfolioData.contact.email} />
              </div>
            </div>

            <aside className="lg:pt-2">
              <div className="border-t pt-5" style={{ borderColor: strongBorder }}>
                <p
                  className="font-terminal text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: accent }}
                >
                  Quick Read
                </p>
                <p className="mt-4 max-w-lg font-display text-[1.75rem] font-semibold leading-[1.06] sm:text-[2rem]">
                  {portfolioData.hero.quickRead}
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
                  value={portfolioData.location}
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
            </aside>
          </div>
        </section>

        <section
          className="grid gap-6 border-y py-8 md:grid-cols-3"
          style={{ borderColor: subtleBorder }}
        >
          {portfolioData.credibility.map((item) => (
            <p key={item} className="text-[15px] leading-8" style={{ color: mutedText }}>
              {item}
            </p>
          ))}
        </section>

        <section id="projects" className="py-14 md:py-16">
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
              <div className="mt-6" style={{ color: accent }}>
                <ProjectActions project={featuredProjectData} />
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
              <article
                key={project.title}
                className={`grid gap-6 border-t py-8 md:grid-cols-[0.14fr_0.3fr_0.56fr] md:gap-10 ${index === selectedProjects.length - 1 ? 'border-b' : ''}`}
                style={{ borderColor: subtleBorder }}
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
                  <p
                    className="mt-4 text-xs uppercase tracking-[0.18em]"
                    style={{ color: metaText }}
                  >
                    {project.stack.join(' / ')}
                  </p>
                </div>

                <div>
                  <p className="text-[16px] leading-8" style={{ color: mutedText }}>
                    {project.summary}
                  </p>
                  <div className="mt-5" style={{ color: accent }}>
                    <ProjectActions project={project} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="writing" className="py-14 md:py-16" aria-labelledby="writing-heading">
          <SectionLabel number="03" label="Writing" accent={accent} />
          <h2
            id="writing-heading"
            className="font-display text-[2.2rem] font-semibold leading-tight sm:text-[2.8rem]"
          >
            Engineering notes.
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {portfolioData.writing.slice(0, 3).map((post) => (
              <article key={post.slug} className="border p-6" style={cardStyle}>
                <p className="font-terminal text-xs" style={{ color: metaText }}>
                  {post.dateLabel}
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold">
                  <Link href={post.href} className="underline decoration-1 underline-offset-4">
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-3 text-sm leading-7" style={{ color: mutedText }}>
                  {post.summary}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section id="experience" className="py-14 md:py-16">
          <SectionLabel number="04" label="Background" accent={accent} />
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div>
              <h2 className="font-display text-[2.2rem] font-semibold leading-[0.98] sm:text-[2.8rem]">
                Experience & education.
              </h2>
              <p className="mt-5 text-[16px] leading-8" style={{ color: mutedText }}>
                The timeline exists to show continuity across shipped work, applied engineering, and
                formal study.
              </p>
            </div>

            <div>
              {portfolioData.timeline.map((entry, index) => (
                <article
                  key={`${entry.period}-${entry.title}`}
                  className={`grid gap-4 border-t py-7 md:grid-cols-[0.24fr_0.76fr] ${index === portfolioData.timeline.length - 1 ? 'border-b' : ''}`}
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
                    <ul
                      className="mt-4 list-disc pl-4 text-[15px] leading-8"
                      style={{ color: mutedText }}
                    >
                      <li>{entry.summary}</li>
                    </ul>
                    {entry.proof ? (
                      <p
                        className="mt-4 text-xs uppercase tracking-[0.18em]"
                        style={{ color: metaText }}
                      >
                        {entry.proof}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="activity" className="py-14 md:py-16">
          <SectionLabel number="05" label="Engineering Activity" accent={accent} />
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
        </section>

        <section id="skills" className="py-14 md:py-16">
          <SectionLabel number="06" label="Capability Map" accent={accent} />
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-5">
            {portfolioData.skills.map((group) => (
              <article
                key={group.label}
                className="border-t pt-4"
                style={{ borderColor: subtleBorder }}
              >
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
        </section>

        <section id="contact" className="py-14 md:py-16">
          <SectionLabel number="07" label="Contact" accent={accent} />
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
        </section>
      </div>
      <PersonalAssistantBlob />
    </main>
  );
}
