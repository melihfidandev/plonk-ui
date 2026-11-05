"use client";

import { Button, Menu, MenuItem, MenuTrigger } from "plonk-ui";
import { Playground } from "@/site/Playground";

/** Menu sayfasının oyun alanı. */
export default function MenuPlayground() {
  return (
    <Playground
      component="Menu"
      controls={{
        placement: {
          type: "enum",
          options: ["bottom start", "bottom end", "top start"],
          default: "bottom start",
        },
      }}
      childrenCode={[
        '<MenuItem id="edit">Edit</MenuItem>',
        '<MenuItem id="duplicate">Duplicate</MenuItem>',
        '<MenuItem id="delete" variant="danger">',
        "  Delete",
        "</MenuItem>",
      ].join("\n")}
      wrapCode={(jsx, indent) =>
        `<MenuTrigger>\n  <Button>Actions</Button>\n${indent(jsx)}\n</MenuTrigger>`
      }
      render={({ placement }) => (
        <MenuTrigger>
          <Button variant="neutral">Actions</Button>
          <Menu placement={placement}>
            <MenuItem id="edit">Edit</MenuItem>
            <MenuItem id="duplicate">Duplicate</MenuItem>
            <MenuItem id="delete" variant="danger">
              Delete
            </MenuItem>
          </Menu>
        </MenuTrigger>
      )}
    />
  );
}
