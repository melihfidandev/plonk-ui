import { useEffect, useRef, useState, type ReactNode } from "react";

/** Ekran okuyucuya kalan süre bu anlarda bildirilir (her saniye değil). */
const ANNOUNCE_AT = [10, 5];
/** Saniyeden sık bakılır: sekme uyuyup uyanınca sayı hemen düzelsin. */
const POLL_MS = 200;

export interface CountdownProps {
  /** Kaç saniyeden geriye sayılır. */
  seconds: number;
  label: ReactNode;
  message: (seconds: number) => string;
  onEnd: () => void;
}

/**
 * Dialog'un geri sayımı. Süre bir bitiş anına göre hesaplanır, sayaç
 * kaymaz. Görünen sayı ekran okuyuculardan gizlidir; onlara sadece
 * belli anlarda kibarca (polite) kalan süre söylenir.
 *
 * Görünüş kişilikten gelir: Atari'de dev "DEVAM? 9", diğerlerinde
 * kendi tarzlarında küçük bir sayaç. Her saniyede sayı `key` ile yeniden
 * doğar, böylece CSS'teki tik animasyonu baştan oynar.
 */
export function Countdown({ seconds, label, message, onEnd }: CountdownProps) {
  const [left, setLeft] = useState(seconds);
  const [announcement, setAnnouncement] = useState("");
  const onEndRef = useRef(onEnd);
  const messageRef = useRef(message);
  useEffect(() => {
    onEndRef.current = onEnd;
    messageRef.current = message;
  });

  useEffect(() => {
    const deadline = Date.now() + seconds * 1000;
    let last = seconds;
    const id = setInterval(() => {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      if (next === last) return;
      last = next;
      setLeft(next);
      if (ANNOUNCE_AT.includes(next) && next < seconds) {
        setAnnouncement(messageRef.current(next));
      }
      if (next === 0) {
        clearInterval(id);
        onEndRef.current();
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [seconds]);

  return (
    <div className="plonk-countdown" data-urgent={left <= 3 || undefined}>
      <span className="plonk-countdown-label font-plonk-display">{label}</span>
      <span
        key={left}
        aria-hidden="true"
        className="plonk-countdown-n font-plonk-display"
      >
        {left}
      </span>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </div>
  );
}
