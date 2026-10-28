"use client";

import { Button, Card, PlonkProvider, usePersonality } from "plonk";

export default function CustomFont() {
  const personality = usePersonality();
  return (
    <PlonkProvider
      personality={personality}
      style={{
        "--plonk-font-display": "Georgia, 'Times New Roman', serif",
        "--plonk-font-body": "system-ui, sans-serif",
        "--plonk-font-display-case": "none",
      }}
    >
      <Card title="Quarterly report" className="w-72 max-w-full">
        <div className="flex flex-col items-start gap-4">
          <p>Same component, your typefaces.</p>
          <Button>Download PDF</Button>
        </div>
      </Card>
    </PlonkProvider>
  );
}
