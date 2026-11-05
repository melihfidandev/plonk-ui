import { renderOgImage } from "@/site/og/image";

export { contentType, size } from "@/site/og/image";
export const alt =
  "Plonk: neo-brutalist React components with switchable personalities";

export default function Image() {
  return renderOgImage("/");
}
