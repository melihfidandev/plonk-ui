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
/** Yukarıda bildirim bölgesi açmış bir provider var mı? */
const ToasterContext = createContext(false);

export interface PlonkProviderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "style"
> {
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
  /**
   * Normal stiller ve `--plonk-*` token'ları. Token'lar katmanlara (Dialog,
   * Toast…) da taşınır: `style={{ "--plonk-color-focus": "#ff8cc6" }}`.
   */
  style?: PlonkStyle;
  /**
   * Bildirim bölgesini aç (varsayılan). Sadece en dıştaki provider açar;
   * iç içe provider'lar onu kullanır. `false`: bu provider açmaz.
   */
  toaster?: boolean;
  /** Bildirimlerin ekrandaki köşesi. Varsayılan `bottom-end` (sağ alt). */
  toastPlacement?: ToastPlacement;
  /**
   * Bildirimlerin varsayılan ekranda kalma süresi (ms). En az 5000.
   * Tek bir toast için `toast("…", { timeout })`.
   */
  toastTimeout?: number;
  /**
   * Sticker toast'larının üstündeki bant (varsayılan açık). Tek bir toast
   * için `toast("…", { tape: false })`.
   */
  toastTape?: boolean;
  /**
   * Dil ve bölge, ör. `"tr-TR"`. Tarih biçimi, ay adları, haftanın ilk günü
   * ve React Aria'nın ekran okuyucu metinleri buna göre. Verilmezse tarayıcının dili.
   */
  locale?: string;
}

const subscribeNothing = () => () => {};

/** Sadece CSS değişkenlerini (`--…`) alır; kenar boşluğu gibi yerleşim stilleri taşınmaz. */
function customProperties(style: PlonkStyle | undefined) {
  if (!style) return undefined;
  const entries = Object.entries(style).filter(([key]) => key.startsWith("--"));
  return entries.length
    ? (Object.fromEntries(entries) as PlonkStyle)
    : undefined;
}

/**
 * Altındaki her şeye bir kişilik verir. İç içe kullanılabilir; en yakın
 * provider kazanır.
 *
 * Dialog, menü gibi katmanlar sayfanın en altına (body) açılır. Kişilik
 * değişkenlerinin dışında kalmasınlar diye her provider, body'de kendi
 * kişiliğini taşıyan bir katman kabı açar ve katmanları oraya yönlendirir.
 * En dıştaki provider, `toast()` bildirimlerinin bölgesini de aynı kaba açar.
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
  toastTape = true,
  locale,
  children,
  ...props
}: PlonkProviderProps) {
  const hasToaster = use(ToasterContext);
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
    if (ownsToaster) setDefaultToastTape(toastTape);
  }, [ownsToaster, toastTape]);

  const motionAttr = motion === "reduce" ? "reduce" : undefined;
  const fullStyle: PlonkStyle | undefined =
    jelly === undefined
      ? style
      : { ...style, "--plonk-jelly-amount": String(jelly) };

  const tree = (
    <PersonalityContext value={personality}>
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

/** En yakın `PlonkProvider`'ın kişiliği. Provider yoksa varsayılan kişilik. */
export function usePersonality(): PersonalityName {
  return use(PersonalityContext);
}
