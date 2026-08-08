import Link from "next/link";

const projects = [
  {
    name: "termux-landing",
    description: "Сайт з термінальним стилем для демонстрації IDE.",
    tags: ["nextjs", "tailwind", "ui"],
  },
  {
    name: "ai-helper",
    description: "Швидкий помічник для пояснення, генерації та рефакторингу коду.",
    tags: ["ai", "editor", "assistant"],
  },
  {
    name: "sandbox",
    description: "Пісочниця для тестування невеликих шаблонів і повсякденних задач.",
    tags: ["sandbox", "console", "test"],
  },
];

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_35%),linear-gradient(135deg,_#030712_0%,_#111827_100%)] px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">projects</p>
            <h1 className="text-3xl font-bold">Мої робочі простори</h1>
          </div>
          <Link href="/editor" className="rounded-xl border border-emerald-700/40 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-950/40">
            Відкрити редактор
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <div key={project.name} className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-lg shadow-black/30">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{project.name}</h2>
                <span className="rounded-full border border-emerald-700/40 px-2.5 py-1 text-xs text-emerald-300">
                  active
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
