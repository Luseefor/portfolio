import { NextResponse } from 'next/server';

type ActivityEvent = {
  id: string;
  actor: string;
  title: string;
  description: string;
  dateLabel: string;
  fullDate: string;
};

type GitHubContributionDay = {
  date: string;
  contributionCount: number;
};

type GitHubYearsResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionYears?: number[];
      };
    };
  };
  errors?: Array<{ message?: string }>;
};

type GitHubCalendarResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions?: number;
          weeks?: Array<{ contributionDays?: GitHubContributionDay[] }>;
        };
      };
    };
  };
  errors?: Array<{ message?: string }>;
};

type GitHubUserResponse = {
  public_repos?: number;
};

type GitHubEvent = {
  id: string;
  type: string;
  created_at: string;
  actor?: { login?: string };
  repo?: { name?: string };
  payload?: {
    size?: number;
    action?: string;
    number?: number;
    ref_type?: string;
    ref?: string;
  };
};

function formatMonthDay(dateInput: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(dateInput);
}

function formatDateLabel(dateInput: string, selectedYear: number): string {
  const date = new Date(dateInput);
  const now = new Date();
  if (selectedYear !== now.getUTCFullYear()) {
    return formatMonthDay(date).toUpperCase();
  }

  const diffMs = now.getTime() - date.getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return formatMonthDay(date).toUpperCase();
}

function getEventDetails(event: GitHubEvent): Pick<ActivityEvent, 'title' | 'description'> {
  const repo = event.repo?.name ?? 'repository';
  switch (event.type) {
    case 'PushEvent': {
      const count = event.payload?.size ?? 0;
      const plural = count === 1 ? '' : 's';
      return {
        title: 'Pushed commits',
        description: `${count} commit${plural} shipped to ${repo}.`,
      };
    }
    case 'PullRequestEvent': {
      const action = event.payload?.action ?? 'updated';
      const prNumber = event.payload?.number ? `#${event.payload.number}` : '';
      return {
        title: 'Pull request activity',
        description: `${action} pull request ${prNumber} in ${repo}.`.trim(),
      };
    }
    case 'CreateEvent': {
      const refType = event.payload?.ref_type ?? 'resource';
      const refName = event.payload?.ref ? ` ${event.payload.ref}` : '';
      return {
        title: `Created ${refType}`,
        description: `Started${refName} in ${repo}.`,
      };
    }
    case 'WatchEvent':
      return { title: 'Starred repository', description: `Starred ${repo}.` };
    case 'ForkEvent':
      return { title: 'Forked repository', description: `Forked ${repo}.` };
    case 'IssuesEvent': {
      const action = event.payload?.action ?? 'updated';
      return { title: 'Issue activity', description: `${action} an issue in ${repo}.` };
    }
    default:
      return {
        title: 'GitHub activity',
        description: `${event.type.replace(/Event$/, '')} in ${repo}.`,
      };
  }
}

function getYearBoundsUtc(year: number) {
  const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0));
  return { start, end };
}

