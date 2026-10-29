"use client";

import { useState } from "react";
import { Button, Dialog, DialogTrigger, Input, Switch } from "plonk";

export default function Form() {
  const [name, setName] = useState("Ada Lovelace");

  return (
    <div className="flex flex-col items-center gap-3">
      <DialogTrigger>
        <Button>Edit profile</Button>
        <Dialog
          title="Edit profile"
          description="Changes are visible to everyone on your team."
          footer={({ close }) => (
            <>
              <Button variant="ghost" onPress={close}>
                Cancel
              </Button>
              <Button onPress={close}>Save</Button>
            </>
          )}
        >
          <div className="flex flex-col gap-5">
            <Input
              label="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Switch label="Show my profile publicly" defaultChecked />
          </div>
        </Dialog>
      </DialogTrigger>
      <span className="font-bold">Name: {name}</span>
    </div>
  );
}
