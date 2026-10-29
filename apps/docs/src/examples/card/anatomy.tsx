"use client";

import { Badge, Button, Card } from "plonk";

export default function Anatomy() {
  return (
    <Card
      className="w-full max-w-sm"
      title="Spring launch"
      description="Landing page, emails and the press kit."
      actions={<Badge variant="success">On track</Badge>}
      footer={
        <>
          <Button size="sm">Open board</Button>
          <Button size="sm" variant="ghost">
            Share
          </Button>
        </>
      }
    >
      Copy is final. Illustrations land on Friday, then we hand everything to
      the dev team.
    </Card>
  );
}
