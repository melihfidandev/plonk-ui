"use client";

import { useEffect, useRef } from "react";
import {
  Badge,
  Button,
  Card,
  Input,
  PERSONALITY_NAMES,
  PlonkProvider,
  Progress,
  Switch,
  type PersonalityName,
  type PlonkStyle,
} from "plonk-ui";
import { PERSONALITY_LABELS } from "../Exhibit";
import { reduceMotion } from "./motion";

/*
 * Kaydırma ilerlemesinin bölümleri: kısa giriş, her kişilik için bir tarama,
 * aralarında kısa duraklama. Toplam birim içinde konum.
 */
const LEAD = 0.15;
const PAUSE = 0.35;
const TOTAL = LEAD * 2 + 3 + PAUSE * 2;

function Board({ name, index }: { name: PersonalityName; index: number }) {
  return (
    <PlonkProvider
      personality={name}
      toaster={false}
      className="site-board"
      // İlk kişilik dışındakiler başta tamamen kırpılı (sağda bekler).
      style={(index > 0 ? { "--x": "100%" } : {}) as PlonkStyle}
      inert={index > 0}
    >
      <div className="site-board-grid">
        <Card
          tilt="left"
          tape={name === "sticker"}
          title="Invite a teammate"
          description="They get an email with a link to join."
          footer={
            <>
              <Button>Send invite</Button>
              <Button variant="ghost">Cancel</Button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <Input label="Email" defaultValue="ada@studio.com" />
            <Switch label="Send a welcome note" defaultChecked />
          </div>
        </Card>
        <div className="side flex-col gap-6">
          <Card
            title="This week"
            actions={<Badge variant="success">On track</Badge>}
          >
            <div className="flex flex-col gap-4">
              <Progress label="Storage" value={62} showValue />
              <div className="flex flex-wrap gap-2">
                <Badge variant="accent">Beta</Badge>
                <Badge variant="warning">Paused</Badge>
              </div>
            </div>
          </Card>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary">Share</Button>
            <Button variant="accent">Preview</Button>
          </div>
        </div>
      </div>
      <span className="site-board-name" aria-hidden="true">
        0{index + 1} · {PERSONALITY_LABELS[name]}
      </span>
    </PlonkProvider>
  );
}

/**
 * Aynı pano dört kişilikte üst üste; kaydırdıkça bir tarama çizgisi sağdan
 * sola geçer ve arkasında panoyu bir sonraki kişiliğe çevirir. Bölüm uzun,
 * içindeki sahne yapışık; ilerleme CSS değişkenlerine yazılır (React çizmez).
 * Hareket azaltılmışsa tarama yok, panolar alt alta (CSS).
 */
export function Wipe() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = section.current;
    if (!root || reduceMotion()) return;
    const boards = [...root.querySelectorAll<HTMLElement>(".site-board")];
    const scan = root.querySelector<HTMLElement>(".site-scan")!;
    const chips = [
      ...root.querySelectorAll<HTMLElement>(".site-wipe-chips span"),
    ];
    let frame = 0;
    let shown = -1;

    const update = () => {
      frame = 0;
      const total = root.offsetHeight - innerHeight;
      const p = Math.min(
        1,
        Math.max(0, -root.getBoundingClientRect().top / total),
      );
      const at = p * TOTAL;
      let current = 0;
      let line: number | null = null;
      boards.slice(1).forEach((board, k) => {
        const start = LEAD + k * (1 + PAUSE);
        const local = Math.min(1, Math.max(0, at - start));
        const x = 100 - local * 100;
        board.style.setProperty("--x", `${x}%`);
        if (x < 50) current = k + 1;
        if (x > 0 && x < 100) {
          line = x;
          scan.dataset.label = `→ ${PERSONALITY_LABELS[PERSONALITY_NAMES[k + 1]!]}`;
        }
      });
      scan.toggleAttribute("data-on", line !== null);
      if (line !== null) scan.style.setProperty("--line", `${line}%`);
      if (current !== shown) {
        shown = current;
        chips.forEach((chip, i) =>
          chip.toggleAttribute("data-on", i === current),
        );
        // Görünen pano dışındakiler odak ve ekran okuyucu dışında.
        boards.forEach((board, i) => (board.inert = i !== current));
      }
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={section} className="site-wipe" aria-labelledby="wipe-title">
      <div className="site-wrap site-wipe-sticky">
        <div className="site-wipe-head">
          <div>
            <span className="site-eyebrow">Same parts</span>
            <h2 id="wipe-title" className="site-h2">
              Different character.
            </h2>
          </div>
          <div className="site-wipe-chips" aria-hidden="true">
            {PERSONALITY_NAMES.map((name, i) => (
              <span key={name} data-on={i === 0 || undefined}>
                {PERSONALITY_LABELS[name]}
              </span>
            ))}
          </div>
        </div>
        <div className="site-wipe-frame">
          {PERSONALITY_NAMES.map((name, i) => (
            <Board key={name} name={name} index={i} />
          ))}
          <span className="site-scan" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
