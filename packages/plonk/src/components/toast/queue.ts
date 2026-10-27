import type { ReactNode } from "react";
import { UNSTABLE_ToastQueue as ToastQueue } from "react-aria-components";

export type ToastVariant = "info" | "success" | "warning" | "danger";

export interface ToastAction {
  label: ReactNode;
  /** Düğmeye basınca çalışır; ardından toast kapanır. */
  onPress: () => void;
}

export interface ToastOptions {
  description?: ReactNode;
  variant?: ToastVariant;
  /** Tek bir eylem düğmesi ("Geri al", "Tekrar dene"). */
  action?: ToastAction;
  /**
   * Kaç milisaniye sonra kendiliğinden kapansın. `0`: kullanıcı kapatana kadar
   * kalır. Varsayılan 5 sn; aksiyonlu toast'larda 0. 5 sn'nin altı 5 sn'ye
   * yükseltilir: okumaya ve eyleme yetişmek için (WCAG 2.2.1).
   */
  timeout?: number;
  /**
   * Retro'da pencere başlık çubuğundaki yazı. Verilmezse türün adı
   * ("Notice", "Success", "Warning", "Error").
   */
  label?: ReactNode;
  /** Kapandığında çağrılır: kullanıcı kapatınca ya da süre dolunca. */
  onClose?: () => void;
}

/** Kuyrukta duran içerik. */
export interface ToastContent {
  title: ReactNode;
  description?: ReactNode;
  variant: ToastVariant;
  action?: ToastAction;
  label?: ReactNode;
}

export const MIN_TIMEOUT = 5000;
const MAX_VISIBLE = 3;

/**
 * Uygulamanın tek bildirim kuyruğu. React dışından da (bir fetch'in
 * catch'inden, bir store'dan) toast açılabilsin diye modül düzeyinde.
 * Görüntüleyen, en dıştaki `PlonkProvider`'ın açtığı bildirim bölgesidir.
 */
export const toastQueue = new ToastQueue<ToastContent>({
  maxVisibleToasts: MAX_VISIBLE,
});

let defaultTimeout = MIN_TIMEOUT;

/** Provider'ın `toastTimeout` ayarı buraya yazılır. */
export function setDefaultToastTimeout(ms: number) {
  defaultTimeout = ms;
}

function show(
  title: ReactNode,
  {
    description,
    variant = "info",
    action,
    label,
    timeout,
    onClose,
  }: ToastOptions = {},
) {
  const ms = timeout ?? (action ? 0 : defaultTimeout);
  return toastQueue.add(
    { title, description, variant, action, label },
    { timeout: ms > 0 ? Math.max(ms, MIN_TIMEOUT) : undefined, onClose },
  );
}

type Shortcut = (
  title: ReactNode,
  options?: Omit<ToastOptions, "variant">,
) => string;

const shortcut =
  (variant: ToastVariant): Shortcut =>
  (title, options) =>
    show(title, { ...options, variant });

/**
 * Bildirim gösterir ve anahtarını döner. Her yerden çağrılabilir; hook ya da
 * context gerekmez.
 *
 * ```ts
 * toast("Changes saved");
 * toast.danger("Upload failed", { action: { label: "Retry", onPress: retry } });
 * const id = toast("Uploading…", { timeout: 0 });
 * toast.dismiss(id);
 * ```
 */
export const toast = Object.assign(
  (title: ReactNode, options?: ToastOptions) => show(title, options),
  {
    info: shortcut("info"),
    success: shortcut("success"),
    warning: shortcut("warning"),
    danger: shortcut("danger"),
    /** Anahtarı verilen toast'u kapatır; anahtar verilmezse hepsini. */
    dismiss(key?: string) {
      if (key === undefined) toastQueue.clear();
      else toastQueue.close(key);
    },
  },
);
