"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  mergeProps,
  useFocusWithin,
  useHover,
  useToast,
  useToastRegion,
} from "react-aria";
import {
  Button as AriaButton,
  type QueuedToast,
  type ToastState,
} from "react-aria-components";
import { playPressEffect } from "../../motion/effects";
import { Button } from "../button";
import { CloseIcon } from "../card/CloseIcon";
import { toastQueue, type ToastContent, type ToastVariant } from "./queue";

export type ToastPlacement =
  "top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end";

type Queued = QueuedToast<ToastContent>;

interface Item {
  toast: Queued;
  exiting: boolean;
}

const NO_TOASTS: Queued[] = [];
const subscribe = (fn: () => void) => toastQueue.subscribe(fn);
const getSnapshot = () => toastQueue.visibleToasts;
const getServerSnapshot = () => NO_TOASTS;

/** The state object React Aria hooks expect, from the shared queue. */
function useQueueState(): ToastState<ToastContent> {
  const visibleToasts = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return {
    visibleToasts,
    add: (content, options) => toastQueue.add(content, options),
    close: (key) => toastQueue.close(key),
    pauseAll: () => toastQueue.pauseAll(),
    resumeAll: () => toastQueue.resumeAll(),
  };
}

/**
 * React Aria removes a closed toast from the queue right away. We keep it in the
 * list as "exiting" until its exit motion (peel, fold) finishes. New toasts are added
 * at the start of the DOM; existing ones don't move, otherwise the browser would restart
 * their animations.
 */
function merge(items: Item[], visible: Queued[]): Item[] {
  const live = new Map(visible.map((t) => [t.key, t]));
  const known = new Set(items.map((i) => i.toast.key));
  const added = visible
    .filter((t) => !known.has(t.key))
    .map((toast) => ({ toast, exiting: false }));
  const kept = items.map((item) => {
    const toast = live.get(item.toast.key);
    return toast ? { toast, exiting: false } : { ...item, exiting: true };
  });
  return [...added, ...kept];
}

export interface ToasterProps {
  /** Container the region opens in (the provider's layer container). */
  container: HTMLElement | null;
  placement?: ToastPlacement;
}

/**
 * Notification region. `PlonkProvider` opens it automatically; not used
 * directly.
 */
export function Toaster({ container, placement = "bottom-end" }: ToasterProps) {
  const state = useQueueState();
  const [items, setItems] = useState<Item[]>(() =>
    merge([], state.visibleToasts),
  );
  const [seen, setSeen] = useState(state.visibleToasts);
  // Kuyruk değişince listeyi render sırasında güncelle (effect'te değil).
  if (seen !== state.visibleToasts) {
    setSeen(state.visibleToasts);
    setItems(merge(items, state.visibleToasts));
  }

  const onExited = useCallback((key: string) => {
    setItems((current) => current.filter((i) => i.toast.key !== key));
  }, []);

  if (!container || items.length === 0) return null;
  return createPortal(
    <Region
      state={state}
      items={items}
      placement={placement}
      onExited={onExited}
    />,
    container,
  );
}

