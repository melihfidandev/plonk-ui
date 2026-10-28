import type { ComponentType } from "react";
import ButtonForm from "./button/form";
import ButtonIcons from "./button/icons";
import ButtonLoading from "./button/loading";
import ButtonSizes from "./button/sizes";
import ButtonVariants from "./button/variants";
import InstallationFirst from "./installation/first";
import PersonalitiesMoments from "./personalities/moments";
import PersonalitiesTape from "./personalities/tape";

/**
 * Docs örnekleri. Her biri hem canlı çalışır hem kaynak kodu sayfada gösterilir
 * (<Example name="…" />). Yeni örnek: dosyayı yaz, buraya ekle.
 *
 * Statik import: sunucu bileşeninden istemci bileşenini dinamik import() ile
 * yüklemek Turbopack'te "module factory is not available" hatası veriyordu.
 * Sunucuda bunlar zaten küçük birer istemci referansı.
 */
export const EXAMPLES = {
  "button/variants": ButtonVariants,
  "button/sizes": ButtonSizes,
  "button/icons": ButtonIcons,
  "button/loading": ButtonLoading,
  "button/form": ButtonForm,
  "installation/first": InstallationFirst,
  "personalities/moments": PersonalitiesMoments,
  "personalities/tape": PersonalitiesTape,
} satisfies Record<string, ComponentType>;

export type ExampleName = keyof typeof EXAMPLES;
