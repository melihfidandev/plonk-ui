import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("koşullu sınıfları birleştirir", () => {
    const active = false;
    expect(cn("a", active && "b", { c: true, d: false })).toBe("a c");
  });

  it("çakışan Tailwind sınıflarında sonuncuyu bırakır", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});
