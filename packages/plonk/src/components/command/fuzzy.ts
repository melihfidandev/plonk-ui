export interface FuzzyMatch {
  /** Yüksek olan daha iyi eşleşme. */
  score: number;
  /** Eşleşen karakterlerin metindeki sırası (vurgulamak için). */
  hits: number[];
}

/**
 * Bulanık eşleşme: sorgunun harfleri metinde aynı sırayla geçmeli, arada
 * başka harfler olabilir ("yfat" → "Yeni fatura"). Ardışık eşleşmeler ve
 * kelime başları ödüllendirilir. Büyük/küçük harf dile göre (tr: "i" ≠ "ı").
 * Eşleşme yoksa `null`.
 */
export function fuzzy(
  text: string,
  query: string,
  locale?: string,
): FuzzyMatch | null {
  const q = query.toLocaleLowerCase(locale).replace(/\s+/g, "");
  if (!q) return { score: 0, hits: [] };
  const t = text.toLocaleLowerCase(locale);
  const hits: number[] = [];
  let from = 0;
  let previous = -2;
  let score = 0;
  for (const ch of q) {
    const at = t.indexOf(ch, from);
    if (at < 0) return null;
    score += at === previous + 1 ? 3 : 1;
    if (at === 0 || /[\s\-_/.]/.test(t[at - 1] ?? "")) score += 2;
    hits.push(at);
    previous = at;
    from = at + 1;
  }
  // Kısa metinlerde aynı eşleşme biraz daha değerli.
  return { score: score - t.length * 0.01, hits };
}
