"use client";

import { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
} from "plonk";

const Icon = ({ d }: { d: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

export default function Actions() {
  const [last, setLast] = useState("nothing yet");

  return (
    <div className="flex flex-col items-center gap-3">
      <MenuTrigger>
        <Button variant="neutral">Project</Button>
        <Menu onAction={(key) => setLast(String(key))}>
          <MenuSection title="Edit">
            <MenuItem
              id="rename"
              icon={<Icon d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16z" />}
              shortcut="⌘E"
            >
              Rename
            </MenuItem>
            <MenuItem
              id="duplicate"
              icon={<Icon d="M8 8h12v12H8zM4 16V4h12" />}
              shortcut="⌘D"
              description="Copies settings too"
            >
              Duplicate
            </MenuItem>
            <MenuItem
              id="archive"
              icon={<Icon d="M4 7h16v13H4zM2 3h20v4H2zM10 12h4" />}
              isDisabled
            >
              Archive
            </MenuItem>
          </MenuSection>
          <MenuSeparator />
          <MenuItem
            id="delete"
            variant="danger"
            icon={
              <Icon d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
            }
            shortcut="⌫"
          >
            Delete
          </MenuItem>
        </Menu>
      </MenuTrigger>
      <span className="font-bold">Last action: {last}</span>
    </div>
  );
}
