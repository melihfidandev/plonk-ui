"use client";

import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { useLocale } from "react-aria";
import {
  Dialog as AriaDialog,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { cn } from "../../lib/cn";
import { fuzzy, type FuzzyMatch } from "./fuzzy";

// ---------- Açık/kapalı durumu: tetikleyici paletten uzakta olabilir ----------

let open = false;
const listeners = new Set<() => void>();
const setOpenState = (next: boolean) => {
  if (open === next) return;
  open = next;
  listeners.forEach((fn) => fn());
};
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

/** Paleti koddan açıp kapatmak için (ör. bir menü öğesinden). */
export const commandPalette = {
  open: () => setOpenState(true),
  close: () => setOpenState(false),
  toggle: () => setOpenState(!open),
};

// ---------- Bağlamlar ----------

interface PaletteContextValue {
  query: string;
  locale: string;
  page: string | null;
  pushPage: (id: string, label: string) => void;
  run: (action?: () => void, keepOpen?: boolean) => void;
}

const PaletteContext = createContext<PaletteContextValue | null>(null);
/** İçinde bulunulan alt sayfa; kökte `null`. */
const PageContext = createContext<string | null>(null);
/** Grup, öğelerini kendisi süzüp sıraladıysa öğeye eşleşmeyi verir. */
const MatchContext = createContext<FuzzyMatch | null | undefined>(undefined);

function usePalette() {
  const ctx = use(PaletteContext);
  if (!ctx) throw new Error("Command items must be inside <CommandPalette>.");
  return ctx;
}

// ---------- Palet ----------

export interface CommandPaletteProps {
  children: ReactNode;
  /** Kontrollü kullanım. Verilmezse ⌘K ve `commandPalette.open()` yönetir. */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** ⌘K / Ctrl+K ile açılır. Başka bir harf ya da kapatmak için `false`. */
  shortcut?: string | false;
  placeholder?: string;
  /** Retro'da pencere başlığı; ekran okuyucular için paletin adı. */
  title?: string;
  emptyLabel?: ReactNode;
  /** Arama metni değişince (sunucudan arama için). */
  onSearchChange?: (search: string) => void;
  className?: string;
}

/**
 * Komut paleti: ⌘K ile açılan, yazdıkça süzülen komut listesi. Sıfırdan
 * yazıldı; pencere katmanı (odak tuzağı, Esc, arka plan) Dialog'unkiyle aynı.
 * Ok tuşları, Enter, Esc; alt sayfada Backspace ya da Esc ile geri.
 *
 * Sticker'da masaya düşen bir not; seçili satırın vurgusu satırdan satıra
 * yayla kayıp ezilir. Retro'da "Çalıştır…" penceresi, seçim ters renk.
 */
export function CommandPalette({
  children,
  isOpen: controlled,
  onOpenChange,
  shortcut = "k",
  placeholder = "Search for a command…",
  title = "Commands",
  emptyLabel = "No results",
  onSearchChange,
  className,
}: CommandPaletteProps) {
  const store = useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  );
  const isOpen = controlled ?? store;
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlled === undefined) setOpenState(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  // Kontrollü kullanımda da ⌘K ve tetikleyici çalışsın.
  useEffect(() => {
    if (controlled === undefined) return;
    return subscribe(() => {
      if (open !== controlled) onOpenChange?.(open);
    });
  }, [controlled, onOpenChange]);
  useEffect(() => {
    if (controlled !== undefined) open = controlled;
  }, [controlled]);

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcut) {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut, isOpen, setOpen]);

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={setOpen}
      isDismissable
      className="plonk-dialog-overlay fixed top-0 left-0 z-50 flex h-(--visual-viewport-height) w-full justify-center p-4 pt-[12vh]"
    >
      <Modal
        className={cn(
          "plonk-dialog plonk-command relative h-fit w-full max-w-xl",
          className,
        )}
      >
        <span aria-hidden="true" className="plonk-zoom">
          <span />
          <span />
          <span />
        </span>
        <AriaDialog
          aria-label={title}
          className="plonk-card plonk-command-card flex max-h-[min(30rem,70vh)] flex-col overflow-hidden rounded-plonk-lg bg-plonk-surface text-plonk-ink plonk-shadow-lg outline-none plonk-border"
        >
          {({ close }) => (
            <PaletteBody
              title={title}
              placeholder={placeholder}
              emptyLabel={emptyLabel}
              onSearchChange={onSearchChange}
              close={close}
            >
              {children}
            </PaletteBody>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}

function PaletteBody({
  title,
  placeholder,
  emptyLabel,
  onSearchChange,
  close,
  children,
}: {
  title: string;
  placeholder: string;
  emptyLabel: ReactNode;
  onSearchChange?: (search: string) => void;
  close: () => void;
  children: ReactNode;
}) {
  const { locale } = useLocale();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [pages, setPages] = useState<{ id: string; label: string }[]>([]);
  const page = pages.at(-1)?.id ?? null;
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const active = useRef<HTMLElement | null>(null);

  const search = (value: string) => {
    setQuery(value);
    onSearchChange?.(value);
  };

  const pushPage = useCallback((id: string, label: string) => {
    setPages((p) => [...p, { id, label }]);
    setQuery("");
  }, []);
  const popPage = () => {
    setPages((p) => p.slice(0, -1));
    setQuery("");
  };
  const run = useCallback(
    (action?: () => void, keepOpen?: boolean) => {
      if (!keepOpen) close();
      action?.();
    },
    [close],
  );

  /*
   * Seçili satır: React durumu değil, DOM'da işaret. Liste her render'da
   * değişebildiği için (süzme, async sonuçlar) etkin satır sonradan DOM'dan
   * bulunur; vurgu kutusu onun konumuna yayla kayar.
   */
  const options = () => [
    ...(list.current?.querySelectorAll<HTMLElement>(
      '[role="option"]:not([aria-disabled="true"])',
    ) ?? []),
  ];

  const activate = (el: HTMLElement | null, jump: boolean, scroll = true) => {
    const prev = active.current;
    if (prev && prev !== el) {
      prev.removeAttribute("data-active");
      prev.setAttribute("aria-selected", "false");
    }
    active.current = el;
    const box = indicator.current;
    if (!el) {
      input.current?.removeAttribute("aria-activedescendant");
      box?.removeAttribute("data-visible");
      return;
    }
    el.setAttribute("data-active", "");
    el.setAttribute("aria-selected", "true");
    input.current?.setAttribute("aria-activedescendant", el.id);
    if (box) {
      if (jump) box.style.transition = "none";
      box.style.setProperty("--plonk-command-y", `${el.offsetTop}px`);
      box.style.setProperty("--plonk-command-h", `${el.offsetHeight}px`);
      box.setAttribute("data-visible", "");
      if (jump) {
        void box.offsetWidth;
        box.style.transition = "";
      } else if (prev !== el) {
        box.removeAttribute("data-squish");
        void box.offsetWidth;
        box.setAttribute("data-squish", "");
      }
    }
    if (scroll) el.scrollIntoView({ block: "nearest" });
  };

  // Süzme ya da sayfa değişince ilk seçenek etkin olur; liste değişip etkin
  // satır kaybolursa da.
  const lastKey = useRef("");
  useLayoutEffect(() => {
    const key = `${page}\u0000${query}`;
    const all = options();
    if (lastKey.current !== key || !active.current?.isConnected) {
      activate(all[0] ?? null, true);
    } else if (active.current) {
      activate(active.current, true);
    }
    if (lastKey.current && lastKey.current.split("\u0000")[0] !== page) {
      const box = list.current;
      box?.removeAttribute("data-turn");
      void box?.offsetWidth;
      box?.setAttribute("data-turn", page ? "in" : "out");
    }
    lastKey.current = key;
  });

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const all = options();
    const at = active.current ? all.indexOf(active.current) : -1;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!all.length) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      activate(all[(at + step + all.length) % all.length] ?? null, false);
    } else if (e.key === "Home" && e.ctrlKey) {
      activate(all[0] ?? null, false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      active.current?.click();
    } else if (e.key === "Escape" && pages.length) {
      // Alt sayfadayken Esc paleti kapatmaz, bir geri gelir.
      e.preventDefault();
      e.stopPropagation();
      popPage();
    } else if (e.key === "Backspace" && !query && pages.length) {
      e.preventDefault();
      popPage();
    }
  };

  return (
    <PaletteContext value={{ query, locale, page, pushPage, run }}>
      <header className="plonk-card-header plonk-command-title">
        <div className="plonk-card-heading min-w-0 flex-1">
          <span className="plonk-card-title font-plonk-display">{title}</span>
        </div>
      </header>
      <div className="plonk-command-search">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.75}
          strokeLinecap="round"
          className="plonk-command-search-icon"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m15.5 15.5 5 5" />
        </svg>
        {pages.length > 0 && (
          <span className="plonk-command-crumb">{pages.at(-1)?.label}</span>
        )}
        <input
          ref={input}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={title}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={query}
          onChange={(e) => search(e.target.value)}
          onKeyDown={onKeyDown}
          className="plonk-command-input"
        />
      </div>
      <div
        ref={list}
        id={listId}
        role="listbox"
        aria-label={title}
        className="plonk-command-list"
        onPointerMove={(e) => {
          // Fare satırın üstüne gelince vurgu oraya kayar (kaydırmadan).
          const el = (e.target as Element).closest<HTMLElement>(
            '[role="option"]:not([aria-disabled="true"])',
          );
          if (el && el !== active.current) activate(el, false, false);
        }}
      >
        <span
          aria-hidden="true"
          ref={indicator}
          className="plonk-command-indicator"
        />
        <PageContext value={null}>{children}</PageContext>
        <div className="plonk-command-empty">{emptyLabel}</div>
      </div>
    </PaletteContext>
  );
}

