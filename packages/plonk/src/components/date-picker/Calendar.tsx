"use client";

import {
  use,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { getDayOfWeek, toCalendarDate } from "@internationalized/date";
import { useLocale } from "react-aria";
import {
  Button as AriaButton,
  ButtonContext,
  Calendar as AriaCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarHeading,
  CalendarStateContext,
  RangeCalendar as AriaRangeCalendar,
  RangeCalendarStateContext,
  type CalendarCellRenderProps,
  type CalendarProps as AriaCalendarProps,
  type DateRange,
  type DateValue,
  type RangeCalendarProps as AriaRangeCalendarProps,
} from "react-aria-components";
import { cn } from "../../lib/cn";
import { Button } from "../button";

export interface CalendarProps<T extends DateValue> extends Omit<
  AriaCalendarProps<T>,
  "className" | "style" | "children"
> {
  className?: string;
}

/**
 * Tek gün seçilen takvim. Ok tuşlarıyla günler, PageUp/PageDown ile aylar
 * arasında gezilir (React Aria).
 *
 * Sticker'da masa takvimi: ileri giderken yaprak koparılıp düşer, seçilen
 * gün sticker olarak yapışır. Retro'da pencere: seçim ters renk, sayfa
 * kademeli kayar.
 */
export function Calendar<T extends DateValue>({
  className,
  ...props
}: CalendarProps<T>) {
  return (
    <AriaCalendar {...props} className={cn("plonk-calendar", className)}>
      <div className="plonk-cal-main">
        <CalendarBody range={false} />
      </div>
    </AriaCalendar>
  );
}

/** Aralık takviminin yanındaki hazır seçenek ("Son 7 gün" gibi). */
export interface CalendarPreset {
  label: ReactNode;
  /** Seçilecek aralık. Fonksiyon verilirse tıklandığı an hesaplanır. */
  range: DateRange | (() => DateRange);
}

export interface RangeCalendarProps<T extends DateValue> extends Omit<
  AriaRangeCalendarProps<T>,
  "className" | "style" | "children"
> {
  /** Takvimin yanında hazır aralık düğmeleri. */
  presets?: CalendarPreset[];
  className?: string;
}

/**
 * Başlangıç ve bitiş seçilen takvim. Sticker'da aralık fosforlu kalemle
 * çizilir; Retro'da araya noktalı desen dolar.
 */
export function RangeCalendar<T extends DateValue>({
  presets,
  className,
  ...props
}: RangeCalendarProps<T>) {
  return (
    <AriaRangeCalendar
      {...props}
      className={cn(
        "plonk-calendar",
        "plonk-calendar-range",
        presets?.length && "plonk-calendar-presets",
        className,
      )}
    >
      {presets?.length ? <Presets presets={presets} /> : null}
      <div className="plonk-cal-main">
        <CalendarBody range />
      </div>
    </AriaRangeCalendar>
  );
}

function Presets({ presets }: { presets: CalendarPreset[] }) {
  const state = use(RangeCalendarStateContext);
  // Takvimin içindeki düğmeler önceki/sonraki ay sayılır (slot ister);
  // hazır seçenekler sıradan düğme, bu yüzden o bağlam burada sıfırlanır.
  return (
    <ButtonContext value={null}>
      <div className="plonk-cal-presets">
        {presets.map((preset, i) => (
          <Button
            key={i}
            size="sm"
            variant="neutral"
            className="plonk-cal-preset"
            onPress={() => {
              const range =
                typeof preset.range === "function"
                  ? preset.range()
                  : preset.range;
              state?.setFocusedDate(toCalendarDate(range.end));
              state?.setValue(range);
            }}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </ButtonContext>
  );
}

function CalendarBody({ range }: { range: boolean }) {
  const single = use(CalendarStateContext);
  const ranged = use(RangeCalendarStateContext);
  const state = range ? ranged : single;
  const { locale } = useLocale();
  const stage = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLTableElement>(null);
  // Aralık seçilirken (ilk gün seçildi, ikincisi bekleniyor) uçlar henüz yapışmaz.
  const selecting = ranged?.anchorDate != null;

  usePageTurn(stage, grid, state?.visibleRange.start.toString() ?? "");

  return (
    <>
      <header className="plonk-cal-header">
        <span aria-hidden="true" className="plonk-cal-rings">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        <AriaButton slot="previous" className="plonk-cal-nav">
          <Arrow d="m15 6-6 6 6 6" />
        </AriaButton>
        <CalendarHeading className="plonk-cal-heading font-plonk-display" />
        <AriaButton slot="next" className="plonk-cal-nav">
          <Arrow d="m9 6 6 6-6 6" />
        </AriaButton>
      </header>
      <div ref={stage} className="plonk-cal-stage">
        <CalendarGrid
          ref={grid}
          weekdayStyle="short"
          className="plonk-cal-grid"
        >
          <CalendarGridHeader>
            {(day) => (
              <CalendarHeaderCell className="plonk-cal-dow">
                {day}
              </CalendarHeaderCell>
            )}
          </CalendarGridHeader>
          <CalendarGridBody>
            {(date) => (
              <CalendarCell date={date} className="plonk-cal-cell">
                {(cell) => (
                  <CellContent
                    cell={cell}
                    range={range}
                    selecting={selecting}
                    column={getDayOfWeek(date, locale)}
                  />
                )}
              </CalendarCell>
            )}
          </CalendarGridBody>
        </CalendarGrid>
      </div>
    </>
  );
}

function CellContent({
  cell,
  range,
  selecting,
  column,
}: {
  cell: CalendarCellRenderProps;
  range: boolean;
  selecting: boolean;
  column: number;
}) {
  const edge = range
    ? cell.isSelectionStart || cell.isSelectionEnd
    : cell.isSelected;
  return (
    <>
      {range && cell.isSelected && (
        <span
          aria-hidden="true"
          className="plonk-cal-hl"
          style={{ "--plonk-cal-col": column } as CSSProperties}
        />
      )}
      {edge && (
        <span
          // Aralık tamamlanınca uç yeniden doğar ve sticker olarak yapışır.
          key={selecting ? "pending" : "set"}
          aria-hidden="true"
          data-pending={selecting || undefined}
          className="plonk-cal-dot"
          style={{ "--plonk-cal-col": column } as CSSProperties}
        />
      )}
      {cell.isToday && (
        <svg
          aria-hidden="true"
          className="plonk-cal-today"
          viewBox="0 0 40 34"
          fill="none"
        >
          <path
            pathLength={1}
            d="M30 6C22 1 6 3 4 15c-2 12 16 17 26 13 9-4 10-16 2-22-5-3-12-3-17-2"
          />
        </svg>
      )}
      <span className="plonk-cal-num">{cell.formattedDate}</span>
    </>
  );
}

function Arrow({ d }: { d: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

/**
 * Ay değişince eski sayfanın hareketi. React eski ayı hemen kaldırdığı için
 * her render'dan sonra ızgaranın bir kopyası tutulur; ay değişince kopya
 * sahneye konur ve CSS'teki hareketi bitince silinir (Sticker'da koparılıp
 * düşen yaprak, Retro'da kayan sayfa). Yeni ızgara da `data-turn` ile girer.
 */
function usePageTurn(
  stage: RefObject<HTMLDivElement | null>,
  grid: RefObject<HTMLTableElement | null>,
  month: string,
) {
  const snapshot = useRef<HTMLTableElement | null>(null);
  const previous = useRef(month);

  useLayoutEffect(() => {
    const box = stage.current;
    const table = grid.current;
    if (!box || !table) return;

    const old = snapshot.current;
    if (old && previous.current !== month) {
      // "2026-10-01" biçimi sözlük sırasıyla da tarih sırasıdır.
      const dir = month > previous.current ? "next" : "prev";
      old.setAttribute("data-dir", dir);
      box.append(old);
      table.removeAttribute("data-turn");
      void table.offsetWidth;
      table.setAttribute("data-turn", dir);

      const remove = () => old.remove();
      const running = old.getAnimations();
      if (running.length === 0) remove();
      else Promise.all(running.map((a) => a.finished)).then(remove, remove);
      setTimeout(remove, 1500);
    }
    previous.current = month;

    const copy = table.cloneNode(true) as HTMLTableElement;
    copy.removeAttribute("data-turn");
    copy.classList.add("plonk-cal-old");
    copy.setAttribute("aria-hidden", "true");
    copy.setAttribute("inert", "");
    for (const el of [copy, ...copy.querySelectorAll("[id]")]) {
      el.removeAttribute("id");
    }
    snapshot.current = copy;
  });
}
