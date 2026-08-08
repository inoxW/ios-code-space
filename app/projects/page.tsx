"use client";

import { useState } from "react";

const initialProjects = [
  { name: "ios-code-space", language: "TypeScript", updated: "2 min ago" },
  { name: "Demo Project", language: "Python", updated: "14 min ago" },
  { name: "Sandbox", language: "JavaScript", updated: "1 hour ago" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState(initialProjects);
  const [name, setName] = useState("");

  const addProject = () => {
    if (!name.trim()) return;

    setProjects((current) => [
      { name: name.trim(), language: "TypeScript", updated: "just now" },
      ...current,
    ]);
    setName("");
  };

  return (
    <main className="px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="mt-2 text-zinc-400">
              Create and review lightweight coding workspaces for browser-based development.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="New project"
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={addProject}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950"
            >
              Add
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {projects.map((project) => (
            <div
              key={project.name}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg shadow-black/20"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {project.language} • Updated {project.updated}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                    Ready
                  </span>
                  <a
                    href="/editor"
                    className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-200"
                  >
                    Open
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
