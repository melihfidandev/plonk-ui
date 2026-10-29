"use client";

import { useState } from "react";
import { Button, Dialog, DialogTrigger } from "plonk";

export default function Countdown() {
  const [status, setStatus] = useState("Signed in");

  return (
    <div className="flex flex-col items-center gap-3">
      <DialogTrigger>
        <Button variant="secondary">Simulate idle session</Button>
        <Dialog
          role="alertdialog"
          size="sm"
          title="Still there?"
          description="You've been away for a while. We'll sign you out to keep your account safe."
          countdown={20}
          onCountdownEnd={({ close }) => {
            setStatus("Signed out");
            close();
          }}
          footer={({ close }) => (
            <>
              <Button
                variant="ghost"
                onPress={() => {
                  setStatus("Signed out");
                  close();
                }}
              >
                Sign out
              </Button>
              <Button
                autoFocus
                onPress={() => {
                  setStatus("Signed in");
                  close();
                }}
              >
                Stay signed in
              </Button>
            </>
          )}
        />
      </DialogTrigger>
      <span className="font-bold">{status}</span>
    </div>
  );
}
