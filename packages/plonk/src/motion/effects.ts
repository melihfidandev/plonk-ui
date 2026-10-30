/**
 * Basma efektleri: kişiliğin "imza" anları. Hangisinin oynayacağını CSS seçer
 * (`--plonk-press-effect`): Çizgi Roman'da `burst` (tıklanan yerde PAT!, ZAP!),
 * Atari'de `score` (düğmeden +100 uçar), diğerlerinde `none`.
 *
 * Efekt `body`'ye eklenir: hiçbir kutunun overflow'u ya da transform'u onu
 * kırpmasın. Kişiliğin renk ve fontu kaynak elemandan kopyalanır; böylece
 * kullanıcının provider `style`'ı ile verdiği renkler de geçerli olur.
 */

const BURST_WORDS = ["PAT!", "ZAP!", "BAM!", "POW!", "TAK!"];
const SCORES = [10, 50, 100, 250];

/** Efektin okuduğu değişkenler. */
const COPIED = [
  "--plonk-color-primary",
  "--plonk-color-accent",
  "--plonk-color-ink",
  "--plonk-color-surface",
  "--plonk-border-width",
  "--plonk-font-display",
];

/** Animasyon hiç bitmezse (sekme arka planda) yine de temizlensin. */
const SAFETY_MS = 2000;

let last = -1;
/** Arka arkaya aynı kelime gelmesin. */
function pick<T>(list: T[]): T {
  let i = Math.floor(Math.random() * list.length);
  if (i === last) i = (i + 1) % list.length;
  last = i;
  return list[i] as T;
}

export interface PressEffectOptions {
  /** `sm`: küçük patlama (ör. toast'un inişi). */
  size?: "sm";
}

/**
 * Elemanın kişiliğindeki basma efektini oynatır. `point` ekran koordinatı;
 * verilmezse (klavye) elemanın ortası kullanılır.
 */
export function playPressEffect(
  el: Element,
  point?: { x: number; y: number },
  options: PressEffectOptions = {},
) {
  if (typeof document === "undefined") return;
  const style = getComputedStyle(el);
  const kind = style.getPropertyValue("--plonk-press-effect").trim();
  if (kind !== "burst" && kind !== "score") return;

  const rect = el.getBoundingClientRect();
  const fx = document.createElement("div");
  fx.setAttribute("aria-hidden", "true");
  fx.className = kind === "burst" ? "plonk-fx-burst" : "plonk-fx-score";
  if (options.size) fx.dataset.size = options.size;
  for (const name of COPIED) {
    fx.style.setProperty(name, style.getPropertyValue(name));
  }
  // Büyük harf dile göre çevrilsin (tr: i → İ).
  const lang = el.closest("[lang]")?.getAttribute("lang");
  if (lang) fx.lang = lang;
  if (
    el.closest('[data-plonk-motion="reduce"]') ||
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  ) {
    fx.dataset.reduce = "";
  }

  // Efektin elemana göre yeri (sol üst köşeden).
  let dx = rect.width / 2;
  let dy = 0;
  if (kind === "burst") {
    if (point) {
      dx = point.x - rect.left;
      dy = point.y - rect.top;
    } else {
      dy = rect.height / 2;
    }
    const word = document.createElement("span");
    word.textContent = pick(BURST_WORDS);
    fx.append(word);
    // Her patlama biraz farklı açıyla.
    fx.style.setProperty("--plonk-fx-tilt", `${Math.random() * 16 - 8}deg`);
  } else {
    fx.textContent = `+${pick(SCORES)}`;
  }

  const release = place(fx, el, rect, dx, dy);
  document.body.append(fx);
  const remove = () => {
    fx.remove();
    release();
  };
  fx.addEventListener("animationend", (e) => {
    if (e.target === fx) remove();
  });
  setTimeout(remove, SAFETY_MS);
}

const supportsAnchors = () =>
  typeof CSS !== "undefined" && CSS.supports?.("anchor-name: --a") === true;
let anchorSeq = 0;

/*
 * Efekti elemanın üstüne yerleştirir. Mümkünse CSS anchor ile elemana
 * çapalanır: konumu tarayıcı hesaplar. Ekran koordinatıyla (fixed + left/top)
 * yerleştirmek Safari'de iki parmakla yakınlaştırınca kayıyordu; elemanın
 * yeri ile fixed konum farklı koordinat sistemlerinde kalıyor. Anchor
 * desteklemeyen tarayıcılarda koordinat yöntemi kalır.
 */
function place(
  fx: HTMLElement,
  el: Element,
  rect: DOMRect,
  dx: number,
  dy: number,
): () => void {
  const target = (el as Partial<ElementCSSInlineStyle>).style;
  if (!target || !supportsAnchors()) {
    fx.style.left = `${rect.left + dx}px`;
    fx.style.top = `${rect.top + dy}px`;
    return () => {};
  }
  const name = `--plonk-fx-${++anchorSeq}`;
  const names = () =>
    target
      .getPropertyValue("anchor-name")
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n && n !== "none");
  // Elemanın kendi anchor'ları varsa (aynı anda iki efekt de olabilir) korunur.
  target.setProperty("anchor-name", [...names(), name].join(", "));
  fx.style.setProperty("position-anchor", name);
  // Yedek değer: eleman efekt bitmeden DOM'dan kalkarsa (dialog'u kapatan
  // düğme, yeniden kurulan bileşen) çapa kaybolur; yedeksiz anchor() geçersiz
  // sayılır ve efekt sayfanın sol altına düşerdi. Son bilinen yerinde kalır.
  fx.style.left = `anchor(left, ${rect.left}px)`;
  fx.style.top = `anchor(top, ${rect.top}px)`;
  fx.style.marginLeft = `${dx}px`;
  fx.style.marginTop = `${dy}px`;
  return () => {
    const rest = names().filter((n) => n !== name);
    if (rest.length) target.setProperty("anchor-name", rest.join(", "));
    else target.removeProperty("anchor-name");
  };
}
