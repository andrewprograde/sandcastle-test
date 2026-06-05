export type HackerNewsStory = {
  rank: number;
  title: string;
  score: number;
  url: string;
};

type HackerNewsItem = {
  title?: string;
  score?: number;
  url?: string;
};

type FetchLike = (input: string) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

const HACKER_NEWS_API_BASE = "https://hacker-news.firebaseio.com/v0";

export async function getTopHackerNewsStories(
  fetchImpl: FetchLike = fetch,
  limit = 10,
): Promise<HackerNewsStory[]> {
  const topStoriesResponse = await fetchImpl(`${HACKER_NEWS_API_BASE}/topstories.json`);

  if (!topStoriesResponse.ok) {
    throw new Error(`Failed to fetch Hacker News top stories: ${topStoriesResponse.status}`);
  }

  const storyIds = await topStoriesResponse.json();
  if (!Array.isArray(storyIds)) {
    throw new Error("Unexpected Hacker News top stories response");
  }

  const items = await Promise.all(
    storyIds.slice(0, limit).map(async (id) => {
      const itemResponse = await fetchImpl(`${HACKER_NEWS_API_BASE}/item/${id}.json`);
      if (!itemResponse.ok) {
        throw new Error(`Failed to fetch Hacker News item ${String(id)}: ${itemResponse.status}`);
      }
      return itemResponse.json() as Promise<HackerNewsItem>;
    }),
  );

  return items.map((item, index) => ({
    rank: index + 1,
    title: item.title ?? "Untitled",
    score: item.score ?? 0,
    url: item.url ?? `https://news.ycombinator.com/item?id=${String(storyIds[index])}`,
  }));
}

export function formatHackerNewsStories(stories: HackerNewsStory[]): string {
  const rows = stories.map((story) => [
    String(story.rank),
    String(story.score),
    truncate(story.title, 60),
    truncate(story.url, 50),
  ]);

  const table = [["#", "Score", "Title", "URL"], ...rows];
  const widths = table[0].map((_, columnIndex) =>
    Math.max(...table.map((row) => row[columnIndex].length)),
  );

  const border = `+${widths.map((width) => "-".repeat(width + 2)).join("+")}+`;
  const formatRow = (row: string[]) =>
    `| ${row.map((cell, index) => cell.padEnd(widths[index])).join(" | ")} |`;

  return [
    "Top 10 Hacker News Stories",
    border,
    formatRow(table[0]),
    border,
    ...rows.map(formatRow),
    border,
  ].join("\n");
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}
