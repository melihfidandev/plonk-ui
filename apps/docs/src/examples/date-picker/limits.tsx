"use client";

import { DatePicker, parseDate, type DateValue } from "plonk";

const BOOKED = ["2026-11-20", "2026-11-21", "2026-11-27"].map((d) =>
  parseDate(d),
);

export default function Limits() {
  return (
    <DatePicker
      className="w-full max-w-xs"
      label="Check-in"
      description="Between Nov 3 and Dec 20. Some nights are booked."
      defaultValue={parseDate("2026-11-12")}
      minValue={parseDate("2026-11-03")}
      maxValue={parseDate("2026-12-20")}
      isDateUnavailable={(date: DateValue) =>
        BOOKED.some((booked) => booked.compare(date) === 0)
      }
    />
  );
}
