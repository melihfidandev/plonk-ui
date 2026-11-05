"use client";

import { useId, useRef, useState } from "react";
import {
  Radio,
  RadioGroup,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "react-aria-components";
import { playJelly } from "plonk-ui";
import { PERSONALITY_LABELS } from "../Exhibit";
import { LiveCode } from "../LiveCode";
import { createStore } from "../store";
import {
  ColorsPanel,
  MotionPanel,
  PersonalityPanel,
  ShapePanel,
} from "./panels";
import { Preview } from "./Preview";
import { selectPersonality, setDraft, shareUrl, useBuilder } from "./store";
import { changes, emptyDraft, themeCode, type CodeFormat } from "./theme";

/** Kodun biçimi: CSS dosyası ya da provider `style`'ı. Hatırlanır. */
const codeFormat = createStore<CodeFormat>("plonk-docs-theme-format", "css", [
  "css",
  "provider",
]);

const reduceMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Tema oluşturucu ("Tezgâh"): telefonda önizleme üstte (yapışık), altında
 * sekmeli ayarlar, en altta açılır kod çekmecesi. Geniş ekranda solda ayarlar,
 * sağda büyük önizleme. Yerleşim sayfanın değil oluşturucunun genişliğine
 * bakar (container query): yan menü açıkken de doğru düzene geçer.
 */
export function ThemeBuilder() {
  const { current, drafts } = useBuilder();
  const draft = drafts[current];
  const format = codeFormat.use();
  const [motion, setMotion] = useState<"system" | "reduce">("system");
  const [codeOpen, setCodeOpen] = useState(false);
  const [shared, setShared] = useState<"copied" | "failed" | null>(null);
  const sample = useRef<HTMLDivElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const codeId = useId();
  const count = changes(draft).length;

  /** "Hepsine bas": düğmeler sırayla basılıp bırakılır, ardından kartlar esner. */
  const pressEverything = () => {
    const root = sample.current;
    if (!root) return;
    const buttons = [...root.querySelectorAll<HTMLElement>(".plonk-button")];
    buttons.forEach((button, i) => {
      setTimeout(() => {
        button.setAttribute("data-pressed", "true");
        setTimeout(() => {
          button.removeAttribute("data-pressed");
          playJelly(button, "pop");
        }, 120);
      }, i * 90);
    });
    root.querySelectorAll<HTMLElement>(".plonk-card").forEach((card, i) => {
      setTimeout(() => playJelly(card, "pop"), buttons.length * 90 + i * 140);
    });
  };

  // Çekmece açıldıktan sonra (yükseklik geçişi 440ms) altı görünecek kadar kaydır.
  const showCode = () => {
    setCodeOpen(true);
    const reduce = reduceMotion();
    setTimeout(
      () =>
        drawer.current?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "end",
        }),
      reduce ? 0 : 460,
    );
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(draft));
      setShared("copied");
    } catch {
      setShared("failed");
    }
    setTimeout(() => setShared(null), 1800);
  };

  return (
    <section className="site-builder" aria-label="Theme builder">
      <div className="site-exhibit-bar site-builder-bar">
        <b>Theme</b>
        <span className="live">Live</span>
        <span className="site-builder-status">
          {PERSONALITY_LABELS[draft.personality]}
          {count > 0 && ` + ${count} ${count === 1 ? "change" : "changes"}`}
        </span>
        <div className="site-builder-actions">
          <button
            type="button"
            onClick={() => setDraft(emptyDraft(draft.personality))}
            disabled={count === 0}
          >
            Reset
          </button>
          <button type="button" onClick={share}>
            <span aria-live="polite">
              {shared === "copied"
                ? "Link copied"
                : shared === "failed"
                  ? "Copy failed"
                  : "Copy link"}
            </span>
          </button>
          <button
            type="button"
            className="primary"
            aria-controls={codeId}
            aria-expanded={codeOpen}
            onClick={codeOpen ? () => setCodeOpen(false) : showCode}
          >
            Code
            <span
              className="count"
              key={count}
              data-zero={count === 0 || undefined}
            >
              {count}
            </span>
          </button>
        </div>
      </div>

      <div className="site-builder-body">
        <div className="site-builder-preview">
          <Preview draft={draft} motion={motion} ref={sample} />
        </div>
        <Tabs className="site-builder-tabs">
          <TabList aria-label="Settings">
            <Tab id="personality">Personality</Tab>
            <Tab id="colors">Colors</Tab>
            <Tab id="shape">Shape</Tab>
            <Tab id="motion">Motion</Tab>
          </TabList>
          <TabPanel id="personality">
            <PersonalityPanel
              drafts={drafts}
              current={current}
              onSelect={selectPersonality}
            />
          </TabPanel>
          <TabPanel id="colors">
            <ColorsPanel draft={draft} edit={setDraft} />
          </TabPanel>
          <TabPanel id="shape">
            <ShapePanel draft={draft} edit={setDraft} />
          </TabPanel>
          <TabPanel id="motion">
            <MotionPanel
              draft={draft}
              edit={setDraft}
              motion={motion}
              onMotion={setMotion}
              onTry={pressEverything}
            />
          </TabPanel>
        </Tabs>
      </div>

      <div
        ref={drawer}
        className="site-builder-code"
        data-open={codeOpen || undefined}
      >
        <button
          type="button"
          className="site-builder-code-toggle"
          aria-controls={codeId}
          aria-expanded={codeOpen}
          onClick={() => setCodeOpen((open) => !open)}
        >
          <span>Get the code</span>
          <small>
            {count === 0
              ? "No changes yet"
              : `${count} ${count === 1 ? "token" : "tokens"}`}
          </small>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="square"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <div id={codeId} className="site-builder-code-body" inert={!codeOpen}>
          <div>
            <div className="site-builder-code-head">
              <RadioGroup
                aria-label="Format"
                orientation="horizontal"
                value={format}
                onChange={(value) => codeFormat.set(value as CodeFormat)}
                className="site-segment"
              >
                <Radio value="css">CSS</Radio>
                <Radio value="provider">Provider</Radio>
              </RadioGroup>
              <p>
                {format === "css"
                  ? "Add it to your global CSS, after plonk-ui/theme.css. Only the tokens you changed are written."
                  : "Tokens in style also reach dialogs, menus and toasts. Only the tokens you changed are written."}
              </p>
            </div>
            <LiveCode
              lang={format === "css" ? "CSS" : "JSX"}
              code={themeCode(draft, format)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
