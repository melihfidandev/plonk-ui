"use client";

import { Fragment, useState, type ReactNode } from "react";
import {
  Checkbox,
  Input,
  Label,
  NumberField,
  Radio,
  RadioGroup,
  TextField,
} from "react-aria-components";
import { CopyButton } from "./code/CodeTabs";
import { Exhibit } from "./Exhibit";

export type Control =
  | { type: "enum"; options: readonly string[]; default: string }
  | { type: "boolean"; default: boolean }
  | { type: "text"; default: string }
  | {
      type: "number";
      default: number;
      min?: number;
      max?: number;
      step?: number;
    };

type ValueOf<C> = C extends { type: "boolean" }
  ? boolean
  : C extends { type: "number" }
    ? number
    : C extends { type: "enum"; options: readonly (infer O)[] }
      ? O
      : string;

export type Values<C extends Record<string, Control>> = {
  [K in keyof C]: ValueOf<C[K]>;
};

export interface PlaygroundProps<C extends Record<string, Control>> {
  /** Koddaki bileşen adı, ör. "Button". */
  component: string;
  controls: C;
  render: (values: Values<C>) => ReactNode;
  /**
   * Koda yazılacak sabit içerik (ör. RadioGroup'un seçenekleri), `children`
   * kontrolü olmayan bileşenler için. Satırlar olduğu gibi girintilenir.
   */
  childrenCode?: string;
}

/**
 * Oyun alanı: kontrollerle prop'ları değiştir, eseri canlı gör, kodu kopyala.
 * Kod ekranda görünenden kendiliğinden yazılır: metin ve sayılar her zaman
 * (boş metin hariç), açık/kapalılar açıksa, seçenekler bileşenin varsayılanından
 * farklıysa. Bu yüzden enum kontrolünün `default`'u bileşenin gerçek varsayılanı
 * olmalı; metin ve sayı `default`'ları sadece örnek değerdir.
 * `children` kontrolü bileşenin içeriği olur.
 */
export function Playground<const C extends Record<string, Control>>({
  component,
  controls,
  render,
  childrenCode,
}: PlaygroundProps<C>) {
  const [values, setValues] = useState(
    () =>
      Object.fromEntries(
        Object.entries(controls).map(([key, c]) => [key, c.default]),
      ) as Values<C>,
  );
  const set = (key: keyof C, value: unknown) =>
    setValues((current) => ({ ...current, [key]: value }));
  const code = toJsx(component, controls, values, childrenCode);

  return (
    <Exhibit
      title={`${component} · Playground`}
      footer={
        <>
          <div className="site-controls">
            {Object.entries(controls).map(([key, control]) => (
              <ControlField
                key={key}
                name={key}
                control={control}
                value={values[key]}
                onChange={(value) => set(key, value)}
              />
            ))}
          </div>
          <div className="site-code">
            <div className="site-code-bar">
              <span className="lang">JSX</span>
              <CopyButton text={code} />
            </div>
            <pre>
              <code>
                <Jsx code={code} />
              </code>
            </pre>
          </div>
        </>
      }
    >
      {render(values)}
    </Exhibit>
  );
}

