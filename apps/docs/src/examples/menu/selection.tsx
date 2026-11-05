"use client";

import { useState } from "react";
import { Button, Menu, MenuItem, MenuTrigger } from "plonk-ui";

// A menu reports its selection as a Set of item ids ("all" only with select all).
const ids = (keys: Iterable<unknown> | "all") =>
  keys === "all" ? [] : [...keys].map(String);

export default function SelectionMenu() {
  const [view, setView] = useState(["grid"]);
  const [columns, setColumns] = useState(["name", "owner"]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-3">
        <MenuTrigger>
          <Button variant="neutral">View</Button>
          <Menu
            selectionMode="single"
            selectedKeys={view}
            onSelectionChange={(keys) => setView(ids(keys))}
          >
            <MenuItem id="list">List</MenuItem>
            <MenuItem id="grid">Grid</MenuItem>
            <MenuItem id="board">Board</MenuItem>
          </Menu>
        </MenuTrigger>
        <MenuTrigger>
          <Button variant="neutral">Columns</Button>
          <Menu
            selectionMode="multiple"
            selectedKeys={columns}
            onSelectionChange={(keys) => setColumns(ids(keys))}
          >
            <MenuItem id="name">Name</MenuItem>
            <MenuItem id="owner">Owner</MenuItem>
            <MenuItem id="updated">Last updated</MenuItem>
          </Menu>
        </MenuTrigger>
      </div>
      <span className="font-bold">
        {view.join("")} · {columns.join(", ") || "no columns"}
      </span>
    </div>
  );
}
