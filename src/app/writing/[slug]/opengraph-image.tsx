import { notFound } from 'next/navigation';
import { getWritingPost, getWritingPosts } from '@/lib/writing';
import { socialImage } from '@/lib/social-image';
export const alt = 'Engineering notes by Rijan Ghimire';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export function generateStaticParams() {
  return getWritingPosts().map(({ slug }) => ({ slug }));
}
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getWritingPost((await params).slug);
  if (!post) notFound();
  return socialImage(post.title, post.dateLabel);
}
