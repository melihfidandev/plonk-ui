import { useEffect, useRef, useState, type ReactNode } from "react";

/** Moments at which the remaining time is announced to screen readers (not every second). */
const ANNOUNCE_AT = [10, 5];
/**
 * Checked more often than once a second, so the number corrects itself right away
 * when the tab sleeps and wakes.
 */
const POLL_MS = 200;

export interface CountdownProps {
  /** Number of seconds to count down from. */
  seconds: number;
  label: ReactNode;
  message: (seconds: number) => string;
  onEnd: () => void;
}

/**
 * The dialog's countdown. Time is computed against an end moment, so the counter
 * doesn't drift. The visible number is hidden from screen readers; they are told the
 * remaining time politely, only at certain moments.
 *
 * The look comes from the personality: a huge "CONTINUE? 9" in Arcade, a small
 * counter in its own style elsewhere. Each second the number is reborn with a `key`,
 * so the tick animation in CSS replays from the start.
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
