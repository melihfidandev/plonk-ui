"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button, Input } from "plonk";

interface State {
  values: { name: string; email: string };
  errors: { name?: string; email?: string };
  done: boolean;
}

// Stands in for a server action: validates and returns errors.
async function join(_: State, data: FormData): Promise<State> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const values = {
    name: String(data.get("name")).trim(),
    email: String(data.get("email")).trim(),
  };
  const errors: State["errors"] = {};
  if (!values.name) errors.name = "Tell us your name.";
  if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Enter a full email address, like you@studio.com.";
  }
  return { values, errors, done: Object.keys(errors).length === 0 };
}

const initial: State = {
  values: { name: "", email: "" },
  errors: {},
  done: false,
};

export default function Validation() {
  const [state, action, pending] = useActionState(join, initial);
  const form = useRef<HTMLFormElement>(null);

  // After a failed submit, move focus to the first invalid field.
  useEffect(() => {
    form.current?.querySelector<HTMLElement>("[aria-invalid]")?.focus();
  }, [state]);

  return (
    <form
      ref={form}
      action={action}
      noValidate
      className="flex w-full max-w-xs flex-col gap-4"
    >
      <Input
        label="Name"
        name="name"
        required
        autoComplete="name"
        defaultValue={state.values.name}
        error={state.errors.name}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        defaultValue={state.values.email}
        error={state.errors.email}
      />
      <Button type="submit" loading={pending} className="self-start">
        Join the beta
      </Button>
      <p role="status" className="font-bold empty:hidden">
        {state.done ? `You're on the list, ${state.values.name}.` : ""}
      </p>
    </form>
  );
}
