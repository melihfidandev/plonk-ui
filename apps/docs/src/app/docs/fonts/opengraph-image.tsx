import { renderOgImage } from "@/site/og/image";

export { contentType, size } from "@/site/og/image";
export const alt = "Plonk · Fonts";

export default function Image() {
  return renderOgImage("/docs/fonts");
}
