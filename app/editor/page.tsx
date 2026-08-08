"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(savedFiles));
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

  const activeLanguage = files.find((file) => file.name === activeFile)?.language ?? "plaintext";

  return (
    <main className="px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Editor</h1>
          <p className="mt-2 text-zinc-400">
            Browse files and edit content in a lightweight browser-based workspace.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Files
            </h2>
            <div className="mt-4 space-y-2">
              {files.map((file) => (
                <button
                  key={file.name}
                  onClick={() => handleFileChange(file.name)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    activeFile === file.name
                      ? "bg-emerald-500 text-zinc-950"
                      : "bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  {file.name}
                  <div className="text-xs opacity-70">{file.language}</div>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{activeFile}</h2>
                <p className="text-sm text-zinc-400">Rich editor with syntax highlighting</p>
              </div>
              <button className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300">
                Run
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-800">
              <Editor
                height="420px"
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
          </section>
        </div>
      </div>
    </main>
  );
}
