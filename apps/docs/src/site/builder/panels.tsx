"use client";

import type { CSSProperties, ReactNode } from "react";
import { Checkbox, Label, Radio, RadioGroup } from "react-aria-components";
import {
  PERSONALITY_NAMES,
  contrastRatio,
  personalities,
  type PersonalityName,
} from "plonk";
import { ColorField, Contrast } from "../ColorField";
import { PERSONALITY_LABELS } from "../Exhibit";
import {
  BODY_FONTS,
  DISPLAY_FONTS,
  INK_SHADOW,
  PAIRS,
  SURFACES,
  changes,
  colorVar,
  linkedRadii,
  setFill,
  setOn,
  unlockOn,
  valueOf,
  withValues,
  type Draft,
  type FontOption,
  type Token,
} from "./theme";

type Edit = (next: Draft) => void;

const SUMMARY: Record<PersonalityName, string> = {
  sticker: "Notebook stickers and tape. Squishes and wobbles like jelly.",
  retro: "Every part is a window. Stepped, instant motion.",
  comic: "Thick ink, halftone dots, speech bubbles. Presses go POW.",
  arcade: "Neon on a night sky. Buttons score points.",
};

/** Panelin içinde başlıklı bir küme. */
function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="site-builder-group">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

const color = (draft: Draft, key: string) =>
  valueOf(draft, colorVar(key) as Token);
const number = (value: string) => parseFloat(value) || 0;

/* ---------- Personality ---------- */

export function PersonalityPanel({
  drafts,
  current,
  onSelect,
}: {
  drafts: Record<PersonalityName, Draft>;
  current: PersonalityName;
  onSelect: (name: PersonalityName) => void;
}) {
  return (
    <>
      <RadioGroup
        aria-label="Start from a personality"
        value={current}
        onChange={(value) => onSelect(value as PersonalityName)}
        className="site-bases"
      >
        {PERSONALITY_NAMES.map((name) => {
          const draft = drafts[name];
          const count = changes(draft).length;
          return (
            <Radio key={name} value={name} className="site-base">
              {/* Noktalar o kişiliğin şu anki renkleri (değiştirildiyse seninkiler). */}
              <span className="swatches" aria-hidden="true">
                {(
                  [
                    "canvas",
                    "surface",
                    "primary",
                    "accent",
                    "secondary",
                  ] as const
                ).map((key) => (
                  <i key={key} style={{ background: color(draft, key) }} />
                ))}
              </span>
              <b>{PERSONALITY_LABELS[name]}</b>
              <small>{SUMMARY[name]}</small>
              {count > 0 && (
                <span className="changed" key={count}>
                  {count} {count === 1 ? "change" : "changes"}
                </span>
              )}
            </Radio>
          );
        })}
      </RadioGroup>
      <p className="site-builder-note">
        You tune how it looks. The motion language and signature moments stay
        with the personality. Each personality keeps its own changes.
      </p>
    </>
  );
}

/* ---------- Colors ---------- */

