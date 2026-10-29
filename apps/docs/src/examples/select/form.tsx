"use client";

import { useState, type FormEvent } from "react";
import { Button, Select, SelectItem } from "plonk";

export default function Form() {
  const [role, setRole] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!role) return;
    setSent(String(new FormData(event.currentTarget).get("role")));
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full max-w-xs flex-col gap-4"
    >
      <Select
        label="Role"
        name="role"
        placeholder="Choose a role"
        isRequired
        value={role}
        onChange={(key) => setRole(key == null ? null : String(key))}
        error={
          submitted && !role ? "Pick a role for the new member." : undefined
        }
      >
        <SelectItem id="viewer">Viewer</SelectItem>
        <SelectItem id="editor">Editor</SelectItem>
        <SelectItem id="admin">Admin</SelectItem>
      </Select>
      <Button type="submit" className="self-start">
        Invite
      </Button>
      <p role="status" className="font-bold empty:hidden">
        {sent ? `Invited as ${sent}.` : ""}
      </p>
    </form>
  );
}
