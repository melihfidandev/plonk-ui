/**
 * API tablolarının İngilizce açıklamaları. Tipler ve varsayılanlar koddan
 * üretilir (scripts/generate-api.ts → src/generated/api.json); burada sadece
 * açıklamalar ve tabloda gösterilecek kalıtsal (React Aria) prop'lar durur.
 * Betik, eksik ya da artık var olmayan prop'ları bildirir.
 */
export interface ComponentApi {
  /** React Aria'dan gelen ama tabloda gösterilecek prop'lar, bu sırayla. */
  inherited?: string[];
  /** Tabloda gösterilmeyecek kendi prop'larımız. */
  hidden?: string[];
  props: Record<string, string>;
}

export const API: Record<string, ComponentApi> = {
  Button: {
    inherited: ["onPress", "type", "isDisabled", "autoFocus"],
    hidden: ["ref"],
    props: {
      variant: "Visual style. `danger` is for destructive actions.",
      size: "Height and padding.",
      iconStart:
        "Icon before the label. Hidden from screen readers; the label names the button.",
      iconEnd: "Icon after the label. Hidden from screen readers.",
      loading:
        "Work in progress: the button can't be pressed but keeps focus and its width, and the change is announced to screen readers.",
      disabled: "Same as `isDisabled`, for parity with HTML.",
      className: "Extra classes, merged with Tailwind Merge.",
      style: "Inline styles, e.g. Plonk tokens for this button only.",
      onPress:
        "Called when pressed with mouse, touch or keyboard. Prefer it over `onClick`.",
      type: "Native button type. Use `submit` inside forms.",
      isDisabled: "Disables the button.",
      autoFocus: "Focuses the button on mount.",
    },
  },
};
