"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Button,
  PERSONALITY_NAMES,
  PlonkProvider,
  personalities,
  type PersonalityName,
} from "plonk-ui";
import { PERSONALITY_LABELS } from "../Exhibit";
import { DOTS, motionLine, reduceMotion, useReducedMotion } from "./motion";

/** Kendiliğinden dönüşte bir kişiliğin ekranda kalma süresi. */
const CYCLE = 3600;
/** Pafta ölçeği: eser 2:1 çizilir. */
const SCALE = 2;

const path = (d: string, cls = "") =>
  `<path pathLength="1" class="${cls}" d="${d}"/>`;

/** Ölçü yazısı; arkasında zemin renginde küçük bir kutu (çizgiler altından geçmesin). */
function label(
  x: number,
  y: number,
  text: string,
  anchor: "middle" | "start" | "end" = "middle",
) {
  const w = text.length * 7.4 + 10;
  const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  const tx = anchor === "middle" ? x : anchor === "end" ? x - 5 : x + 5;
  return `<rect x="${x0}" y="${y - 10}" width="${w}" height="15"/><text x="${tx}" y="${y + 1}" text-anchor="${anchor}">${text}</text>`;
}

/**
 * Eserin teknik çizimi: genişlik, yükseklik, köşe, çizgi kalınlığı ve gölge
 * gerçek düğmeden ölçülür, ölçü çizgileri olarak çizilir.
 */
function drawing(stage: HTMLElement, name: PersonalityName): string {
  const button = stage.querySelector<HTMLElement>(".plonk-button");
  if (!button) return "";
  const s = stage.getBoundingClientRect();
  const b = button.getBoundingClientRect();
  const cs = getComputedStyle(button);
  const { shadow } = personalities[name];
  const sx = parseFloat(shadow.x) * SCALE;
  const sy = parseFloat(shadow.y) * SCALE;
  const r = parseFloat(cs.borderTopLeftRadius);
  const bw = parseFloat(cs.borderTopWidth);
  const x = b.left - s.left;
  const y = b.top - s.top;
  const w = b.width;
  const h = b.height;
  const top = y - 26;
  const left = x - 26;
  const t = 5;
  const rad = Math.min(r * SCALE, h / 2);
  const radius = r * SCALE >= h / 2 ? "R PILL" : `R${Math.round(r)}`;
  let svg = "";
  // Genişlik ve yükseklik
  svg += path(`M${x} ${y - 6}V${top - 6}M${x + w} ${y - 6}V${top - 6}`, "ext");
  svg += path(
    `M${x} ${top}H${x + w}M${x} ${top - t}V${top + t}M${x + w} ${top - t}V${top + t}`,
  );
  svg += label(x + w / 2, top - 8, `${Math.round(w / SCALE)} PX`);
  svg += path(
    `M${x - 6} ${y}H${left - 6}M${x - 6} ${y + h}H${left - 6}`,
    "ext",
  );
  svg += path(
    `M${left} ${y}V${y + h}M${left - t} ${y}H${left + t}M${left - t} ${y + h}H${left + t}`,
  );
  svg += label(left - 4, y + h / 2 + 4, `${Math.round(h / SCALE)}`, "end");
  // Köşe
  svg += path(
    `M${x + rad * 0.29} ${y + rad * 0.29}L${x - 18} ${top - 26}H${x - 40}`,
  );
  svg += label(x - 40, top - 26, radius, "end");
  // Mürekkep (çizgi kalınlığı)
  svg += path(
    `M${x + w * 0.2} ${y + h}L${x + w * 0.1} ${y + h + 34}H${x - 30}`,
  );
  svg += label(x - 30, y + h + 34, `INK ${bw}`, "end");
  // Gölge: yer varsa sağa, yoksa aşağıdan sola
  const gx = x + w + sx - 2;
  const gy = y + h + sy - 2;
  const text = `SHADOW ${sx / SCALE}/${sy / SCALE}`;
  if (gx + 40 + text.length * 7.4 + 10 < s.width - 12) {
    svg += path(`M${gx} ${gy}L${gx + 16} ${gy + 26}H${gx + 30}`);
    svg += label(gx + 30, gy + 26, text, "start");
  } else {
    svg += path(`M${gx} ${gy}L${gx + 10} ${gy + 42}H${gx - 12}`);
    svg += label(gx - 12, gy + 42, text, "end");
  }
  return svg;
}

