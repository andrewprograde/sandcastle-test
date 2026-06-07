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

type TableCell = {
  value: string;
  width: number;
};

const HACKER_NEWS_API_BASE = "https://hacker-news.firebaseio.com/v0";
const DEFAULT_STORY_LIMIT = 10;
const MAX_TITLE_LENGTH = 60;
const MAX_URL_DISPLAY_LENGTH = 60;

export async function getTopHackerNewsStories(
  fetchImpl: FetchLike = fetch,
  limit = DEFAULT_STORY_LIMIT,
): Promise<HackerNewsStory[]> {
  const storyIds = await fetchTopStoryIds(fetchImpl);
  const selectedStoryIds = storyIds.slice(0, limit);
  const items = await Promise.all(
    selectedStoryIds.map((storyId) => fetchStoryItem(fetchImpl, storyId)),
  );

  return items.map((item, index) => ({
    rank: index + 1,
    title: item.title ?? "Untitled",
    score: item.score ?? 0,
    url: item.url ?? `https://news.ycombinator.com/item?id=${String(selectedStoryIds[index])}`,
  }));
}

export function formatHackerNewsStories(stories: HackerNewsStory[]): string {
  const rows = stories.map((story) => [
    textCell(String(story.rank)),
    textCell(String(story.score)),
    textCell(truncate(story.title, MAX_TITLE_LENGTH)),
    urlCell(story.url),
  ]);

  const table = [["#", "Score", "Title", "URL"].map(textCell), ...rows];
  const widths = table[0].map((_, columnIndex) =>
    Math.max(...table.map((row) => row[columnIndex].width)),
  );

  const border = `+${widths.map((width) => "-".repeat(width + 2)).join("+")}+`;
  const formatRow = (row: TableCell[]) =>
    `| ${row.map((cell, index) => cell.value + " ".repeat(widths[index] - cell.width)).join(" | ")} |`;

  return [
    "Top 10 Hacker News Stories",
    border,
    formatRow(table[0]),
    border,
    ...rows.map(formatRow),
    border,
  ].join("\n");
}

async function fetchTopStoryIds(fetchImpl: FetchLike): Promise<unknown[]> {
  const response = await fetchImpl(`${HACKER_NEWS_API_BASE}/topstories.json`);

  if (!response.ok) {
    throw new Error(`Failed to fetch Hacker News top stories: ${response.status}`);
  }

  const storyIds = await response.json();
  if (!Array.isArray(storyIds)) {
    throw new Error("Unexpected Hacker News top stories response");
  }

  return storyIds;
}

async function fetchStoryItem(fetchImpl: FetchLike, storyId: unknown): Promise<HackerNewsItem> {
  const response = await fetchImpl(`${HACKER_NEWS_API_BASE}/item/${String(storyId)}.json`);

  if (!response.ok) {
    throw new Error(`Failed to fetch Hacker News item ${String(storyId)}: ${response.status}`);
  }

  return parseHackerNewsItem(await response.json());
}

function parseHackerNewsItem(value: unknown): HackerNewsItem {
  if (!value || typeof value !== "object") {
    return {};
  }

  const item = value as Record<string, unknown>;

  return {
    title: typeof item.title === "string" ? item.title : undefined,
    score: typeof item.score === "number" ? item.score : undefined,
    url: typeof item.url === "string" ? item.url : undefined,
  };
}

function textCell(value: string): TableCell {
  return {
    value,
    width: value.length,
  };
}

function urlCell(url: string): TableCell {
  const displayUrl = truncate(url, MAX_URL_DISPLAY_LENGTH);

  return {
    value: hyperlink(url, displayUrl),
    width: displayUrl.length,
  };
}

function hyperlink(url: string, label: string): string {
  return `\u001B]8;;${url}\u0007${label}\u001B]8;;\u0007`;
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}