function getWindowBoundsUtc(year: number) {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  if (year === currentYear) {
    const end = new Date(Date.UTC(currentYear, now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 364);
    return { start, end };
  }

  return getYearBoundsUtc(year);
}

function buildYearDays(year: number, graphDays: GitHubContributionDay[]) {
  const map = new Map(graphDays.map((day) => [day.date, day.contributionCount]));
  const { start, end } = getYearBoundsUtc(year);

  const days: Array<{ date: string; count: number }> = [];
  const cursor = new Date(start);
  while (cursor < end) {
    const isoDate = cursor.toISOString().slice(0, 10);
    days.push({ date: isoDate, count: map.get(isoDate) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

async function githubFetchJson<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'portfolio-identity-activity',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub request failed (${response.status}): ${body}`);
  }
  return (await response.json()) as T;
}

async function fetchEventsForYear(username: string, token: string, year: number) {
  const { start, end } = getYearBoundsUtc(year);
  const filtered: GitHubEvent[] = [];

  for (let page = 1; page <= 10; page += 1) {
    const pageEvents = await githubFetchJson<GitHubEvent[]>(
      `https://api.github.com/users/${username}/events/public?per_page=100&page=${page}`,
      token,
    );

    if (pageEvents.length === 0) {
      break;
    }

    let allOlderThanYear = true;
    for (const event of pageEvents) {
      const ts = new Date(event.created_at);
      if (ts >= start && ts < end) {
        filtered.push(event);
      }
      if (ts >= start) {
        allOlderThanYear = false;
      }
    }

    if (allOlderThanYear) {
      break;
    }
  }

  return filtered.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export async function GET(request: Request) {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  if (!username || !token) {
    return NextResponse.json(
      {
        message: 'Missing GITHUB_USERNAME or GITHUB_TOKEN.',
        selectedYear: null,
        availableYears: [],
        summary: { totalCommits: 0, activeDays: 0, activeRepos: 0, publicRepos: 0 },
        range: { from: null, to: null },
        heatmap: [],
        events: [],
      },
      { status: 500 },
    );
  }

  const nowYear = new Date().getUTCFullYear();
  const requestedYearRaw = Number(new URL(request.url).searchParams.get('year'));
  const requestedYear = Number.isFinite(requestedYearRaw) ? requestedYearRaw : nowYear;

  const yearsQuery = `
    query ActivityYears($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionYears
        }
      }
    }
  `;

  const calendarQuery = `
    query ActivityCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
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
      }
    }
  `;

  try {
    const yearsResponse = await githubFetchJson<GitHubYearsResponse>(
      'https://api.github.com/graphql',
      token,
      {
        method: 'POST',
        body: JSON.stringify({
          query: yearsQuery,
          variables: { login: username },
        }),
      },
    );

    if (yearsResponse.errors?.length) {
      throw new Error(
        yearsResponse.errors.map((error) => error.message).filter(Boolean).join('; '),
      );
    }

    const availableYearsRaw = yearsResponse.data?.user?.contributionsCollection?.contributionYears ?? [];
    const availableYears = [...availableYearsRaw].sort((a, b) => b - a);
    const selectedYear = availableYears.includes(requestedYear)
      ? requestedYear
      : (availableYears[0] ?? nowYear);

    const { start, end } = getWindowBoundsUtc(selectedYear);

    const [calendar, user, eventsRaw] = await Promise.all([
      githubFetchJson<GitHubCalendarResponse>('https://api.github.com/graphql', token, {
        method: 'POST',
        body: JSON.stringify({
          query: calendarQuery,
          variables: {
            login: username,
            from: start.toISOString(),
            to: end.toISOString(),
          },
        }),
      }),
      githubFetchJson<GitHubUserResponse>(`https://api.github.com/users/${username}`, token),
      fetchEventsForYear(username, token, selectedYear),
    ]);

    if (calendar.errors?.length) {
      throw new Error(calendar.errors.map((error) => error.message).filter(Boolean).join('; '));
    }

    const graphDays =
      calendar.data?.user?.contributionsCollection?.contributionCalendar?.weeks
        ?.flatMap((week) => week.contributionDays ?? []) ?? [];

    const days = buildYearDays(selectedYear, graphDays);
    const totalContributions =
      calendar.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions ?? 0;
    const activeDays = days.reduce((sum, day) => sum + (day.count > 0 ? 1 : 0), 0);
    const activeRepos = new Set(
      eventsRaw.map((event) => event.repo?.name).filter((repo): repo is string => Boolean(repo)),
    ).size;

    const events: ActivityEvent[] = eventsRaw.slice(0, 4).map((event) => {
      const details = getEventDetails(event);
      return {
        id: event.id,
        actor: event.actor?.login ?? username,
        title: details.title,
        description: details.description,
        dateLabel: formatDateLabel(event.created_at, selectedYear),
        fullDate: event.created_at,
      };
    });

    return NextResponse.json({
      selectedYear,
      availableYears,
      summary: {
        totalCommits: totalContributions,
        activeDays,
        activeRepos,
        publicRepos: user.public_repos ?? 0,
      },
      range: {
        from: days[0]?.date ?? null,
        to: days[days.length - 1]?.date ?? null,
      },
      heatmap: days,
      events,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'GitHub activity fetch failed.',
        selectedYear: null,
        availableYears: [],
        summary: { totalCommits: 0, activeDays: 0, activeRepos: 0, publicRepos: 0 },
        range: { from: null, to: null },
        heatmap: [],
        events: [],
      },
      { status: 502 },
    );
  }
}
