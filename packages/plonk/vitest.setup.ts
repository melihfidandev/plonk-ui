import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

// jsdom'da Web Animations yok; React Aria'nın SelectionIndicator'ı bunu
// koşulsuz çağırıyor. Tarayıcıda gerçeği var, testte boş liste yeter.
if (typeof Element !== "undefined" && !("getAnimations" in Element.prototype)) {
  Object.defineProperty(Element.prototype, "getAnimations", {
    value: () => [],
  });
}

// jsdom'da ResizeObserver yok; TabList göstergesi sekme boyutlarını izliyor.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
