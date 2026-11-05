"use client";

import { useEffect, useState } from "react";
import { Button, Progress } from "plonk-ui";

const SIZE = 8.4;

export default function Upload() {
  const [sent, setSent] = useState<number | null>(null);
  const uploading = sent !== null && sent < SIZE;

  useEffect(() => {
    if (!uploading) return;
    const id = setTimeout(
      () => setSent((s) => Math.min((s ?? 0) + 0.7, SIZE)),
      250,
    );
    return () => clearTimeout(id);
  }, [uploading, sent]);

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Progress
        label="moodboard.zip"
        value={sent ?? 0}
        max={SIZE}
        showValue
        variant={sent === SIZE ? "success" : "primary"}
        formatValue={(value, max) =>
          `${value.toFixed(1)} of ${max.toFixed(1)} MB`
        }
      />
      <Button
        className="self-start"
        loading={uploading}
        onPress={() => setSent(0)}
      >
        {sent === SIZE ? "Upload again" : "Upload"}
      </Button>
    </div>
  );
}
