"use client";

import { Button, PlonkProvider, Switch, usePersonality } from "plonk";

export default function Reduced() {
  const personality = usePersonality();
  return (
    <div className="grid w-full gap-6 sm:grid-cols-2">
      {(["system", "reduce"] as const).map((motion) => (
        <PlonkProvider
          key={motion}
          personality={personality}
          motion={motion}
          className="flex flex-col items-start gap-4"
        >
          <strong>
            {motion === "system" ? "Full motion" : "Reduced motion"}
          </strong>
          <Button>Press me</Button>
          <Switch label="Autosave" />
        </PlonkProvider>
      ))}
    </div>
  );
}