export function ColorsPanel({ draft, edit }: { draft: Draft; edit: Edit }) {
  const set = (key: string) => (value: string) =>
    edit(withValues(draft, { [colorVar(key)]: value }));
  // Temanın yönü: yazı kartın zemininden açıksa koyu tema (Arcade).
  const lightInk = isLighter(color(draft, "ink"), color(draft, "surface"));
  return (
    <>
      <Group title="Surfaces and text">
        <div className="site-builder-grid">
          {SURFACES.map(({ key, label }) => (
            <div key={key} className="site-builder-field">
              <span>{label}</span>
              <ColorField
                label={label}
                value={color(draft, key)}
                onChange={set(key)}
              />
            </div>
          ))}
        </div>
        <div className="site-builder-checks">
          <Check
            label="Ink on surface"
            what="Text on cards is"
            text={["ink", color(draft, "ink")]}
            back={["surface", color(draft, "surface")]}
            light={lightInk}
          />
          <Check
            label="Ink on canvas"
            what="Text on the page is"
            text={["ink", color(draft, "ink")]}
            back={["canvas", color(draft, "canvas")]}
            light={isLighter(color(draft, "ink"), color(draft, "canvas"))}
          />
          <Check
            label="Muted on surface"
            what="Descriptions on cards are"
            text={["ink muted", color(draft, "inkMuted")]}
            back={["surface", color(draft, "surface")]}
            light={lightInk}
          />
        </div>
      </Group>

      <Group title="Fills and the text on them">
        <p className="site-builder-note">
          Text is the color of labels and icons on the fill. Auto keeps it
          readable.
        </p>
        {PAIRS.map((pair) => {
          const fill = color(draft, pair.key);
          const on = color(draft, pair.on);
          const auto = !draft.locked.includes(pair.on);
          return (
            <div key={pair.key} className="site-builder-pair">
              <div className="head">
                <span>{pair.label}</span>
                <Contrast
                  a={fill}
                  b={on}
                  label={`Text on ${pair.label.toLowerCase()}`}
                />
              </div>
              <div className="fields">
                {/* Etiketler sadece göz için: alanların adları zaten tam. */}
                <span className="slot">
                  <small aria-hidden="true">Fill</small>
                  <ColorField
                    label={pair.label}
                    value={fill}
                    onChange={(value) => edit(setFill(draft, pair, value))}
                  />
                </span>
                <span className="slot">
                  <small aria-hidden="true">Text</small>
                  <ColorField
                    label={`Text on ${pair.label.toLowerCase()}`}
                    value={on}
                    onChange={(value) => edit(setOn(draft, pair, value))}
                  />
                </span>
                <button
                  type="button"
                  className="site-auto"
                  aria-pressed={auto}
                  aria-label={`Pick the text color on ${pair.label.toLowerCase()} automatically`}
                  title="Pick a readable text color automatically"
                  onClick={() =>
                    edit(
                      auto
                        ? { ...draft, locked: [...draft.locked, pair.on] }
                        : unlockOn(draft, pair),
                    )
                  }
                >
                  Auto
                </button>
              </div>
              {contrastRatio(fill, on) < 4.5 && (
                <p className="site-builder-hint">
                  Labels on {pair.label.toLowerCase()} are hard to read.{" "}
                  {auto
                    ? "Pick a lighter or darker fill."
                    : "Turn Auto back on or pick another text color."}
                </p>
              )}
            </div>
          );
        })}
      </Group>

      <Group title="Focus">
        <div className="site-builder-pair">
          <div className="head">
            <span>Focus ring</span>
            <Contrast
              a={color(draft, "focus")}
              b={color(draft, "canvas")}
              min={3}
              label="Focus ring on canvas"
            />
          </div>
          <div className="fields">
            <ColorField
              label="Focus"
              value={color(draft, "focus")}
              onChange={set("focus")}
            />
          </div>
          {contrastRatio(color(draft, "focus"), color(draft, "canvas")) < 3 && (
            <p className="site-builder-hint">
              The focus ring blends into the canvas. Keyboard users may lose
              their place.
            </p>
          )}
        </div>
        <p className="site-builder-note">
          Press Tab inside the preview to see it. It should stand out on the
          canvas: 3:1 at least.
        </p>
      </Group>
    </>
  );
}

/** Rengin siyaha karşı kontrastı daha yüksekse o renk daha açıktır. */
const isLighter = (a: string, b: string) =>
  contrastRatio(a, "#000000") > contrastRatio(b, "#000000");

/**
 * Bir yazı / zemin kontrolü: etiket ve rozet yan yana; eşiğin altındaysa
 * altında ne yapılacağını söyleyen kısa bir ipucu. Yön temanın kendisinden
 * (`light`: yazı zeminden açık mı, koyu temada evet): her satırın kendi
 * renklerine baksaydı biri "surface lighter", öbürü "surface darker" diyebilirdi.
 */
function Check({
  label,
  what,
  text,
  back,
  light,
}: {
  label: string;
  light: boolean;
  /** İpucunun öznesi, ör. "Text on cards is". */
  what: string;
  text: [name: string, color: string];
  back: [name: string, color: string];
}) {
  const low = contrastRatio(text[1], back[1]) < 4.5;
  return (
    <div className="site-builder-check">
      <span className="row">
        {label}
        <Contrast a={text[1]} b={back[1]} label={label} />
      </span>
      {low && (
        <p className="site-builder-hint">
          {what} hard to read. Make {text[0]} {light ? "lighter" : "darker"} or{" "}
          {back[0]} {light ? "darker" : "lighter"}.
        </p>
      )}
    </div>
  );
}

