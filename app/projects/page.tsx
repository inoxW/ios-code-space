const projects = [
  {
    name: "dashboard-ui",
    stack: "Next.js + Tailwind",
    status: "active",
  },
  {
    name: "api-mock",
    stack: "Node.js",
    status: "planned",
  },
  {
    name: "mobile-layout",
    stack: "Responsive CSS",
    status: "active",
  },
];

export default function ProjectsPage() {
  return (
    <main className="px-5 py-10">
      <section className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-black/30 p-8 shadow-panel">
        <h1 className="text-3xl font-bold text-mist">Projects</h1>
        <p className="mt-2 text-mist/70">Current project list in this demo workspace.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <article key={project.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h2 className="text-lg font-semibold text-mist">{project.name}</h2>
              <p className="mt-1 text-sm text-mist/70">{project.stack}</p>
              <p className="mt-3 inline-block rounded-full border border-accent/50 px-2 py-1 text-xs text-accent">
                {project.status}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
