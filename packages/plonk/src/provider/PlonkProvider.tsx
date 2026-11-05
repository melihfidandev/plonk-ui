"use client";

import {
  createContext,
  use,
  useEffect,
  useState,
  useSyncExternalStore,
  type HTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { I18nProvider, UNSAFE_PortalProvider } from "react-aria";
import {
  setDefaultToastTape,
  setDefaultToastTimeout,
} from "../components/toast/queue";
import { Toaster, type ToastPlacement } from "../components/toast/Toaster";
import { cn } from "../lib/cn";
import {
  DEFAULT_PERSONALITY,
  type PersonalityName,
} from "../tokens/personalities";
import type { PlonkStyle } from "../tokens/variables";

const PersonalityContext = createContext<PersonalityName>(DEFAULT_PERSONALITY);
/** Is there a provider above that already opened a notification region? */
const ToasterContext = createContext(false);
/** Default for decorative tape (Toast, table action bar). */
const TapeContext = createContext(true);

export interface PlonkProviderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "style"
> {
  /** Look and motion language of the components. */
  personality?: PersonalityName;
  /**
   * `system`: follows the user's operating system preference (default).
   * `reduce`: always reduces motion.
   */
  motion?: "system" | "reduce";
  /**
   * Jelly amount: 0 off, 1 full jelly. Defaults to the personality's value.
   * Always 0 when motion is reduced.
   */
  jelly?: number;
  /**
   * Regular styles and `--plonk-*` tokens. Tokens also carry over to layers (Dialog,
   * Toast…): `style={{ "--plonk-color-focus": "#ff8cc6" }}`.
   */
  style?: PlonkStyle;
  /**
   * Open the notification region (default). Only the outermost provider opens it;
   * nested providers use that one. `false`: this provider doesn't open it.
   */
  toaster?: boolean;
  /** Screen corner for notifications. Default `bottom-end` (bottom right). */
  toastPlacement?: ToastPlacement;
  /**
   * Default time notifications stay on screen (ms). At least 5000.
   * For a single toast use `toast("…", { timeout })`.
   */
  toastTimeout?: number;
  /**
   * Decorative tape: turns it off (or on) everywhere it's on by default (Toast, table
   * action bar). A component's own setting always wins
   * (`toast("…", { tape: true })`). Defaults to the outer provider's.
   */
  tape?: boolean;
  /**
   * Language and region, e.g. `"tr-TR"`. Date format, month names, first day of the
   * week and React Aria's screen reader texts follow it. Defaults to the browser's language.
   */
  locale?: string;
}

const subscribeNothing = () => () => {};

/** Takes only CSS variables (`--…`); layout styles such as margins aren't carried over. */
function customProperties(style: PlonkStyle | undefined) {
  if (!style) return undefined;
  const entries = Object.entries(style).filter(([key]) => key.startsWith("--"));
  return entries.length
    ? (Object.fromEntries(entries) as PlonkStyle)
    : undefined;
}

/**
 * Gives everything below it a personality. Can be nested; the nearest provider wins.
 *
 * Layers such as dialogs and menus open at the bottom of the page (body). So they
 * don't fall outside the personality's variables, each provider opens a layer container
 * in body that carries its personality and routes layers there. The outermost provider
 * also opens the region for `toast()` notifications in that container.
 */
export function PlonkProvider({
  personality = DEFAULT_PERSONALITY,
  motion = "system",
  jelly,
  className,
  style,
  toaster = true,
  toastPlacement = "bottom-end",
  toastTimeout,
  tape: tapeProp,
  locale,
  children,
  ...props
}: PlonkProviderProps) {
  const hasToaster = use(ToasterContext);
  const tape = tapeProp ?? use(TapeContext);
  const ownsToaster = toaster && !hasToaster;
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  // Sunucuda body yok; kap sadece tarayıcıda açılır.
  const isClient = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (ownsToaster && toastTimeout !== undefined) {
      setDefaultToastTimeout(toastTimeout);
    }
  }, [ownsToaster, toastTimeout]);

  useEffect(() => {
    if (ownsToaster) setDefaultToastTape(tape);
  }, [ownsToaster, tape]);

  const motionAttr = motion === "reduce" ? "reduce" : undefined;
  const fullStyle: PlonkStyle | undefined =
    jelly === undefined
      ? style
      : { ...style, "--plonk-jelly-amount": String(jelly) };

  const tree = (
    <PersonalityContext value={personality}>
      <TapeContext value={tape}>
        <ToasterContext value={hasToaster || ownsToaster}>
          <UNSAFE_PortalProvider getContainer={() => layer}>
            <div
              lang={locale}
              {...props}
              data-plonk-personality={personality}
              data-plonk-motion={motionAttr}
              style={fullStyle}
              className={cn("plonk", className)}
            >
              {children}
            </div>
          </UNSAFE_PortalProvider>
        </ToasterContext>
      </TapeContext>
      {ownsToaster && <Toaster container={layer} placement={toastPlacement} />}
      {isClient &&
        createPortal(
          <div
            ref={setLayer}
            lang={locale}
            data-plonk-layer=""
            data-plonk-personality={personality}
            data-plonk-motion={motionAttr}
            style={customProperties(fullStyle)}
            className="plonk"
          />,
          document.body,
        )}
    </PersonalityContext>
  );

  // Dil verildiyse React Aria'nın bütün bileşenleri (tarih, toast) ona uyar.
  return locale ? <I18nProvider locale={locale}>{tree}</I18nProvider> : tree;
}

/** Is decorative tape on by default (the nearest provider's `tape` setting). */
export function useTapeDefault(): boolean {
  return use(TapeContext);
}

/** Personality of the nearest `PlonkProvider`. The default personality without a provider. */
export function usePersonality(): PersonalityName {
  return use(PersonalityContext);
}
