"use client";

import {
  createContext,
  use,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { UNSAFE_PortalProvider } from "react-aria";
import { cn } from "../lib/cn";
import {
  DEFAULT_PERSONALITY,
  type PersonalityName,
} from "../tokens/personalities";

const PersonalityContext = createContext<PersonalityName>(DEFAULT_PERSONALITY);

export interface PlonkProviderProps extends HTMLAttributes<HTMLDivElement> {
  /** Bileşenlerin görünüşü ve hareket dili. */
  personality?: PersonalityName;
  /**
   * `system`: kullanıcının işletim sistemi tercihine uyar (varsayılan).
   * `reduce`: hareketi her durumda azaltır.
   */
  motion?: "system" | "reduce";
  /**
   * Jöle miktarı: 0 kapalı, 1 tam jöle. Verilmezse kişiliğin varsayılanı.
   * Hareket azaltıldığında her durumda 0 olur.
   */
  jelly?: number;
}

const subscribeNothing = () => () => {};

/** Sadece CSS değişkenlerini (`--…`) alır; kenar boşluğu gibi yerleşim stilleri taşınmaz. */
function customProperties(style: CSSProperties | undefined) {
  if (!style) return undefined;
  const entries = Object.entries(style).filter(([key]) => key.startsWith("--"));
  return entries.length
    ? (Object.fromEntries(entries) as CSSProperties)
    : undefined;
}

/**
 * Altındaki her şeye bir kişilik verir. İç içe kullanılabilir; en yakın
 * provider kazanır.
 *
 * Dialog, menü gibi katmanlar sayfanın en altına (body) açılır. Kişilik
 * değişkenlerinin dışında kalmasınlar diye her provider, body'de kendi
 * kişiliğini taşıyan bir katman kabı açar ve katmanları oraya yönlendirir.
 */
export function PlonkProvider({
  personality = DEFAULT_PERSONALITY,
  motion = "system",
  jelly,
  className,
  style,
  children,
  ...props
}: PlonkProviderProps) {
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  // Sunucuda body yok; kap sadece tarayıcıda açılır.
  const isClient = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

  const motionAttr = motion === "reduce" ? "reduce" : undefined;
  const fullStyle =
    jelly === undefined
      ? style
      : ({ ...style, "--plonk-jelly-amount": String(jelly) } as CSSProperties);

  return (
    <PersonalityContext value={personality}>
      <UNSAFE_PortalProvider getContainer={() => layer}>
        <div
          {...props}
          data-plonk-personality={personality}
          data-plonk-motion={motionAttr}
          style={fullStyle}
          className={cn("plonk", className)}
        >
          {children}
        </div>
      </UNSAFE_PortalProvider>
      {isClient &&
        createPortal(
          <div
            ref={setLayer}
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
}

/** En yakın `PlonkProvider`'ın kişiliği. Provider yoksa varsayılan kişilik. */
export function usePersonality(): PersonalityName {
  return use(PersonalityContext);
}
