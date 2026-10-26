/**
 * Hareket eğrileri. Yaylar gerçek bir sönümlü yay olarak simüle edilir ve
 * CSS `linear()` fonksiyonuna çevrilir; böylece JavaScript olmadan, sadece
 * CSS geçişleriyle fiziksel bir his elde edilir.
 */

export type Easing =
  | {
      type: "spring";
      /** Yayın bir salınımı kaç saniyede tamamladığı. Küçüldükçe hızlanır. */
      response: number;
      /** 0-1 arası sönüm. 1'de hiç aşma yok, küçüldükçe daha çok sekiyor. */
      damping: number;
    }
  | {
      type: "bezier";
      points: [number, number, number, number];
      /** ms */
      duration: number;
    }
  | {
      type: "steps";
      count: number;
      /** ms */
      duration: number;
    }
  | { type: "instant" };

export interface ResolvedEasing {
  /** CSS `transition-timing-function` değeri */
  easing: string;
  /** ms */
  duration: number;
}

// Hedefe bu kadar yaklaşınca yay "durdu" sayılır; daha küçüğü gözle görülmez.
const SETTLE = 0.004;

/** Durgun hâlden 1'e çekilen, kütlesi 1 olan yayın t saniyedeki konumu. */
export function springPosition(
  t: number,
  response: number,
  damping: number,
): number {
  const w0 = (2 * Math.PI) / response;
  if (damping < 1) {
    const wd = w0 * Math.sqrt(1 - damping * damping);
    const a = damping * w0;
    return (
      1 - Math.exp(-a * t) * (Math.cos(wd * t) + (a / wd) * Math.sin(wd * t))
    );
  }
  if (damping === 1) {
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  }
  const root = Math.sqrt(damping * damping - 1);
  const r1 = -w0 * (damping - root);
  const r2 = -w0 * (damping + root);
  return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
}

/** Yayın hedefe yerleşip durduğu süre (saniye). */
export function springDuration(response: number, damping: number): number {
  const w0 = (2 * Math.PI) / response;
  if (damping < 1) {
    const a = damping * w0;
    const wd = w0 * Math.sqrt(1 - damping * damping);
    const amplitude = Math.sqrt(1 + (a / wd) ** 2);
    return Math.log(amplitude / SETTLE) / a;
  }
  let t = 0;
  while (t < 5 && Math.abs(1 - springPosition(t, response, damping)) > SETTLE) {
    t += 0.001;
  }
  return t;
}

function cubicBezier([x1, y1, x2, y2]: [number, number, number, number]) {
  const bez = (s: number, a: number, b: number) =>
    3 * (1 - s) ** 2 * s * a + 3 * (1 - s) * s ** 2 * b + s ** 3;
  const slope = (s: number, a: number, b: number) =>
    3 * (1 - s) ** 2 * a + 6 * (1 - s) * s * (b - a) + 3 * s ** 2 * (1 - b);

  return (x: number) => {
    let s = x;
    for (let i = 0; i < 8; i++) {
      const d = slope(s, x1, x2);
      if (Math.abs(d) < 1e-6) break;
      s -= (bez(s, x1, x2) - x) / d;
    }
    // Newton sapıtırsa ikiye bölmeyle düzelt.
    if (s < 0 || s > 1 || Math.abs(bez(s, x1, x2) - x) > 1e-4) {
      let lo = 0;
      let hi = 1;
      s = x;
      for (let i = 0; i < 40; i++) {
        if (bez(s, x1, x2) < x) lo = s;
        else hi = s;
        s = (lo + hi) / 2;
      }
    }
    return bez(s, y1, y2);
  };
}

type Point = [number, number];

/** Ramer-Douglas-Peucker: eğriyi bozmadan gereksiz noktaları atar. */
function simplify(points: Point[], tolerance: number): Point[] {
  if (points.length < 3) return points;
  const [ax, ay] = points[0]!;
  const [bx, by] = points[points.length - 1]!;
  const len = Math.hypot(bx - ax, by - ay);
  let maxDist = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i]!;
    const dist =
      Math.abs((by - ay) * px - (bx - ax) * py + bx * ay - by * ax) / len;
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }
  if (maxDist <= tolerance) return [points[0]!, points[points.length - 1]!];
  const left = simplify(points.slice(0, index + 1), tolerance);
  const right = simplify(points.slice(index), tolerance);
  return [...left.slice(0, -1), ...right];
}

const round = (n: number, digits: number) => {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
};

/** Eğriyi çizmek için 0-1 zaman aralığında örnek noktalar. */
export function sampleEasing(easing: Easing, count = 120): Point[] {
  const ts = Array.from({ length: count + 1 }, (_, i) => i / count);
  switch (easing.type) {
    case "spring": {
      const total = springDuration(easing.response, easing.damping);
      return ts.map((t) => [
        t,
        springPosition(t * total, easing.response, easing.damping),
      ]);
    }
    case "bezier": {
      const fn = cubicBezier(easing.points);
      return ts.map((t) => [t, fn(t)]);
    }
    case "steps":
      return ts.map((t) => [
        t,
        t >= 1 ? 1 : Math.floor(t * easing.count) / easing.count,
      ]);
    case "instant":
      return ts.map((t) => [t, 1]);
  }
}

/** Easing tanımını CSS'te kullanılacak eğri + süre ikilisine çevirir. */
export function resolveEasing(easing: Easing): ResolvedEasing {
  switch (easing.type) {
    case "spring": {
      const points = simplify(sampleEasing(easing, 160), 0.0015);
      const stops = points.map(([t, x], i) => {
        if (i === 0) return "0";
        if (i === points.length - 1) return "1";
        return `${round(x, 3)} ${round(t * 100, 2)}%`;
      });
      return {
        easing: `linear(${stops.join(", ")})`,
        duration: Math.round(
          springDuration(easing.response, easing.damping) * 1000,
        ),
      };
    }
    case "bezier":
      return {
        easing: `cubic-bezier(${easing.points.join(", ")})`,
        duration: easing.duration,
      };
    case "steps":
      return {
        easing: `steps(${easing.count}, end)`,
        duration: easing.duration,
      };
    case "instant":
      return { easing: "linear", duration: 0 };
  }
}

/** Yay eğrisinin en yüksek noktası; 1'in üstü hedefi ne kadar aştığını gösterir. */
export function overshoot(easing: Easing): number {
  return Math.max(...sampleEasing(easing).map(([, x]) => x));
}
