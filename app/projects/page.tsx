"use client";

export const dynamic = "force-dynamic";
export const ssr = false;

import Link from "next/link";
import { useProject } from "@/lib/project-context";

export default function ProjectsPage() {
  const { project, resetProject, renameProject } = useProject();

  return (
    <main className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#242424] to-[#1a1a1a] p-6">
      <div className="max-w-4xl w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Projects</h1>
          <p className="text-gray-400">Manage your coding projects and files</p>
        </div>

        <div className="rounded-lg bg-[#2a2a2a] border border-gray-700 p-8">
          {/* Project Name */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-3">
              Project Name
            </label>
            <input
              value={project.name}
              onChange={(e) => renameProject(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a1a] text-white rounded-lg border border-gray-600 outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
              <p className="text-xs text-gray-400 uppercase mb-2">Files</p>
              <p className="text-3xl font-bold text-blue-400">{project.files.length}</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
              <p className="text-xs text-gray-400 uppercase mb-2">Last Updated</p>
              <p className="text-sm text-white">
                {new Date(project.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Files List */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-4">Files</p>
            <div className="space-y-2">
              {project.files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between bg-[#1a1a1a] rounded-lg p-4 border border-gray-700"
                >
                  <div>
                    <p className="font-mono text-white">{f.name}</p>
                    <p className="text-xs text-gray-400">{f.language}</p>
                  </div>
                  <span className="text-xs bg-gray-700 px-3 py-1 rounded text-gray-200">
                    {f.language}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/editor"
              className="px-6 py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
            >
              Open in Editor
            </Link>
            <button
              type="button"
              onClick={resetProject}
              className="px-6 py-3 bg-[#1a1a1a] text-red-400 font-semibold rounded-lg border border-red-500/30 hover:bg-red-500/10 transition"
            >
              Reset Files
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
