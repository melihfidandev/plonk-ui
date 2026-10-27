"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useLocale } from "react-aria";
import { cn } from "../../lib/cn";
import { playJelly } from "../../motion/jelly";
import type { FieldProps } from "../field/Field";

/** Tek değer ya da `[başlangıç, bitiş]` aralığı. */
export type SliderValue = number | [number, number];

export interface SliderMark {
  value: number;
  /** Verilmezse değer, `formatOptions` ile biçimlenip yazılır. */
  label?: ReactNode;
}

export interface SliderProps<T extends SliderValue = number> extends Omit<
  FieldProps,
  "error"
> {
  value?: T;
  defaultValue?: T;
  /** Her değişimde (sürüklerken de) çağrılır. */
  onChange?: (value: T) => void;
  /** Sürükleme bitince ya da klavyeyle her adımda çağrılır (kaydetmek için). */
  onChangeEnd?: (value: T) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Sayı biçimi (`Intl.NumberFormat`), ör. `{ style: "currency", currency: "TRY" }`. */
  formatOptions?: Intl.NumberFormatOptions;
  /** Biçimi tamamen sen ver: `(v) => ["Low", "Mid", "High"][v]`. */
  formatValue?: (value: number) => string;
  /** Rayın altındaki işaretler: sayılar ya da `{ value, label }`. */
  marks?: (number | SliderMark)[];
  /** Tutamacın üstündeki değer etiketi: hep görünür ya da sadece kullanılırken. */
  valueBubble?: "always" | "active" | "never";
  /** Aralıkta iki tutamacın ekran okuyucu adları. */
  thumbLabels?: [string, string];
  /** Formla gönderilir; aralıkta aynı adla iki değer. */
  name?: string;
  isDisabled?: boolean;
  /** Görünür etiket yoksa zorunlu. */
  "aria-label"?: string;
  className?: string;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** Sticker tutamacının imlecin en fazla ne kadar gerisinde kalabileceği (px). */
const MAX_LAG = 18;

/**
 * Kaydırıcı: tek değer ya da iki tutamaçlı aralık. Sıfırdan yazıldı; fare,
 * dokunma ve klavye (oklar, PageUp/PageDown, Home/End) çalışır.
 *
 * Sticker'da tutamaç sürüklenirken hız yönünde jöle gibi uzar, değer etiketi
 * yaylı bir gecikmeyle izler ve eğilir. Retro'da tutamaç adım adım zıplar.
 * Fizik, `--plonk-jelly-amount` sıfırsa (Retro, azaltılmış hareket) kapalıdır.
 */
export function Slider<T extends SliderValue = number>({
  label,
  description,
  value: controlled,
  defaultValue,
  onChange,
  onChangeEnd,
  min = 0,
  max = 100,
  step = 1,
  formatOptions,
  formatValue,
  marks,
  valueBubble = "always",
  thumbLabels = ["Minimum", "Maximum"],
  name,
  isDisabled = false,
  "aria-label": ariaLabel,
  className,
}: SliderProps<T>) {
  const { locale, direction } = useLocale();
  const rtl = direction === "rtl";
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = description != null ? `${id}-description` : undefined;

  const [inner, setInner] = useState<SliderValue>(
    () => defaultValue ?? controlled ?? min,
  );
  const current = controlled ?? inner;
  const values = Array.isArray(current) ? current : [current];
  const range = Array.isArray(current);

  const number = useMemo(
    () => new Intl.NumberFormat(locale, formatOptions),
    [locale, formatOptions],
  );
  const format = useCallback(
    (v: number) => (formatValue ? formatValue(v) : number.format(v)),
    [formatValue, number],
  );

  const decimals = (String(step).split(".")[1] ?? "").length;
  const snap = (v: number) =>
    Number(
      clamp(Math.round((v - min) / step) * step + min, min, max).toFixed(
        decimals,
      ),
    );
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  // Hızlı sürüklemede birden çok olay tek render'a sığabilir; son değer burada.
  const latest = useRef(values);
  useLayoutEffect(() => {
    latest.current = values;
  });

  const commit = (i: number, raw: number, end: boolean) => {
    const next = [...latest.current];
    let v = snap(raw);
    if (range) v = i === 0 ? Math.min(v, next[1]!) : Math.max(v, next[0]!);
    const changed = v !== next[i];
    next[i] = v;
    const out = (range ? [next[0]!, next[1]!] : next[0]!) as T;
    if (changed) {
      latest.current = next;
      if (controlled === undefined) setInner(out);
      onChange?.(out);
      hop(i);
    }
    if (end) onChangeEnd?.(out);
  };

  // ---------- Hareket: Sticker fiziği, Retro zıplaması ----------
  const area = useRef<HTMLDivElement>(null);
  const thumbs = useRef<(HTMLDivElement | null)[]>([]);
  const physics = useSliderPhysics(area, thumbs, values, pct, rtl);
  const hop = (i: number) => {
    const knob =
      thumbs.current[i]?.querySelector<HTMLElement>(".plonk-slider-knob");
    if (!knob) return;
    knob.removeAttribute("data-hop");
    void knob.offsetWidth;
    knob.setAttribute("data-hop", "");
  };

  // ---------- Fare ve dokunma ----------
  const [dragging, setDragging] = useState(-1);
  const valueAt = (clientX: number) => {
    const r = area.current!.getBoundingClientRect();
    const f = clamp((clientX - r.left) / r.width, 0, 1);
    return min + (rtl ? 1 - f : f) * (max - min);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (isDisabled || e.button !== 0) return;
    e.preventDefault();
    const v = valueAt(e.clientX);
    // Aralıkta en yakın tutamaç; üst üsteyse tıklanan yöndeki.
    let i = 0;
    if (range) {
      const d0 = Math.abs(v - values[0]!);
      const d1 = Math.abs(v - values[1]!);
      i = d0 < d1 ? 0 : d1 < d0 ? 1 : v > values[1]! ? 1 : 0;
    }
    area.current!.setPointerCapture(e.pointerId);
    // Fareyle tutulunca odak halkası çıkmasın; klavyeye geçince yeniden çıkar.
    const knob = thumbs.current[i]?.querySelector<HTMLElement>("[role=slider]");
    knob?.setAttribute("data-pointer", "");
    knob?.focus();
    setDragging(i);
    physics.wake();
    commit(i, v, false);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging < 0) return;
    commit(dragging, valueAt(e.clientX), false);
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging < 0) return;
    const i = dragging;
    setDragging(-1);
    commit(i, valueAt(e.clientX), true);
    const knob =
      thumbs.current[i]?.querySelector<HTMLElement>(".plonk-slider-knob");
    if (knob) playJelly(knob, "pop");
  };

  // ---------- Klavye ----------
  const onKeyDown = (i: number) => (e: KeyboardEvent) => {
    if (isDisabled) return;
    const big = Math.max(step, Math.round((max - min) / 10 / step) * step);
    const side = rtl ? -1 : 1;
    const delta: Record<string, number> = {
      ArrowRight: step * side,
      ArrowLeft: -step * side,
      ArrowUp: step,
      ArrowDown: -step,
      PageUp: big,
      PageDown: -big,
    };
    let next: number | undefined;
    if (e.key in delta) next = values[i]! + delta[e.key]!;
    if (e.key === "Home") next = min;
    if (e.key === "End") next = max;
    if (next === undefined) return;
    e.preventDefault();
    e.currentTarget.removeAttribute("data-pointer");
    physics.wake();
    commit(i, next, true);
  };

  const p = values.map(pct);
  const fillStart = range ? p[0]! : 0;
  const fillEnd = range ? p[1]! : p[0]!;
  const text = values.map(format).join(" – ");

  return (
    <div
      data-disabled={isDisabled || undefined}
      className={cn("plonk-slider-field flex flex-col gap-1.5", className)}
    >
      {(label != null || valueBubble !== "always") && (
        <div className="flex items-baseline justify-between gap-3">
          {label != null && (
            <span
              id={labelId}
              className="text-sm font-bold text-plonk-ink"
              onClick={() =>
                thumbs.current[0]
                  ?.querySelector<HTMLElement>("[role=slider]")
                  ?.focus()
              }
            >
              {label}
            </span>
          )}
          <output
            aria-hidden="true"
            className="ml-auto text-sm font-bold text-plonk-ink tabular-nums"
          >
            {text}
          </output>
        </div>
      )}
      <div
        ref={area}
        data-bubble={valueBubble}
        data-dragging={dragging >= 0 || undefined}
        className="plonk-slider"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="plonk-slider-track">
          <div
            className="plonk-slider-fill"
            style={{
              insetInlineStart: `${fillStart}%`,
              width: `${fillEnd - fillStart}%`,
            }}
          />
        </div>
        {values.map((v, i) => (
          <div
            key={i}
            ref={(el) => {
              thumbs.current[i] = el;
            }}
            data-active={dragging === i || undefined}
            className="plonk-slider-thumb"
            style={{ insetInlineStart: `${p[i]}%` }}
          >
            <div
              role="slider"
              tabIndex={isDisabled ? undefined : 0}
              aria-valuemin={range && i === 1 ? values[0] : min}
              aria-valuemax={range && i === 0 ? values[1] : max}
              aria-valuenow={v}
              aria-valuetext={format(v)}
              aria-orientation="horizontal"
              aria-disabled={isDisabled || undefined}
              aria-label={range ? thumbLabels[i] : ariaLabel}
              aria-labelledby={
                label != null
                  ? range
                    ? `${labelId} ${id}-thumb-${i}`
                    : labelId
                  : undefined
              }
              id={`${id}-thumb-${i}`}
              aria-describedby={descriptionId}
              className="plonk-slider-knob"
              onKeyDown={onKeyDown(i)}
              onBlur={(e) => e.currentTarget.removeAttribute("data-pointer")}
            />
            {valueBubble !== "never" && (
              <div aria-hidden="true" className="plonk-slider-bubble">
                {format(v)}
              </div>
            )}
          </div>
        ))}
        {marks && (
          <div aria-hidden="true" className="plonk-slider-marks">
            {marks.map((m) => {
              const mark = typeof m === "number" ? { value: m } : m;
              return (
                <span
                  key={mark.value}
                  // Uçtakiler raya hizalanır, dışarı taşmaz.
                  data-edge={
                    mark.value <= min
                      ? "start"
                      : mark.value >= max
                        ? "end"
                        : undefined
                  }
                  className="plonk-slider-mark"
                  style={{ insetInlineStart: `${pct(mark.value)}%` }}
                >
                  {mark.label ?? format(mark.value)}
                </span>
              );
            })}
          </div>
        )}
      </div>
      {description != null && (
        <p id={descriptionId} className="text-sm text-plonk-ink-muted">
          {description}
        </p>
      )}
      {name &&
        values.map((v, i) => (
          <input key={i} type="hidden" name={name} value={v} />
        ))}
    </div>
  );
}

