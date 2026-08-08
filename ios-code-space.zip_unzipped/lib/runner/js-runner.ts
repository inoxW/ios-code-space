"use client";

/** Minimal sandboxed JS runner via blob worker (no DOM access). */

export async function runJavaScript(
  code: string,
  onStdout: (t: string) => void,
  onStderr: (t: string) => void,
  timeoutMs = 8000
): Promise<boolean> {
  const src = `
    const logs = [];
    const cons = {
      log: (...a) => logs.push(a.map(String).join(" ")),
      info: (...a) => logs.push(a.map(String).join(" ")),
      warn: (...a) => logs.push(a.map(String).join(" ")),
      error: (...a) => logs.push(a.map(String).join(" ")),
    };
    self.onmessage = async (e) => {
      try {
        const fn = new Function("console", e.data.code);
        const ret = fn(cons);
        if (ret !== undefined) logs.push(String(ret));
        self.postMessage({ ok: true, logs });
      } catch (err) {
        self.postMessage({ ok: false, logs, error: String(err) });
      }
    };
  `;
  const blob = new Blob([src], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      onStderr(`Timeout after ${timeoutMs}ms`);
      resolve(false);
    }, timeoutMs);

    worker.onmessage = (ev) => {
      window.clearTimeout(timer);
      const { ok, logs, error } = ev.data as {
        ok: boolean;
        logs: string[];
        error?: string;
      };
      logs?.forEach((l) => onStdout(l));
      if (error) onStderr(error);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(!!ok);
    };

    worker.onerror = (err) => {
      window.clearTimeout(timer);
      onStderr(String(err.message || err));
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(false);
    };

    worker.postMessage({ code });
  });
}
