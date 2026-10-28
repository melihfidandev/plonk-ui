import type { Metadata } from "next";
import { MotionLab } from "./motion-lab";

export const metadata: Metadata = { title: "Laboratuvar · Plonk" };

// Site İngilizce (kök lang="en"); laboratuvar Türkçe kalır: büyük harfler "İ" olsun.
export default function Lab() {
  return (
    <div lang="tr" className="contents">
      <MotionLab />
    </div>
  );
}