/**
 * Sticker fiziği. Tutamacın görünen konumu gerçek konumu yayla izler; aradaki
 * hız tutamacı uzatır, değer etiketi bir yay daha geriden gelip eğilir.
 * Değerler CSS değişkenlerine yazılır. Döngü sadece hareket varken çalışır ve
 * jöle miktarı 0 ise (Retro, azaltılmış hareket) hiç başlamaz.
 */
function useSliderPhysics(
  area: RefObject<HTMLDivElement | null>,
  thumbs: RefObject<(HTMLDivElement | null)[]>,
  values: number[],
  pct: (v: number) => number,
  rtl: boolean,
) {
  const state = useRef<{ x: number; bx: number; bv: number; s: number }[]>([]);
  const frame = useRef(0);
  const targets = useRef<number[]>([]);
  const sign = rtl ? -1 : 1;
  const tick = useRef<(now: number, last: number) => void>(() => {});

  const step = (now: number, last: number) => {
    const box = area.current;
    if (!box) return;
    const jelly = parseFloat(
      getComputedStyle(box).getPropertyValue("--plonk-jelly-amount"),
    );
    const width = box.offsetWidth;
    const k = 1 - Math.pow(0.7, (now - last) / 16.67);
    let moving = false;
    targets.current.forEach((t, i) => {
      const el = thumbs.current[i];
      if (!el) return;
      const target = (t / 100) * width;
      const st = (state.current[i] ??= { x: target, bx: target, bv: 0, s: 0 });
      if (!(jelly > 0)) {
        Object.assign(st, { x: target, bx: target, bv: 0, s: 0 });
      } else {
        const vx = (target - st.x) * k;
        // Tutamaç imleçten fazla kopmasın; hız hissini uzama verir.
        st.x = clamp(st.x + vx, target - MAX_LAG, target + MAX_LAG);
        st.bv = st.bv * 0.78 + (st.x - st.bx) * 0.16;
        st.bx += st.bv;
        const stretch = Math.min(Math.abs(vx) / 18, 0.45) * jelly;
        st.s += (stretch - st.s) * 0.35;
      }
      el.style.setProperty("--plonk-slider-lag", `${(st.x - target) * sign}px`);
      el.style.setProperty("--plonk-slider-stretch", st.s.toFixed(3));
      el.style.setProperty(
        "--plonk-slider-trail",
        `${(st.bx - st.x) * sign}px`,
      );
      el.style.setProperty(
        "--plonk-slider-sway",
        `${clamp(-st.bv * 1.6 * sign, -14, 14).toFixed(2)}deg`,
      );
      if (
        Math.abs(target - st.x) > 0.1 ||
        Math.abs(st.bx - st.x) > 0.1 ||
        Math.abs(st.bv) > 0.05 ||
        st.s > 0.002
      )
        moving = true;
    });
    if (moving) {
      frame.current = requestAnimationFrame((t) => tick.current(t, now));
    } else {
      frame.current = 0;
    }
  };

  useLayoutEffect(() => {
    targets.current = values.map(pct);
    tick.current = step;
  });

  const wake = useCallback(() => {
    if (frame.current) return;
    const now = performance.now();
    frame.current = requestAnimationFrame((t) => tick.current(t, now));
  }, []);

  // Değer dışarıdan (kontrollü) değişse de görünen konum yetişsin.
  const key = values.join(",");
  useEffect(() => {
    wake();
  }, [key, wake]);
  // İşaret de sıfırlanır: StrictMode effect'i kapatıp açınca döngü yeniden uyanabilsin.
  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    },
    [],
  );

  return { wake };
}
