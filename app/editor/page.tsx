"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";

type Assistant = {
  id: string;
  name: string;
  role: string;
  prompt: string;
  response: string;
};

const files = [
  { name: "main.swift", language: "swift" },
  { name: "README.md", language: "markdown" },
  { name: "package.json", language: "json" },
];

const starterCode: Record<string, string> = {
  "main.swift": `import Foundation

print("Hello from ios-code-space")
`,
  "README.md": `# ios-code-space

A browser-based coding workspace for mobile and desktop devices.
`,
  "package.json": `{
  "name": "ios-code-space",
  "version": "1.0.0"
}
`,
};

const storageKey = "ios-code-space-editor";

const initialAssistants: Assistant[] = [
  {
    id: "editor",
    name: "Code Editor AI",
    role: "Редагує код",
    prompt: "Покращи структуру цього файлу",
    response: "Я підкажу, як зробити код чистішим і компактнішим.",
  },
  {
    id: "debug",
    name: "Debug Mentor",
    role: "Шукає помилки",
    prompt: "Поясни потенційні проблеми",
    response: "Я допоможу знайти слабкі місця й підказати виправлення.",
  },
  {
    id: "ux",
    name: "UI Architect",
    role: "Покращує UX",
    prompt: "Які UX-ідеї підходять для цього інтерфейсу",
    response: "Я пропоную більш зрозумілі й сучасні рішення для користувача.",
  },
];

export default function EditorPage() {
  const [activeFile, setActiveFile] = useState(files[0].name);
  const [content, setContent] = useState(starterCode[files[0].name]);
  const [savedFiles, setSavedFiles] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") {
      return {};
    }

    try {
      const stored = window.localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [assistants, setAssistants] = useState(initialAssistants);
  const [teamPrompt, setTeamPrompt] = useState("Допоможи покращити цей код для продакшену");
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "termux@online:~$ ready",
    "termux@online:~$ editor connected",
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(savedFiles));
    } catch {
      // Ignore storage issues in restricted environments.
    }
  }, [savedFiles]);

  const handleFileChange = (fileName: string) => {
    setActiveFile(fileName);
    setContent(savedFiles[fileName] ?? starterCode[fileName] ?? "");
  };

  const handleContentChange = (value: string | undefined) => {
    const nextValue = value ?? "";
    setContent(nextValue);
    setSavedFiles((current) => ({ ...current, [activeFile]: nextValue }));
  };

  const handleRun = () => {
    setTerminalLines((current) => [
      ...current,
      `termux@online:~$ run ${activeFile}`,
      "✓ executed in browser sandbox",
    ]);
  };

  const handleAskTeam = () => {
    const prompt = teamPrompt.trim() || "help me";
    setAssistants((current) =>
      current.map((assistant) => ({
        ...assistant,
        response: `${assistant.name}: ${prompt} → ${assistant.role.toLowerCase()} plan ready.`,
      }))
    );
    setTerminalLines((current) => [...current, `ai-team@termux:~$ ${prompt}`]);
  };

  const activeLanguage = files.find((file) => file.name === activeFile)?.language ?? "plaintext";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.15),_transparent_35%),linear-gradient(135deg,_#030712_0%,_#111827_100%)] px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-lg shadow-black/30">
          <h1 className="text-3xl font-bold">Редактор коду + AI</h1>
          <p className="mt-2 text-zinc-400">
            Редагуй файли, запускай код і працюй з командою AI в одному просторі.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-lg shadow-black/30">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Файли</h2>
            <div className="mt-4 space-y-2">
              {files.map((file) => (
                <button
                  key={file.name}
                  onClick={() => handleFileChange(file.name)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    activeFile === file.name
                      ? "bg-emerald-500 text-zinc-950"
                      : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  {file.name}
                  <div className="text-xs opacity-70">{file.language}</div>
                </button>
              ))}
            </div>
          </aside>

          <section className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-lg shadow-black/30">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{activeFile}</h2>
                  <p className="text-sm text-zinc-400">Monaco editor with syntax highlighting</p>
                </div>
                <button onClick={handleRun} className="rounded-lg border border-emerald-700/40 px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-950/40">
                  ▶ Run
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-800">
                <Editor
                  height="380px"
                  language={activeLanguage}
                  value={content}
                  onChange={handleContentChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbersMinChars: 3,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-lg shadow-black/30">
                <h3 className="font-semibold text-zinc-100">Консоль</h3>
                <div className="mt-3 rounded-xl border border-zinc-800 bg-black/70 p-3 font-mono text-sm text-emerald-400">
                  {terminalLines.map((line, index) => (
                    <div key={`${line}-${index}`}>{line}</div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-lg shadow-black/30">
                <h3 className="font-semibold text-zinc-100">Об’єднана AI-команда</h3>
                <p className="mt-2 text-sm text-zinc-400">Три AI-асистенти працюють разом: редагування, дебаг і UX.</p>

                <textarea
                  value={teamPrompt}
                  onChange={(event) => setTeamPrompt(event.target.value)}
                  className="mt-3 min-h-[90px] w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-100 outline-none"
                />
                <button onClick={handleAskTeam} className="mt-3 w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950">
                  Запустити AI-команду
                </button>

                <div className="mt-4 space-y-3">
                  {assistants.map((assistant) => (
                    <div key={assistant.id} className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-zinc-100">{assistant.name}</p>
                        <span className="text-xs text-emerald-400">{assistant.role}</span>
                      </div>
                      <div className="mt-2 rounded-lg border border-emerald-700/30 bg-emerald-950/20 p-2 text-sm text-emerald-200">
                        {assistant.response}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
