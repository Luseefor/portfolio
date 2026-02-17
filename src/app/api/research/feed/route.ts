import { NextResponse } from 'next/server';
import { fetchResearchFeed } from '@/lib/research/feed';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawLimit = searchParams.get('limit');
    const parsedLimit = rawLimit ? Number(rawLimit) : undefined;
    const limit =
      parsedLimit !== undefined && Number.isFinite(parsedLimit) && parsedLimit > 0
        ? parsedLimit
        : undefined;

    const feed = await fetchResearchFeed(limit);
    return NextResponse.json(feed);
  } catch (error) {
    console.error('Research feed error:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch research feed.',
      },
      { status: 500 },
    );
  }
}
