import { renderOgImage } from "@/site/og/image";

export { contentType, size } from "@/site/og/image";
export const alt = "Plonk · Data Table";

export default function Image() {
  return renderOgImage("/docs/components/data-table");
}
