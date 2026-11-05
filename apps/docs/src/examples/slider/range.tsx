"use client";

import { useState } from "react";
import { Slider } from "plonk-ui";

const PRICE = {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
} as const;

export default function Range() {
  const [searched, setSearched] = useState<[number, number]>([200, 800]);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Slider
        label="Price"
        defaultValue={[200, 800]}
        min={0}
        max={1000}
        step={50}
        minGap={100}
        formatOptions={PRICE}
        thumbLabels={["Minimum price", "Maximum price"]}
        onChangeEnd={setSearched}
      />
      <span className="font-bold">
        Searching {searched.map((v) => `$${v}`).join(" – ")}
      </span>
    </div>
  );
}
