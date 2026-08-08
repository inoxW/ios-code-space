"use client";

import { useState } from "react";

export default function ConsolePage() {
  const [command, setCommand] = useState("help");
  const [history, setHistory] = useState<string[]>([
    "termux@online:~$ help",
    "Available commands: help, ai, open editor",
  ]);

  const runCommand = () => {
    const trimmed = command.trim().toLowerCase();
    const nextLines = [`termux@online:~$ ${trimmed}`];

    if (trimmed === "help") {
      nextLines.push("Available commands: help, ai, open editor");
    } else if (trimmed === "ai") {
      nextLines.push("AI team is active in the editor workspace.");
    } else if (trimmed === "open editor") {
      nextLines.push("Opening editor... ready.");
    } else {
      nextLines.push("Command not found");
    }

    setHistory((current) => [...current, ...nextLines]);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_35%),linear-gradient(135deg,_#030712_0%,_#111827_100%)] px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-5xl rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">console</p>
            <h1 className="text-3xl font-bold">Термінальна панель</h1>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-black/70 p-4 font-mono text-sm text-emerald-400">
          {history.map((line, index) => (
            <div key={`${line}-${index}`}>{line}</div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none"
            placeholder="Введи команду"
          />
          <button onClick={runCommand} className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-zinc-950">
            Run
          </button>
        </div>
      </div>
    </main>
  );
}
