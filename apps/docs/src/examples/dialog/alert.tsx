"use client";

import { useState } from "react";
import { Badge, Button, Dialog, DialogTrigger } from "plonk-ui";

export default function Alert() {
  const [deleted, setDeleted] = useState(false);

  if (deleted) {
    return (
      <div className="flex items-center gap-3">
        <Badge variant="danger" dot>
          Project deleted
        </Badge>
        <Button size="sm" variant="ghost" onPress={() => setDeleted(false)}>
          Undo
        </Button>
      </div>
    );
  }

  return (
    <DialogTrigger>
      <Button variant="danger">Delete project</Button>
      <Dialog
        role="alertdialog"
        size="sm"
        title="Delete this project?"
        description="“Spring launch” and its 24 pages will be deleted for good."
        footer={({ close }) => (
          <>
            <Button variant="neutral" onPress={close} autoFocus>
              Cancel
            </Button>
            <Button
              variant="danger"
              onPress={() => {
                setDeleted(true);
                close();
              }}
            >
              Delete
            </Button>
          </>
        )}
      />
    </DialogTrigger>
  );
}
