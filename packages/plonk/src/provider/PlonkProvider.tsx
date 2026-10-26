"use client";

import { createContext, useContext, type HTMLAttributes } from "react";
import { cn } from "../lib/cn";
import {
  DEFAULT_PERSONALITY,
  type PersonalityName,
} from "../tokens/personalities";

const PersonalityContext = createContext<PersonalityName>(DEFAULT_PERSONALITY);

export interface PlonkProviderProps extends HTMLAttributes<HTMLDivElement> {
  /** Bileşenlerin görünüşü ve hareket dili. */
  personality?: PersonalityName;
  /**
   * `system`: kullanıcının işletim sistemi tercihine uyar (varsayılan).
   * `reduce`: hareketi her durumda azaltır.
   */
  motion?: "system" | "reduce";
}

/**
 * Altındaki her şeye bir kişilik verir. İç içe kullanılabilir; en yakın
 * provider kazanır.
 */
export function PlonkProvider({
  personality = DEFAULT_PERSONALITY,
  motion = "system",
  className,
  children,
  ...props
}: PlonkProviderProps) {
  return (
    <PersonalityContext.Provider value={personality}>
      <div
        {...props}
        data-plonk-personality={personality}
        data-plonk-motion={motion === "reduce" ? "reduce" : undefined}
        className={cn("plonk", className)}
      >
        {children}
      </div>
    </PersonalityContext.Provider>
  );
}

/** En yakın `PlonkProvider`'ın kişiliği. Provider yoksa varsayılan kişilik. */
export function usePersonality(): PersonalityName {
  return useContext(PersonalityContext);
}
