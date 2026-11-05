import { useSyncExternalStore } from "react";
import { personalities, type PersonalityName } from "plonk-ui";

/** Kişiliğin işaret rengi (sekmelerdeki nokta, harf karoları). */
export const DOTS: Record<PersonalityName, string> = {
  sticker: "#FFD23F",
  retro: "#5B4CFF",
  comic: "#E3170A",
  arcade: "#23E5FF",
};

export const reduceMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Hareket dilinin kısa künyesi, token'lardan: "Spring 0.42 / 0.52 · jelly 0.75". */
export function motionLine(name: PersonalityName): string {
  const { motion, jelly } = personalities[name];
  const spring = motion.spring;
  const head =
    spring.type === "spring"
      ? `Spring ${spring.response} / ${spring.damping}`
      : spring.type === "steps"
        ? `Steps(${spring.count}) ${spring.duration}ms`
        : "Instant";
  return `${head} · ${jelly.amount > 0 ? `jelly ${jelly.amount}` : "no jelly"}`;
}

/**
 * Gerçek bir basış gibi: düğmenin ortasında işaretçi iner, kısa süre sonra
 * kalkar. React Aria basışı tanır; jöle ve kişiliğin efekti (POW!, +100)
 * kütüphanenin kendisinden gelir. Sanal sayılmasın diye basınç verilir.
 */
export function pressLike(el: HTMLElement, hold = 140) {
  const r = el.getBoundingClientRect();
  const init: PointerEventInit = {
    bubbles: true,
    cancelable: true,
    composed: true,
    pointerId: 99,
    pointerType: "mouse",
    isPrimary: true,
    button: 0,
    width: 1,
    height: 1,
    pressure: 0.5,
    clientX: r.left + r.width / 2,
    clientY: r.top + r.height / 2,
  };
  el.dispatchEvent(new PointerEvent("pointerdown", { ...init, buttons: 1 }));
  setTimeout(() => {
    el.dispatchEvent(new PointerEvent("pointerup", { ...init, buttons: 0 }));
    // React Aria basışın yerini click'ten okur; sahte basışta tarayıcı click
    // üretmez, yoksa POW! (0, 0) noktasında, ekranın dışında çıkıyordu.
    el.dispatchEvent(new MouseEvent("click", { ...init, detail: 1 }));
  }, hold);
}

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (onChange: () => void) => {
  const mq = matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

/** Hareket azaltılmış mı (sunucuda ve hidrasyonda hayır). */
export const useReducedMotion = () =>
  useSyncExternalStore(subscribeReduce, reduceMotion, () => false);
