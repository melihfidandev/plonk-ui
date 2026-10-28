"use client";

import { useSyncExternalStore } from "react";

/**
 * Tarayıcıda hatırlanan küçük bir seçim (sergilerin kişiliği, kod dilinin
 * TS / JS'i). Aynı anahtarı kullanan bütün bileşenler birlikte değişir; sunucuda
 * ve hidrasyonda varsayılan değer kullanılır.
 */
export function createStore<T extends string>(
  key: string,
  fallback: T,
  allowed: readonly T[],
) {
  let value: T | null = null;
  const listeners = new Set<() => void>();

  const read = (): T => {
    if (value !== null) return value;
    try {
      const saved = localStorage.getItem(key);
      value = allowed.includes(saved as T) ? (saved as T) : fallback;
    } catch {
      value = fallback;
    }
    return value;
  };

  const set = (next: T) => {
    value = next;
    try {
      localStorage.setItem(key, next);
    } catch {
      // Hatırlanamasa da bu sekmede geçerli.
    }
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const use = () => useSyncExternalStore(subscribe, read, () => fallback);

  return { use, set };
}
