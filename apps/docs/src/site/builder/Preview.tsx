"use client";

import type { Ref } from "react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Input,
  PlonkProvider,
  Progress,
  Select,
  SelectItem,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  toast,
} from "plonk";
import { styleOf, type Draft } from "./theme";

/**
 * Önizleme: gerçek Plonk bileşenleri, seçilen kişiliğin provider'ı içinde,
 * ayarlar provider'ın `style`'ıyla. Toast'lar da aynı token'ları alır (provider
 * onları katman kabına taşır). Bu sayfada bildirim bölgesini sadece burası açar.
 */
export function Preview({
  draft,
  motion,
  ref,
}: {
  draft: Draft;
  motion: "system" | "reduce";
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <PlonkProvider
      personality={draft.personality}
      motion={motion}
      style={styleOf(draft)}
      toastPlacement="bottom-end"
      className="site-builder-stage"
    >
      {/* key: kişilik değişince eser yeniden "basılır". */}
      <div
        key={draft.personality}
        ref={ref}
        className="site-builder-sample @container"
      >
        <div className="grid w-full items-start gap-7 @xl:grid-cols-2">
          <Card
            tilt="left"
            title="Invite a teammate"
            description="They get an email with a link to join."
            footer={
              <>
                <Button>Send invite</Button>
                <Button variant="ghost">Cancel</Button>
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <Input label="Email" type="email" defaultValue="ada@studio.com" />
              <Select label="Role" defaultValue="editor">
                <SelectItem id="viewer">Viewer</SelectItem>
                <SelectItem id="editor">Editor</SelectItem>
                <SelectItem id="admin">Admin</SelectItem>
              </Select>
              <Checkbox label="Send a welcome note" defaultChecked />
            </div>
          </Card>
          <div className="flex flex-col gap-6">
            <Card
              title="This week"
              actions={<Badge variant="success">On track</Badge>}
            >
              <div className="flex flex-col gap-4">
                <Progress label="Storage" value={62} showValue />
                <Switch label="Autosave" defaultChecked />
                <Tabs>
                  <TabList aria-label="Range">
                    <Tab id="day">Day</Tab>
                    <Tab id="week">Week</Tab>
                    <Tab id="month">Month</Tab>
                  </TabList>
                  <TabPanel id="day">12 new signups today.</TabPanel>
                  <TabPanel id="week">84 signups, up 12%.</TabPanel>
                  <TabPanel id="month">310 signups so far.</TabPanel>
                </Tabs>
              </div>
            </Card>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">New</Badge>
              <Badge variant="accent">Beta</Badge>
              <Badge variant="secondary">Synced</Badge>
              <Badge variant="warning">Paused</Badge>
              <Badge variant="danger">Failed</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary">Share</Button>
              <Button variant="accent">Preview</Button>
              <Button variant="danger">Delete</Button>
              <Button
                variant="neutral"
                onPress={() =>
                  toast.success("Theme saved", {
                    description: "Every component picked it up.",
                  })
                }
              >
                Show a toast
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PlonkProvider>
  );
}