function Region({
  state,
  items,
  placement,
  onExited,
}: {
  state: ToastState<ToastContent>;
  items: Item[];
  placement: ToastPlacement;
  onExited: (key: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const slots = useRef(new Map<string, HTMLDivElement>());
  const { regionProps } = useToastRegion({}, state, ref);
  const { hoverProps, isHovered } = useHover({});
  const [isFocusWithin, setFocusWithin] = useState(false);
  const { focusWithinProps } = useFocusWithin({
    onFocusWithinChange: setFocusWithin,
  });
  const [isDragging, setDragging] = useState(false);

  // Sürükleme bitince süreler, fare ya da odak bölgede değilse devam eder.
  const settled = useRef({ isHovered, isFocusWithin });
  useLayoutEffect(() => {
    settled.current = { isHovered, isFocusWithin };
  });
  const onDragChange = useCallback(
    (dragging: boolean) => {
      setDragging(dragging);
      if (dragging) state.pauseAll();
      else if (!settled.current.isHovered && !settled.current.isFocusWithin)
        state.resumeAll();
    },
    [state],
  );

  /*
   * Liste yerleşimi: her toast, kenara yakın olanların yükseklikleri kadar
   * kaydırılır. Konum CSS değişkeninde, geçiş CSS'te (yay). Çıkan toast
   * yerinde kalır, diğerleri boşluğu kapatır.
   */
  const layout = useCallback(() => {
    const region = ref.current;
    if (!region) return;
    const sign = placement.startsWith("top") ? 1 : -1;
    const gap = parseFloat(getComputedStyle(region).rowGap) || 0;
    const live = state.visibleToasts;
    const placed: HTMLDivElement[] = [];
    const fresh: HTMLDivElement[] = [];
    let offset = 0;

    live.forEach((toast, i) => {
      const slot = slots.current.get(toast.key);
      if (!slot) return;
      if (slot.dataset.placed === undefined) {
        // İlk yerleşim animasyonsuz: kuyruktan gelen toast yerine kaymasın.
        slot.style.transition = "none";
        fresh.push(slot);
      } else {
        placed.push(slot);
      }
      slot.style.setProperty("--plonk-toast-offset", `${sign * offset}px`);
      slot.style.zIndex = String(live.length - i);
      offset += slot.offsetHeight + gap;
    });
    for (const item of items) {
      if (item.exiting) {
        const slot = slots.current.get(item.toast.key);
        if (slot) slot.style.zIndex = String(live.length + 1);
      }
    }
    region.style.height = `${Math.max(0, offset - gap)}px`;

    if (fresh.length === 0) return;
    void region.offsetWidth;
    for (const slot of fresh) {
      slot.style.transition = "";
      slot.dataset.placed = "";
    }
    // Yeni sticker yapışınca masa sarsılır: öncekiler bir an aşağı sıçrar.
    for (const slot of placed) {
      const card = slot.firstElementChild?.nextElementSibling;
      // Kendi düşüşü sürerken sarsılmaz; yoksa düşüş yarıda kesilir.
      if (!(card instanceof HTMLElement) || card.getAnimations().length > 0)
        continue;
      card.removeAttribute("data-bump");
      void card.offsetWidth;
      card.setAttribute("data-bump", "");
    }
  }, [items, placement, state.visibleToasts]);

  useLayoutEffect(layout);

  // İçerik boyutu değişirse (font yüklenmesi, uzun metin) yeniden yerleştir.
  const layoutRef = useRef(layout);
  useLayoutEffect(() => {
    layoutRef.current = layout;
  });
  const observer = useRef<ResizeObserver | null>(null);
  useLayoutEffect(() => {
    observer.current = new ResizeObserver(() => layoutRef.current());
    return () => observer.current?.disconnect();
  }, []);

  const slotRef = useCallback((key: string, el: HTMLDivElement | null) => {
    if (el) {
      slots.current.set(key, el);
      observer.current?.observe(el);
    } else {
      slots.current.delete(key);
    }
  }, []);

  const paused = isHovered || isFocusWithin || isDragging;

  return (
    <div
      {...mergeProps(regionProps, hoverProps, focusWithinProps)}
      ref={ref}
      data-placement={placement}
      data-paused={paused || undefined}
      className="plonk-toast-region"
    >
      {items.map((item) => (
        <ToastItem
          key={item.toast.key}
          item={item}
          state={state}
          slotRef={slotRef}
          onExited={onExited}
          onDragChange={onDragChange}
        />
      ))}
    </div>
  );
}

const LABELS: Record<ToastVariant, string> = {
  info: "Notice",
  success: "Success",
  warning: "Warning",
  danger: "Error",
};

/** A stable number from the key, so every toast has its own tilt and tape. */
function seed(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return ((h >>> 0) % 1000) / 1000;
}

/** Comic's entrance animation (theme.css); a burst plays when it ends. */
const SLAM = "plonk-toast-slam";

const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 0.6;

function ToastItem({
  item,
  state,
  slotRef,
  onExited,
  onDragChange,
}: {
  item: Item;
  state: ToastState<ToastContent>;
  slotRef: (key: string, el: HTMLDivElement | null) => void;
  onExited: (key: string) => void;
  onDragChange: (dragging: boolean) => void;
}) {
  const { toast, exiting } = item;
  const { key, content, timeout } = toast;
  const slot = useRef<HTMLDivElement | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const {
    toastProps,
    contentProps,
    titleProps,
    descriptionProps,
    closeButtonProps,
  } = useToast({ toast }, state, card);

  /*
   * Çıkış: hareketin ihtiyaç duyduğu ölçüler yazılır, slot'taki bütün
   * animasyonlar bitince liste temizlenir. Animasyon iptal olursa (kişilik
   * değişti, hareket kapandı) da temizlenir; katman ekranda takılı kalmaz.
   */
  useLayoutEffect(() => {
    const el = card.current;
    const box = slot.current;
    if (!exiting || !el || !box) return;
    /*
     * Çizgi Roman'da kart ortadan yırtılır: kart sol yarıyı, kopyası sağ
     * yarıyı oynar. Hangi çıkışın oynayacağını CSS söyler (--plonk-toast-exit);
     * sürükleyip atılan toast yırtılmaz, fırlar.
     */
    if (
      box.dataset.exit !== "swipe" &&
      getComputedStyle(el).getPropertyValue("--plonk-toast-exit").trim() ===
        "tear"
    ) {
      const half = el.cloneNode(true) as HTMLElement;
      half.classList.add("plonk-toast-half");
      half.removeAttribute("data-bump");
      for (const node of half.querySelectorAll("[id]"))
        node.removeAttribute("id");
      box.append(half);
    }
    // Ölçüler slot'a yazılır: hem kart hem Retro'nun zoom çerçeveleri okur.
    const height = el.offsetHeight;
    const bar = el.querySelector<HTMLElement>(".plonk-toast-bar");
    box.style.height = `${box.offsetHeight}px`;
    box.style.setProperty("--plonk-toast-h", `${height}px`);
    box.style.setProperty(
      "--plonk-toast-bar-h",
      `${el.clientTop + (bar?.offsetHeight ?? 0)}px`,
    );
    box.style.setProperty(
      "--plonk-toast-peel",
      `${Math.min(72, height * 0.95)}px`,
    );

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onExited(key);
    };
    // Duraklatılmış süre çubuğu beklenmez; sadece çıkış hareketleri.
    const running = box
      .getAnimations({ subtree: true })
      .filter(
        (a) =>
          a.playState === "running" &&
          a.effect?.getComputedTiming().endTime !== Infinity,
      );
    Promise.all(running.map((a) => a.finished)).then(finish, finish);
    const fallback = setTimeout(finish, 2000);
    return () => clearTimeout(fallback);
  }, [exiting, key, onExited]);

  // ---------- Sürükleyip kapatma ----------
  const drag = useRef<{
    id: number;
    x0: number;
    dx: number;
    last: number;
    t: number;
    v: number;
    active: boolean;
  } | null>(null);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (exiting || e.button !== 0) return;
    if ((e.target as Element).closest("button, a, input")) return;
    drag.current = {
      id: e.pointerId,
      x0: e.clientX,
      dx: 0,
      last: e.clientX,
      t: e.timeStamp,
      v: 0,
      active: false,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = card.current;
    if (!d || !el || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    if (!d.active) {
      // Küçük kaymalar tıklama sayılır.
      if (Math.abs(dx) < 4) return;
      d.active = true;
      el.setPointerCapture(e.pointerId);
      el.dataset.dragging = "";
      onDragChange(true);
    }
    d.v = (e.clientX - d.last) / Math.max(1, e.timeStamp - d.t);
    d.last = e.clientX;
    d.t = e.timeStamp;
    d.dx = dx;
    // Retro'da kademeli: kişilik, adımı CSS'te verir.
    const step =
      parseFloat(
        getComputedStyle(el).getPropertyValue("--plonk-toast-drag-step"),
      ) || 1;
    const x = Math.round(dx / step) * step;
    el.style.setProperty("--plonk-toast-drag-x", `${x}px`);
    el.style.setProperty("--plonk-toast-drag-turn", String(x / 40));
    el.style.setProperty(
      "--plonk-toast-drag-progress",
      String(Math.min(Math.abs(x) / 420, 0.45)),
    );
  };

  const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = card.current;
    if (!d || !el || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.active) return;
    delete el.dataset.dragging;
    onDragChange(false);
    const flung =
      Math.abs(d.dx) > SWIPE_DISTANCE ||
      (Math.abs(d.v) > SWIPE_VELOCITY && Math.abs(d.dx) > 24);
    if (flung && slot.current) {
      slot.current.dataset.exit = "swipe";
      slot.current.style.setProperty(
        "--plonk-toast-swipe",
        String(Math.sign(d.dx || d.v)),
      );
      state.close(key);
    } else {
      // Değişkenler silinince CSS geçişi yayla yerine döndürür.
      el.style.removeProperty("--plonk-toast-drag-x");
      el.style.removeProperty("--plonk-toast-drag-turn");
      el.style.removeProperty("--plonk-toast-drag-progress");
    }
  };

  const setSlot = useCallback(
    (el: HTMLDivElement | null) => {
      slot.current = el;
      slotRef(key, el);
    },
    [key, slotRef],
  );

  const s = seed(key);
  const label = content.label ?? LABELS[content.variant];
  const hasDescription = content.description != null;

  return (
    <div
      ref={setSlot}
      data-exiting={exiting || undefined}
      className="plonk-toast-slot"
      style={
        {
          "--plonk-toast-tilt": (s * 1.2 - 0.6).toFixed(3),
          "--plonk-toast-tape": `${(s * 8 - 5).toFixed(1)}deg`,
        } as CSSProperties
      }
    >
      <span aria-hidden="true" className="plonk-toast-zoom">
        <span />
        <span />
        <span />
      </span>
      <div
        {...(exiting ? { inert: true, "aria-hidden": true } : toastProps)}
        aria-describedby={
          exiting || !hasDescription
            ? undefined
            : toastProps["aria-describedby"]
        }
        ref={card}
        data-variant={content.variant}
        className="plonk-toast"
        style={
          timeout
            ? ({ "--plonk-toast-timeout": `${timeout}ms` } as CSSProperties)
            : undefined
        }
        onPointerDown={onPointerDown}
        onMouseDown={(e) => {
          /*
           * Sürüklemek için basmak odak vermez. Safari tıklanan düğmeye odak
           * vermediği için, odaktaki toast kapanınca React Aria odağı geri
           * verecek yer bulamaz ve kalan toast'a taşır: süreler takılı kalırdı.
           */
          if (!(e.target as Element).closest("button, a, input")) {
            e.preventDefault();
          }
        }}
        onAnimationEnd={(e) => {
          // Çizgi Roman: toast yere çarpınca köşesinde küçük bir "BAM!".
          if (e.target !== e.currentTarget || e.animationName !== SLAM) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
          playPressEffect(
            e.currentTarget,
            { x: rtl ? rect.left + 14 : rect.right - 14, y: rect.top + 6 },
            { size: "sm" },
          );
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        {content.tape && (
          <span aria-hidden="true" className="plonk-toast-tape" />
        )}
        <div aria-hidden="true" className="plonk-toast-bar">
          <span className="plonk-toast-label font-plonk-display">{label}</span>
        </div>
        <span aria-hidden="true" className="plonk-toast-icon">
          <ToastIcon variant={content.variant} />
        </span>
        <div {...contentProps} className="plonk-toast-content">
          <div {...titleProps} className="plonk-toast-title font-plonk-display">
            {content.title}
          </div>
          {hasDescription && (
            <div {...descriptionProps} className="plonk-toast-description">
              {content.description}
            </div>
          )}
        </div>
        {content.action && (
          <div className="plonk-toast-actions">
            <Button
              size="sm"
              variant="neutral"
              onPress={() => {
                content.action?.onPress();
                state.close(key);
              }}
            >
              {content.action.label}
            </Button>
          </div>
        )}
        <AriaButton
          {...closeButtonProps}
          className="plonk-card-close plonk-toast-close grid shrink-0 cursor-pointer place-items-center outline-offset-2 focus-visible:outline-3 focus-visible:outline-plonk-focus"
        >
          <CloseIcon />
        </AriaButton>
        {timeout ? (
          <span aria-hidden="true" className="plonk-toast-timer">
            <span />
          </span>
        ) : null}
        <span aria-hidden="true" className="plonk-toast-curl">
          <span />
        </span>
      </div>
    </div>
  );
}

const SMOOTH: Record<ToastVariant, string> = {
  info: "M12 11v6M12 7.2v.1",
  success: "M6.5 12.5l3.8 3.8 7.2-8.3",
  warning: "M12 6.5v7M12 17.4v.1",
  danger: "M7.5 7.5l9 9M16.5 7.5l-9 9",
};

/** 5×7 pixel drawings; each `#` is a pixel. */
const PIXEL: Record<ToastVariant, string[]> = {
  info: ["..#..", ".....", ".##..", "..#..", "..#..", "..#..", ".###."],
  success: [".....", "....#", "...##", "#.##.", "###..", ".#...", "....."],
  warning: ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."],
  danger: [".....", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "....."],
};

const pixelPath = (rows: string[]) =>
  rows
    .flatMap((row, y) =>
      [...row].map((c, x) => (c === "#" ? `M${x} ${y}h1v1H${x}z` : "")),
    )
    .join("");

function ToastIcon({ variant }: { variant: ToastVariant }) {
  return (
    <>
      <svg
        className="plonk-toast-icon-smooth"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={SMOOTH[variant]} />
      </svg>
      <svg
        className="plonk-toast-icon-pixel"
        viewBox="0 0 5 7"
        fill="currentColor"
        shapeRendering="crispEdges"
      >
        <path d={pixelPath(PIXEL[variant])} />
      </svg>
    </>
  );
}
