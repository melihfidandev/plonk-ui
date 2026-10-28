/**
 * Sitenin gezinme yapısı: yan menü, arama ve sayfa başlıkları buradan okur.
 * `ready: false` olan sayfalar menüde soluk görünür, aramada çıkmaz.
 */
export interface NavPage {
  title: string;
  href: string;
  ready?: boolean;
}

export interface NavSection {
  title: string;
  pages: NavPage[];
}

const component = (title: string, ready = false): NavPage => ({
  title,
  href: `/docs/components/${title.toLowerCase().replaceAll(" ", "-")}`,
  ready,
});

export const NAV: NavSection[] = [
  {
    title: "Get started",
    pages: [
      { title: "Introduction", href: "/docs", ready: true },
      { title: "Installation", href: "/docs/installation" },
      { title: "Personalities", href: "/docs/personalities" },
    ],
  },
  {
    title: "Guides",
    pages: [
      { title: "Colors", href: "/docs/colors" },
      { title: "Fonts", href: "/docs/fonts" },
      { title: "Tokens", href: "/docs/tokens" },
      { title: "Motion", href: "/docs/motion" },
      { title: "Localization", href: "/docs/localization" },
      { title: "Accessibility", href: "/docs/accessibility" },
    ],
  },
  {
    title: "Components",
    pages: [
      component("Accordion"),
      component("Avatar"),
      component("Badge"),
      component("Button", true),
      component("Card"),
      component("Checkbox"),
      component("Combo Box"),
      component("Command Palette"),
      component("Data Table"),
      component("Date Picker"),
      component("Dialog"),
      component("Drawer"),
      component("Input"),
      component("Kbd"),
      component("Menu"),
      component("Popover"),
      component("Progress"),
      component("Radio Group"),
      component("Select"),
      component("Slider"),
      component("Switch"),
      component("Tabs"),
      component("Textarea"),
      component("Toast"),
      component("Tooltip"),
    ],
  },
];

export const READY_PAGES = NAV.flatMap((section) =>
  section.pages
    .filter((page) => page.ready)
    .map((page) => ({ ...page, section: section.title })),
);
