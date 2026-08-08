"use client";

import Link from "next/link";
import { useProject } from "@/lib/project-context";

export default function ProjectsPage() {
  const { project, resetProject, renameProject } = useProject();

  return (
    <main className="px-5 py-10">
      <section className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-black/30 p-8 shadow-panel">
        <p className="text-xs uppercase tracking-[0.35em] text-accent">projects</p>
        <h1 className="mt-2 text-3xl font-bold text-mist">Workspace</h1>
        <p className="mt-2 text-sm text-mist/70">
          Stored in localStorage — no account required.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-6">
          <label className="text-xs uppercase tracking-wide text-mist/50">
            Project name
          </label>
          <input
            value={project.name}
            onChange={(e) => renameProject(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-ink px-4 py-3 text-mist outline-none focus:border-accent/50"
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-mist/50">Files</p>
              <p className="text-2xl font-semibold text-accent">
                {project.files.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-mist/50">Updated</p>
              <p className="text-sm text-mist">
                {new Date(project.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <ul className="mt-6 space-y-2">
            {project.files.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-4 py-2 text-sm"
              >
                <span className="font-mono text-mist">{f.name}</span>
                <span className="text-xs text-mist/50">{f.language}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/editor"
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-ink"
            >
              Open in editor
            </Link>
            <button
              type="button"
              onClick={resetProject}
              className="rounded-xl border border-ember/40 px-4 py-2 text-sm text-ember hover:bg-ember/10"
            >
              Reset demo files
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
