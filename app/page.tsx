import Link from "next/link";

const features = [
  {
    title: "Code Editor",
    description: "Write Python, JavaScript, and TypeScript with syntax highlighting",
    href: "/editor",
    icon: "📝",
  },
  {
    title: "Run Code",
    description: "Execute code instantly with Pyodide and Node.js runtimes",
    href: "/editor",
    icon: "▶",
  },
  {
    title: "File Management",
    description: "Create, edit, and manage project files with localStorage persistence",
    href: "/projects",
    icon: "📁",
  },
];

export default function HomePage() {
  return (
    <main className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#242424] to-[#1a1a1a] p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-3xl font-bold">
              ▶
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Replit</h1>
          <p className="text-xl text-gray-400 mb-2">Browser-based IDE</p>
          <p className="text-gray-500">Code in Python, JavaScript, and TypeScript</p>
        </div>

        <div className="grid gap-4 mb-8">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="block p-6 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] border border-gray-700 hover:border-gray-600 transition group"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">{feature.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/editor"
            className="px-6 py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            Open Editor
          </Link>
          <Link
            href="/projects"
            className="px-6 py-3 bg-[#2a2a2a] text-white font-semibold rounded-lg border border-gray-700 hover:bg-[#333333] transition"
          >
            My Projects
          </Link>
        </div>
      </div>
    </main>
  );
}
