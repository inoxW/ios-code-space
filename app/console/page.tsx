"use client";

export const dynamic = "force-dynamic";
export const ssr = false;

import { useCallback, useEffect, useRef, useState } from "react";
import { useProject } from "@/lib/project-context";
import { guessFromFiles } from "@/lib/deps/guess";
import { PYODIDE_FRIENDLY } from "@/lib/deps/map";
import { getPyodideRunner } from "@/lib/runner/pyodide-runner";
import { runJavaScript } from "@/lib/runner/js-runner";

type LineKind = "cmd" | "out" | "err" | "sys" | "info";
type TermLine = { text: string; kind: LineKind };

const HIST_KEY = "terminal:history:v1";

function loadHistory(): string[] {
    try {
        return JSON.parse(localStorage.getItem(HIST_KEY) ?? "[]");
    } catch {
        return [];
    }
}

function saveHistory(h: string[]) {
    try {
        localStorage.setItem(HIST_KEY, JSON.stringify(h.slice(-200)));
    } catch { }
}

function kindClass(k: LineKind) {
    switch (k) {
        case "cmd":
            return "text-blue-400 font-semibold";
        case "err":
            return "text-red-400";
        case "sys":
            return "text-gray-500 italic";
        case "info":
            return "text-gray-300";
        default:
            return "text-gray-200";
    }
}

export default function ConsolePage() {
    const { project, activeFile, clearTerminal, addFile } = useProject();
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [lines, setLines] = useState<TermLine[]>([]);
    const [histIdx, setHistIdx] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const push = useCallback((text: string, kind: LineKind = "out") => {
        setLines((p) => [...p.slice(-150), { text, kind }]);
    }, []);

    const execute = useCallback(
        async (raw: string) => {
            const cmd = raw.trim();
            if (!cmd) return;

            const hist = loadHistory();
            const newHist = [...hist.filter((h) => h !== cmd), cmd];
            saveHistory(newHist);
            setHistIdx(-1);

            push(`$ ${cmd}`, "cmd");
            setBusy(true);

            const [name, ...rest] = cmd.split(/\s+/);
            const args = rest.join(" ");

            try {
                switch (name.toLowerCase()) {
                    case "help":
                        push("Commands: ls | cat | run | new | guess | clear | history | echo", "info");
                        break;

                    case "ls":
                        project.files.forEach((f) =>
                            push(`  ${f.name.padEnd(20)} ${f.language}`, "info")
                        );
                        break;

                    case "cat": {
                        const f = args ? project.files.find((fi) => fi.name === args) : activeFile;
                        if (!f) {
                            push(`not found: ${args || "no active"}`, "err");
                            break;
                        }
                        push(`--- ${f.name} ---`, "sys");
                        f.content.split("\n").forEach((l) => push(l, "out"));
                        break;
                    }

                    case "run":
                        if (!activeFile) {
                            push("no active file", "err");
                            break;
                        }
                        push(`$ run ${activeFile.name}`, "cmd");
                        if (activeFile.language === "python") {
                            const g = guessFromFiles([activeFile]);
                            const packages = g.packages.filter((p) => PYODIDE_FRIENDLY.has(p));
                            const ok = await getPyodideRunner().run(activeFile.content, {
                                onStdout: (t) => push(t, "out"),
                                onStderr: (t) => push(t, "err"),
                                packages,
                                stdin: "",
                            });
                            push(ok ? "✓ done" : "✗ failed", ok ? "sys" : "err");
                        } else if (activeFile.language === "javascript" || activeFile.language === "typescript") {
                            const ok = await runJavaScript(activeFile.content, (t) => push(t), (t) => push(t, "err"));
                            push(ok ? "✓ done" : "✗ failed", ok ? "sys" : "err");
                        } else {
                            push(`cannot run: ${activeFile.language}`, "err");
                        }
                        break;

                    case "new": {
                        const fileName = args || `file-${Date.now()}.py`;
                        addFile(fileName);
                        push(`created ${fileName}`, "sys");
                        break;
                    }

                    case "guess": {
                        const g = guessFromFiles(project.files);
                        if (!g.packages.length) {
                            push("no packages", "info");
                            break;
                        }
                        push(`packages: ${g.packages.join(", ")}`, "info");
                        push(`modules: ${g.modules.join(", ")}`, "info");
                        break;
                    }

                    case "clear":
                        setLines([]);
                        clearTerminal();
                        break;

                    case "history":
                        loadHistory().forEach((h, i) => push(`  ${i + 1}  ${h}`, "info"));
                        break;

                    case "echo":
                        push(args || "", "out");
                        break;

                    case "status":
                        push(`project: ${project.name}`, "info");
                        push(`files: ${project.files.length} | active: ${activeFile?.name ?? "none"}`, "info");
                        break;

                    default:
                        push(`unknown command: ${name}`, "err");
                }
            } finally {
                setBusy(false);
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "auto" }), 0);
            }
        },
        [project, activeFile, push, clearTerminal, addFile]
    );

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            execute(input);
            setInput("");
            return;
        }
        if (e.key === "l" && e.ctrlKey) {
            e.preventDefault();
            setLines([]);
            return;
        }
        const hist = loadHistory();
        if (e.key === "ArrowUp") {
            e.preventDefault();
            const next = Math.min(histIdx + 1, hist.length - 1);
            setHistIdx(next);
            setInput(hist[hist.length - 1 - next] ?? "");
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            const next = Math.max(histIdx - 1, -1);
            setHistIdx(next);
            setInput(next === -1 ? "" : hist[hist.length - 1 - next] ?? "");
        }
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, [lines]);

    return (
        <main className="w-full h-full bg-[#0d0d0d] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="h-12 bg-[#1e1e1e] border-b border-gray-700 flex items-center px-4 gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 truncate">{project.name}</p>
                    {activeFile && <p className="text-sm font-medium text-white truncate">{activeFile.name}</p>}
                </div>
                <div className="flex items-center gap-2 text-xs flex-shrink-0">
                    <span className={`font-semibold ${busy ? "text-yellow-500" : "text-green-500"}`}>
                        {busy ? "● Running" : "● Ready"}
                    </span>
                </div>
            </div>

            {/* Terminal Output */}
            <div
                className="flex-1 overflow-auto bg-[#0d0d0d] p-4 font-mono text-xs leading-6 cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                {lines.map((l, i) => (
                    <div key={i} className={`whitespace-pre-wrap ${kindClass(l.kind)}`}>
                        {l.text}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input Section */}
            <div className="bg-[#1a1a1a] border-t border-gray-700 p-4">
                <div className="flex gap-2">
                    <span className="text-blue-400 font-bold">$</span>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        disabled={busy}
                        autoFocus
                        spellCheck={false}
                        placeholder="help | ls | run | new | guess | clear"
                        className="flex-1 px-3 py-2 bg-[#252525] text-white text-sm font-mono rounded border border-gray-700 outline-none focus:border-blue-500 disabled:opacity-50"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            execute(input);
                            setInput("");
                        }}
                        disabled={busy}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded hover:opacity-90 disabled:opacity-50 transition"
                    >
                        {busy ? "…" : "▶"}
                    </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">Ctrl+L clear • ↑↓ history</p>
            </div>
        </main>
    );
}
