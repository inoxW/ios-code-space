/* global importScripts, loadPyodide */
/* eslint-disable no-undef */

const PYODIDE_VERSION = "0.26.4";
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodide = null;
let loadPromise = null;
let currentId = "";
let stdinLines = [];
let stdinIdx = 0;
const installed = new Set();

function post(msg) {
    self.postMessage(msg);
}

async function ensurePyodide() {
    if (pyodide) return pyodide;
    if (!loadPromise) {
        loadPromise = (async () => {
            post({ type: "status", id: "init", text: "Loading Pyodide runtime…" });
            importScripts(`${INDEX_URL}pyodide.js`);
            const pd = await loadPyodide({
                indexURL: INDEX_URL,
                stdout: (s) => {
                    if (currentId) post({ type: "stdout", id: currentId, text: s });
                },
                stderr: (s) => {
                    if (currentId) post({ type: "stderr", id: currentId, text: s });
                },
            });
            post({ type: "ready" });
            return pd;
        })();
    }
    pyodide = await loadPromise;
    return pyodide;
}

self.onmessage = async (ev) => {
    const msg = ev.data;
    try {
        if (msg.type === "init") {
            await ensurePyodide();
            return;
        }
        if (msg.type === "run") {
            currentId = msg.id;
            const pd = await ensurePyodide();

            const pkgs = (msg.packages || []).filter((p) => p && !installed.has(p));
            if (pkgs.length) {
                post({
                    type: "status",
                    id: msg.id,
                    text: `Installing: ${pkgs.join(", ")}`,
                });
                await pd.loadPackage("micropip");
                const micropip = pd.pyimport("micropip");
                for (const pkg of pkgs) {
                    try {
                        await micropip.install(pkg);
                        installed.add(pkg);
                    } catch (e) {
                        post({
                            type: "stderr",
                            id: msg.id,
                            text: `micropip failed for ${pkg}: ${e}`,
                        });
                    }
                }
            }

            try {
                await pd.runPythonAsync(msg.code);
                post({ type: "done", id: msg.id, ok: true });
            } catch (e) {
                const err = e && e.message ? e.message : String(e);
                post({ type: "stderr", id: msg.id, text: err });
                post({ type: "done", id: msg.id, ok: false, error: err });
            }
        }
    } catch (e) {
        post({ type: "init_error", error: String(e) });
    }
};
