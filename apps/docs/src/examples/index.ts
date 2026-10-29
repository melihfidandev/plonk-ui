import type { ComponentType } from "react";
import AccessibilityReduced from "./accessibility/reduced";
import ButtonForm from "./button/form";
import ButtonIcons from "./button/icons";
import ButtonLoading from "./button/loading";
import ButtonSizes from "./button/sizes";
import ButtonVariants from "./button/variants";
import CheckboxSelectAll from "./checkbox/select-all";
import CheckboxTerms from "./checkbox/terms";
import FontsCustom from "./fonts/custom";
import InputDetails from "./input/details";
import InputIcons from "./input/icons";
import InputValidation from "./input/validation";
import InstallationFirst from "./installation/first";
import PersonalitiesMoments from "./personalities/moments";
import PersonalitiesTape from "./personalities/tape";
import RadioGroupControlled from "./radio-group/controlled";
import RadioGroupDescriptions from "./radio-group/descriptions";
import SwitchForm from "./switch/form";
import SwitchSettings from "./switch/settings";
import TextareaAutoResize from "./textarea/auto-resize";
import TextareaCount from "./textarea/count";

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
  "button/variants": ButtonVariants,
  "button/sizes": ButtonSizes,
  "button/icons": ButtonIcons,
  "button/loading": ButtonLoading,
  "button/form": ButtonForm,
  "checkbox/select-all": CheckboxSelectAll,
  "checkbox/terms": CheckboxTerms,
  "fonts/custom": FontsCustom,
  "input/details": InputDetails,
  "input/icons": InputIcons,
  "input/validation": InputValidation,
  "installation/first": InstallationFirst,
  "personalities/moments": PersonalitiesMoments,
  "personalities/tape": PersonalitiesTape,
  "radio-group/controlled": RadioGroupControlled,
  "radio-group/descriptions": RadioGroupDescriptions,
  "switch/form": SwitchForm,
  "switch/settings": SwitchSettings,
  "textarea/auto-resize": TextareaAutoResize,
  "textarea/count": TextareaCount,
} satisfies Record<string, ComponentType>;

export type ExampleName = keyof typeof EXAMPLES;
