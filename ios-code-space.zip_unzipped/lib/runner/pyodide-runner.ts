"use client";

import type { RunnerOut } from "./types";

type Handlers = {
  onStdout: (t: string) => void;
  onStderr: (t: string) => void;
  onStatus?: (t: string) => void;
  packages?: string[];
};

type Pending = Handlers & { resolve: (ok: boolean) => void };

export class PyodideRunner {
  private worker: Worker | null = null;
  private pending = new Map<string, Pending>();
  private _ready = false;

  get ready() {
    return this._ready;
  }

  start() {
    if (typeof window === "undefined") return;
    if (this.worker) return;
    this.worker = new Worker("/pyodide-worker.js");
    this.worker.onmessage = (ev: MessageEvent<RunnerOut>) => this.handle(ev.data);
    this.worker.onerror = (err) => {
      console.error("Pyodide worker error", err);
      this._ready = false;
    };
    this.worker.postMessage({ type: "init" });
  }

  async run(code: string, handlers: Handlers, timeoutMs = 20000): Promise<boolean> {
    this.start();
    if (!this.worker) return false;

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `run-${Date.now()}`;

    return new Promise<boolean>((resolve) => {
      const timer = window.setTimeout(() => {
        handlers.onStderr(`Timeout after ${timeoutMs}ms — restarting runtime`);
        this.terminate();
        this.start();
        this.pending.delete(id);
        resolve(false);
      }, timeoutMs);

      this.pending.set(id, {
        ...handlers,
        resolve: (ok) => {
          window.clearTimeout(timer);
          resolve(ok);
        },
      });

      this.worker!.postMessage({
        type: "run",
        id,
        code,
        packages: handlers.packages || [],
      });
    });
  }

  private handle(msg: RunnerOut) {
    if (msg.type === "ready") {
      this._ready = true;
      return;
    }
    if (msg.type === "init_error") {
      this._ready = false;
      console.error(msg.error);
      return;
    }

    const id = "id" in msg ? msg.id : "";
    const p = this.pending.get(id);
    if (!p && msg.type !== "status") return;

    if (msg.type === "stdout" && p) p.onStdout(msg.text);
    if (msg.type === "stderr" && p) p.onStderr(msg.text);
    if (msg.type === "status") {
      if (p?.onStatus) p.onStatus(msg.text);
      else if (id === "init") {
        // broadcast init status to all waiters lightly via console
      }
    }
    if (msg.type === "done" && p) {
      p.resolve(msg.ok);
      this.pending.delete(id);
    }
  }

  terminate() {
    this.worker?.terminate();
    this.worker = null;
    this._ready = false;
    this.pending.forEach((p) => p.resolve(false));
    this.pending.clear();
  }
}

let singleton: PyodideRunner | null = null;

export function getPyodideRunner(): PyodideRunner {
  if (!singleton) singleton = new PyodideRunner();
  return singleton;
}
