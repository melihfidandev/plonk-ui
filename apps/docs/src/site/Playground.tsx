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
import { Exhibit, type ExhibitProps } from "./Exhibit";

export type Control =
  | { type: "enum"; options: readonly string[]; default: string }
  | { type: "boolean"; default: boolean }
  | { type: "text"; default: string }
  | {
      type: "number";
      default: number;
      /** `default` bileşenin kendi varsayılanı: ona eşitse koda yazılmaz. */
      omitDefault?: boolean;
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
  /**
   * Üretilen kodu sarar; katmanlar tetikleyicisiyle birlikte yazılır:
   * `(jsx) => \`<DialogTrigger>…${jsx}</DialogTrigger>\``. `indent` ile
   * girintilenmiş hâli de verilir.
   */
  /**
   * Kodu kendin yaz: JSX olmayan API'ler için (ör. `toast.success(…)`).
   * Verilince `childrenCode`, `extraCode` ve `wrapCode` kullanılmaz.
   */
  code?: (values: Values<C>) => string;
  /** Sergiye geçen ayarlar, kontrollere bağlı olabilir (ör. toast bölgesi). */
  stage?: (
    values: Values<C>,
  ) => Pick<ExhibitProps, "toaster" | "toastPlacement">;
  /** Koda her zaman yazılan sabit prop'lar, ör. `footer={…}`. */
  extraCode?: string[];
  wrapCode?: (
    jsx: string,
    indent: (code: string, depth?: number) => string,
  ) => string;
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
  extraCode,
  wrapCode,
  code: writeCode,
  stage,
}: PlaygroundProps<C>) {
  const [values, setValues] = useState(
    () =>
      Object.fromEntries(
        Object.entries(controls).map(([key, c]) => [key, c.default]),
      ) as Values<C>,
  );
  const set = (key: keyof C, value: unknown) =>
    setValues((current) => ({ ...current, [key]: value }));
  const jsx = toJsx(component, controls, values, childrenCode, extraCode);
  const code = writeCode
    ? writeCode(values)
    : wrapCode
      ? wrapCode(jsx, indent)
      : jsx;

  return (
    <Exhibit
      {...stage?.(values)}
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
              <span className="lang">{writeCode ? "TS" : "JSX"}</span>
              <CopyButton text={code} />
            </div>
            <pre>
              <code>
                {writeCode ? <Script code={code} /> : <Jsx code={code} />}
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

/** Her satırı `depth` kez iki boşlukla girintiler. */
const indent = (code: string, depth = 1) =>
  code.replace(/^/gm, "  ".repeat(depth));

function toJsx<C extends Record<string, Control>>(
  component: string,
  controls: C,
  values: Values<C>,
  childrenCode?: string,
  extraCode: string[] = [],
) {
  const fromControls = Object.entries(controls)
    .filter(([key, c]) => {
      if (key === "children") return false;
      const value = values[key];
      if (c.type === "text") return value !== "";
      if (c.type === "boolean") return value === true;
      if (c.type === "enum") return value !== c.default;
      return !(c.omitDefault && value === c.default);
    })
    .map(([key, c]) => {
      const value = values[key];
      if (c.type === "boolean") return key;
      if (c.type === "number") return `${key}={${String(value)}}`;
      return `${key}="${String(value)}"`;
    });
  const props = [...fromControls, ...extraCode];
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
    const body = indent(childrenCode);
    return `<${open}>\n${body}\n</${component}>`;
  }
  const line = `<${open}>${children}</${component}>`;
  return line.length <= 72 && !open.endsWith("\n")
    ? line
    : `<${open}>\n  ${children}\n</${component}>`;
}

/*
 * Oyun alanının ürettiği küçük JSX için hafif renklendirme (Shiki'yi tarayıcıya
 * taşımaya değmez). Renkler kod kutusunun temasıyla aynı. Etiketler süslü
 * parantez derinliği sayılarak ayrılır (prop içindeki `=>` ve iç JSX etiketi
 * bitirmesin); prop adları sadece etiketin içinde renklenir, aradaki düz metin
 * (children) olduğu gibi kalır.
 */
const IN_TAG =
  /(<\/?)([A-Za-z][\w.]*)|(\s)([a-zA-Z][\w-]*)(?=[=\s/>]|$)|("[^"]*")|(\/?>)/g;
const COLORS = {
  tag: "#7ee787",
  attr: "#79c0ff",
  string: "#a5d6ff",
  punct: "#e6edf3",
};

/** `from`'daki `{`in eşi olan `}`in yeri (yoksa son karakter). */
function closingBrace(code: string, from: number) {
  let depth = 0;
  for (let i = from; i < code.length; i++) {
    if (code[i] === "{") depth++;
    else if (code[i] === "}" && --depth === 0) return i;
  }
  return code.length - 1;
}

function Jsx({ code }: { code: string }) {
  const parts: ReactNode[] = [];
  let text = "";
  let i = 0;
  while (i < code.length) {
    if (code[i] === "<" && /[A-Za-z/]/.test(code[i + 1] ?? "")) {
      parts.push(text);
      text = "";
      let end = i;
      while (end < code.length && code[end] !== ">") {
        end = code[end] === "{" ? closingBrace(code, end) + 1 : end + 1;
      }
      parts.push(...highlightTag(code.slice(i, end + 1)));
      i = end + 1;
    } else {
      text += code[i++];
    }
  }
  parts.push(text);
  return parts.map((part, i) => <Fragment key={i}>{part}</Fragment>);
}

/** Etiketin içi: `{…}` ifadeleri bütün olarak, kalanı prop adı/dizgi olarak. */
function highlightTag(tag: string) {
  const parts: ReactNode[] = [];
  let plain = "";
  let i = 0;
  while (i < tag.length) {
    if (tag[i] === "{") {
      parts.push(...highlightPlain(plain));
      plain = "";
      const end = closingBrace(tag, i);
      parts.push(
        <span style={{ color: COLORS.attr }}>{tag.slice(i, end + 1)}</span>,
      );
      i = end + 1;
    } else {
      plain += tag[i++];
    }
  }
  parts.push(...highlightPlain(plain));
  return parts;
}

function highlightPlain(code: string) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of code.matchAll(IN_TAG)) {
    const index = match.index;
    if (index > last) parts.push(code.slice(last, index));
    const [, bracket, name, space, attr, string, close] = match;
    if (name) {
      parts.push(
        <span style={{ color: COLORS.punct }}>{bracket}</span>,
        <span style={{ color: COLORS.tag }}>{name}</span>,
      );
    } else if (attr) {
      parts.push(space, <span style={{ color: COLORS.attr }}>{attr}</span>);
    } else if (string) {
      parts.push(<span style={{ color: COLORS.string }}>{string}</span>);
    } else if (close) {
      parts.push(<span style={{ color: COLORS.punct }}>{close}</span>);
    }
    last = index + match[0].length;
  }
  parts.push(code.slice(last));
  return parts;
}

/*
 * JSX olmayan kod (ör. `toast.success("…", { … })`) için: dizgiler, nesne
 * anahtarları ve fonksiyon adları renklenir, gerisi düz kalır.
 */
const SCRIPT =
  /("[^"]*"|`[^`]*`)|\b([A-Za-z_]\w*)(?=\s*:)|\b([A-Za-z_][\w.]*)(?=\()/g;

function Script({ code }: { code: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of code.matchAll(SCRIPT)) {
    const [whole, string, key, call] = match;
    if (match.index > last) parts.push(code.slice(last, match.index));
    const color = string ? COLORS.string : key ? COLORS.attr : COLORS.tag;
    parts.push(<span style={{ color }}>{string ?? key ?? call ?? whole}</span>);
    last = match.index + whole.length;
  }
  parts.push(code.slice(last));
  return parts.map((part, i) => <Fragment key={i}>{part}</Fragment>);
}
