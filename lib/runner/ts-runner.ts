"use client";

/** Compile TypeScript in a worker, then run the JS output via the JS runner. */

import { runJavaScript } from "./js-runner";

let tsWorker: Worker | null = null;

function getTsWorker(): Worker {
    if (!tsWorker) tsWorker = new Worker("/ts-worker.js");
    return tsWorker;
}

export function compileTypeScript(code: string): Promise<{ js: string; errors: string[] }> {
    return new Promise((resolve) => {
        const id = `ts-${Date.now()}`;
        const w = getTsWorker();
        const handler = (ev: MessageEvent) => {
            if (ev.data.id !== id) return;
            w.removeEventListener("message", handler);
            resolve({ js: ev.data.js ?? "", errors: ev.data.errors ?? [] });
        };
        w.addEventListener("message", handler);
        w.postMessage({ id, code });
    });
}

export async function runTypeScript(
    code: string,
    onStdout: (t: string) => void,
    onStderr: (t: string) => void
): Promise<boolean> {
    const { js, errors } = await compileTypeScript(code);
    if (errors.length) {
        errors.forEach((e) => onStderr(`[tsc] ${e}`));
        if (!js) return false;
    }
    return runJavaScript(js, onStdout, onStderr);
}
