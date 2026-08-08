import Link from "next/link";

const cards = [
  {
    title: "Editor",
    description: "Files, Run (Pyodide Python / JS worker), Guess deps, live terminal.",
    href: "/editor",
  },
  {
    title: "Console",
    description: "Termux-style commands: help, ls, guess, run, new, clear.",
    href: "/console",
  },
  {
    title: "Projects",
    description: "Workspace overview; files persist in localStorage.",
    href: "/projects",
  },
];

export default function HomePage() {
  return (
    <main className="px-5 py-10">
      <section className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-black/30 p-8 shadow-panel">
        <p className="text-xs uppercase tracking-[0.35em] text-accent">
          ios-code-space
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-mist sm:text-5xl">
          Code in the browser — including on iPhone &amp; iPad.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-mist/80">
          Next.js workspace with shared project state, dependency guessing
          (UPM-style), command console, and in-browser Python via Pyodide.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/editor"
            className="rounded-xl bg-accent px-5 py-3 font-semibold text-ink transition hover:brightness-110"
          >
            Open editor
          </Link>
          <Link
            href="/console"
            className="rounded-xl border border-accent/40 px-5 py-3 font-semibold text-accent transition hover:bg-accent/10"
          >
            Console
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-white/10 bg-black/40 p-6 transition hover:border-accent/40"
            >
              <h2 className="text-lg font-semibold text-mist">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-mist/70">
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