function ControlField({
  name,
  control,
  value,
  onChange,
}: {
  name: string;
  control: Control;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (control.type === "enum") {
    return (
      <RadioGroup
        value={String(value)}
        onChange={onChange}
        orientation="horizontal"
        className="site-control"
      >
        <Label>{name}</Label>
        <div className="site-segment">
          {control.options.map((option) => (
            <Radio key={option} value={option}>
              {option}
            </Radio>
          ))}
        </div>
      </RadioGroup>
    );
  }
  if (control.type === "boolean") {
    return (
      <div className="site-control">
        <span aria-hidden="true">{name}</span>
        <Checkbox
          isSelected={Boolean(value)}
          onChange={onChange}
          className="site-toggle"
        >
          <span className="box" aria-hidden="true">
            {value ? "✓" : ""}
          </span>
          {name}
        </Checkbox>
      </div>
    );
  }
  if (control.type === "number") {
    return (
      <NumberField
        value={Number(value)}
        onChange={(next) =>
          onChange(Number.isNaN(next) ? control.default : next)
        }
        minValue={control.min}
        maxValue={control.max}
        step={control.step}
        className="site-control"
      >
        <Label>{name}</Label>
        <Input className="site-text-input" />
      </NumberField>
    );
  }
  return (
    <TextField
      value={String(value)}
      onChange={onChange}
      className="site-control"
    >
      <Label>{name}</Label>
      <Input className="site-text-input" />
    </TextField>
  );
}

function toJsx<C extends Record<string, Control>>(
  component: string,
  controls: C,
  values: Values<C>,
  childrenCode?: string,
) {
  const props = Object.entries(controls)
    .filter(([key, c]) => {
      if (key === "children") return false;
      const value = values[key];
      if (c.type === "text") return value !== "";
      if (c.type === "boolean") return value === true;
      if (c.type === "enum") return value !== c.default;
      return true;
    })
    .map(([key, c]) => {
      const value = values[key];
      if (c.type === "boolean") return key;
      if (c.type === "number") return `${key}={${String(value)}}`;
      return `${key}="${String(value)}"`;
    });
  // Uzun açılış etiketinde her prop kendi satırında (Prettier gibi).
  const inline = [component, ...props].join(" ");
  const open =
    inline.length + 3 <= 72
      ? inline
      : [component, ...props].join("\n  ") + "\n";
  const children =
    childrenCode ?? ("children" in controls ? String(values.children) : "");
  if (!children) return open.endsWith("\n") ? `<${open}/>` : `<${open} />`;
  if (childrenCode !== undefined) {
    const body = childrenCode.replace(/^/gm, "  ");
    return `<${open}>\n${body}\n</${component}>`;
  }
  const line = `<${open}>${children}</${component}>`;
  return line.length <= 72 && !open.endsWith("\n")
    ? line
    : `<${open}>\n  ${children}\n</${component}>`;
}

/*
 * Oyun alanının ürettiği küçük JSX için hafif renklendirme (Shiki'yi tarayıcıya
 * taşımaya değmez). Renkler kod kutusunun temasıyla aynı. Önce etiketler
 * ayrılır; prop adları sadece etiketin içinde renklenir, aradaki düz metin
 * (children) olduğu gibi kalır.
 */
const TAG = /<\/?[A-Za-z][^>]*>/g;
const IN_TAG =
  /^(<\/?)([A-Za-z][\w.]*)|(\s)([a-zA-Z][\w-]*)(?=[=\s/>])|("[^"]*")|(\{[^}]*\})|(\/?>)$/g;
const COLORS = {
  tag: "#7ee787",
  attr: "#79c0ff",
  string: "#a5d6ff",
  punct: "#e6edf3",
};

function Jsx({ code }: { code: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const tag of code.matchAll(TAG)) {
    if (tag.index > last) parts.push(code.slice(last, tag.index));
    parts.push(...highlightTag(tag[0]));
    last = tag.index + tag[0].length;
  }
  parts.push(code.slice(last));
  return parts.map((part, i) => <Fragment key={i}>{part}</Fragment>);
}

function highlightTag(tag: string) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of tag.matchAll(IN_TAG)) {
    const index = match.index;
    if (index > last) parts.push(tag.slice(last, index));
    const [, bracket, name, space, attr, string, expr, close] = match;
    if (name) {
      parts.push(
        <span style={{ color: COLORS.punct }}>{bracket}</span>,
        <span style={{ color: COLORS.tag }}>{name}</span>,
      );
    } else if (attr) {
      parts.push(space, <span style={{ color: COLORS.attr }}>{attr}</span>);
    } else if (string) {
      parts.push(<span style={{ color: COLORS.string }}>{string}</span>);
    } else if (expr) {
      parts.push(<span style={{ color: COLORS.attr }}>{expr}</span>);
    } else if (close) {
      parts.push(<span style={{ color: COLORS.punct }}>{close}</span>);
    }
    last = index + match[0].length;
  }
  parts.push(tag.slice(last));
  return parts;
}
