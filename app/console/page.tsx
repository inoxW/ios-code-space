export default function ConsolePage() {
  return (
    <main className="px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Console</h1>
        <p className="mt-2 text-zinc-400">
          Inspect execution output and runtime logs from the browser-based workspace.
        </p>

        <div className="mt-8 rounded-2xl border border-emerald-900 bg-black p-4 font-mono text-sm text-emerald-400">
          <div className="mb-2 text-emerald-300">$ run project</div>
          <div>Compiling main.swift...</div>
          <div>Execution finished successfully.</div>
          <div className="mt-3 text-zinc-500">Ready for the next run.</div>
        </div>
      </div>
    </main>
  );
}
