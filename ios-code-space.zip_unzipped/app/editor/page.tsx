"use client";

import { useCallback, useEffect, useState } from "react";
import { useProject } from "@/lib/project-context";
import { guessFromFiles } from "@/lib/deps/guess";
import { PYODIDE_FRIENDLY } from "@/lib/deps/map";
import { getPyodideRunner } from "@/lib/runner/pyodide-runner";
import { runJavaScript } from "@/lib/runner/js-runner";

export default function EditorPage() {
  const {
    project,
    activeFile,
    terminal,
    setActiveFileId,
    updateFileContent,
    addFile,
    removeFile,
    appendTerminal,
    clearTerminal,
  } = useProject();

  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState("script.py");

  useEffect(() => {
    // preload Pyodide in background
    try {
      getPyodideRunner().start();
    } catch {
      /* ignore */
    }
  }, []);

  const runActive = useCallback(async () => {
    if (!activeFile || busy) return;
    setBusy(true);
    appendTerminal(`$ run ${activeFile.name}`);
    try {
      if (activeFile.language === "python") {
        const g = guessFromFiles([activeFile]);
        const packages = g.packages.filter((p) => PYODIDE_FRIENDLY.has(p));
        if (packages.length) {
          appendTerminal(`[deps] will try: ${packages.join(", ")}`);
        }
        const ok = await getPyodideRunner().run(activeFile.content, {
          onStdout: (t) => appendTerminal(t),
          onStderr: (t) => appendTerminal(`[err] ${t}`),
          onStatus: (t) => appendTerminal(`[pyodide] ${t}`),
          packages,
        });
        appendTerminal(ok ? "✓ done" : "✗ failed");
      } else if (
        activeFile.language === "javascript" ||
        activeFile.language === "typescript"
      ) {
        const ok = await runJavaScript(
          activeFile.content,
          (t) => appendTerminal(t),
          (t) => appendTerminal(`[err] ${t}`)
        );
        appendTerminal(ok ? "✓ done" : "✗ failed");
      } else {
        appendTerminal(`cannot run: ${activeFile.language}`);
      }
    } finally {
      setBusy(false);
    }
  }, [activeFile, appendTerminal, busy]);

  const onGuess = () => {
    const g = guessFromFiles(project.files);
    appendTerminal("$ guess");
    if (!g.packages.length) {
      appendTerminal("no third-party packages detected");
    } else {
      appendTerminal(`packages: ${g.packages.join(", ")}`);
      appendTerminal(`modules: ${g.modules.join(", ")}`);
    }
  };

  return (
    <main className="px-4 py-6 sm:px-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent">
              editor
            </p>
            <h1 className="text-lg font-semibold text-mist">
              {project.name}
              {activeFile ? (
                <span className="text-mist/50"> / {activeFile.name}</span>
              ) : null}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onGuess}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-mist hover:border-accent/50"
            >
              Guess deps
            </button>
            <button
              type="button"
              onClick={runActive}
              disabled={busy}
              className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-ink disabled:opacity-50"
            >
              {busy ? "Running…" : "▶ Run"}
            </button>
            <button
              type="button"
              onClick={clearTerminal}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-mist/70"
            >
              Clear log
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-mist">Files</p>
            </div>
            <div className="space-y-1">
              {project.files.map((f) => (
                <div key={f.id} className="group flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveFileId(f.id)}
                    className={`min-w-0 flex-1 rounded-xl border px-3 py-2 text-left text-sm ${
                      activeFile?.id === f.id
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-transparent text-mist/80 hover:bg-white/5"
                    }`}
                  >
                    <div className="truncate font-medium">{f.name}</div>
                    <div className="text-xs opacity-60">{f.language}</div>
                  </button>
                  {project.files.length > 1 ? (
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => removeFile(f.id)}
                      className="rounded-lg px-2 py-1 text-xs text-mist/40 hover:text-ember"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-1">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-ink px-2 py-1.5 text-xs text-mist outline-none"
                placeholder="name.py"
              />
              <button
                type="button"
                onClick={() => {
                  if (newName.trim()) addFile(newName.trim());
                }}
                className="rounded-lg bg-accent/90 px-2 py-1.5 text-xs font-semibold text-ink"
              >
                +
              </button>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <textarea
                value={activeFile?.content ?? ""}
                onChange={(e) =>
                  activeFile &&
                  updateFileContent(activeFile.id, e.target.value)
                }
                spellCheck={false}
                className="min-h-[340px] w-full resize-y rounded-xl border border-white/5 bg-ink p-4 font-mono text-sm leading-relaxed text-mist outline-none focus:border-accent/30"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-mist">Terminal</p>
                <span className="text-xs text-accent">
                  {busy ? "busy" : "idle"}
                </span>
              </div>
              <div className="max-h-48 overflow-auto rounded-xl border border-white/5 bg-black/60 p-3 font-mono text-xs text-accent">
                {terminal.map((line, i) => (
                  <div key={`${i}-${line.slice(0, 20)}`} className="whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
