import { renderOgImage } from "@/site/og/image";

export { contentType, size } from "@/site/og/image";
export const alt = "Plonk · Toast";

export default function Image() {
  return renderOgImage("/docs/components/toast");
}
