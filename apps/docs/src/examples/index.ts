import type { ComponentType } from "react";
import AccessibilityReduced from "./accessibility/reduced";
import AccordionFaq from "./accordion/faq";
import AvatarFallback from "./avatar/fallback";
import AvatarGroup from "./avatar/group";
import BadgeStatus from "./badge/status";
import BadgeVariants from "./badge/variants";
import ButtonForm from "./button/form";
import ButtonIcons from "./button/icons";
import ButtonLoading from "./button/loading";
import ButtonSizes from "./button/sizes";
import ButtonVariants from "./button/variants";
import CardAnatomy from "./card/anatomy";
import CardClosable from "./card/closable";
import CardTilt from "./card/tilt";
import CheckboxSelectAll from "./checkbox/select-all";
import CheckboxTerms from "./checkbox/terms";
import ComboBoxCustom from "./combo-box/custom";
import ComboBoxItems from "./combo-box/items";
import DialogAlert from "./dialog/alert";
import DialogCountdown from "./dialog/countdown";
import DialogForm from "./dialog/form";
import DrawerBottom from "./drawer/bottom";
import DrawerFilters from "./drawer/filters";
import FontsCustom from "./fonts/custom";
import InputDetails from "./input/details";
import InputIcons from "./input/icons";
import InputValidation from "./input/validation";
import InstallationFirst from "./installation/first";
import KbdInline from "./kbd/inline";
import KbdShortcuts from "./kbd/shortcuts";
import MenuActions from "./menu/actions";
import MenuSelection from "./menu/selection";
import PersonalitiesMoments from "./personalities/moments";
import PersonalitiesTape from "./personalities/tape";
import PopoverShare from "./popover/share";
import ProgressIndeterminate from "./progress/indeterminate";
import ProgressUpload from "./progress/upload";
import RadioGroupControlled from "./radio-group/controlled";
import RadioGroupDescriptions from "./radio-group/descriptions";
import SelectDescriptions from "./select/descriptions";
import SelectForm from "./select/form";
import SelectSections from "./select/sections";
import SwitchForm from "./switch/form";
import SwitchSettings from "./switch/settings";
import TabsControlled from "./tabs/controlled";
import TabsSettings from "./tabs/settings";
import TextareaAutoResize from "./textarea/auto-resize";
import TextareaCount from "./textarea/count";
import TooltipIcons from "./tooltip/icons";
import TooltipShortcut from "./tooltip/shortcut";

/**
 * Docs örnekleri. Her biri hem canlı çalışır hem kaynak kodu sayfada gösterilir
 * (<Example name="…" />). Yeni örnek: dosyayı yaz, buraya ekle.
 *
 * Statik import: sunucu bileşeninden istemci bileşenini dinamik import() ile
 * yüklemek Turbopack'te "module factory is not available" hatası veriyordu.
 * Sunucuda bunlar zaten küçük birer istemci referansı.
 */
export const EXAMPLES = {
  "accessibility/reduced": AccessibilityReduced,
  "accordion/faq": AccordionFaq,
  "avatar/fallback": AvatarFallback,
  "avatar/group": AvatarGroup,
  "badge/status": BadgeStatus,
  "badge/variants": BadgeVariants,
  "button/form": ButtonForm,
  "button/icons": ButtonIcons,
  "button/loading": ButtonLoading,
  "button/sizes": ButtonSizes,
  "button/variants": ButtonVariants,
  "card/anatomy": CardAnatomy,
  "card/closable": CardClosable,
  "card/tilt": CardTilt,
  "checkbox/select-all": CheckboxSelectAll,
  "checkbox/terms": CheckboxTerms,
  "combo-box/custom": ComboBoxCustom,
  "combo-box/items": ComboBoxItems,
  "dialog/alert": DialogAlert,
  "dialog/countdown": DialogCountdown,
  "dialog/form": DialogForm,
  "drawer/bottom": DrawerBottom,
  "drawer/filters": DrawerFilters,
  "fonts/custom": FontsCustom,
  "input/details": InputDetails,
  "input/icons": InputIcons,
  "input/validation": InputValidation,
  "installation/first": InstallationFirst,
  "kbd/inline": KbdInline,
  "kbd/shortcuts": KbdShortcuts,
  "menu/actions": MenuActions,
  "menu/selection": MenuSelection,
  "personalities/moments": PersonalitiesMoments,
  "personalities/tape": PersonalitiesTape,
  "popover/share": PopoverShare,
  "progress/indeterminate": ProgressIndeterminate,
  "progress/upload": ProgressUpload,
  "radio-group/controlled": RadioGroupControlled,
  "radio-group/descriptions": RadioGroupDescriptions,
  "select/descriptions": SelectDescriptions,
  "select/form": SelectForm,
  "select/sections": SelectSections,
  "switch/form": SwitchForm,
  "switch/settings": SwitchSettings,
  "tabs/controlled": TabsControlled,
  "tabs/settings": TabsSettings,
  "textarea/auto-resize": TextareaAutoResize,
  "textarea/count": TextareaCount,
  "tooltip/icons": TooltipIcons,
  "tooltip/shortcut": TooltipShortcut,
} satisfies Record<string, ComponentType>;

export type ExampleName = keyof typeof EXAMPLES;
