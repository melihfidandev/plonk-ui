"use client";

import { useState } from "react";
import { Button, toast } from "plonk";

const FILES = ["brief.pdf", "moodboard.png", "invoice-0042.pdf"];

export default function Undo() {
  const [files, setFiles] = useState(FILES);

  function remove(file: string) {
    const index = files.indexOf(file);
    setFiles((current) => current.filter((f) => f !== file));
    toast(`Deleted ${file}`, {
      action: {
        label: "Undo",
        onPress: () =>
          setFiles((current) => [
            ...current.slice(0, index),
            file,
            ...current.slice(index),
          ]),
      },
    });
  }

  return (
    <ul className="flex w-full max-w-xs flex-col gap-2">
      {files.map((file) => (
        <li key={file} className="flex items-center justify-between gap-3">
          <span className="font-bold">{file}</span>
          <Button size="sm" variant="ghost" onPress={() => remove(file)}>
            Delete
          </Button>
        </li>
      ))}
      {files.length === 0 && (
        <Button size="sm" variant="neutral" onPress={() => setFiles(FILES)}>
          Restore all
        </Button>
      )}
    </ul>
  );
}
