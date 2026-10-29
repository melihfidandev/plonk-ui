"use client";

import { useState } from "react";
import {
  DateRangePicker,
  getLocalTimeZone,
  parseDate,
  today,
  type DateRange,
} from "plonk";

// Functions run when the preset is pressed, so "today" is always fresh.
const PRESETS = [
  {
    label: "Last 7 days",
    range: () => {
      const end = today(getLocalTimeZone());
      return { start: end.subtract({ days: 6 }), end };
    },
  },
  {
    label: "This month",
    range: () => {
      const now = today(getLocalTimeZone());
      return { start: now.set({ day: 1 }), end: now };
    },
  },
];

export default function Range() {
  const [range, setRange] = useState<DateRange | null>({
    start: parseDate("2026-11-02"),
    end: parseDate("2026-11-08"),
  });

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <DateRangePicker
        label="Report period"
        presets={PRESETS}
        value={range}
        onChange={setRange}
      />
      <span className="font-bold">
        {range ? `${range.start} → ${range.end}` : "No period"}
      </span>
    </div>
  );
}
