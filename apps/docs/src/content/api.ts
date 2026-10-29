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
  /** Tabloda gösterilecek varsayılan, koddaki uzun ifade yerine. */
  defaults?: Record<string, string>;
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
  Card: {
    props: {
      title:
        "Heading, rendered as an `<h3>` and used to name the card's region. In Retro it sits in the window's title bar.",
      description: "Muted line under the title.",
      actions:
        "Content on the right of the header, like a badge, a button or a menu.",
      footer: "Bottom row, usually buttons. Wraps on narrow screens.",
      onClose:
        "Shows a close box and calls this when it's pressed. Retro puts it at the left of the title bar.",
      closeLabel: "Accessible name of the close box.",
      tape: "Sticks decorative tape on top, drawn differently by each personality.",
      tilt: "Sticks the card on at the personality's tilt angle. Retro and Arcade stay straight.",
    },
  },
  Badge: {
    props: {
      variant: "Fill color, from the personality's palette.",
      dot: "A small status dot before the text, in the text color.",
    },
  },
  Avatar: {
    props: {
      name: "Person's name. Used as the image's alt text and for the initials fallback, whose color is picked from the name.",
      src: "Image URL. If it's missing or fails to load, the initials show instead.",
      size: "Size. Inside an `AvatarGroup`, the group's size is the default.",
    },
  },
  AvatarGroup: {
    props: {
      max: "Show at most this many avatars; the rest collapse into a “+N” bubble.",
      size: "Size of every avatar in the group.",
      moreLabel:
        "Accessible name of the “+N” bubble. Translate it for your app's language.",
    },
  },
  Progress: {
    defaults: { formatValue: `percent, e.g. "60%"` },
    props: {
      value:
        "Current value. Leave it out or pass `null` for an indeterminate bar.",
      max: "Value that means done.",
      label: "Visible label, linked to the bar.",
      showValue: "Shows the formatted value on the right of the label.",
      formatValue:
        "Formats the value for the label and for screen readers (`aria-valuetext`).",
      variant: "Fill color.",
    },
  },
  Dialog: {
    inherited: [
      "isOpen",
      "defaultOpen",
      "onOpenChange",
      "isKeyboardDismissDisabled",
    ],
    defaults: {
      countdownLabel: '"Continue?"',
      countdownMessage: "`${seconds} seconds left`",
    },
    props: {
      title:
        "Heading, also the dialog's accessible name. In Retro it sits in the window's title bar.",
      description:
        "Text under the title, linked to the dialog as its description.",
      footer:
        "Bottom row, usually buttons. Pass a function to get `close`: `({ close }) => …`.",
      size: "Maximum width: `sm` for confirmations, `lg` for long content.",
      role: "`alertdialog` for decisions the user has to make: no close box, and clicking outside doesn't close it.",
      isDismissable: "Close when clicking outside.",
      hideClose: "Hides the close box.",
      closeLabel: "Accessible name of the close box.",
      countdown:
        "Seconds to count down from, shown big in the dialog. Use at least 20 and offer a button that resets it.",
      onCountdownEnd:
        "Called when the countdown reaches zero, with `close`. Without it, the dialog closes.",
      countdownLabel: "Text next to the number. Translate it for your app.",
      countdownMessage:
        "What screen readers hear at 10 and 5 seconds left. Translate it for your app.",
      "aria-label": "Accessible name. Required when there's no `title`.",
      className: "Extra classes for the dialog's card.",
      isOpen: "Controlled open state. Use with `onOpenChange`.",
      defaultOpen: "Open on first render, when uncontrolled.",
      onOpenChange: "Called with `true` or `false` when it opens or closes.",
      isKeyboardDismissDisabled: "Stops `Esc` from closing it.",
    },
  },
  DialogTrigger: {
    inherited: ["isOpen", "defaultOpen", "onOpenChange"],
    props: {
      isOpen: "Controlled open state. Use with `onOpenChange`.",
      defaultOpen: "Open on first render, when uncontrolled.",
      onOpenChange: "Called with `true` or `false` when it opens or closes.",
    },
  },
  Drawer: {
    inherited: [
      "isOpen",
      "defaultOpen",
      "onOpenChange",
      "isKeyboardDismissDisabled",
    ],
    props: {
      title: "Heading, also the drawer's accessible name.",
      description:
        "Text under the title, linked to the drawer as its description.",
      footer:
        "Bottom row, pinned under the scrolling content. Pass a function to get `close`.",
      placement:
        "Edge it slides in from. `bottom` works well as a sheet on phones.",
      isDismissable: "Close when clicking outside.",
      hideClose: "Hides the close box.",
      closeLabel: "Accessible name of the close box.",
      "aria-label": "Accessible name. Required when there's no `title`.",
      className: "Extra classes for the panel.",
      isOpen: "Controlled open state. Use with `onOpenChange`.",
      defaultOpen: "Open on first render, when uncontrolled.",
      onOpenChange: "Called with `true` or `false` when it opens or closes.",
      isKeyboardDismissDisabled: "Stops `Esc` from closing it.",
    },
  },
  Popover: {
    defaults: { offset: "12" },
    inherited: [
      "placement",
      "offset",
      "crossOffset",
      "shouldFlip",
      "isOpen",
      "onOpenChange",
      "triggerRef",
    ],
    props: {
      title: "Small heading, also the popover's accessible name.",
      "aria-label": "Accessible name. Required when there's no `title`.",
      className: "Extra classes for the panel.",
      placement:
        "Preferred side of the trigger. It flips when there's no room.",
      offset: "Gap to the trigger, in pixels.",
      crossOffset: "Shift along the trigger's edge, in pixels.",
      shouldFlip: "Flip to the other side when it doesn't fit.",
      isOpen: "Controlled open state, for popovers without a `DialogTrigger`.",
      onOpenChange: "Called when it opens or closes.",
      triggerRef:
        "Element to anchor to when there's no `DialogTrigger`, for example a table cell.",
    },
  },
  Tooltip: {
    inherited: ["placement", "offset", "crossOffset", "shouldFlip"],
    props: {
      className: "Extra classes for the bubble.",
      placement: "Preferred side. It flips when there's no room.",
      offset: "Gap to the trigger, in pixels.",
      crossOffset: "Shift along the trigger's edge, in pixels.",
      shouldFlip: "Flip to the other side when it doesn't fit.",
    },
  },
  TooltipTrigger: {
    defaults: { trigger: "hover and focus" },
    inherited: [
      "delay",
      "closeDelay",
      "trigger",
      "isDisabled",
      "isOpen",
      "defaultOpen",
      "onOpenChange",
    ],
    props: {
      delay:
        "Milliseconds of hovering before it opens. Once one tooltip is open, the next opens right away.",
      closeDelay: "Milliseconds before it closes after the pointer leaves.",
      trigger:
        "By default it opens on hover and on focus. `focus` opens it on focus only.",
      isDisabled: "Never shows the tooltip.",
      isOpen: "Controlled open state. Use with `onOpenChange`.",
      defaultOpen: "Open on first render, when uncontrolled.",
      onOpenChange: "Called with `true` or `false` when it opens or closes.",
    },
  },
};
