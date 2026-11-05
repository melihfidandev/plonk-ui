// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// npm paketin README'sini, GitHub kökteki README'yi gösterir; ikisi aynı kalmalı.
const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), "utf8");

describe("README", () => {
  it("is the same in the package and at the repository root", () => {
    expect(read("../../../../README.md")).toBe(read("../../README.md"));
  });
});
