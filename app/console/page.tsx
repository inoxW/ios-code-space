"use client";

import { useState } from "react";

const helpLines = [
  "help - show available commands",
  "status - show workspace status",
  "clear - clear terminal output",
];

export default function ConsolePage() {
  const [command, setCommand] = useState("help");
  const [history, setHistory] = useState<string[]>(["web-console ready"]);

  const execute = () => {
    const cmd = command.trim().toLowerCase();
    if (!cmd) {
      return;
    }

    if (cmd === "clear") {
      setHistory(["web-console ready"]);
      return;
    }

    const next = [`$ ${cmd}`];
    if (cmd === "help") {
      next.push(...helpLines);
    } else if (cmd === "status") {
      next.push("workspace: online", "mode: development");
    } else {
      next.push("unknown command");
    }

    setHistory((prev) => [...prev, ...next]);
  };

  return (
    <main className="px-5 py-10">
      <section className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-black/30 p-8 shadow-panel">
        <h1 className="text-3xl font-bold text-mist">Console</h1>
        <p className="mt-2 text-mist/70">A simple command simulator for UI and flow testing.</p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/70 p-4 font-mono text-sm text-accent">
          {history.map((line, index) => (
            <div key={`${line}-${index}`}>{line}</div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            placeholder="Type command"
            className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-mist outline-none"
          />
          <button
            type="button"
            onClick={execute}
            className="rounded-xl bg-accent px-4 py-2 font-semibold text-ink"
          >
            Run
          </button>
        </div>
      </section>
    </main>
  );
}
