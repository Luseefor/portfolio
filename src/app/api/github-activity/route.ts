import { NextResponse } from 'next/server';

const GITHUB_USERNAME = process.env.GITHUB_USERNAME?.trim() || 'Luseefor';
const GITHUB_EVENTS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=30`;
const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

type GitHubEvent = {
  id: string;
  type: string;
  repo?: { name?: string };
  created_at?: string;
  payload?: Record<string, unknown>;
};

type ContributionDay = {
  contributionCount: number;
  date: string;
};

type GraphQLResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: ContributionDay[];
          }>;
        };
      };
      repositoriesContributedTo?: {
        nodes?: Array<{ nameWithOwner: string } | null>;
      };
    };
  };
  errors?: Array<{ message: string }>;
};

function summarizeEvent(event: GitHubEvent) {
  const repo = event.repo?.name ?? 'repository';
  const payload = event.payload ?? {};

  switch (event.type) {
    case 'PushEvent': {
      const size = typeof payload.size === 'number' ? payload.size : 0;
      return {
        title: `Pushed ${size || 'multiple'} ${size === 1 ? 'commit' : 'commits'} to ${repo}`,
        kind: 'Push',
      };
    }
    case 'PullRequestEvent': {
      const action = typeof payload.action === 'string' ? payload.action : 'updated';
      return {
        title: `${action[0]?.toUpperCase() ?? 'U'}${action.slice(1)} pull request in ${repo}`,
        kind: 'Pull request',
      };
    }
    case 'IssuesEvent': {
      const action = typeof payload.action === 'string' ? payload.action : 'updated';
      return {
        title: `${action[0]?.toUpperCase() ?? 'U'}${action.slice(1)} issue in ${repo}`,
        kind: 'Issue',
      };
    }
    case 'CreateEvent': {
      const refType = typeof payload.ref_type === 'string' ? payload.ref_type : 'resource';
      return {
        title: `Created ${refType} in ${repo}`,
        kind: 'Create',
      };
    }
    case 'DeleteEvent': {
      const refType = typeof payload.ref_type === 'string' ? payload.ref_type : 'resource';
      return {
        title: `Deleted ${refType} in ${repo}`,
        kind: 'Delete',
      };
    }
    case 'ReleaseEvent': {
      return {
        title: `Published release in ${repo}`,
        kind: 'Release',
      };
    }
    default:
      return {
        title: `${event.type.replace(/Event$/, '')} activity in ${repo}`,
        kind: event.type.replace(/Event$/, ''),
      };
  }
}

async function fetchGraphQLContributions(token: string) {
  const query = `
    query PortfolioContributionData($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
        repositoriesContributedTo(
          first: 1
          contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]
          orderBy: { field: PUSHED_AT, direction: DESC }
        ) {
          nodes {
            nameWithOwner
          }
        }
      }
    }
  `;

  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 27);

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'portfolio-site',
    },
    body: JSON.stringify({
      query,
      variables: {
        login: GITHUB_USERNAME,
        from: from.toISOString(),
        to: to.toISOString(),
      },
    }),
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as GraphQLResponse;
  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? 'GraphQL request failed.');
  }

  const calendar =
    payload.data?.user?.contributionsCollection?.contributionCalendar;
  const weeks = calendar?.weeks ?? [];
  const contributionDays = weeks.flatMap((week) => week.contributionDays).slice(-28);
  const totalContributions = calendar?.totalContributions ?? 0;
  const activeDays = contributionDays.filter((day) => day.contributionCount > 0).length;
  const topRepo =
    payload.data?.user?.repositoriesContributedTo?.nodes?.[0]?.nameWithOwner ?? null;
  const latestEvent =
    [...contributionDays].reverse().find((day) => day.contributionCount > 0)?.date ?? null;

  const dailyCounts = contributionDays.slice(-14).map((day) => ({
    date: day.date,
    count: day.contributionCount,
  }));

  let events: Array<{
    id: string;
    title: string;
    kind: string;
    repo: string | null;
    createdAt: string | null;
  }> = [];
  let recentTopRepo: string | null = null;

  try {
    const recent = await fetchPublicEvents();
    events = recent.events;
    recentTopRepo = recent.summary.topRepo;
  } catch {
    // Keep GraphQL summary/cadence even when public events lookup fails.
  }

  return {
    username: GITHUB_USERNAME,
    source: 'graphql',
    events,
    summary: {
      totalEvents: totalContributions,
      activeDays,
      topRepo: recentTopRepo ?? topRepo,
      latestEvent,
    },
    dailyCounts,
  };
}

async function fetchPublicEvents() {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'portfolio-site',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(GITHUB_EVENTS_URL, {
    headers,
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    throw new Error(`Public events request failed with status ${response.status}`);
  }

  const rawEvents = (await response.json()) as GitHubEvent[];
  const filteredEvents = rawEvents.filter((event) =>
    ['PushEvent', 'PullRequestEvent', 'IssuesEvent', 'CreateEvent', 'DeleteEvent', 'ReleaseEvent'].includes(
      event.type,
    ),
  );

  const events = filteredEvents.slice(0, 6).map((event) => {
    const summary = summarizeEvent(event);
    return {
      id: event.id,
      title: summary.title,
      kind: summary.kind,
      repo: event.repo?.name ?? null,
      createdAt: event.created_at ?? null,
    };
  });

  const today = new Date();
  const dailyCounts = Array.from({ length: 14 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (13 - index));
    const key = day.toISOString().slice(0, 10);
    return { date: key, count: 0 };
  });

  const dailyCountMap = new Map(dailyCounts.map((entry) => [entry.date, entry]));
  const repoFrequency = new Map<string, number>();

  for (const event of filteredEvents) {
    if (event.created_at) {
      const key = event.created_at.slice(0, 10);
      const dayEntry = dailyCountMap.get(key);
      if (dayEntry) dayEntry.count += 1;
    }

    const repoName = event.repo?.name;
    if (repoName) {
      repoFrequency.set(repoName, (repoFrequency.get(repoName) ?? 0) + 1);
    }
  }

  const activeDays = dailyCounts.filter((entry) => entry.count > 0).length;
  const totalEvents = filteredEvents.length;
  const latestEvent = filteredEvents[0]?.created_at ?? null;
  const topRepo =
    [...repoFrequency.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;

  return {
    username: GITHUB_USERNAME,
    source: 'events',
    events,
    summary: {
      totalEvents,
      activeDays,
      topRepo,
      latestEvent,
    },
    dailyCounts,
  };
}

export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const payload = token ? await fetchGraphQLContributions(token).catch(() => fetchPublicEvents()) : await fetchPublicEvents();

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('GitHub activity API error:', error);
    return NextResponse.json(
      { error: 'Unable to load GitHub activity right now.' },
      { status: 500 },
    );
  }
}
