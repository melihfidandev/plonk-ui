"use client";

import { useState, type FormEvent } from "react";
import { Button, Switch } from "plonk-ui";

export default function Form() {
  const [sent, setSent] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSent(JSON.stringify(Object.fromEntries(data)));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-start gap-4">
      <Switch name="digest" label="Weekly digest" defaultChecked />
      <Switch name="mentions" value="yes" label="Mentions" />
      <Button type="submit">Save</Button>
      <code className="empty:hidden">{sent}</code>
    </form>
  );
}
