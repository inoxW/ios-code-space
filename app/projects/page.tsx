export default function ProjectsPage() {
  const projects = ["ios-code-space", "Demo Project", "Sandbox"];

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="mt-2 text-zinc-400">
          A minimal project list for the web-based coding workspace.
        </p>

        <div className="mt-8 grid gap-4">
          {projects.map((project) => (
            <div
              key={project}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
            >
              {project}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
