"use client";

import { Avatar, AvatarGroup } from "plonk-ui";

const TEAM = [
  { name: "Ada Lovelace", src: "/avatars/ada.svg" },
  { name: "Kemal Sunal", src: "/avatars/kemal.svg" },
  { name: "Lin Chen", src: "/avatars/lin.svg" },
  { name: "Grace Hopper" },
  { name: "Alan Turing" },
  { name: "Margaret Hamilton" },
];

export default function Group() {
  return (
    <div className="flex flex-col items-center gap-6">
      <AvatarGroup aria-label="Project team" max={4}>
        {TEAM.map((person) => (
          <Avatar key={person.name} {...person} />
        ))}
      </AvatarGroup>
      <AvatarGroup aria-label="Reviewers" size="sm">
        {TEAM.slice(0, 3).map((person) => (
          <Avatar key={person.name} {...person} />
        ))}
      </AvatarGroup>
    </div>
  );
}
