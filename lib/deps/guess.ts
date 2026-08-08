import { mapJsModule, mapPythonModule } from "./map";
import type { FileEntry } from "../types";

const PY_IMPORT = /^\s*(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/gm;
const JS_IMPORT =
    /(?:import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;

export type GuessResult = {
    packages: string[];
    modules: string[];
    language: string;
};

export function guessFromPython(code: string): GuessResult {
    const modules = new Set<string>();
    const packages = new Set<string>();
    let m: RegExpExecArray | null;
    const re = new RegExp(PY_IMPORT);
    while ((m = re.exec(code))) {
        const mod = (m[1] || m[2] || "").trim();
        if (!mod) continue;
        modules.add(mod);
        const pkg = mapPythonModule(mod);
        if (pkg) packages.add(pkg);
    }
    return {
        packages: [...packages].sort(),
        modules: [...modules].sort(),
        language: "python",
    };
}

export function guessFromJs(code: string): GuessResult {
    const modules = new Set<string>();
    const packages = new Set<string>();
    let m: RegExpExecArray | null;
    const re = new RegExp(JS_IMPORT);
    while ((m = re.exec(code))) {
        const mod = (m[1] || m[2] || "").trim();
        if (!mod) continue;
        modules.add(mod);
        const pkg = mapJsModule(mod);
        if (pkg) packages.add(pkg);
    }
    return {
        packages: [...packages].sort(),
        modules: [...modules].sort(),
        language: "javascript",
    };
}

export function guessFromFiles(files: FileEntry[]): GuessResult {
    const packages = new Set<string>();
    const modules = new Set<string>();
    let language = "mixed";

    for (const f of files) {
        let r: GuessResult;
        if (f.language === "python") {
            r = guessFromPython(f.content);
            language = files.length === 1 ? "python" : language;
        } else if (
            f.language === "javascript" ||
            f.language === "typescript"
        ) {
            r = guessFromJs(f.content);
            language = files.length === 1 ? "javascript" : language;
        } else {
            continue;
        }
        r.packages.forEach((p) => packages.add(p));
        r.modules.forEach((m) => modules.add(m));
    }

    return {
        packages: [...packages].sort(),
        modules: [...modules].sort(),
        language,
    };
}
