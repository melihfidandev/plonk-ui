"use client";

import { useState } from "react";
import {
  Button,
  DialogTrigger,
  Drawer,
  Input,
  Radio,
  RadioGroup,
  Switch,
} from "plonk";

export default function Filters() {
  const [applied, setApplied] = useState("All projects");

  function apply(data: FormData) {
    const status = String(data.get("status"));
    const mine = data.get("mine") === "on";
    setApplied(`${status}${mine ? ", mine only" : ""}`);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <DialogTrigger>
        <Button variant="neutral">Filters</Button>
        <Drawer title="Filters" description="Narrow down the project list.">
          {({ close }) => (
            <form
              action={(data) => {
                apply(data);
                close();
              }}
              className="flex flex-col gap-5"
            >
              <Input label="Search" name="query" placeholder="Project name" />
              <RadioGroup
                label="Status"
                name="status"
                defaultValue="All projects"
              >
                <Radio value="All projects" label="All" />
                <Radio value="Active" label="Active" />
                <Radio value="Archived" label="Archived" />
              </RadioGroup>
              <Switch name="mine" label="Only mine" />
              <Button type="submit" className="self-start">
                Apply
              </Button>
            </form>
          )}
        </Drawer>
      </DialogTrigger>
      <span className="font-bold">Showing: {applied}</span>
    </div>
  );
}
