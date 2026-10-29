"use client";

import { Tab, TabList, TabPanel, Tabs } from "plonk";
import { Playground } from "@/site/Playground";

/** Tabs sayfasının oyun alanı. */
export default function TabsPlayground() {
  return (
    <Playground
      component="Tabs"
      controls={{
        keyboardActivation: {
          type: "enum",
          options: ["automatic", "manual"],
          default: "automatic",
        },
        isDisabled: { type: "boolean", default: false },
      }}
      childrenCode={[
        '<TabList aria-label="Project">',
        '  <Tab id="overview">Overview</Tab>',
        '  <Tab id="activity">Activity</Tab>',
        '  <Tab id="settings">Settings</Tab>',
        "</TabList>",
        '<TabPanel id="overview">…</TabPanel>',
        '<TabPanel id="activity">…</TabPanel>',
        '<TabPanel id="settings">…</TabPanel>',
      ].join("\n")}
      render={(props) => (
        <Tabs className="w-full max-w-sm" {...props}>
          <TabList aria-label="Project">
            <Tab id="overview">Overview</Tab>
            <Tab id="activity">Activity</Tab>
            <Tab id="settings">Settings</Tab>
          </TabList>
          <TabPanel id="overview">Three pages are waiting for review.</TabPanel>
          <TabPanel id="activity">Ada pushed two commits an hour ago.</TabPanel>
          <TabPanel id="settings">Only admins can change these.</TabPanel>
        </Tabs>
      )}
    />
  );
}
