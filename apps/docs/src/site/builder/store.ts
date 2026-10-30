"use client";

import { useSyncExternalStore } from "react";
import { PERSONALITY_NAMES, type PersonalityName } from "plonk";
import { decodeDraft, emptyDraft, encodeDraft, type Draft } from "./theme";

const KEY = "plonk-docs-theme";

/**
 * Oluşturucunun durumu: açık kişilik ve her kişiliğin kendi taslağı. Kişilik
 * değiştirmek bir şey silmez; geri dönünce o kişiliğin ayarları yerindedir.
 * Renkler başka kişiliğe taşınmaz: Comic'in kırmızısı Arcade'in koyu zemininde
 * çoğu zaman yanlış durur.
 */
export interface BuilderState {
  current: PersonalityName;
  drafts: Record<PersonalityName, Draft>;
}

const fresh = (current: PersonalityName): BuilderState => ({
  current,
  drafts: Object.fromEntries(
    PERSONALITY_NAMES.map((name) => [name, emptyDraft(name)]),
  ) as Record<PersonalityName, Draft>,
});

const SERVER = fresh("sticker");

/*
 * Tarayıcıda hatırlanır. Açılışta sırası: bağlantıdaki tema (`#theme=…`),
 * kayıtlı durum, sergilerin son kişiliği. Bağlantıdan gelen tema o kişiliğin
 * taslağına yazılır ve adres çubuğundan silinir: düzenledikçe eskiyen bir
 * bağlantı yenilemede taslağın üstüne yazmasın.
 */
let state: BuilderState | null = null;
let fromLink = false;
const listeners = new Set<() => void>();

function save(next: BuilderState) {
  try {
    const drafts = Object.fromEntries(
      PERSONALITY_NAMES.map((name) => [name, encodeDraft(next.drafts[name])]),
    );
    localStorage.setItem(
      KEY,
      JSON.stringify({ current: next.current, drafts }),
    );
  } catch {
    // Hatırlanamasa da bu sekmede geçerli.
  }
}

/** Kayıtlı durum; bozuksa ya da yoksa `null`. */
function load(saved: string | null): BuilderState | null {
  if (!saved) return null;
  try {
    const raw = JSON.parse(saved) as {
      current?: string;
      drafts?: Record<string, string>;
    };
    const current = raw.current as PersonalityName;
    if (!PERSONALITY_NAMES.includes(current)) return null;
    const next = fresh(current);
    for (const name of PERSONALITY_NAMES) {
      const draft = decodeDraft(raw.drafts?.[name] ?? "");
      if (draft?.personality === name) next.drafts[name] = draft;
    }
    return next;
  } catch {
    return null;
  }
}

function withLink(base: BuilderState, linked: Draft): BuilderState {
  return {
    current: linked.personality,
    drafts: { ...base.drafts, [linked.personality]: linked },
  };
}

function initial(): BuilderState {
  let saved: BuilderState | null = null;
  let last: PersonalityName = "sticker";
  try {
    saved = load(localStorage.getItem(KEY));
    const exhibit = localStorage.getItem("plonk-docs-personality");
    if (PERSONALITY_NAMES.includes(exhibit as PersonalityName)) {
      last = exhibit as PersonalityName;
    }
  } catch {
    // localStorage kapalı: varsayılan.
  }
  const linked = decodeDraft(location.hash);
  if (linked) {
    fromLink = true;
    const next = withLink(saved ?? fresh(linked.personality), linked);
    save(next);
    return next;
  }
  return saved ?? fresh(last);
}

const read = () => (state ??= initial());

function update(next: BuilderState) {
  state = next;
  save(next);
  listeners.forEach((listener) => listener());
}

function forgetLink() {
  if (!fromLink) return;
  fromLink = false;
  try {
    history.replaceState(
      history.state,
      "",
      location.pathname + location.search,
    );
  } catch {
    // Safari çok sık çağrıyı reddeder; bağlantı adreste kalır, zararı yok.
  }
}

/** Açık kişiliğin taslağını değiştirir. */
export function setDraft(next: Draft) {
  const current = read();
  update({
    current: next.personality,
    drafts: { ...current.drafts, [next.personality]: next },
  });
}

/** Başka kişiliğe geçer; o kişiliğin kendi taslağı açılır. */
export function selectPersonality(name: PersonalityName) {
  update({ ...read(), current: name });
}

/** Sayfa açıkken yapıştırılan bir tema bağlantısı. */
function onHashChange() {
  const linked = decodeDraft(location.hash);
  if (!linked) return;
  fromLink = true;
  update(withLink(read(), linked));
  forgetLink();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("hashchange", onHashChange);
  // Hidrasyonda ilk okuma abonelikten sonra da olabilir: önce durumu kur.
  read();
  forgetLink();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0)
      window.removeEventListener("hashchange", onHashChange);
  };
}

export const useBuilder = () =>
  useSyncExternalStore(subscribe, read, () => SERVER);

/** Bu taslağı açan bağlantı. */
export const shareUrl = (value: Draft) =>
  `${location.origin}${location.pathname}#${encodeDraft(value)}`;
