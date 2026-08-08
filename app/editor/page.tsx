"use client";

import { useMemo, useState } from "react";

type FileItem = {
  id: number;
  name: string;
  language: string;
  content: string;
};

const initialFiles: FileItem[] = [
  {
    id: 1,
    name: "main.ts",
    language: "typescript",
    content: "export const greet = (name: string) => `Hello, ${name}`;\n",
  },
  {
    id: 2,
    name: "notes.md",
    language: "markdown",
    content: "# Notes\n\n- Keep functions small\n- Add tests for logic\n",
  },
];

export default function EditorPage() {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [activeId, setActiveId] = useState<number>(1);
  const [logs, setLogs] = useState<string[]>(["editor ready", "type and run a snippet"]);

  const activeFile = useMemo(
    () => files.find((file) => file.id === activeId) ?? files[0],
    [files, activeId]
  );

  const updateContent = (value: string) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === activeId ? { ...file, content: value } : file))
    );
  };

  const addFile = () => {
    const nextFile: FileItem = {
      id: Date.now(),
      name: `snippet-${files.length + 1}.txt`,
      language: "text",
      content: "",
    };
    setFiles((prev) => [...prev, nextFile]);
    setActiveId(nextFile.id);
    setLogs((prev) => [...prev, `created ${nextFile.name}`]);
  };

  const runFile = () => {
    const firstLine = activeFile.content.split("\n")[0] || "(empty file)";
    setLogs((prev) => [...prev, `run ${activeFile.name}`, `> ${firstLine}`, "done"]);
  };

  return (
    <main className="px-5 py-10">
      <section className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-black/30 p-4 shadow-panel">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-sm font-semibold uppercase tracking-wider text-mist">Files</h1>
            <button
              type="button"
              onClick={addFile}
              className="rounded-lg bg-accent px-2 py-1 text-xs font-semibold text-ink"
            >
              New
            </button>
          </div>
          <div className="space-y-2">
            {files.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => setActiveId(file.id)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                  activeId === file.id
                    ? "border-accent/60 bg-accent/10 text-accent"
                    : "border-white/10 bg-white/5 text-mist"
                }`}
              >
                <div>{file.name}</div>
                <div className="text-xs text-mist/60">{file.language}</div>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-4">
          <article className="rounded-2xl border border-white/10 bg-black/30 p-4 shadow-panel">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-mist">{activeFile.name}</h2>
                <p className="text-xs text-mist/70">{activeFile.language}</p>
              </div>
              <button
                type="button"
                onClick={runFile}
                className="rounded-lg border border-ember/70 px-3 py-1.5 text-sm text-ember"
              >
                Run
              </button>
            </div>
            <textarea
              value={activeFile.content}
              onChange={(event) => updateContent(event.target.value)}
              className="min-h-[320px] w-full resize-none rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-sm text-mist outline-none"
            />
          </article>

          <article className="rounded-2xl border border-white/10 bg-black/30 p-4 shadow-panel">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent">Console</h3>
            <div className="space-y-1 rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-sm text-accent">
              {logs.map((line, index) => (
                <div key={`${line}-${index}`}>{line}</div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
