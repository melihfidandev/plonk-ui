import { renderOgImage } from "@/site/og/image";

export { contentType, size } from "@/site/og/image";
export const alt = "Plonk · Drawer";

export default function Image() {
  return renderOgImage("/docs/components/drawer");
}
