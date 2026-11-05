"use client";

import { useState, useSyncExternalStore } from "react";
import { Calendar, parseDate } from "plonk-ui";

// A calendar on the page reads "today" while rendering, so draw it in the
// browser only (see "Server rendering" below).
const noop = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

export default function InlineCalendar() {
  const isClient = useIsClient();
  const [date, setDate] = useState(parseDate("2026-11-14"));

  if (!isClient) return <div className="h-[23rem] w-full max-w-80" />;
  return (
    <div className="flex flex-col items-center gap-3">
      <Calendar aria-label="Delivery date" value={date} onChange={setDate} />
      <span className="font-bold">Delivery: {date.toString()}</span>
    </div>
  );
}
