"use client";

import { useCallback, useState } from "react";
import { executeCommand } from "@/lib/commands";
import { useProject } from "@/lib/project-context";
import { guessFromFiles } from "@/lib/deps/guess";
import { PYODIDE_FRIENDLY } from "@/lib/deps/map";
import { getPyodideRunner } from "@/lib/runner/pyodide-runner";
import { runJavaScript } from "@/lib/runner/js-runner";

export default function ConsolePage() {
  const {
    project,
    activeFile,
    terminal,
    appendTerminal,
    clearTerminal,
    addFile,
  } = useProject();
  const [command, setCommand] = useState("help");
  const [busy, setBusy] = useState(false);

  const runActive = useCallback(async () => {
    if (!activeFile) {
      appendTerminal("no active file");
      return;
    }
    appendTerminal(`$ run ${activeFile.name}`);
    setBusy(true);
    try {
      if (activeFile.language === "python") {
        const g = guessFromFiles([activeFile]);
        const packages = g.packages.filter((p) => PYODIDE_FRIENDLY.has(p));
        const runner = getPyodideRunner();
        const ok = await runner.run(activeFile.content, {
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
        appendTerminal(`cannot run language: ${activeFile.language}`);
      }
    } finally {
      setBusy(false);
    }
  }, [activeFile, appendTerminal]);

  const onRun = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await executeCommand(command, {
        files: project.files,
        activeFile,
        append: appendTerminal,
        clear: clearTerminal,
        addFile,
        runActive,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="px-5 py-10">
      <section className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-black/30 p-8 shadow-panel">
        <p className="text-xs uppercase tracking-[0.35em] text-accent">console</p>
        <h1 className="mt-2 text-3xl font-bold text-mist">Terminal</h1>
        <p className="mt-2 text-sm text-mist/70">
          Shared with Editor. Commands: help, ls, guess, run, new, clear, status.
        </p>

        <div className="mt-6 max-h-[420px] overflow-auto rounded-2xl border border-white/10 bg-black/70 p-4 font-mono text-sm text-accent">
          {terminal.map((line, i) => (
            <div key={`${i}-${line.slice(0, 24)}`} className="whitespace-pre-wrap">
              {line}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onRun()}
            disabled={busy}
            className="flex-1 rounded-xl border border-white/10 bg-ink px-3 py-2 font-mono text-mist outline-none focus:border-accent/50"
            placeholder="help | guess | run | ls"
          />
          <button
            type="button"
            onClick={onRun}
            disabled={busy}
            className="rounded-xl bg-accent px-4 py-2 font-semibold text-ink disabled:opacity-50"
          >
            {busy ? "…" : "Run"}
          </button>
        </div>
      </section>
    </main>
  );
}
