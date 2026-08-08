export default function ConsolePage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Console</h1>
        <p className="mt-2 text-zinc-400">
          Placeholder output panel for runtime logs and execution results.
        </p>

        <div className="mt-8 rounded-2xl border border-emerald-900 bg-black p-4 font-mono text-sm text-emerald-400">
          Ready.
        </div>
      </div>
    </main>
  );
}
