import { guessFromFiles } from "./deps/guess";
import type { FileEntry } from "./types";

export type CommandContext = {
    files: FileEntry[];
    activeFile?: FileEntry;
    append: (line: string) => void;
    clear: () => void;
    addFile: (name: string, content?: string) => void;
    runActive: () => Promise<void>;
};

export const COMMAND_HELP = [
    "help          — list commands",
    "ls            — list files",
    "guess         — detect dependencies from project files",
    "run           — run active file (Python via Pyodide / JS worker)",
    "new <name>    — create file (e.g. new script.py)",
    "clear         — clear terminal",
    "status        — workspace status",
];

export async function executeCommand(
    raw: string,
    ctx: CommandContext
): Promise<void> {
    const line = raw.trim();
    if (!line) return;

    ctx.append(`$ ${line}`);
    const [cmd, ...rest] = line.split(/\s+/);
    const arg = rest.join(" ").trim();

    switch (cmd.toLowerCase()) {
        case "help":
            COMMAND_HELP.forEach((h) => ctx.append(h));
            break;
        case "clear":
            ctx.clear();
            break;
        case "ls":
            ctx.files.forEach((f) => ctx.append(`  ${f.name}  (${f.language})`));
            break;
        case "status":
            ctx.append(`project files: ${ctx.files.length}`);
            ctx.append(`active: ${ctx.activeFile?.name ?? "—"}`);
            ctx.append("python: Pyodide (browser WASM)");
            ctx.append("js: sandboxed worker");
            break;
        case "guess": {
            const g = guessFromFiles(ctx.files);
            if (!g.packages.length) {
                ctx.append("no third-party packages detected");
            } else {
                ctx.append(`packages: ${g.packages.join(", ")}`);
                ctx.append(`modules: ${g.modules.join(", ")}`);
            }
            break;
        }
        case "run":
            await ctx.runActive();
            break;
        case "new": {
            const name = arg || `file-${Date.now()}.py`;
            ctx.addFile(name);
            ctx.append(`created ${name}`);
            break;
        }
        default:
            ctx.append(`unknown command: ${cmd} (try help)`);
    }
}
