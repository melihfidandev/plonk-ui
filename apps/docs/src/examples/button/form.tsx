"use client";

import { useState, type FormEvent } from "react";
import { Button, Input } from "plonk-ui";

export default function Form() {
  const [email, setEmail] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setEmail(String(data.get("email")));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <Input
        label="Email"
        name="email"
        type="email"
        required
        placeholder="you@studio.com"
      />
      <Button type="submit">Subscribe</Button>
      {email && <p className="w-full font-bold">Subscribed: {email}</p>}
    </form>
  );
}
