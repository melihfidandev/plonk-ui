import { afterEach, describe, expect, it, vi } from "vitest";
import { playPressEffect } from "./effects";

const button = (effect?: string) => {
  const el = document.createElement("button");
  if (effect) el.style.setProperty("--plonk-press-effect", effect);
  document.body.append(el);
  return el;
};

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("playPressEffect", () => {
  it("kişilik efekt seçmediyse hiçbir şey eklemez", () => {
    playPressEffect(button());
    playPressEffect(button("none"));
    expect(document.querySelector("[class^='plonk-fx']")).toBeNull();
  });

  it("burst: tıklanan noktada ekran okuyuculardan gizli bir ses balonu", () => {
    vi.spyOn(CSS, "supports").mockReturnValue(false);
    playPressEffect(button("burst"), { x: 40, y: 60 });
    const fx = document.querySelector<HTMLElement>(".plonk-fx-burst");
    expect(fx).not.toBeNull();
    expect(fx?.getAttribute("aria-hidden")).toBe("true");
    expect(fx?.style.left).toBe("40px");
    expect(fx?.textContent).toMatch(/^[A-Z]+!$/);
  });

  it("anchor destekleniyorsa elemana çapalanır, bitince çapa kalkar", () => {
    vi.useFakeTimers();
    vi.spyOn(CSS, "supports").mockReturnValue(true);
    const el = button("burst");
    el.style.setProperty("anchor-name", "--kendi");
    playPressEffect(el, { x: 40, y: 60 });
    const fx = document.querySelector<HTMLElement>(".plonk-fx-burst");
    const name = fx?.style.getPropertyValue("position-anchor");
    expect(name).toMatch(/^--plonk-fx-\d+$/);
    // Elemanın kendi çapası korunur.
    expect(el.style.getPropertyValue("anchor-name")).toBe(`--kendi, ${name}`);
    expect(fx?.style.marginLeft).toBe("40px");
    vi.advanceTimersByTime(2000);
    expect(el.style.getPropertyValue("anchor-name")).toBe("--kendi");
  });

  it("score: puan yazar ve animasyon hiç bitmese de temizlenir", () => {
    vi.useFakeTimers();
    playPressEffect(button("score"));
    expect(document.querySelector(".plonk-fx-score")?.textContent).toMatch(
      /^\+\d+$/,
    );
    vi.advanceTimersByTime(2000);
    expect(document.querySelector(".plonk-fx-score")).toBeNull();
  });

  it("hareket azaltılmışsa efekt işaretlenir (CSS sadece belirip söndürür)", () => {
    const wrap = document.createElement("div");
    wrap.dataset.plonkMotion = "reduce";
    const el = button("burst");
    wrap.append(el);
    document.body.append(wrap);
    playPressEffect(el);
    expect(
      document.querySelector<HTMLElement>(".plonk-fx-burst")?.dataset.reduce,
    ).toBe("");
  });
});
