import { afterEach, describe, expect, it, vi } from "vitest";
import { createProgram } from "../index.js";

function mockJsonResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fish command", () => {
  it("outputs ASCII art of a fish when called", () => {
    const output: string[] = [];
    const program = createProgram((message) => output.push(message));

    program.parse(["node", "app", "fish"]);

    expect(output).toEqual([
      [
        "      /\\",
        "   __/  \\__",
        "><_  ))))><",
        "   \\__/",
      ].join("\n"),
    ]);
  });
});

describe("joke command", () => {
  it("outputs a funny joke when called", () => {
    const output: string[] = [];
    const program = createProgram((message) => output.push(message));

    program.parse(["node", "app", "joke"]);

    expect(output).toEqual([
      "Why did the TypeScript developer go broke? Because they kept losing their cache!",
    ]);
  });
});

describe("hacker-news command", () => {
  it("outputs the top 10 Hacker News stories as a table", async () => {
    const output: string[] = [];
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/topstories.json")) {
        return mockJsonResponse([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      }

      const id = Number(url.match(/item\/(\d+)\.json$/)?.[1]);
      return mockJsonResponse({
        title: `Story ${id}`,
        score: id * 10,
        url: `https://example.com/story-${id}`,
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const program = createProgram((message) => output.push(message));

    await program.parseAsync(["node", "app", "hacker-news"]);

    expect(fetchMock).toHaveBeenCalledTimes(11);
    expect(output).toEqual([
      [
        "Top 10 Hacker News Stories",
        "+----+-------+----------+------------------------------+",
        "| #  | Score | Title    | URL                          |",
        "+----+-------+----------+------------------------------+",
        "| 1  | 10    | Story 1  | https://example.com/story-1  |",
        "| 2  | 20    | Story 2  | https://example.com/story-2  |",
        "| 3  | 30    | Story 3  | https://example.com/story-3  |",
        "| 4  | 40    | Story 4  | https://example.com/story-4  |",
        "| 5  | 50    | Story 5  | https://example.com/story-5  |",
        "| 6  | 60    | Story 6  | https://example.com/story-6  |",
        "| 7  | 70    | Story 7  | https://example.com/story-7  |",
        "| 8  | 80    | Story 8  | https://example.com/story-8  |",
        "| 9  | 90    | Story 9  | https://example.com/story-9  |",
        "| 10 | 100   | Story 10 | https://example.com/story-10 |",
        "+----+-------+----------+------------------------------+",
      ].join("\n"),
    ]);
  });
});
