"use client";

import { useId, type ReactNode } from "react";
import {
  Dialog as AriaDialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
  type DialogTriggerProps,
  type ModalOverlayProps,
} from "react-aria-components";
import { cn } from "../../lib/cn";
import { Countdown } from "./Countdown";
import { DialogFrame, type RenderSlot } from "./DialogFrame";

export { DialogTrigger, type DialogTriggerProps };

export type DialogSize = "sm" | "md" | "lg";

export interface DialogProps extends Pick<
  ModalOverlayProps,
  "isOpen" | "defaultOpen" | "onOpenChange" | "isKeyboardDismissDisabled"
> {
  title?: ReactNode;
  /** Başlığın altındaki açıklama; ekran okuyucuya dialog'un açıklaması olarak bağlanır. */
  description?: ReactNode;
  /** İçerik. Fonksiyon verilirse `close` ile dialog'u kapatabilirsin. */
  children?: RenderSlot;
  /** Alt kısımdaki eylemler (genelde butonlar). Fonksiyon olarak da verilebilir. */
  footer?: RenderSlot;
  size?: DialogSize;
  /**
   * `alertdialog`: kullanıcının bir karar vermesi gereken uyarılar. Dışarı
   * tıklayınca kapanmaz ve kapatma kutusu çıkmaz.
   */
  role?: "dialog" | "alertdialog";
  /** Dışarı tıklayınca kapansın mı? Varsayılan: `dialog` için evet. */
  isDismissable?: boolean;
  /** Kapatma kutusunu gizler. `alertdialog`'da varsayılan olarak gizli. */
  hideClose?: boolean;
  /** Kapatma kutusunun ekran okuyucu adı. */
  closeLabel?: string;
  /**
   * Saniye cinsinden geri sayım (ör. "Oturumun kapanacak, devam?"). Bitince
   * `onCountdownEnd` çağrılır; verilmemişse dialog kapanır. Kullanıcıya yetecek
   * süre ver (WCAG: en az 20 sn) ve süreyi uzatan bir düğme koy.
   */
  countdown?: number;
  onCountdownEnd?: (api: { close: () => void }) => void;
  /** Sayının yanındaki yazı. Varsayılan: "Continue?". */
  countdownLabel?: ReactNode;
  /** Ekran okuyucuya 10 ve 5 saniye kala söylenen metin (yerelleştirme için). */
  countdownMessage?: (seconds: number) => string;
  /** Görünür başlık yoksa zorunlu. */
  "aria-label"?: string;
  className?: string;
}

const defaultCountdownMessage = (seconds: number) => `${seconds} seconds left`;

const SIZES: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-3xl",
};

/**
 * Sayfanın üstünde açılan pencere. Odak içeride tutulur, Esc ile kapanır,
 * kapanınca odak açan düğmeye döner (React Aria).
 *
 * Sticker'da fırlatılmış gibi gelip jöleyle oturur. Retro'da eski Mac'teki
 * gibi ortadan büyüyen çerçevelerle açılır. Çizgi Roman'da konuşma balonu
 * kuyruğundan şişer, Atari'de ekran gibi kademeli büyür.
 */
export function Dialog({
  title,
  description,
  children,
  footer,
  size = "md",
  role = "dialog",
  isDismissable = role === "dialog",
  hideClose = role === "alertdialog",
  closeLabel = "Close",
  countdown,
  onCountdownEnd,
  countdownLabel = "Continue?",
  countdownMessage = defaultCountdownMessage,
  "aria-label": ariaLabel,
  className,
  ...overlayProps
}: DialogProps) {
  const descriptionId = useId();

  return (
    <ModalOverlay
      {...overlayProps}
      isDismissable={isDismissable}
      className="plonk-dialog-overlay fixed top-0 left-0 z-50 flex h-(--visual-viewport-height) w-full items-center justify-center p-4 sm:p-6"
    >
      <Modal className={cn("plonk-dialog relative w-full", SIZES[size])}>
        <span aria-hidden="true" className="plonk-zoom">
          <span />
          <span />
          <span />
        </span>
        <AriaDialog
          role={role}
          aria-label={ariaLabel}
          aria-describedby={description != null ? descriptionId : undefined}
          className={cn(
            // Köşe kişilikten ezilebilir: Çizgi Roman'da dialog bir konuşma balonu.
            "plonk-card flex max-h-[calc(var(--visual-viewport-height)-2rem)] flex-col rounded-[var(--plonk-dialog-radius,var(--plonk-radius-lg))] bg-plonk-surface text-plonk-ink plonk-shadow-lg outline-none plonk-border",
            className,
          )}
        >
          {({ close }) => (
            <DialogFrame
              close={close}
              title={title}
              description={description}
              descriptionId={descriptionId}
              footer={footer}
              hideClose={hideClose}
              closeLabel={closeLabel}
              countdown={
                countdown != null && (
                  <Countdown
                    key={countdown}
                    seconds={countdown}
                    label={countdownLabel}
                    message={countdownMessage}
                    onEnd={() =>
                      onCountdownEnd ? onCountdownEnd({ close }) : close()
                    }
                  />
                )
              }
            >
              {children}
            </DialogFrame>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
