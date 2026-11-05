"use client";

import { useState } from "react";
import {
  Badge,
  Card,
  DatePicker,
  PlonkProvider,
  Slider,
  parseDate,
} from "plonk-ui";
import { Label, Radio, RadioGroup } from "react-aria-components";
import { Exhibit, exhibitPersonality } from "./Exhibit";
import { LiveCode } from "./LiveCode";

/** Sergideki metinler her dilde: bileşenlerin kendisi tarih ve sayıyı çevirir. */
const LOCALES = {
  "en-US": {
    title: "Trip notifications",
    badge: "New",
    date: "Departure",
    budget: "Budget used",
  },
  "tr-TR": {
    title: "Gezi bildirimleri",
    badge: "Yeni",
    date: "Gidiş tarihi",
    budget: "Kullanılan bütçe",
  },
  "de-DE": {
    title: "Reisemitteilungen",
    badge: "Neu",
    date: "Abreise",
    budget: "Budget genutzt",
  },
  "ja-JP": {
    title: "旅行の通知",
    badge: "新着",
    date: "出発日",
    budget: "予算の使用率",
  },
} as const;

type Locale = keyof typeof LOCALES;

// Sabit tarih: ön-render'da "bugün" okunmasın, sunucu ve tarayıcı aynı çizsin.
const DEPARTURE = parseDate("2026-11-14");

/**
 * Dil sergisi: aynı bileşenler, farklı `locale`. Tarih biçimi, haftanın ilk
 * günü, sayı biçimi ve büyük harf kuralı (Çizgi Roman / Atari'de i → İ) değişir.
 */
export function LocaleLab() {
  const personality = exhibitPersonality.use();
  const [locale, setLocale] = useState<Locale>("tr-TR");
  const text = LOCALES[locale];

  return (
    <Exhibit
      title="Localization · Try it"
      footer={
        <>
          <div className="site-controls">
            <RadioGroup
              value={locale}
              onChange={(value) => setLocale(value as Locale)}
              orientation="horizontal"
              className="site-control"
            >
              <Label>locale</Label>
              <div className="site-segment">
                {Object.keys(LOCALES).map((key) => (
                  <Radio key={key} value={key}>
                    {key}
                  </Radio>
                ))}
              </div>
            </RadioGroup>
          </div>
          <LiveCode
            lang="JSX"
            code={`<PlonkProvider locale="${locale}">\n  <App />\n</PlonkProvider>`}
          />
        </>
      }
    >
      <PlonkProvider personality={personality} locale={locale} toaster={false}>
        <Card title={text.title} className="w-80 max-w-full">
          <div className="flex flex-col items-start gap-5">
            <Badge variant="accent">{text.badge}</Badge>
            <DatePicker label={text.date} defaultValue={DEPARTURE} />
            <div className="w-full">
              <Slider
                aria-label={text.budget}
                defaultValue={0.42}
                min={0}
                max={1}
                step={0.01}
                formatOptions={{ style: "percent" }}
              />
            </div>
          </div>
        </Card>
      </PlonkProvider>
    </Exhibit>
  );
}
