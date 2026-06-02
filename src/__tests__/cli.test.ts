import { describe, expect, it } from "vitest";
import { createProgram } from "../index.js";

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