/**
 * Hero'daki pafta: tek bir düğme ölçüleriyle çizilir; antetteki sekmeler
 * kişiliği değiştirir. Dokunulana kadar dört kişilik kendiliğinden döner
 * (pafta ekrandayken, hareket azaltılmamışsa).
 */
export function Specimen() {
  const [name, setName] = useState<PersonalityName>("sticker");
  const [auto, setAuto] = useState(true);
  const [visible, setVisible] = useState(true);
  const reduce = useReducedMotion();
  const sheet = useRef<HTMLElement>(null);
  const dims = useRef<SVGSVGElement>(null);
  const cycling = auto && visible && !reduce;

  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(Boolean(entry?.isIntersecting)),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!cycling) return;
    const timer = setTimeout(() => {
      const i = PERSONALITY_NAMES.indexOf(name);
      setName(PERSONALITY_NAMES[(i + 1) % PERSONALITY_NAMES.length]!);
    }, CYCLE);
    return () => clearTimeout(timer);
  }, [cycling, name]);

  // Kişilik değişince: çizgiler silinir, eser girişini bitirince ölçülüp yeniden çizilir.
  useEffect(() => {
    const svg = dims.current;
    const stage =
      sheet.current?.querySelector<HTMLElement>(".site-sheet-stage");
    if (!svg || !stage) return;
    svg.removeAttribute("data-drawn");
    const measure = () => {
      svg.innerHTML = drawing(stage, name);
    };
    let frame = 0;
    const timer = setTimeout(
      () => {
        document.fonts.ready.then(() => {
          measure();
          frame = requestAnimationFrame(() =>
            requestAnimationFrame(() => svg.setAttribute("data-drawn", "")),
          );
        });
      },
      reduceMotion() ? 50 : 560,
    );
    addEventListener("resize", measure);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      removeEventListener("resize", measure);
    };
  }, [name]);

  const stop = () => setAuto(false);

  return (
    <figure
      ref={sheet}
      className="site-sheet"
      data-auto={cycling || undefined}
      style={{ "--cycle": `${CYCLE}ms` } as CSSProperties}
    >
      <PlonkProvider
        personality={name}
        toaster={false}
        className="site-sheet-stage"
      >
        <div className="site-scale">
          {/* key: kişilik değişince eser yeniden "basılır". */}
          <div key={name} className="site-in">
            <Button onPress={stop}>Plonk!</Button>
          </div>
        </div>
        <svg ref={dims} className="site-dims" aria-hidden="true" />
      </PlonkProvider>
      <div className="site-titleblock">
        <div className="tabs" role="group" aria-label="Personality">
          {PERSONALITY_NAMES.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={n === name}
              style={{ "--dot": DOTS[n] } as CSSProperties}
              onClick={() => {
                stop();
                setName(n);
              }}
            >
              <i aria-hidden="true" />
              {PERSONALITY_LABELS[n]}
            </button>
          ))}
        </div>
        <div>
          <small>Part</small>
          <b>Button</b>
        </div>
        <div>
          <small>Scale</small>
          <b>2 : 1</b>
        </div>
        <div>
          <small>Motion</small>
          <b className="small">{motionLine(name)}</b>
        </div>
        <div>
          <small>Sheet</small>
          <b>0{PERSONALITY_NAMES.indexOf(name) + 1} / 04</b>
        </div>
      </div>
    </figure>
  );
}