/* ---------- Shape ---------- */

export function Range({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className="site-builder-range" data-disabled={disabled || undefined}>
      <span className="name">{label}</span>
      <output>{disabled ? "–" : `${value}${unit}`}</output>
      <input
        type="range"
        className="site-range"
        min={min}
        max={max}
        step={step}
        value={disabled ? min : value}
        disabled={disabled}
        aria-label={label}
        style={
          {
            "--fill": disabled ? 0 : (value - min) / (max - min),
          } as CSSProperties
        }
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Segment<T extends string>({
  label,
  value,
  options,
  onChange,
  isDisabled,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  isDisabled?: boolean;
}) {
  return (
    <RadioGroup
      value={value}
      onChange={(next) => onChange(next as T)}
      orientation="horizontal"
      isDisabled={isDisabled}
      className="site-control"
    >
      <Label>{label}</Label>
      <div className="site-segment">
        {options.map((option) => (
          <Radio key={option.value} value={option.value}>
            {option.label}
          </Radio>
        ))}
      </div>
    </RadioGroup>
  );
}

function FontPicker({
  label,
  token,
  fonts,
  draft,
  edit,
}: {
  label: string;
  token: "--plonk-font-display" | "--plonk-font-body";
  fonts: FontOption[];
  draft: Draft;
  edit: Edit;
}) {
  return (
    <RadioGroup
      value={valueOf(draft, token)}
      onChange={(value) => {
        const font = fonts.find((f) => f.value === value);
        // Sadece büyük harf çizen fontta başlıklar büyük harfe çevrilir: tarayıcı
        // sayfanın diline göre çevirir (tr: i → İ), font noktasız I çizmez.
        edit(
          withValues(draft, {
            [token]: value,
            ...(font?.capsOnly && { "--plonk-font-display-case": "uppercase" }),
          }),
        );
      }}
      orientation="horizontal"
      className="site-control"
    >
      <Label>{label}</Label>
      <div className="site-fonts">
        {fonts.map((font) => (
          <Radio
            key={font.id}
            value={font.value}
            className="site-font"
            style={{ fontFamily: font.value }}
          >
            {font.label}
          </Radio>
        ))}
      </div>
    </RadioGroup>
  );
}

export function ShapePanel({ draft, edit }: { draft: Draft; edit: Edit }) {
  const px = (token: Token) => number(valueOf(draft, token));
  const set = (token: Token, unit: string) => (value: number) =>
    edit(withValues(draft, { [token]: `${value}${unit}` }));
  const shadowColor = valueOf(draft, "--plonk-shadow-color");
  const display = DISPLAY_FONTS.find(
    (f) => f.value === valueOf(draft, "--plonk-font-display"),
  );

  return (
    <>
      <Group title="Lines and corners">
        <Range
          label="Border"
          value={px("--plonk-border-width")}
          unit="px"
          min={0}
          max={6}
          step={0.5}
          onChange={set("--plonk-border-width", "px")}
        />
        <Checkbox
          isSelected={draft.linked}
          onChange={(linked) => edit({ ...draft, linked })}
          className="site-toggle"
        >
          <span className="box" aria-hidden="true">
            {draft.linked ? "✓" : ""}
          </span>
          One slider for all corners
        </Checkbox>
        {draft.linked ? (
          <Range
            label="Corners"
            value={px("--plonk-radius-md")}
            unit="px"
            min={0}
            max={28}
            step={1}
            onChange={(md) => edit(withValues(draft, linkedRadii(md)))}
          />
        ) : (
          (["sm", "md", "lg"] as const).map((size) => (
            <Range
              key={size}
              label={`Corners ${size}`}
              value={px(`--plonk-radius-${size}`)}
              unit="px"
              min={0}
              max={32}
              step={1}
              onChange={set(`--plonk-radius-${size}`, "px")}
            />
          ))
        )}
      </Group>

      <Group title="Shadow">
        <Range
          label="Offset x"
          value={px("--plonk-shadow-x")}
          unit="px"
          min={-10}
          max={12}
          step={1}
          onChange={set("--plonk-shadow-x", "px")}
        />
        <Range
          label="Offset y"
          value={px("--plonk-shadow-y")}
          unit="px"
          min={0}
          max={12}
          step={1}
          onChange={set("--plonk-shadow-y", "px")}
        />
        <Segment
          label="Shadow color"
          value={shadowColor === INK_SHADOW ? "ink" : "custom"}
          options={[
            { value: "ink", label: "Follows ink" },
            { value: "custom", label: "Custom" },
          ]}
          onChange={(mode) =>
            edit(
              withValues(draft, {
                "--plonk-shadow-color":
                  mode === "ink" ? INK_SHADOW : color(draft, "ink"),
              }),
            )
          }
        />
        {shadowColor !== INK_SHADOW && (
          <ColorField
            label="Shadow color"
            value={shadowColor}
            onChange={(value) =>
              edit(withValues(draft, { "--plonk-shadow-color": value }))
            }
          />
        )}
      </Group>

      <Group title="Type">
        <FontPicker
          label="Headings"
          token="--plonk-font-display"
          fonts={DISPLAY_FONTS}
          draft={draft}
          edit={edit}
        />
        <Segment
          label="Heading case"
          value={
            valueOf(draft, "--plonk-font-display-case") as "none" | "uppercase"
          }
          options={[
            { value: "none", label: "As written" },
            { value: "uppercase", label: "Capitals" },
          ]}
          isDisabled={display?.capsOnly}
          onChange={(value) =>
            edit(withValues(draft, { "--plonk-font-display-case": value }))
          }
        />
        {display?.capsOnly && (
          <p className="site-builder-note">
            {display.label} only has capitals, so headings are uppercased: the
            browser then follows the page language (Turkish i → İ).
          </p>
        )}
        <FontPicker
          label="Body"
          token="--plonk-font-body"
          fonts={BODY_FONTS}
          draft={draft}
          edit={edit}
        />
      </Group>
    </>
  );
}

/* ---------- Motion ---------- */

export function MotionPanel({
  draft,
  edit,
  motion,
  onMotion,
  onTry,
}: {
  draft: Draft;
  edit: Edit;
  motion: "system" | "reduce";
  onMotion: (value: "system" | "reduce") => void;
  onTry: () => void;
}) {
  // Retro ve Atari'de jöle yok: hareketleri kademeli.
  const wobbles = personalities[draft.personality].jelly.duration > 0;
  return (
    <>
      <Group title="Feel">
        <Range
          label="Tilt"
          value={number(valueOf(draft, "--plonk-tilt"))}
          unit="deg"
          min={0}
          max={4}
          step={0.1}
          onChange={(value) =>
            edit(withValues(draft, { "--plonk-tilt": `${value}deg` }))
          }
        />
        <p className="site-builder-note">
          How crooked things are stuck on: tilted cards, toasts and tape.
        </p>
        <Range
          label="Jelly"
          value={number(valueOf(draft, "--plonk-jelly-amount"))}
          unit=""
          min={0}
          max={1}
          step={0.05}
          disabled={!wobbles}
          onChange={(value) =>
            edit(withValues(draft, { "--plonk-jelly-amount": String(value) }))
          }
        />
        <p className="site-builder-note">
          {wobbles
            ? "How much things wobble when you let go. 0 turns it off."
            : `${PERSONALITY_LABELS[draft.personality]} moves in steps, so it has no jelly.`}
        </p>
      </Group>

      <Group title="Try it">
        <Segment
          label="Preview motion"
          value={motion}
          options={[
            { value: "system", label: "Full" },
            { value: "reduce", label: "Reduced" },
          ]}
          onChange={onMotion}
        />
        <button type="button" className="site-builder-try" onClick={onTry}>
          Press everything
        </button>
        <p className="site-builder-note">
          Reduced is what people who ask their system for less motion see: less
          movement, never none. It is not part of the theme.
        </p>
      </Group>
    </>
  );
}
