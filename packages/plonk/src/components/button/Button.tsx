"use client";

import type { CSSProperties, ReactNode, Ref } from "react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  type PressEvent,
} from "react-aria-components";
import { cn } from "../../lib/cn";
import { playPressEffect } from "../../motion/effects";
import { playJelly } from "../../motion/jelly";

export type ButtonVariant =
  "primary" | "secondary" | "accent" | "danger" | "neutral" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<
  AriaButtonProps,
  "className" | "style" | "children" | "isPending"
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Metnin önündeki ikon. Ekran okuyuculardan gizlenir. */
  iconStart?: ReactNode;
  /** Metnin arkasındaki ikon. Ekran okuyuculardan gizlenir. */
  iconEnd?: ReactNode;
  /**
   * İş sürerken: tıklanamaz ama odakta kalır, genişliği korunur, yerine
   * yükleniyor noktaları gelir. Ekran okuyucuya durum değişimi duyurulur.
   */
  loading?: boolean;
  /** HTML'deki gibi; `isDisabled` ile aynı. */
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "plonk-pressable plonk-border bg-plonk-primary text-plonk-on-primary",
  secondary:
    "plonk-pressable plonk-border bg-plonk-secondary text-plonk-on-secondary",
  accent: "plonk-pressable plonk-border bg-plonk-accent text-plonk-on-accent",
  danger: "plonk-pressable plonk-border bg-plonk-danger text-plonk-on-danger",
  neutral: "plonk-pressable plonk-border bg-plonk-surface text-plonk-ink",
  ghost:
    "border-(length:--plonk-border-width) border-transparent bg-transparent text-plonk-ink transition-colors plonk-motion-spring hover:bg-plonk-ink/8 active:bg-plonk-ink/14 disabled:bg-transparent",
};

// Köşe kişilikten ezilebilir: Atari'de düğmeler kubbe gibi tam yuvarlak.
const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-[var(--plonk-button-radius,var(--plonk-radius-sm))] px-3 text-sm",
  md: "h-10 gap-2 rounded-[var(--plonk-button-radius,var(--plonk-radius-md))] px-4 text-base",
  lg: "h-12 gap-2.5 rounded-[var(--plonk-button-radius,var(--plonk-radius-md))] px-6 text-lg",
};

/**
 * Basınca gölgesinin yerine iner, bırakınca yayla çıkıp jöle gibi esner.
 * Hareketin dili kişilikten gelir: Retro'da anlık ve kademeli, Çizgi Roman'da
 * tıklanan yerde PAT!, Atari'de düğmeden puan uçar.
 *
 * React Aria'nın Button'ı üzerine kurulu: dokunma, klavye ve fare aynı
 * davranır; Dialog, Menu gibi bileşenlerin tetikleyicisi olarak çalışır.
 */
export function Button({
  variant = "primary",
  size = "md",
  iconStart,
  iconEnd,
  loading = false,
  disabled,
  isDisabled,
  className,
  children,
  onPress,
  ...props
}: ButtonProps) {
  const handlePress = (e: PressEvent) => {
    onPress?.(e);
    if (!(e.target instanceof HTMLElement)) return;
    playJelly(e.target);
    // Klavyede nokta yok: efekt düğmenin ortasından çıkar.
    const rect = e.target.getBoundingClientRect();
    playPressEffect(
      e.target,
      e.pointerType === "keyboard"
        ? undefined
        : { x: rect.left + e.x, y: rect.top + e.y },
    );
  };

  return (
    <AriaButton
      {...props}
      isDisabled={isDisabled ?? disabled}
      isPending={loading}
      data-variant={variant}
      onPress={handlePress}
      className={cn(
        "plonk-button relative inline-flex shrink-0 cursor-pointer items-center justify-center font-plonk-display leading-none whitespace-nowrap outline-none select-none",
        "outline-offset-3 data-focus-visible:outline-3 data-focus-visible:outline-plonk-focus",
        "disabled:cursor-not-allowed disabled:border-dashed! disabled:bg-plonk-sunken disabled:text-plonk-ink-muted",
        "data-pending:cursor-progress",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-[inherit]",
          // visibility: hidden adı da gizlerdi; opacity ekran okuyucuya adı bırakır.
          loading && "opacity-0",
        )}
      >
        {iconStart && <Icon>{iconStart}</Icon>}
        {children}
        {iconEnd && <Icon>{iconEnd}</Icon>}
      </span>
      {loading && (
        <span
          aria-hidden="true"
          className="plonk-dots absolute inset-0 flex items-center justify-center gap-[0.3em]"
        >
          <span />
          <span />
          <span />
        </span>
      )}
    </AriaButton>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 [&>svg]:size-[1.15em]"
    >
      {children}
    </span>
  );
}
