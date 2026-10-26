// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  overshoot,
  resolveEasing,
  sampleEasing,
  springDuration,
  springPosition,
} from "./easing";

describe("springPosition", () => {
  it("0'dan başlar ve 1'e yerleşir", () => {
    const end = springDuration(0.4, 0.5);
    expect(springPosition(0, 0.4, 0.5)).toBeCloseTo(0, 6);
    expect(springPosition(end, 0.4, 0.5)).toBeCloseTo(1, 2);
  });

  it("sönüm azaldıkça hedefi daha çok aşar", () => {
    const soft = overshoot({ type: "spring", response: 0.4, damping: 0.4 });
    const firm = overshoot({ type: "spring", response: 0.4, damping: 0.7 });
    expect(soft).toBeGreaterThan(firm);
    expect(firm).toBeGreaterThan(1);
  });

  it("kritik ve aşırı sönümde hedefi hiç aşmaz", () => {
    expect(
      overshoot({ type: "spring", response: 0.4, damping: 1 }),
    ).toBeLessThanOrEqual(1);
    expect(
      overshoot({ type: "spring", response: 0.4, damping: 1.4 }),
    ).toBeLessThanOrEqual(1);
  });
});

describe("resolveEasing", () => {
  it("yayı 0 ile başlayıp 1 ile biten bir linear() eğrisine çevirir", () => {
    const { easing, duration } = resolveEasing({
      type: "spring",
      response: 0.42,
      damping: 0.52,
    });
    expect(easing).toMatch(/^linear\(0, .+, 1\)$/);
    expect(duration).toBeGreaterThan(300);
    expect(duration).toBeLessThan(2000);
  });

  it("linear() eğrisini makul sayıda noktaya indirir", () => {
    const { easing } = resolveEasing({
      type: "spring",
      response: 0.42,
      damping: 0.52,
    });
    const stops = easing.split(",").length;
    expect(stops).toBeGreaterThan(8);
    expect(stops).toBeLessThan(60);
  });

  it("basamaklı ve anlık hareketi CSS karşılıklarına çevirir", () => {
    expect(resolveEasing({ type: "steps", count: 3, duration: 240 })).toEqual({
      easing: "steps(3, end)",
      duration: 240,
    });
    expect(resolveEasing({ type: "instant" })).toEqual({
      easing: "linear",
      duration: 0,
    });
  });
});

describe("sampleEasing", () => {
  it("bezier eğrisini uçlarda 0 ve 1 verecek şekilde örnekler", () => {
    const points = sampleEasing({
      type: "bezier",
      points: [0.3, 0.7, 0.4, 1],
      duration: 70,
    });
    expect(points[0]![1]).toBeCloseTo(0, 3);
    expect(points.at(-1)![1]).toBeCloseTo(1, 3);
  });

  it("basamaklı eğriyi eşit basamaklara böler", () => {
    const values = new Set(
      sampleEasing({ type: "steps", count: 3, duration: 240 }).map(
        ([, v]) => v,
      ),
    );
    expect([...values].sort()).toEqual([0, 1 / 3, 2 / 3, 1]);
  });
});
