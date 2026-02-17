import { readSourceConfigs } from '@/lib/research/sourceStore';
import { fetchSource } from '@/lib/research/sourceFetch';
import type { FeedResponse, ResearchItem, SourceFailure } from '@/lib/research/types';

function dedupeAndSort(items: ResearchItem[]): ResearchItem[] {
  const deduped = new Map<string, ResearchItem>();

  items.forEach((item) => {
    const key = item.url.toLowerCase();
    if (!deduped.has(key)) {
      deduped.set(key, item);
      return;
    }

    const existing = deduped.get(key);
    if (!existing) return;

    const existingTime = existing.publishedAt ? Date.parse(existing.publishedAt) : Number.NaN;
    const candidateTime = item.publishedAt ? Date.parse(item.publishedAt) : Number.NaN;
    if (!Number.isNaN(candidateTime) && (Number.isNaN(existingTime) || candidateTime > existingTime)) {
      deduped.set(key, item);
    }
  });

  return [...deduped.values()].sort((a, b) => {
    const aTime = a.publishedAt ? Date.parse(a.publishedAt) : Number.NaN;
    const bTime = b.publishedAt ? Date.parse(b.publishedAt) : Number.NaN;

    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
    if (Number.isNaN(aTime)) return 1;
    if (Number.isNaN(bTime)) return -1;
    return bTime - aTime;
  });
}

export async function fetchResearchFeed(limit?: number): Promise<FeedResponse> {
  const allSources = await readSourceConfigs();
  const enabledSources = allSources
    .filter((source) => source.enabled)
    .sort((a, b) => a.priority - b.priority);

  const results = await Promise.all(enabledSources.map((source) => fetchSource(source)));

  const allItems: ResearchItem[] = [];
  const partialFailures: SourceFailure[] = [];
  let successfulSources = 0;

  results.forEach((result) => {
    if (result.failure) {
      partialFailures.push(result.failure);
      return;
    }

    successfulSources += 1;
    allItems.push(...result.items);
  });

  const sortedItems = dedupeAndSort(allItems);
  const limitedItems = typeof limit === 'number' && limit > 0 ? sortedItems.slice(0, limit) : sortedItems;

  return {
    items: limitedItems,
    meta: {
      fetchedAt: new Date().toISOString(),
      partialFailures,
      totalSources: enabledSources.length,
      successfulSources,
    },
  };
}
