import { describe, it, expect } from "vitest";
import { greet } from "../greet.js";

describe("greet", () => {
  it("returns a greeting with the given name", () => {
    expect(greet("World")).toBe("Hello, World!");
  });

  it("returns a greeting with a different name", () => {
    expect(greet("TypeScript")).toBe("Hello, TypeScript!");
  });
});
