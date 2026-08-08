/* TypeScript in-browser compiler worker using TypeScript CDN */
/* global importScripts, ts */
/* eslint-disable no-undef */

let tsLoaded = false;

function ensureTs() {
    if (tsLoaded) return;
    importScripts("https://cdn.jsdelivr.net/npm/typescript@5.5.3/lib/typescript.js");
    tsLoaded = true;
}

self.onmessage = (ev) => {
    const { id, code, fileName = "script.ts" } = ev.data;
    try {
        ensureTs();
        const result = ts.transpileModule(code, {
            fileName,
            compilerOptions: {
                target: ts.ScriptTarget.ES2020,
                module: ts.ModuleKind.None,
                strict: false,
                esModuleInterop: true,
            },
            reportDiagnostics: true,
        });

        const errors = (result.diagnostics ?? []).map(
            (d) => ts.flattenDiagnosticMessageText(d.messageText, "\n")
        );

        self.postMessage({ id, js: result.outputText, errors });
    } catch (e) {
        self.postMessage({ id, js: null, errors: [String(e)] });
    }
};
