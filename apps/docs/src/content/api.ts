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
  /**
   * Docgen'in yanlış çözdüğü tipler için elle yazılan tip (ör. paylaşılan
   * DOM olay tipleri başka bir elemana göre çözülebiliyor).
   */
  types?: Record<string, string>;
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
  Input: {
    inherited: ["type", "name", "required", "disabled"],
    props: {
      iconStart:
        "Icon or text before the value, like a search glass or `https://`. Hidden from screen readers.",
      iconEnd:
        "Icon or text after the value, like a unit. Hidden from screen readers.",
      label:
        "Visible label, linked to the control. Without one, pass `aria-label` or `aria-labelledby`.",
      description:
        "Help text under the control, read by screen readers after the label.",
      error:
        "Error message. When set, the control is marked invalid (`aria-invalid`) and shakes once. Pass `true` to mark it without a message.",
      type: "Native input type: `email`, `password`, `search`, `url`…",
      name: "Field name in the submitted form data.",
      required:
        "Marks the field required: an asterisk in the label and native `required` for validation and screen readers.",
      disabled: "Disables the field. The border turns dashed.",
    },
  },
  Textarea: {
    inherited: ["rows", "name", "required", "disabled"],
    props: {
      autoResize:
        "Grows with its content (`field-sizing: content`) up to 20rem, then scrolls. Browsers without support keep a resizable field.",
      label:
        "Visible label, linked to the control. Without one, pass `aria-label` or `aria-labelledby`.",
      description:
        "Help text under the control, read by screen readers after the label.",
      error:
        "Error message. When set, the control is marked invalid (`aria-invalid`) and shakes once. Pass `true` to mark it without a message.",
      rows: "Starting height in lines.",
      name: "Field name in the submitted form data.",
      required: "Marks the field required, with an asterisk in the label.",
      disabled: "Disables the field. The border turns dashed.",
    },
  },
  Checkbox: {
    types: { onChange: "ChangeEventHandler<HTMLInputElement>" },
    inherited: [
      "checked",
      "defaultChecked",
      "onChange",
      "name",
      "value",
      "required",
      "disabled",
    ],
    props: {
      indeterminate:
        "Shows a dash for “some selected”, like a select-all box. Screen readers announce it as mixed. Clicking it checks the box.",
      label:
        "Visible label, linked to the control. Without one, pass `aria-label` or `aria-labelledby`.",
      description:
        "Help text under the control, read by screen readers after the label.",
      error:
        "Error message. When set, the control is marked invalid (`aria-invalid`) and shakes once. Pass `true` to mark it without a message.",
      checked: "Controlled checked state. Use with `onChange`.",
      defaultChecked: "Checked state on first render, when uncontrolled.",
      onChange:
        "Native change event. Read `event.target.checked` for the new state.",
      name: "Field name in the submitted form data.",
      value: "Value sent with the form when checked. Defaults to `on`.",
      required: "Marks the checkbox required, with an asterisk in the label.",
      disabled: "Disables the checkbox.",
    },
  },
  RadioGroup: {
    inherited: ["disabled"],
    props: {
      name: "Field name shared by all options. Generated when not set.",
      value:
        "Controlled selected value. Pass `null` for no selection; `undefined` makes the group uncontrolled.",
      defaultValue: "Selected value on first render, when uncontrolled.",
      onValueChange: "Called with the option's `value` when it's selected.",
      required: "One option must be selected. Adds an asterisk to the label.",
      orientation:
        "Stacks options or lays them out in a wrapping row. Arrow keys work the same either way.",
      label: "Group label, rendered as the fieldset's `legend`.",
      description: "Help text under the label, read with the group.",
      error:
        "Error message for the whole group. Every option is marked invalid and the options shake once.",
      disabled: "Disables every option in the group.",
    },
  },
  Radio: {
    inherited: ["disabled"],
    props: {
      value: "This option's value, sent with the form when selected.",
      label: "Visible label, linked to the option.",
      description: "Help text under the option's label.",
      disabled: "Disables this option only.",
    },
  },
  Switch: {
    types: { onChange: "ChangeEventHandler<HTMLInputElement>" },
    inherited: [
      "checked",
      "defaultChecked",
      "onChange",
      "name",
      "value",
      "disabled",
    ],
    props: {
      label:
        "Visible label, linked to the switch. Without one, pass `aria-label`.",
      description: "Help text under the label, read by screen readers.",
      checked: "Controlled on state. Use with `onChange`.",
      defaultChecked: "On state on first render, when uncontrolled.",
      onChange:
        "Native change event. Read `event.target.checked` for the new state.",
      name: "Field name in the submitted form data.",
      value: "Value sent with the form when on. Defaults to `on`.",
      disabled: "Disables the switch. The track turns dashed.",
    },
  },
};
