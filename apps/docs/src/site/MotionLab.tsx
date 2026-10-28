"use client";

import { useState } from "react";
import {
  Button,
  Checkbox,
  PlonkProvider,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  personalities,
} from "plonk";
import { Label, Radio, RadioGroup } from "react-aria-components";
import { Exhibit, exhibitPersonality } from "./Exhibit";
import { LiveCode } from "./LiveCode";

type Motion = "system" | "reduce";

/**
 * Hareket sergisi: jöle miktarını kaydır, hareketi azalt, farkı bileşenlerde
 * gör. Hareket azaltılınca jöle her durumda 0 olur (kaydırıcı ne derse desin).
 */
export function MotionLab() {
  const personality = exhibitPersonality.use();
  const { amount: fallback, duration } = personalities[personality].jelly;
  // Retro ve Atari'de jöle yok (süre 0): kaydırıcı kapalı.
  const wobbles = duration > 0;
  const [jelly, setJelly] = useState<number | null>(null);
  const [motion, setMotion] = useState<Motion>("system");
  const amount = jelly ?? fallback;

  const props = [
    `personality="${personality}"`,
    wobbles && jelly != null && `jelly={${jelly}}`,
    motion === "reduce" && `motion="reduce"`,
  ].filter(Boolean);
  const code = `<PlonkProvider ${props.join(" ")}>\n  <App />\n</PlonkProvider>`;

  return (
    <Exhibit
      title="Motion · Try it"
      footer={
        <>
          <div className="site-controls">
            <label className="site-control">
              <span>
                jelly ·{" "}
                {wobbles ? amount.toFixed(2) : "none in this personality"}
              </span>
              <input
                type="range"
                className="site-range"
                min={0}
                max={1}
                step={0.05}
                value={wobbles ? amount : 0}
                disabled={!wobbles}
                onChange={(e) => setJelly(Number(e.target.value))}
              />
            </label>
            <RadioGroup
              value={motion}
              onChange={(value) => setMotion(value as Motion)}
              orientation="horizontal"
              className="site-control"
            >
              <Label>motion</Label>
              <div className="site-segment">
                <Radio value="system">system</Radio>
                <Radio value="reduce">reduce</Radio>
              </div>
            </RadioGroup>
            {wobbles && jelly != null && (
              <button
                type="button"
                className="site-reset"
                onClick={() => setJelly(null)}
              >
                Reset
              </button>
            )}
          </div>
          <LiveCode lang="JSX" code={code} />
        </>
      }
    >
      <PlonkProvider
        personality={personality}
        toaster={false}
        jelly={wobbles ? (jelly ?? undefined) : undefined}
        motion={motion}
      >
        <div className="flex flex-col items-start gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Press and hold</Button>
            <Button variant="secondary">Press me</Button>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Switch label="Autosave" />
            <Checkbox label="Remember me" />
          </div>
          <Tabs>
            <TabList aria-label="Plan">
              <Tab id="month">Monthly</Tab>
              <Tab id="year">Yearly</Tab>
              <Tab id="life">Lifetime</Tab>
            </TabList>
            <TabPanel id="month">$12 a month.</TabPanel>
            <TabPanel id="year">$120 a year.</TabPanel>
            <TabPanel id="life">$400 once.</TabPanel>
          </Tabs>
        </div>
      </PlonkProvider>
    </Exhibit>
  );
}
