"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useProject } from "@/lib/project-context";
import { executeCommand } from "@/lib/commands";
import { guessFromFiles } from "@/lib/deps/guess";
import { PYODIDE_FRIENDLY } from "@/lib/deps/map";
import { getPyodideRunner } from "@/lib/runner/pyodide-runner";
import { runJavaScript } from "@/lib/runner/js-runner";
import { getPluginCommands } from "@/lib/plugins";

type LineKind = "cmd" | "out" | "err" | "sys" | "info";
type TermLine = { text: string; kind: LineKind };

const HIST_KEY = "terminal:history:v1";

function loadHistory(): string[] {
    try { return JSON.parse(localStorage.getItem(HIST_KEY) ?? "[]"); }
    catch { return []; }
}
function saveHistory(h: string[]) {
    try { localStorage.setItem(HIST_KEY, JSON.stringify(h.slice(-200))); } catch { }
}

function kindClass(k: LineKind) {
    switch (k) {
        case "cmd": return "text-accent font-semibold";
        case "err": return "text-ember";
        case "sys": return "text-mist/40 italic";
        case "info": return "text-mist/70";
        default: return "text-mist";
    }
}

export default function ConsolePage() {
    const { project, activeFile, terminal, appendTerminal, clearTerminal, addFile } = useProject();
    const [input, setInput] = useState("help");
    const [busy, setBusy] = useState(false);
    const [lines, setLines] = useState<TermLine[]>([
        { text: "ios-code-space terminal — type help", kind: "sys" },
    ]);
    const [histIdx, setHistIdx] = useState(-1);
    const [stdin, setStdin] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const push = useCallback((text: string, kind: LineKind = "out") => {
        setLines((p) => [...p.slice(-500), { text, kind }]);
    }, []);

    const runActive = useCallback(async () => {
        if (!activeFile) { push("no active file", "err"); return; }
        push(`$ run ${activeFile.name}`, "cmd");
        setBusy(true);
        try {
            if (activeFile.language === "python") {
                const g = guessFromFiles([activeFile]);
                const packages = g.packages.filter((p) => PYODIDE_FRIENDLY.has(p));
                const ok = await getPyodideRunner().run(activeFile.content, {
                    onStdout: (t) => push(t, "out"),
                    onStderr: (t) => push(t, "err"),
                    onStatus: (t) => push(t, "sys"),
                    packages,
                    stdin,
                });
                push(ok ? "✓ done" : "✗ failed", ok ? "sys" : "err");
            } else if (activeFile.language === "javascript" || activeFile.language === "typescript") {
                const ok = await runJavaScript(activeFile.content, (t) => push(t), (t) => push(t, "err"));
                push(ok ? "✓ done" : "✗ failed", ok ? "sys" : "err");
            } else {
                push(`cannot run: ${activeFile.language}`, "err");
            }
        } finally { setBusy(false); }
    }, [activeFile, push, stdin]);

    const execute = useCallback(async (raw: string) => {
        const cmd = raw.trim();
        if (!cmd) return;

        // Save to history
        const hist = loadHistory();
        const newHist = [...hist.filter((h) => h !== cmd), cmd];
        saveHistory(newHist);
        setHistIdx(-1);

        push(`$ ${cmd}`, "cmd");
        appendTerminal(`$ ${cmd}`);
        setBusy(true);

        const [name, ...rest] = cmd.split(/\s+/);
        const args = rest.join(" ");

        try {
            // Plugin commands take priority
            const pluginCmds = getPluginCommands();
            if (pluginCmds[name]) {
                const result = await pluginCmds[name].fn(args, {
                    files: project.files,
                    activeFile,
                    append: (t) => { push(t, "out"); appendTerminal(t); },
                    addFile,
                });
                const lines = Array.isArray(result) ? result : [result];
                lines.forEach((l) => { push(l, "out"); appendTerminal(l); });
                return;
            }

            // Built-in commands
            switch (name.toLowerCase()) {
                case "help": {
                    const pluginHelp = Object.entries(getPluginCommands()).map(
                        ([c, d]) => `  ${c.padEnd(16)} ${d.description}`
                    );
                    [
                        "Built-in commands:",
                        "  help             Show this help",
                        "  ls               List files",
                        "  cat <file>       Show file content",
                        "  run              Run active file",
                        "  new <name>       Create file",
                        "  guess            Detect dependencies",
                        "  clear            Clear terminal",
                        "  history          Show command history",
                        "  echo <text>      Print text",
                        "  status           Workspace info",
                        ...(pluginHelp.length ? ["", "Plugin commands:", ...pluginHelp] : []),
                    ].forEach((l) => push(l, "info"));
                    break;
                }
                case "ls":
                    project.files.forEach((f) => push(`  ${f.name.padEnd(24)} ${f.language}`, "info"));
                    break;
                case "cat": {
                    const f = args ? project.files.find((fi) => fi.name === args) : activeFile;
                    if (!f) { push(`not found: ${args || "(no active file)"}`, "err"); break; }
                    push(`--- ${f.name} ---`, "sys");
                    f.content.split("\n").forEach((l) => push(l, "out"));
                    break;
                }
                case "echo":
                    push(args, "out");
                    break;
                case "run":
                    await runActive();
                    break;
                case "guess": {
                    const g = guessFromFiles(project.files);
                    if (!g.packages.length) { push("no third-party packages detected", "info"); break; }
                    push(`packages: ${g.packages.join(", ")}`, "info");
                    push(`modules:  ${g.modules.join(", ")}`, "info");
                    break;
                }
                case "new": {
                    const name2 = args || `file-${Date.now()}.py`;
                    addFile(name2);
                    push(`created ${name2}`, "sys");
                    break;
                }
                case "clear":
                    setLines([{ text: "cleared", kind: "sys" }]);
                    clearTerminal();
                    break;
                case "history":
                    loadHistory().forEach((h, i) => push(`  ${i + 1}  ${h}`, "info"));
                    break;
                case "status":
                    push(`project: ${project.name}`, "info");
                    push(`files:   ${project.files.length}`, "info");
                    push(`active:  ${activeFile?.name ?? "—"}`, "info");
                    push("python:  Pyodide WASM", "info");
                    push("js:      Blob worker", "info");
                    break;
                default:
                    // Fall through to legacy command executor
                    await executeCommand(cmd, {
                        files: project.files,
                        activeFile,
                        append: (t) => push(t, "out"),
                        clear: () => { setLines([{ text: "cleared", kind: "sys" }]); clearTerminal(); },
                        addFile,
                        runActive,
                    });
            }
        } finally {
            setBusy(false);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 30);
        }
    }, [project, activeFile, push, appendTerminal, clearTerminal, addFile, runActive]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") { execute(input); setInput(""); return; }
        if (e.key === "l" && e.ctrlKey) {
            e.preventDefault();
            setLines([{ text: "cleared", kind: "sys" }]);
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
        bottomRef.current?.scrollIntoView();
    }, [lines]);

    return (
        <main className="px-4 py-6 sm:px-5">
            <div className="mx-auto flex max-w-5xl flex-col gap-4">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-accent">terminal</p>
                        <h1 className="text-lg font-semibold text-mist">
                            {project.name}
                            {activeFile ? <span className="text-mist/50"> / {activeFile.name}</span> : null}
                        </h1>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-mist/50">
                        <span>↑↓ history</span>
                        <span>Ctrl+L clear</span>
                        <span className={busy ? "text-ember" : "text-accent"}>{busy ? "busy" : "idle"}</span>
                    </div>
                </div>

                {/* Output */}
                <div
                    className="min-h-[420px] max-h-[60vh] overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs"
                    onClick={() => inputRef.current?.focus()}
                >
                    {lines.map((l, i) => (
                        <div key={i} className={`whitespace-pre-wrap leading-5 ${kindClass(l.kind)}`}>
                            {l.text}
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* stdin box */}
                <details className="rounded-2xl border border-white/10 bg-black/30">
                    <summary className="cursor-pointer px-4 py-2 text-xs text-mist/50 select-none">
                        stdin (для Python input()) — клікни щоб розгорнути
                    </summary>
                    <div className="px-4 pb-4">
                        <textarea
                            value={stdin}
                            onChange={(e) => setStdin(e.target.value)}
                            rows={3}
                            placeholder={"value1\nvalue2\nvalue3"}
                            spellCheck={false}
                            className="w-full resize-y rounded-xl border border-white/10 bg-ink p-3 font-mono text-xs text-mist outline-none focus:border-accent/30"
                        />
                        <p className="mt-1 text-xs text-mist/30">Один рядок = одне значення input(). Зчитується зверху вниз.</p>
                    </div>
                </details>

                {/* Input row */}
                <div className="flex gap-2">
                    <span className="flex items-center text-accent font-mono text-sm px-1">$</span>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        disabled={busy}
                        autoFocus
                        spellCheck={false}
                        placeholder="help | run | ls | calc 2**10 | b64 hello | stats"
                        className="flex-1 rounded-xl border border-white/10 bg-ink px-3 py-2 font-mono text-sm text-mist outline-none focus:border-accent/50 disabled:opacity-50"
                    />
                    <button
                        type="button"
                        onClick={() => { execute(input); setInput(""); }}
                        disabled={busy}
                        className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
                    >
                        {busy ? "…" : "▶"}
                    </button>
                </div>
            </div>
        </main>
    );
}
