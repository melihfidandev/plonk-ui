"use client";

import { Avatar } from "plonk";

export default function Fallback() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar name="Ada Lovelace" src="/avatars/ada.svg" size="lg" />
      <Avatar name="Kemal Sunal" src="/avatars/missing.png" size="lg" />
      <Avatar name="Lin" size="lg" />
    </div>
  );
}
