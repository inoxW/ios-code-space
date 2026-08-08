"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type FileEntry = {
  id: number;
  name: string;
  language: string;
  content: string;
};

type Assistant = {
  id: string;
  name: string;
  role: string;
  prompt: string;
  response: string;
};

const starterFiles: FileEntry[] = [
  {
    id: 1,
    name: "main.py",
    language: "python",
    content: `def greet(name):
    return f"Hello, {name}!"

print(greet("Termux Online"))
`,
  },
  {
    id: 2,
    name: "app.tsx",
    language: "typescript",
    content: `export function Widget() {
  return <div>Build faster with AI</div>;
}
`,
  },
];

const initialAssistants: Assistant[] = [
  {
    id: "editor",
    name: "Code Editor AI",
    role: "Редагує код",
    prompt: "Підкажи, як покращити структуру цього файлу",
    response: "Я допомагаю робити код чистішим, коротшим і зрозумілішим.",
  },
  {
    id: "debug",
    name: "Debug Mentor",
    role: "Шукає помилки",
    prompt: "Поясни ймовірні проблеми в цьому коді",
    response: "Я аналізую логіку, баги та слабкі місця в реалізації.",
  },
  {
    id: "design",
    name: "UI Architect",
    role: "Покращує UX",
    prompt: "Які UI-ідеї підходять для цього інтерфейсу",
    response: "Я пропоную більш зрозумілі, сучасні й дружні рішення для користувача.",
  },
];

export default function EditorPage() {
  const [files, setFiles] = useState<FileEntry[]>(starterFiles);
  const [activeFileId, setActiveFileId] = useState(1);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "termux@online:~$ welcome",
    "termux@online:~$ editor ready",
  ]);
  const [teamPrompt, setTeamPrompt] = useState("Допоможи покращити цей код для продакшену");
  const [assistants, setAssistants] = useState<Assistant[]>(initialAssistants);

  const activeFile = useMemo(
    () => files.find((file) => file.id === activeFileId) ?? files[0],
    [activeFileId, files]
  );

  const updateActiveFileContent = (content: string) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === activeFileId ? { ...file, content } : file))
    );
  };

  const createFile = () => {
    const newFile: FileEntry = {
      id: Date.now(),
      name: `snippet-${files.length + 1}.py`,
      language: "python",
      content: "# новий файл\nprint('hello from termux online')\n",
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setTerminalOutput((prev) => [...prev, `termux@online:~$ created ${newFile.name}`]);
  };

  const runSnippet = () => {
    const output = [
      `termux@online:~$ running ${activeFile?.name}`,
      `> ${activeFile?.content.split("\n").filter(Boolean)[0] || "// empty file"}`,
      "✓ executed in browser sandbox",
    ];
    setTerminalOutput((prev) => [...prev, ...output]);
  };

  const updateAssistantPrompt = (id: string, value: string) => {
    setAssistants((prev) =>
      prev.map((assistant) => (assistant.id === id ? { ...assistant, prompt: value } : assistant))
    );
  };

  const askTeam = () => {
    const prompt = teamPrompt.trim() || "help me";
    setAssistants((prev) =>
      prev.map((assistant) => {
        const roleHint = assistant.role.includes("Редагує") ? "refactor" : "debug";
        return {
          ...assistant,
          response: `${assistant.name}: ${prompt} → ${roleHint} plan ready with a practical suggestion.`,
        };
      })
    );
    setTerminalOutput((prev) => [...prev, `ai-team@termux:~$ ${prompt}`]);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.2),_transparent_35%),linear-gradient(135deg,_#030712_0%,_#111827_100%)] px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 shadow-lg shadow-black/30">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-400">termux online studio</p>
            <h1 className="text-xl font-semibold">Редактор коду + об’єднана AI</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900">
              Головна
            </Link>
            <Link href="/console" className="rounded-lg border border-emerald-700/40 px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-950/40">
              Консоль
            </Link>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 shadow-lg shadow-black/30">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-200">Файли</p>
              <button
                onClick={createFile}
                className="rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-semibold text-zinc-950"
              >
                + New
              </button>
            </div>
            <div className="space-y-2">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setActiveFileId(file.id)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                    activeFileId === file.id
                      ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                      : "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-900"
                  }`}
                >
                  <div className="font-medium">{file.name}</div>
                  <div className="text-xs text-zinc-500">{file.language}</div>
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-lg shadow-black/30">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{activeFile?.name}</p>
                  <p className="text-xs text-zinc-500">{activeFile?.language}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={runSnippet}
                    className="rounded-lg border border-emerald-700/40 px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-950/40"
                  >
                    ▶ Run
                  </button>
                  <button
                    onClick={() => setTerminalOutput((prev) => [...prev, "termux@online:~$ saved"])}
                    className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                  >
                    Save
                  </button>
                </div>
              </div>

              <textarea
                value={activeFile?.content}
                onChange={(e) => updateActiveFileContent(e.target.value)}
                className="min-h-[320px] w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm text-zinc-100 outline-none"
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-lg shadow-black/30">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-semibold text-zinc-100">Консоль</p>
                  <span className="text-xs text-emerald-400">live</span>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-black/60 p-3 font-mono text-sm text-emerald-400">
                  {terminalOutput.map((line, index) => (
                    <div key={`${line}-${index}`}>{line}</div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-lg shadow-black/30">
                <p className="font-semibold text-zinc-100">Об’єднана AI-команда</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Три AI-асистенти працюють одночасно: один редагує код, другий шукає помилки, третій покращує UX.
                </p>

                <textarea
                  value={teamPrompt}
                  onChange={(e) => setTeamPrompt(e.target.value)}
                  className="mt-3 min-h-[90px] w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-100 outline-none"
                />
                <button
                  onClick={askTeam}
                  className="mt-3 w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950"
                >
                  Запустити AI-команду
                </button>

                <div className="mt-4 space-y-3">
                  {assistants.map((assistant) => (
                    <div key={assistant.id} className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-zinc-100">{assistant.name}</p>
                        <span className="text-xs text-emerald-400">{assistant.role}</span>
                      </div>
                      <textarea
                        value={assistant.prompt}
                        onChange={(e) => updateAssistantPrompt(assistant.id, e.target.value)}
                        className="mt-2 min-h-[70px] w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none"
                      />
                      <div className="mt-2 rounded-lg border border-emerald-700/30 bg-emerald-950/20 p-2 text-sm text-emerald-200">
                        {assistant.response}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
