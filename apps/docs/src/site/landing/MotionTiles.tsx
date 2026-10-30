"use client";

import { useEffect, useRef } from "react";
import { Button, PERSONALITY_NAMES, PlonkProvider, Switch } from "plonk";
import { PERSONALITY_LABELS } from "../Exhibit";
import { motionLine, pressLike, reduceMotion } from "./motion";

/**
 * Dört kişiliğin hareket dili yan yana. Bölüm ekrandayken karolar sırayla
 * kendiliğinden basılır (bir dalga); ziyaretçi dokununca dalga durur.
 * Basışlar gerçek: jöle, POW!, +100 kütüphanenin kendisinden.
 */
export function MotionTiles() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || reduceMotion()) return;
    const tiles = [...el.querySelectorAll<HTMLElement>(".site-tile")];
    let timer = 0;
    let wave = 0;
    let stopped = false;
    const start = () => {
      if (stopped) return;
      clearInterval(timer);
      timer = window.setInterval(() => {
        const tile = tiles[wave++ % tiles.length]!;
        const button = tile.querySelector<HTMLElement>(".plonk-button");
        if (button) pressLike(button);
        setTimeout(
          () => tile.querySelector<HTMLInputElement>("input")?.click(),
          320,
        );
      }, 1100);
    };
    const observer = new IntersectionObserver(
      ([entry]) => (entry?.isIntersecting ? start() : clearInterval(timer)),
      { threshold: 0.4 },
    );
    observer.observe(el);
    // Gerçek bir dokunuş dalgayı durdurur (kendi taklit basışlarımız değil).
    const onPointer = (e: PointerEvent) => {
      if (!e.isTrusted) return;
      stopped = true;
      clearInterval(timer);
    };
    el.addEventListener("pointerdown", onPointer);
    return () => {
      observer.disconnect();
      clearInterval(timer);
      el.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <div ref={root} className="site-tiles">
      {PERSONALITY_NAMES.map((name, i) => (
        <PlonkProvider
          key={name}
          personality={name}
          toaster={false}
          className="site-tile"
        >
          <header>
            <span>0{i + 1}</span>
            <span>Motion</span>
          </header>
          <h3>{PERSONALITY_LABELS[name]}</h3>
          <p>{motionLine(name)}</p>
          <div className="row">
            <Button size="sm">Press</Button>
            <Switch aria-label={`${PERSONALITY_LABELS[name]} switch`} />
          </div>
        </PlonkProvider>
      ))}
    </div>
  );
}