// ---------- Alt sayfa, grup, öğe ----------

export interface CommandPageProps {
  /** `CommandItem`'ın `page` değeriyle eşleşir. */
  id: string;
  children: ReactNode;
}

/** Bir öğe seçilince açılan iç liste ("Tema değiştir ›"). */
export function CommandPage({ id, children }: CommandPageProps) {
  const { page } = usePalette();
  if (page !== id) return null;
  return <PageContext value={id}>{children}</PageContext>;
}

export interface CommandGroupProps {
  heading?: ReactNode;
  children?: ReactNode;
  /**
   * `false`: öğeleri süzme ve sıralama (sunucu zaten süzdüyse). Varsayılan:
   * bulanık arama.
   */
  filter?: boolean;
  /** Sonuçlar gelirken "aranıyor" satırı. */
  isLoading?: boolean;
  loadingLabel?: ReactNode;
}

/**
 * Başlıklı öğe grubu. Yazınca öğeler bulanık aramayla süzülür ve en iyi
 * eşleşen başa gelir; hiç öğe kalmazsa grup gizlenir.
 */
export function CommandGroup({
  heading,
  children,
  filter = true,
  isLoading = false,
  loadingLabel = "Searching…",
}: CommandGroupProps) {
  const { query, locale, page } = usePalette();
  const scope = use(PageContext);
  const headingId = useId();
  if (scope !== page) return null;

  const items = Children.toArray(children).filter(
    (c): c is ReactElement<CommandItemProps> => isValidElement(c),
  );
  const scored = items
    .map((el) => ({
      el,
      match: filter ? fuzzy(textOf(el.props), query, locale) : null,
    }))
    .filter((x) => !filter || x.match);
  if (filter && query) {
    scored.sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0));
  }
  if (!scored.length && !isLoading) return null;

  return (
    <div
      role="group"
      aria-labelledby={headingId}
      className="plonk-command-group"
    >
      {heading != null && (
        <div id={headingId} className="plonk-command-heading">
          {heading}
        </div>
      )}
      {scored.map(({ el, match }) => (
        <MatchContext key={el.key} value={match}>
          {el}
        </MatchContext>
      ))}
      {isLoading && (
        <div data-loading="" className="plonk-command-loading">
          {loadingLabel}
        </div>
      )}
    </div>
  );
}

