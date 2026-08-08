"use client";

import Link from "next/link";
import { useState } from "react";

const initialProjects = [
  { name: "termux-landing", language: "TypeScript", updated: "2 min ago" },
  { name: "ai-helper", language: "Python", updated: "14 min ago" },
  { name: "sandbox", language: "JavaScript", updated: "1 hour ago" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState(initialProjects);
  const [name, setName] = useState("");

  const addProject = () => {
    if (!name.trim()) return;
    setProjects((current) => [{ name: name.trim(), language: "TypeScript", updated: "just now" }, ...current]);
    setName("");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_35%),linear-gradient(135deg,_#030712_0%,_#111827_100%)] px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">projects</p>
            <h1 className="text-3xl font-bold">Робочі простори</h1>
            <p className="mt-2 text-zinc-400">Створюй нові проєкти й переходь до редактора за одним кліком.</p>
          </div>

          <div className="flex gap-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Новий проєкт"
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none"
            />
            <button onClick={addProject} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950">
              Add
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {projects.map((project) => (
            <div key={project.name} className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-lg shadow-black/30">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <p className="mt-1 text-sm text-zinc-400">{project.language} • Updated {project.updated}</p>
                </div>
                <div className="flex gap-2">
                  <span className="rounded-full border border-emerald-700/40 px-3 py-1 text-xs text-emerald-300">Ready</span>
                  <Link href="/editor" className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-200">
                    Open
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
