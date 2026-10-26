"use client";

import {
  cn,
  contrastRatio,
  DEFAULT_PERSONALITY,
  MOTION_TOKENS,
  overshoot,
  PERSONALITY_NAMES,
  personalities,
  PlonkProvider,
  resolveEasing,
  sampleEasing,
  type ColorToken,
  type MotionToken,
  type PersonalityName,
} from "plonk";
import { useState, useSyncExternalStore, type CSSProperties } from "react";

// Tailwind'in sınıfları görebilmesi için tam adlarıyla.
const MOTION_CLASS: Record<MotionToken, string> = {
  press: "plonk-motion-press",
  spring: "plonk-motion-spring",
  snap: "plonk-motion-snap",
  enter: "plonk-motion-enter",
  exit: "plonk-motion-exit",
};

const SWATCHES: [ColorToken, ColorToken | null][] = [
  ["canvas", "ink"],
  ["surface", "ink"],
  ["primary", "onPrimary"],
  ["accent", "onAccent"],
  ["secondary", "onSecondary"],
  ["success", "onSuccess"],
  ["warning", "onWarning"],
  ["danger", "onDanger"],
  ["inkMuted", null],
  ["focus", null],
];

const cssVar = (token: ColorToken) =>
  `var(--plonk-color-${token.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)})`;

function restart(el: HTMLElement, className: string) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

// Kişilik adreste durur (/lab#retro), böylece doğrudan link verilebilir.
const subscribeHash = (onChange: () => void) => {
  addEventListener("hashchange", onChange);
  return () => removeEventListener("hashchange", onChange);
};
const readHash = (): PersonalityName => {
  const hash = location.hash.slice(1);
  return (PERSONALITY_NAMES as readonly string[]).includes(hash)
    ? (hash as PersonalityName)
    : DEFAULT_PERSONALITY;
};

