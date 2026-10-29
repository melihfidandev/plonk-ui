"use client";

import { useState } from "react";
import { Textarea } from "plonk";

const LIMIT = 140;

export default function Count() {
  const [bio, setBio] = useState("Frontend developer. I make buttons squish.");
  const left = LIMIT - bio.length;

  return (
    <Textarea
      className="w-full max-w-sm"
      label="Bio"
      value={bio}
      onChange={(event) => setBio(event.target.value)}
      maxLength={LIMIT}
      description={`${left} characters left`}
    />
  );
}
