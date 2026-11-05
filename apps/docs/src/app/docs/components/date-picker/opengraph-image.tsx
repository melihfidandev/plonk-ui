import { renderOgImage } from "@/site/og/image";

export { contentType, size } from "@/site/og/image";
export const alt = "Plonk · Date Picker";

export default function Image() {
  return renderOgImage("/docs/components/date-picker");
}
