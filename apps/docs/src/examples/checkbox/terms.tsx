"use client";

import { useState, type FormEvent } from "react";
import { Button, Checkbox } from "plonk";

export default function Terms() {
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // A checked box sends "on"; an unchecked one sends nothing.
    const accepted = data.get("terms") === "on";
    setError(accepted ? undefined : "Accept the terms to continue.");
    setSent(accepted);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Checkbox
        name="terms"
        required
        label="I accept the terms"
        description="We only email you about your account."
        error={error}
        onChange={() => setError(undefined)}
      />
      <Button type="submit" className="self-start">
        Create account
      </Button>
      <p role="status" className="font-bold empty:hidden">
        {sent ? "Account created." : ""}
      </p>
    </form>
  );
}
