"use client";

import { Button, Dialog, DialogTrigger, toast } from "plonk-ui";

export default function Moments() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="secondary"
        onPress={() =>
          toast.success("Invoice sent", {
            description: "Ada will get it in a minute.",
          })
        }
      >
        Show a toast
      </Button>
      <DialogTrigger>
        <Button>Open a dialog</Button>
        <Dialog
          role="alertdialog"
          size="sm"
          title="Still there?"
          description="You'll be signed out when the timer runs out."
          countdown={20}
          footer={({ close }) => (
            <>
              <Button variant="ghost" onPress={close}>
                Sign out
              </Button>
              <Button onPress={close} autoFocus>
                Stay signed in
              </Button>
            </>
          )}
        />
      </DialogTrigger>
    </div>
  );
}
