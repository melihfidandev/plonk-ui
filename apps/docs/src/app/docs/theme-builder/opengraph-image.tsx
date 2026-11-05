import { renderOgImage } from "@/site/og/image";

export { contentType, size } from "@/site/og/image";
export const alt = "Plonk · Theme builder";

export default function Image() {
  return renderOgImage("/docs/theme-builder");
}
