import { useEffect, useRef } from "react";

/**
 * pop: wobble on release. squish: squash while moving.
 * shake: a "no" shake on error.
 */
export type JellyKind = "pop" | "squish" | "shake";

/**
 * Starts (or restarts) the jelly animation on an element.
 *
 * A `data-plonk-jelly` attribute is used instead of a class: when React rewrites
 * `className` the animation isn't removed, because React doesn't manage this attribute.
 * Amount and duration come from the `--plonk-jelly-*` tokens.
 */
export function playJelly(el: HTMLElement, kind: JellyKind = "pop") {
  el.removeAttribute("data-plonk-jelly");
  // Yeniden akış zorlanmazsa tarayıcı aynı animasyonu baştan başlatmaz.
  void el.offsetWidth;
  el.setAttribute("data-plonk-jelly", kind);
}

/**
 * Shakes the element when an error state begins. Doesn't shake on the first render;
 * only on a change from valid to invalid.
 */
export function useShakeOnInvalid<T extends HTMLElement>(invalid: boolean) {
  const ref = useRef<T>(null);
  const previous = useRef(invalid);
  useEffect(() => {
    if (invalid && !previous.current && ref.current) {
      playJelly(ref.current, "shake");
    }
    previous.current = invalid;
  }, [invalid]);
  return ref;
}
