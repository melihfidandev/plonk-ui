"use client";

import { useState } from "react";
import { contrastRatio } from "plonk";

/** "#abc" ya da "abc123" → "#AABBCC" / "#ABC123"; geçersizse `null`. */
function normalizeHex(text: string): string | null {
  const raw = text.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(raw)) {
    return `#${[...raw].map((c) => c + c).join("")}`.toUpperCase();
  }
  return /^[0-9a-f]{6}$/i.test(raw) ? `#${raw}`.toUpperCase() : null;
}

/**
 * Renk alanı: kare örnek (tarayıcının renk seçicisi) + elle yazılabilen hex.
 * Marka rengini yapıştırmak seçiciyle aramaktan kolay. Yazarken geçerli bir
 * değer olduğu anda uygulanır; alan terk edilince son geçerli değere döner.
 */
export function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState<string | null>(null);
  return (
    <span className="site-color" data-disabled={disabled || undefined}>
      <input
        type="color"
        aria-label={label}
        value={value.toLowerCase()}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
      />
      <input
        type="text"
        aria-label={`${label} hex`}
        className="site-hex"
        value={text ?? value.toUpperCase()}
        disabled={disabled}
        maxLength={7}
        spellCheck={false}
        autoComplete="off"
        onChange={(e) => {
          setText(e.target.value);
          const hex = normalizeHex(e.target.value);
          if (hex && e.target.value.replace("#", "").length === 6)
            onChange(hex);
        }}
        onBlur={() => {
          const hex = text === null ? null : normalizeHex(text);
          if (hex) onChange(hex);
          setText(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />
    </span>
  );
}

/**
 * WCAG kontrastı. Metin için 4.5 (AA), odak halkası gibi metin olmayan
 * parçalar için 3 yeter.
 */
export function Contrast({
  a,
  b,
  min = 4.5,
  label,
}: {
  a: string;
  b: string;
  min?: number;
  /** Ekran okuyucu için neyin neye karşı ölçüldüğü, ör. "Ink on surface". */
  label?: string;
}) {
  const ratio = contrastRatio(a, b);
  const pass = ratio >= min;
  const verdict = pass ? (min < 4.5 ? "OK" : "AA") : "Low";
  return (
    <span className="site-contrast" data-pass={pass || undefined}>
      {label && <span className="sr-only">{label}: </span>}
      {ratio.toFixed(1)}:1 {verdict}
    </span>
  );
}
