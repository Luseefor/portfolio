import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
        <p className="mt-5 text-lg leading-8 text-[var(--text-secondary)]">{post.summary}</p>
      </header>
      {post.body?.length ? (
        <div className="space-y-5">
          {post.body.map((paragraph) => (
            <p key={paragraph} className="leading-8">
              {paragraph}
            </p>
          ))}
        </div>
      ) : (
        <p className="border-t border-[var(--border-default)] pt-6">Full post coming soon</p>
      )}
    </DetailShell>
  );
}
