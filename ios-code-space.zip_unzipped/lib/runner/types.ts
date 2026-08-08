export type RunnerIn =
  | { type: "init" }
  | { type: "run"; id: string; code: string; packages?: string[] };

export type RunnerOut =
  | { type: "ready" }
  | { type: "stdout"; id: string; text: string }
  | { type: "stderr"; id: string; text: string }
  | { type: "status"; id: string; text: string }
  | { type: "done"; id: string; ok: boolean; error?: string }
  | { type: "init_error"; error: string };
