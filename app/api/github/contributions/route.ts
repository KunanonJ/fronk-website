import { NextResponse } from "next/server";
import {
  GITHUB_CONTRIBUTIONS_LOGIN,
  emptyContributionCalendar,
  normalizeContributionCalendar,
  parseGithubContributionsHtml,
  type ContributionCalendar,
} from "@/lib/github/contributions";

const QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
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

type GhResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: {
            contributionDays: { date: string; contributionCount: number }[];
          }[];
        };
      };
    };
  };
  errors?: { message: string }[];
};

async function fetchViaGraphql(): Promise<ContributionCalendar | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { login: GITHUB_CONTRIBUTIONS_LOGIN },
    }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;

  const json = (await res.json()) as GhResponse;
  const calendar =
    json.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar?.weeks?.length) return null;

  return normalizeContributionCalendar(
    calendar.weeks,
    calendar.totalContributions,
  );
}

/** Public profile contributions SVG/HTML — no token required. */
async function fetchViaPublicHtml(): Promise<ContributionCalendar | null> {
  const res = await fetch(
    `https://github.com/users/${GITHUB_CONTRIBUTIONS_LOGIN}/contributions`,
    {
      headers: {
        Accept: "text/html",
        "User-Agent": "kunanonj-website-activity",
      },
      next: { revalidate: 3600 },
    },
  );

  if (!res.ok) return null;

  const html = await res.text();
  const calendar = parseGithubContributionsHtml(html);
  if (calendar.weeks.length === 0) return null;
  return calendar;
}

async function fetchCalendar(): Promise<ContributionCalendar> {
  const fromGraphql = await fetchViaGraphql();
  if (fromGraphql) return fromGraphql;

  const fromHtml = await fetchViaPublicHtml();
  if (fromHtml) return fromHtml;

  return emptyContributionCalendar();
}

export async function GET() {
  try {
    const calendar = await fetchCalendar();
    return NextResponse.json(calendar, {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(emptyContributionCalendar(), {
      status: 200,
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=3600",
      },
    });
  }
}
