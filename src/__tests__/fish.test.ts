import { describe, expect, it } from "vitest";
import { getFishAsciiArt } from "../fish.js";

describe("getFishAsciiArt", () => {
  it("returns ASCII art of a fish", () => {
    expect(getFishAsciiArt()).toBe(
      [
        "      /\\",
        "   __/  \\__",
        "><_  ))))><",
        "   \\__/",
      ].join("\n"),
    );
  });
});
