export default function EditorPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Editor</h1>
        <p className="mt-2 text-zinc-400">
          Placeholder editor page for the browser-based workspace.
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <textarea
            className="min-h-[420px] w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm text-zinc-100 outline-none"
            defaultValue={`import Foundation\n\nprint("Hello from ios-code-space")\n`}
          />
        </div>
      </div>
    </main>
  );
}
