import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PaperText from '@/components/portfolio/PaperText';
import DetailShell from '@/components/portfolio/DetailShell';
import { portfolioData } from '@/content/portfolio';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return portfolioData.writing.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = portfolioData.writing.find((entry) => entry.slug === slug);
  if (!post) notFound();
  const title = `${post.title} | Rijan Ghimire`;
  return {
    title,
    description: post.summary,
    openGraph: { title, description: post.summary, type: 'article' },
    twitter: { card: 'summary', title, description: post.summary },
  };
}

export default async function WritingPage({ params }: Props) {
  const { slug } = await params;
  const post = portfolioData.writing.find((entry) => entry.slug === slug);
  if (!post) notFound();

  return (
    <DetailShell>
      <header>
        <p className="font-terminal text-xs text-[var(--text-secondary)]">{post.dateLabel}</p>
        <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">{post.title}</h1>
        <p className="mt-5 text-lg leading-8 text-[var(--text-secondary)]">
          <PaperText text={post.summary} />
        </p>
      </header>
      {post.body?.length ? (
        <div className="space-y-5">
          {post.body.map((paragraph) => (
            <p key={paragraph} className="leading-8">
              <PaperText text={paragraph} />
            </p>
          ))}
        </div>
      ) : (
        <p className="border-t border-[var(--border-default)] pt-6">Full post coming soon</p>
      )}
      {post.sources?.length ? (
        <section
          aria-labelledby="sources-title"
          className="border-t border-[var(--border-default)] pt-6"
        >
          <h2 id="sources-title" className="font-display text-3xl font-semibold">
            Sources
          </h2>
          <ul className="mt-3 space-y-2">
            {post.sources.map((source) => (
              <li key={source.href}>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center text-sm underline"
                >
                  {source.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </DetailShell>
  );
}
