import { renderOgImage } from "@/site/og/image";

export { contentType, size } from "@/site/og/image";
export const alt = "Plonk · Radio Group";

export default function Image() {
  return renderOgImage("/docs/components/radio-group");
}
