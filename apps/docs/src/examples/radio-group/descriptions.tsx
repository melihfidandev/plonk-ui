"use client";

import { Radio, RadioGroup } from "plonk";

export default function Descriptions() {
  return (
    <RadioGroup label="Shipping" name="shipping" defaultValue="standard">
      <Radio
        value="standard"
        label="Standard"
        description="3–5 business days. Free."
      />
      <Radio value="express" label="Express" description="Next day. $12." />
      <Radio
        value="pickup"
        label="Pick up in store"
        description="Out of stock nearby."
        disabled
      />
    </RadioGroup>
  );
}
