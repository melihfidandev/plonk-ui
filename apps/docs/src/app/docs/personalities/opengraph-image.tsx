import { renderOgImage } from "@/site/og/image";

export { contentType, size } from "@/site/og/image";
export const alt = "Plonk · Personalities";

export default function Image() {
  return renderOgImage("/docs/personalities");
}
