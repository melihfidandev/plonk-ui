"use client";

import { useState } from "react";
import { Button, Tab, TabList, TabPanel, Tabs } from "plonk";

const STEPS = ["details", "team", "review"];

export default function Controlled() {
  const [step, setStep] = useState("details");
  const index = STEPS.indexOf(step);
  const next = STEPS[index + 1];

  return (
    <Tabs
      className="w-full max-w-sm"
      selectedKey={step}
      onSelectionChange={(key) => setStep(String(key))}
    >
      <TabList aria-label="New project">
        <Tab id="details">1. Details</Tab>
        <Tab id="team">2. Team</Tab>
        <Tab id="review">3. Review</Tab>
      </TabList>
      {STEPS.map((id) => (
        <TabPanel key={id} id={id}>
          <div className="flex flex-col items-start gap-3">
            <p>Step {STEPS.indexOf(id) + 1} of 3.</p>
            {next ? (
              <Button size="sm" onPress={() => setStep(next)}>
                Next
              </Button>
            ) : (
              <Button size="sm" onPress={() => setStep("details")}>
                Start over
              </Button>
            )}
          </div>
        </TabPanel>
      ))}
    </Tabs>
  );
}
