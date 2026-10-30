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
      { title: "Installation", href: "/docs/installation", ready: true },
      { title: "Personalities", href: "/docs/personalities", ready: true },
    ],
  },
  {
    title: "Guides",
    pages: [
      { title: "Colors", href: "/docs/colors", ready: true },
      { title: "Fonts", href: "/docs/fonts", ready: true },
      { title: "Tokens", href: "/docs/tokens", ready: true },
      { title: "Motion", href: "/docs/motion", ready: true },
      { title: "Localization", href: "/docs/localization", ready: true },
      { title: "Accessibility", href: "/docs/accessibility", ready: true },
    ],
  },
  {
    title: "Components",
    pages: [
      component("Accordion", true),
      component("Avatar", true),
      component("Badge", true),
      component("Button", true),
      component("Card", true),
      component("Checkbox", true),
      component("Combo Box", true),
      component("Command Palette", true),
      component("Data Table", true),
      component("Date Picker", true),
      component("Dialog", true),
      component("Drawer", true),
      component("Input", true),
      component("Kbd", true),
      component("Menu", true),
      component("Popover", true),
      component("Progress", true),
      component("Radio Group", true),
      component("Select", true),
      component("Slider", true),
      component("Switch", true),
      component("Tabs", true),
      component("Textarea", true),
      component("Toast", true),
      component("Tooltip", true),
    ],
  },
];

export const READY_PAGES = NAV.flatMap((section) =>
  section.pages
    .filter((page) => page.ready)
    .map((page) => ({ ...page, section: section.title })),
);
