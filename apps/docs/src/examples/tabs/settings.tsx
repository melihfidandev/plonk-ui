"use client";

import { Input, Switch, Tab, TabList, TabPanel, Tabs } from "plonk";

export default function Settings() {
  return (
    <Tabs className="w-full max-w-sm">
      <TabList aria-label="Settings">
        <Tab id="profile">Profile</Tab>
        <Tab id="notifications">Alerts</Tab>
        <Tab id="billing" isDisabled>
          Billing
        </Tab>
      </TabList>
      <TabPanel id="profile">
        <div className="flex flex-col gap-4">
          <Input label="Display name" defaultValue="Ada" />
          <Input label="Email" type="email" defaultValue="ada@studio.com" />
        </div>
      </TabPanel>
      <TabPanel id="notifications">
        <div className="flex flex-col gap-4">
          <Switch label="Mentions" defaultChecked />
          <Switch label="Weekly digest" />
        </div>
      </TabPanel>
      <TabPanel id="billing">Billing is managed by your admin.</TabPanel>
    </Tabs>
  );
}
