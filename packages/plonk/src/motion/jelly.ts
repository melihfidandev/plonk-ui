import { useEffect, useRef } from "react";

/**
 * pop: bırakınca esneme. squish: yer değiştirirken ezilme.
 * shake: hata anında "hayır" sallanması.
 */
export type JellyKind = "pop" | "squish" | "shake";

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

/**
 * Hata durumu yeni başladığında elemanı sallar. İlk render'da sallamaz;
 * sadece geçerliden geçersize geçişte çalışır.
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
