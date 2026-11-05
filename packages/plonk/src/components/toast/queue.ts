import type { ReactNode } from "react";
import { UNSTABLE_ToastQueue as ToastQueue } from "react-aria-components";

export type ToastVariant = "info" | "success" | "warning" | "danger";

export interface ToastAction {
  label: ReactNode;
  /** Runs when the button is pressed; then the toast closes. */
  onPress: () => void;
}

export interface ToastOptions {
  description?: ReactNode;
  variant?: ToastVariant;
  /** A single action button ("Undo", "Retry"). */
  action?: ToastAction;
  /**
   * Milliseconds before it closes on its own. `0`: stays until the user closes it.
   * Default 5 s; 0 for toasts with an action. Anything below 5 s is raised to 5 s, so
   * there is time to read and act (WCAG 2.2.1).
   */
  timeout?: number;
  /**
   * Text in the title bar in Retro (and the label in Comic and Arcade). Defaults to the
   * type's name ("Notice", "Success", "Warning", "Error").
   */
  label?: ReactNode;
  /**
   * The tape on top. On by default (the provider's `tape` setting); each personality
   * draws its own version.
   */
  tape?: boolean;
  /** Called when it closes: when the user closes it or time runs out. */
  onClose?: () => void;
}

/** Content waiting in the queue. */
export interface ToastContent {
  title: ReactNode;
  description?: ReactNode;
  variant: ToastVariant;
  action?: ToastAction;
  label?: ReactNode;
  tape: boolean;
}

export const MIN_TIMEOUT = 5000;
const MAX_VISIBLE = 3;

/**
 * The app's single notification queue. Module level, so toasts can be opened from
 * outside React too (a fetch's catch, a store). They are displayed by the region
 * opened by the outermost `PlonkProvider`.
 */
export const toastQueue = /* @__PURE__ */ new ToastQueue<ToastContent>({
  maxVisibleToasts: MAX_VISIBLE,
});

let defaultTimeout = MIN_TIMEOUT;
let defaultTape = true;

/** The provider's `toastTimeout` setting is written here. */
export function setDefaultToastTimeout(ms: number) {
  defaultTimeout = ms;
}

/** The provider's `tape` setting is written here (toasts open from outside React too). */
export function setDefaultToastTape(tape: boolean) {
  defaultTape = tape;
}

function show(
  title: ReactNode,
  {
    description,
    variant = "info",
    action,
    label,
    tape = defaultTape,
    timeout,
    onClose,
  }: ToastOptions = {},
) {
  const ms = timeout ?? (action ? 0 : defaultTimeout);
  return toastQueue.add(
    { title, description, variant, action, label, tape },
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
 * Shows a notification and returns its key. Callable from anywhere; no hook or
 * context needed.
 *
 * ```ts
 * toast("Changes saved");
 * toast.danger("Upload failed", { action: { label: "Retry", onPress: retry } });
 * const id = toast("Uploading…", { timeout: 0 });
 * toast.dismiss(id);
 * ```
 */
export const toast = /* @__PURE__ */ Object.assign(
  (title: ReactNode, options?: ToastOptions) => show(title, options),
  {
    info: shortcut("info"),
    success: shortcut("success"),
    warning: shortcut("warning"),
    danger: shortcut("danger"),
    /** Closes the toast with the given key; closes all of them when no key is given. */
    dismiss(key?: string) {
      if (key === undefined) toastQueue.clear();
      else toastQueue.close(key);
    },
  },
);
