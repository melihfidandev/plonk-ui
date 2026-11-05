"use client";

import { use, useLayoutEffect, useRef, type ReactNode } from "react";
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabListStateContext,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
  type TabListProps as AriaTabListProps,
  type TabPanelProps as AriaTabPanelProps,
  type TabProps as AriaTabProps,
  type TabsProps as AriaTabsProps,
} from "react-aria-components";
import { cn } from "../../lib/cn";
import { playJelly } from "../../motion/jelly";

export interface TabsProps extends Omit<
  AriaTabsProps,
  "className" | "style" | "orientation"
> {
  className?: string;
}

/**
 * Tabs. Arrow keys move between tabs (React Aria).
 * The selected tab's indicator springs to the new tab, squishing and stretching on the way.
 */
export function Tabs({ className, ...props }: TabsProps) {
  // grid değil flex: dış yerleşim Tabs'ı gererse sekme çubuğu uzamasın.
  return (
    <AriaTabs
      {...props}
      className={cn("flex min-w-0 flex-col gap-4", className)}
    />
  );
}

export interface TabListProps<T> extends Omit<
  AriaTabListProps<T>,
  "className" | "style"
> {
  className?: string;
}

/**
 * Tab bar. A single indicator sits behind the selected tab; its position and size
 * are measured from the selected tab and written to CSS variables, the transition is
 * in CSS. Measured again when tab sizes change (font loading, window resize).
 */
export function TabList<T extends object>({
  className,
  ...props
}: TabListProps<T>) {
  const selectedKey = use(TabListStateContext)?.selectedKey;
  const boxRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const previousKey = useRef(selectedKey);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const indicator = indicatorRef.current;
    if (!box || !indicator) return;

    const place = () => {
      const tab = box.querySelector<HTMLElement>(
        '[role="tab"][aria-selected="true"]',
      );
      indicator.hidden = !tab;
      if (!tab) return;
      indicator.style.setProperty("--plonk-tab-x", `${tab.offsetLeft}px`);
      indicator.style.setProperty("--plonk-tab-y", `${tab.offsetTop}px`);
      indicator.style.setProperty("--plonk-tab-w", `${tab.offsetWidth}px`);
      indicator.style.setProperty("--plonk-tab-h", `${tab.offsetHeight}px`);
    };
    place();

    // İlk yerleşim animasyonsuz; geçişler ondan sonra açılır.
    const frame = requestAnimationFrame(() => {
      indicator.dataset.ready = "";
    });
    // İlk çizimde seçili anahtar henüz boş olabilir; bu bir değişim sayılmaz.
    if (previousKey.current != null && previousKey.current !== selectedKey) {
      playJelly(indicator, "squish");
    }
    previousKey.current = selectedKey;

    const observer = new ResizeObserver(place);
    observer.observe(box);
    for (const tab of box.querySelectorAll('[role="tab"]')) {
      observer.observe(tab);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [selectedKey]);

  return (
    <div
      ref={boxRef}
      className={cn(
        "plonk-tablist relative flex w-fit max-w-full overflow-x-auto rounded-[var(--plonk-tabs-radius,var(--plonk-radius-pill))] bg-plonk-surface p-1 plonk-border",
        className,
      )}
    >
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className="plonk-tab-indicator absolute top-0 left-0 rounded-[var(--plonk-tabs-radius,var(--plonk-radius-pill))]"
      />
      <AriaTabList {...props} className="flex gap-1" />
    </div>
  );
}

export interface TabProps extends Omit<
  AriaTabProps,
  "className" | "style" | "children"
> {
  children: ReactNode;
  className?: string;
}

export function Tab({ children, className, ...props }: TabProps) {
  return (
    <AriaTab
      {...props}
      className={cn(
        "plonk-tab relative cursor-pointer rounded-[var(--plonk-tabs-radius,var(--plonk-radius-pill))] px-4 py-1.5 font-plonk-display whitespace-nowrap outline-none select-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "outline-offset-2 data-focus-visible:outline-3 data-focus-visible:outline-plonk-focus data-focus-visible:outline-solid",
        className,
      )}
    >
      {children}
    </AriaTab>
  );
}

export interface TabPanelProps extends Omit<
  AriaTabPanelProps,
  "className" | "style"
> {
  className?: string;
}

/** Tab content. Fades in sliding up slightly. */
export function TabPanel({ className, ...props }: TabPanelProps) {
  return (
    <AriaTabPanel
      {...props}
      className={cn(
        "plonk-tab-panel rounded-plonk-sm outline-offset-4 data-focus-visible:outline-3 data-focus-visible:outline-plonk-focus data-focus-visible:outline-solid",
        className,
      )}
    />
  );
}
