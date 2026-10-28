"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";

const SELECTOR = ".site-prose :is(h2, h3)[id]";

/** Okuma çizgisi: üst barın biraz altı. Bunu geçen başlık "okunuyor" sayılır. */
const READ_LINE = 140;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const scrollMax = () => document.documentElement.scrollHeight - innerHeight;

/*
 * Sadece görünen başlıklar. Next (Cache Components) gezinince önceki sayfayı
 * silmez, gizleyip DOM'da tutar (geri dönüş anında açılsın diye); onun
 * başlıkları listeye karışıyordu.
 */
const headings = () =>
  [...document.querySelectorAll<HTMLElement>(SELECTOR)].filter(
    (h) => h.getClientRects().length > 0,
  );

/*
 * Başlıklar DOM'dan okunur (MDX'in ürettiği h2/h3). Sayfa değişince içerik
 * yenilenir ya da gizlenen sayfa geri gösterilir; MutationObserver ikisini de
 * yakalar. Anlık görüntü düz bir metin: aynı başlıklar için aynı değer döner,
 * React gereksiz yere yeniden çizmez.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "hidden"],
  });
  return () => observer.disconnect();
}
function getSnapshot() {
  return headings()
    .map((h) => `${h.tagName === "H3" ? 3 : 2}\t${h.id}\t${h.textContent}`)
    .join("\n");
}

interface TocItem {
  depth: number;
  id: string;
  text: string;
}

/** Sayfanın başlıkları ve şu an okunan başlık. */
function useToc() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "");
  const items: TocItem[] = snapshot
    ? snapshot.split("\n").map((line) => {
        const [depth, id, text] = line.split("\t");
        return { depth: Number(depth), id: id!, text: text! };
      })
    : [];
  const [active, setActive] = useState<string | null>(null);

  /*
   * Okunan başlık: üst barın (ve varsa çubuğun) biraz altını geçmiş son
   * başlık. Kaydırma konumundan hesaplanır: sayfanın ortasına atlayınca da
   * doğru bölüm seçilir (başlıkların ekrandan geçmesini beklemez).
   */
  useEffect(() => {
    if (!snapshot) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const list = headings();
      // Sayfanın sonunda son başlık: kısa son bölümler çizgiye hiç ulaşamaz.
      if (scrollY >= scrollMax() - 2) {
        setActive(list.at(-1)?.id ?? null);
        return;
      }
      const passed = list.filter(
        (h) => h.getBoundingClientRect().top <= READ_LINE,
      );
      setActive((passed.at(-1) ?? list[0])?.id ?? null);
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [snapshot]);

  return { items, active };
}

/*
 * Sayfa içi bağlantılar (#api gibi) görünen başlığa gitsin. Gizlenen önceki
 * sayfada aynı kimlikli başlık olabilir (her bileşende "API" var); tarayıcı
 * ilkine, yani gizli olana gitmeye çalışıp hiç kaymıyordu.
 */
function useInPageLinks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element).closest?.<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      const id = decodeURIComponent(link.hash.slice(1));
      const target = headings().find((h) => h.id === id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
      history.replaceState(null, "", `#${id}`);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

/**
 * Listenin solundaki çizgi okudukça aşağı doğru dolar. Ucu okunan bölümün
 * hizasında durur; iki bölüm arasında okurken ikisinin arasında, kaydırdıkça
 * akarak ilerler. Sayfanın sonunda çizgi tamamen doludur. Değer her karede
 * CSS değişkenine yazılır (React yeniden çizilmez).
 */
function useRailFill(list: RefObject<HTMLDivElement | null>, key: string) {
  useEffect(() => {
    const box = list.current;
    if (!box || !key) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const hs = headings();
      const links = [...box.querySelectorAll<HTMLElement>("a")];
      if (hs.length === 0 || hs.length !== links.length) return;
      const tops = hs.map((h) => h.getBoundingClientRect().top);
      const centers = links.map((a) => a.offsetTop + a.offsetHeight / 2);
      const max = scrollMax();
      let i = -1;
      tops.forEach((top, k) => {
        if (top <= READ_LINE) i = k;
      });

      let fill: number;
      if (scrollY >= max - 2) {
        fill = box.offsetHeight;
      } else if (i < 0) {
        // İlk başlığa yaklaşırken: sayfanın başından ilk maddeye.
        const reach = scrollY + tops[0]! - READ_LINE;
        fill = centers[0]! * clamp01(reach > 0 ? scrollY / reach : 1);
      } else if (i === tops.length - 1) {
        // Son bölüm: son maddeden listenin sonuna, sayfa sonuna kadar.
        const from = scrollY + tops[i]! - READ_LINE;
        const f = clamp01(max > from ? (scrollY - from) / (max - from) : 1);
        fill = centers[i]! + (box.offsetHeight - centers[i]!) * f;
      } else {
        const f = clamp01((READ_LINE - tops[i]!) / (tops[i + 1]! - tops[i]!));
        fill = centers[i]! + (centers[i + 1]! - centers[i]!) * f;
      }
      box.style.setProperty("--site-toc-fill", `${fill.toFixed(1)}px`);
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [list, key]);
}

/** Geniş ekranda sağ sütundaki başlık listesi. */
export function Toc() {
  const { items, active } = useToc();
  const list = useRef<HTMLDivElement>(null);
  useInPageLinks();
  useRailFill(list, items.map((h) => h.id).join("|"));

  if (items.length === 0) return <div className="site-toc" />;
  return (
    <nav aria-label="On this page" className="site-toc">
      <p>On this page</p>
      <div ref={list} className="site-toc-list">
        <span aria-hidden="true" className="site-toc-rail">
          <span />
        </span>
        {items.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            data-depth={h.depth}
            aria-current={active === h.id ? "location" : undefined}
          >
            {h.text}
          </a>
        ))}
      </div>
    </nav>
  );
}

/**
 * Dar ekranda başlık listesi: üst bara yapışık bir çubuk. Okunan bölümün adını
 * gösterir, dokununca liste açılır. Alt kenarındaki çizgi okuma ilerlemesi.
 */
export function TocBar() {
  const { items, active } = useToc();
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);

  // İlerleme: sayfanın ne kadarı okundu. Değer CSS değişkeninde, React'e girmez.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.current?.style.setProperty(
        "--site-progress",
        String(max > 0 ? Math.min(1, scrollY / max) : 0),
      );
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  // Dışarı dokununca ya da Esc ile kapanır.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!bar.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (items.length === 0) return null;
  const current = items.find((h) => h.id === active) ?? items[0]!;

  return (
    <div ref={bar} className="site-tocbar" data-open={open || undefined}>
      <button
        type="button"
        className="site-tocbar-button"
        aria-expanded={open}
        aria-controls="site-tocbar-list"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="label">On this page</span>
        <span className="current">{current.text}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="square"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <span
        ref={progress}
        aria-hidden="true"
        className="site-tocbar-progress"
      />
      <nav
        id="site-tocbar-list"
        aria-label="On this page"
        className="site-tocbar-list"
        hidden={!open}
      >
        {items.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            data-depth={h.depth}
            aria-current={active === h.id ? "location" : undefined}
            onClick={() => setOpen(false)}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
