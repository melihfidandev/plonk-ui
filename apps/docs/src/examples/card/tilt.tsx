"use client";

import { Card } from "plonk-ui";

export default function Tilt() {
  return (
    <div className="flex flex-wrap justify-center gap-6">
      <Card tilt="left" title="To do" className="w-44">
        Pick fonts
      </Card>
      <Card tilt="right" title="Done" className="w-44">
        Choose a name
      </Card>
    </div>
  );
}