export interface CommandItemProps {
  children: ReactNode;
  /** Arama için metin; `children` düz metin değilse zorunlu. */
  textValue?: string;
  /** Aramada eşleşecek ek kelimeler ("ayarlar" için "tercihler"). */
  keywords?: string[];
  icon?: ReactNode;
  description?: ReactNode;
  /** Sağda gösterilen kısayol, ör. "⌘N". Sadece gösterim. */
  shortcut?: string;
  /** Seçilince çalışır, ardından palet kapanır. */
  onAction?: () => void;
  /** Çalıştıktan sonra palet açık kalsın. */
  keepOpen?: boolean;
  /** Seçilince bu kimlikteki `CommandPage` açılır. */
  page?: string;
  isDisabled?: boolean;
}

const textOf = (props: CommandItemProps) =>
  [
    props.textValue ??
      (typeof props.children === "string" ? props.children : ""),
    ...(props.keywords ?? []),
  ].join(" ");

export function CommandItem(props: CommandItemProps) {
  const {
    children,
    icon,
    description,
    shortcut,
    onAction,
    keepOpen,
    page: target,
    isDisabled,
  } = props;
  const { query, locale, page, pushPage, run } = usePalette();
  const scope = use(PageContext);
  const fromGroup = use(MatchContext);
  const id = useId();
  if (scope !== page) return null;

  // Grubun dışındaysa kendini süzer.
  const match =
    fromGroup === undefined ? fuzzy(textOf(props), query, locale) : fromGroup;
  if (fromGroup === undefined && !match) return null;

  const label =
    typeof children === "string" && match?.hits.length
      ? highlight(children, match.hits)
      : children;

  return (
    <div
      id={id}
      role="option"
      aria-selected="false"
      aria-disabled={isDisabled || undefined}
      className="plonk-command-item"
      onClick={() => {
        if (isDisabled) return;
        if (target) pushPage(target, textOf(props));
        else run(onAction, keepOpen);
      }}
    >
      {icon != null && (
        <span aria-hidden="true" className="plonk-command-icon">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="plonk-command-label block truncate">{label}</span>
        {description != null && (
          <span className="plonk-command-description block truncate">
            {description}
          </span>
        )}
      </span>
      {shortcut && <kbd className="plonk-command-shortcut">{shortcut}</kbd>}
      {target && (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="plonk-command-chevron"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      )}
    </div>
  );
}

function highlight(text: string, hits: number[]) {
  const set = new Set(hits);
  const parts: ReactNode[] = [];
  let buffer = "";
  let marked = false;
  [...text].forEach((ch, i) => {
    const hit = set.has(i);
    if (hit !== marked && buffer) {
      parts.push(marked ? <mark key={i}>{buffer}</mark> : buffer);
      buffer = "";
    }
    marked = hit;
    buffer += ch;
  });
  if (buffer) parts.push(marked ? <mark key="end">{buffer}</mark> : buffer);
  return parts;
}

// ---------- Tetikleyici ----------

const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform);
const noop = () => () => {};

export interface CommandPaletteTriggerProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Üst çubukta duran, arama kutusu gibi görünen düğme. Tıklayınca paleti
 * açar; klavye kullanmayanlar ve dokunmatik ekranlar için. Kısayolu da
 * öğretir (Mac'te ⌘K, diğerlerinde Ctrl K).
 */
export function CommandPaletteTrigger({
  children = "Search…",
  className,
}: CommandPaletteTriggerProps) {
  const mac = useSyncExternalStore(noop, isMac, () => null);
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => commandPalette.open()}
      className={cn(
        "plonk-command-trigger plonk-field flex h-10 w-full min-w-48 cursor-pointer items-center gap-2 rounded-plonk-md px-3 text-left text-plonk-ink-muted",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.75}
        strokeLinecap="round"
        className="size-4 shrink-0"
      >
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
      </svg>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {mac !== null && (
        <kbd className="plonk-kbd inline-grid h-6 min-w-6 place-items-center rounded-plonk-sm bg-plonk-surface px-1.5 font-plonk-mono text-xs font-semibold text-plonk-ink plonk-border">
          {mac ? "⌘K" : "Ctrl K"}
        </kbd>
      )}
    </button>
  );
}
