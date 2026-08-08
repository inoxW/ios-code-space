import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-emerald-400">
            ios-code-space
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Web-based coding workspace for iPhone, iPad, and desktop
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Create projects, edit code, inspect files, and run code through a
            backend execution service — all from the browser.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/projects"
              className="rounded-lg bg-emerald-500 px-5 py-3 font-medium text-zinc-950 transition hover:bg-emerald-400"
            >
              Open Projects
            </Link>

            <Link
              href="/editor"
              className="rounded-lg border border-zinc-700 px-5 py-3 font-medium text-zinc-100 transition hover:bg-zinc-900"
            >
              Open Editor
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          <FeatureCard
            title="Projects"
            description="Organize coding workspaces and switch between environments quickly."
          />
          <FeatureCard
            title="Editor"
            description="Write and modify code in a clean browser-based editor."
          />
          <FeatureCard
            title="Console"
            description="See output, logs, and execution results in a terminal-style panel."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg shadow-black/20">
      <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
    </div>
  );
}