export function MotionLab() {
  const name = useSyncExternalStore(
    subscribeHash,
    readHash,
    () => DEFAULT_PERSONALITY,
  );
  const [reduce, setReduce] = useState(false);
  const [jelly, setJelly] = useState<number | null>(null);
  const p = personalities[name];
  const jellyValue = jelly ?? p.jelly.amount;

  const choose = (n: PersonalityName) => {
    setJelly(null);
    history.replaceState(null, "", `#${n}`);
    dispatchEvent(new HashChangeEvent("hashchange"));
  };

  // Hareket azaltılmışken jöle ayarını uygulama; azaltma kuralı kazanmalı.
  const style =
    jelly !== null && !reduce
      ? ({ "--plonk-jelly-amount": String(jelly) } as CSSProperties)
      : undefined;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b-2 border-black bg-[#fafaf7]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <div className="mr-auto">
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-50">
              Aşama 1 · token&apos;lar ve hareket
            </p>
            <h1 className="text-xl font-black tracking-tight">Laboratuvar</h1>
          </div>

          <div
            role="radiogroup"
            aria-label="Kişilik"
            className="flex rounded-full border-2 border-black p-0.5"
          >
            {PERSONALITY_NAMES.map((n) => (
              <button
                key={n}
                role="radio"
                aria-checked={name === n}
                onClick={() => choose(n)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold",
                  name === n ? "bg-black text-white" : "hover:bg-black/5",
                )}
              >
                {personalities[n].label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3 text-sm font-semibold">
            Jöle
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.05}
              value={jellyValue}
              disabled={reduce}
              onChange={(e) => setJelly(Number(e.target.value))}
              className="w-32 accent-black"
            />
            <output className="w-10 font-mono tabular-nums">
              {reduce ? "0" : jellyValue.toFixed(2)}
            </output>
            {jelly !== null && (
              <button
                onClick={() => setJelly(null)}
                className="text-xs underline opacity-60"
              >
                varsayılan ({p.jelly.amount})
              </button>
            )}
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={reduce}
              onChange={(e) => setReduce(e.target.checked)}
              className="size-4 accent-black"
            />
            Hareketi azalt
          </label>
        </div>
      </header>

      <PlonkProvider
        personality={name}
        motion={reduce ? "reduce" : "system"}
        style={style}
        className="flex-1 bg-plonk-canvas"
      >
        <div className="mx-auto grid max-w-6xl gap-16 px-4 py-14">
          <section>
            <h2 className="font-plonk-display text-5xl leading-none">
              {p.label}
            </h2>
            <p className="mt-3 max-w-prose text-lg">{p.description}</p>
          </section>

          <Section
            title="Basma denemesi"
            note="Prototip. Gerçek Button ve Switch Aşama 2'de gelecek."
          >
            <PressDemo />
          </Section>

          <Section
            title="Hareket token'ları"
            note="Her token bir eğri ve bir süre. Oynat'a basıp karşılaştır."
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(Object.keys(MOTION_TOKENS) as MotionToken[]).map((k) => (
                <MotionCard
                  key={k}
                  token={k}
                  personality={name}
                  reduce={reduce}
                />
              ))}
            </div>
          </Section>

          <Section
            title="Renkler"
            note="Metin çiftlerinin hepsi en az 4.5:1 kontrastta (testlerle güvence altında)."
          >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {SWATCHES.map(([bg, fg]) => (
                <div
                  key={bg}
                  className="overflow-hidden rounded-plonk-md bg-plonk-surface plonk-shadow plonk-border"
                >
                  <div
                    className="flex h-20 items-end p-3 font-plonk-display text-2xl"
                    style={{
                      background: cssVar(bg),
                      color: fg ? cssVar(fg) : undefined,
                    }}
                  >
                    {fg ? "Aa" : ""}
                  </div>
                  <div className="border-t-(length:--plonk-border-width) border-plonk-ink p-3 text-sm">
                    <p className="font-bold">{bg}</p>
                    <p className="font-plonk-mono text-xs text-plonk-ink-muted">
                      {p.color[bg]}
                    </p>
                    {fg && (
                      <p className="mt-1 text-xs text-plonk-ink-muted">
                        {contrastRatio(p.color[bg], p.color[fg]).toFixed(1)}:1
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section
            title="Biçim"
            note="Çerçeve, gölge, köşe ve eğim token'ları."
          >
            <div className="flex flex-wrap items-end gap-6">
              {(["sm", "md", "lg"] as const).map((r, i) => (
                <div
                  key={r}
                  className={cn(
                    "grid size-28 place-items-center bg-plonk-surface font-bold plonk-shadow plonk-border",
                    r === "sm" && "rounded-plonk-sm",
                    r === "md" && "rounded-plonk-md",
                    r === "lg" && "rounded-plonk-lg",
                    i === 1 && "plonk-tilt",
                  )}
                >
                  radius-{r}
                </div>
              ))}
              <div className="grid h-28 w-44 plonk-tilt-reverse place-items-center rounded-plonk-md bg-plonk-accent font-bold text-plonk-on-accent plonk-shadow-lg plonk-border">
                shadow-lg + tilt
              </div>
              <span className="rounded-plonk-pill bg-plonk-success px-4 py-1 text-sm font-bold text-plonk-on-success plonk-border">
                pill
              </span>
            </div>
            <dl className="mt-6 grid max-w-md grid-cols-2 gap-x-6 gap-y-1 font-plonk-mono text-sm">
              <dt className="text-plonk-ink-muted">border-width</dt>
              <dd>{p.border.width}</dd>
              <dt className="text-plonk-ink-muted">shadow</dt>
              <dd>
                {p.shadow.x} {p.shadow.y}
              </dd>
              <dt className="text-plonk-ink-muted">tilt</dt>
              <dd>{p.tilt}</dd>
            </dl>
          </Section>
        </div>
      </PlonkProvider>
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="font-plonk-display text-3xl leading-none">{title}</h3>
      <p className="mt-2 mb-6 text-plonk-ink-muted">{note}</p>
      {children}
    </section>
  );
}

function PressDemo() {
  const [on, setOn] = useState(false);
  const pop = (e: React.PointerEvent<HTMLElement>) =>
    restart(e.currentTarget, "plonk-pop");
  const clear = (e: React.AnimationEvent<HTMLElement>) =>
    e.currentTarget.classList.remove("plonk-pop", "plonk-squish");

  return (
    <div className="flex flex-wrap items-center gap-8">
      <button
        onPointerUp={pop}
        onAnimationEnd={clear}
        className="plonk-pressable plonk-tilt rounded-plonk-md bg-plonk-primary px-7 py-3.5 font-plonk-display text-2xl text-plonk-on-primary plonk-border"
      >
        Bas bana
      </button>
      <button
        onPointerUp={pop}
        onAnimationEnd={clear}
        className="plonk-pressable plonk-tilt-reverse rounded-plonk-pill bg-plonk-surface px-6 py-3 font-bold plonk-border"
      >
        İkincil buton
      </button>

      <button
        role="switch"
        aria-checked={on}
        onClick={(e) => {
          setOn(!on);
          // İç katmanın sınıfı hiç değişmediği için React onu yeniden yazmaz.
          const squisher = e.currentTarget.querySelector("[data-squish]");
          if (squisher instanceof HTMLElement)
            restart(squisher, "plonk-squish");
        }}
        className={cn(
          "relative h-9 w-16 rounded-plonk-pill transition-colors plonk-border",
          on ? "bg-plonk-success" : "bg-plonk-surface",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 left-1 -mt-3 size-6 [transition-property:translate] plonk-motion-snap",
            on && "translate-x-[1.6rem]",
          )}
        >
          <span
            data-squish
            onAnimationEnd={clear}
            className="block size-full rounded-plonk-pill bg-plonk-accent plonk-border"
          />
        </span>
        <span className="sr-only">Bildirimler</span>
      </button>

      <div className="plonk-tilt-reverse rounded-plonk-lg bg-plonk-surface p-5 plonk-shadow plonk-border">
        <p className="font-plonk-display text-xl">Kart</p>
        <p className="text-sm text-plonk-ink-muted">
          tilt-reverse ile yapıştırılmış
        </p>
      </div>
    </div>
  );
}

function MotionCard({
  token,
  personality,
  reduce,
}: {
  token: MotionToken;
  personality: PersonalityName;
  reduce: boolean;
}) {
  const [on, setOn] = useState(false);
  const easing = personalities[personality].motion[token];
  const { duration } = resolveEasing(easing);
  const points = sampleEasing(easing, 100);
  const peak = Math.max(1.2, overshoot(easing) + 0.05);
  const W = 220;
  const H = 110;
  const path = points
    .map(
      ([t, v], i) =>
        `${i ? "L" : "M"}${(t * W).toFixed(1)},${(H - (v / peak) * H).toFixed(1)}`,
    )
    .join(" ");
  const target = H - H / peak;

  return (
    <div className="rounded-plonk-md bg-plonk-surface p-5 plonk-shadow plonk-border">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-plonk-display text-2xl">{token}</p>
        <p className="font-plonk-mono text-xs text-plonk-ink-muted">
          {easing.type} · {duration}ms
        </p>
      </div>
      <p className="mt-1 min-h-10 text-sm text-plonk-ink-muted">
        {MOTION_TOKENS[token]}
      </p>

      <svg
        viewBox={`-4 -4 ${W + 8} ${H + 8}`}
        className="mt-3 w-full"
        aria-hidden="true"
      >
        <line
          x1={0}
          x2={W}
          y1={target}
          y2={target}
          stroke="currentColor"
          strokeDasharray="4 4"
          opacity={0.3}
        />
        <line x1={0} x2={W} y1={H} y2={H} stroke="currentColor" opacity={0.2} />
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      </svg>

      <div className="relative mt-4 h-10 rounded-plonk-pill bg-plonk-canvas">
        <span
          className={cn(
            "absolute top-1 left-1 size-8 rounded-plonk-pill bg-plonk-primary [transition-property:translate] plonk-border",
            MOTION_CLASS[token],
          )}
          style={{ translate: on ? "9rem 0" : "0 0" }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setOn(!on)}
          className="plonk-pressable rounded-plonk-sm bg-plonk-primary px-4 py-1.5 text-sm font-bold text-plonk-on-primary plonk-border"
        >
          Oynat
        </button>
        {reduce && token !== "press" && (
          <span className="text-xs text-plonk-ink-muted">
            azaltılmış: 150ms
          </span>
        )}
      </div>
    </div>
  );
}
