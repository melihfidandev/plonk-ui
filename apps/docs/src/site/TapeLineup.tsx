"use client";

import { Card } from "plonk-ui";
import { Lineup } from "./Lineup";

/** Card sayfası: bandın dört kişilikteki hâli yan yana. */
export function TapeLineup() {
  return (
    <Lineup>
      {() => (
        <Card tape title="Pinned note" className="mt-3">
          Same prop, four kinds of tape.
        </Card>
      )}
    </Lineup>
  );
}
