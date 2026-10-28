import type { ComponentType } from "react";
import ButtonForm from "./button/form";
import ButtonIcons from "./button/icons";
import ButtonLoading from "./button/loading";
import ButtonSizes from "./button/sizes";
import ButtonVariants from "./button/variants";

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
} satisfies Record<string, ComponentType>;

export type ExampleName = keyof typeof EXAMPLES;
