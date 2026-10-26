import type { Metadata } from "next";
import { MotionLab } from "./motion-lab";

export const metadata: Metadata = { title: "Laboratuvar · Plonk" };

export default function Lab() {
  return <MotionLab />;
}
