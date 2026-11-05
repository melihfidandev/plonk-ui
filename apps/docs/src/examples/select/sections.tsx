"use client";

import { Select, SelectItem, SelectSection } from "plonk-ui";

export default function Sections() {
  return (
    <Select
      className="w-full max-w-xs"
      label="Time zone"
      placeholder="Pick a city"
    >
      <SelectSection title="Europe">
        <SelectItem id="Europe/Istanbul">Istanbul</SelectItem>
        <SelectItem id="Europe/Berlin">Berlin</SelectItem>
        <SelectItem id="Europe/Lisbon">Lisbon</SelectItem>
      </SelectSection>
      <SelectSection title="Americas">
        <SelectItem id="America/New_York">New York</SelectItem>
        <SelectItem id="America/Mexico_City">Mexico City</SelectItem>
      </SelectSection>
      <SelectSection title="Asia">
        <SelectItem id="Asia/Tokyo">Tokyo</SelectItem>
        <SelectItem id="Asia/Singapore">Singapore</SelectItem>
      </SelectSection>
    </Select>
  );
}
