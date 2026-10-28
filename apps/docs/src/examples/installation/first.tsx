"use client";

import { Button, Card, Switch, toast } from "plonk";

export default function First() {
  return (
    <Card title="Notifications" className="w-72 max-w-full">
      <div className="flex flex-col gap-4">
        <Switch label="Email me about replies" defaultChecked />
        <Button onPress={() => toast.success("Settings saved")}>Save</Button>
      </div>
    </Card>
  );
}
