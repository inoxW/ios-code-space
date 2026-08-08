import Link from "next/link";

const cards = [
  {
    title: "Projects",
    description: "Manage your workspace projects and quick actions.",
    href: "/projects",
  },
  {
    title: "Editor",
    description: "Edit code snippets and simulate a save workflow.",
    href: "/editor",
  },
  {
    title: "Console",
    description: "Run lightweight command simulation for demos.",
    href: "/console",
  },
];

export default function HomePage() {
  return (
    <main className="px-5 py-10">
      <section className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-black/30 p-8 shadow-panel">
        <p className="text-xs uppercase tracking-[0.35em] text-accent">ios-code-space</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-mist sm:text-5xl">
          One web workspace for code, projects, and terminal-like interactions.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-mist/80">
          This repository is a clean Next.js starter focused on a compact coding dashboard experience.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-accent/70 hover:bg-white/10"
            >
              <h2 className="text-lg font-semibold text-mist">{card.title}</h2>
              <p className="mt-2 text-sm text-mist/70">{card.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
