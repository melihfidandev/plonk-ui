export type JellyKind = "pop" | "squish";

/**
 * Elemanda jöle animasyonunu (yeniden) başlatır.
 *
 * Sınıf yerine `data-plonk-jelly` özelliği kullanılır: React `className`'i
 * yeniden yazdığında animasyon silinmez, çünkü bu özelliği React yönetmez.
 * Miktar ve süre `--plonk-jelly-*` token'larından gelir.
 */
export function playJelly(el: HTMLElement, kind: JellyKind = "pop") {
  el.removeAttribute("data-plonk-jelly");
  // Yeniden akış zorlanmazsa tarayıcı aynı animasyonu baştan başlatmaz.
  void el.offsetWidth;
  el.setAttribute("data-plonk-jelly", kind);
}
