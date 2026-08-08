"use client";

import { useCallback, useEffect, useRef, useState, memo } from "react";
import { useProject } from "@/lib/project-context";
import { guessFromFiles } from "@/lib/deps/guess";
import { PYODIDE_FRIENDLY } from "@/lib/deps/map";
import { getPyodideRunner } from "@/lib/runner/pyodide-runner";
import { runJavaScript } from "@/lib/runner/js-runner";
import { runTypeScript } from "@/lib/runner/ts-runner";

// Memoized components for performance
const FilesList = memo(({ files, activeFileId, onSelect, onRemove }: any) => (
  <div className="flex-1 overflow-y-auto">
    {files.map((f: any) => (
      <div
        key={f.id}
        onClick={() => onSelect(f.id)}
        className={`px-4 py-3 border-l-2 cursor-pointer transition ${activeFileId === f.id
            ? "border-l-blue-500 bg-[#2a2a2a] text-blue-400"
            : "border-l-transparent text-gray-300 hover:bg-[#2a2a2a]"
          }`}
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{f.name}</p>
            <p className="text-xs text-gray-500">{f.language}</p>
          </div>
          {files.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(f.id);
              }}
              className="text-gray-500 hover:text-red-400 ml-2"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
));

const Console = memo(({ lines, busy }: any) => (
  <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-gray-300">
    {lines.length === 0 ? (
      <p className="text-gray-600">Ready...</p>
    ) : (
      lines.map((line: string, i: number) => (
        <div key={i} className="whitespace-pre-wrap">
          {line}
        </div>
      ))
    )}
  </div>
));

export default function EditorPage() {
  const {
    project,
    activeFile,
    terminal,
    setActiveFileId,
    updateFileContent,
    addFile,
    removeFile,
    appendTerminal,
    clearTerminal,
  } = useProject();

  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState("script.py");
  const [leftWidth, setLeftWidth] = useState(250);
  const [consoleHeight, setConsoleHeight] = useState(200);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ type: null as "vertical" | "horizontal" | null });
  const frameRef = useRef<number | null>(null);

  // Efficient drag handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.current.type) return;

      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        if (dragState.current.type === "vertical") {
          const newWidth = Math.max(150, Math.min(400, e.clientX - 10));
          setLeftWidth(newWidth);
        } else if (dragState.current.type === "horizontal") {
          const container = containerRef.current;
          if (container) {
            const rect = container.getBoundingClientRect();
            const newHeight = Math.max(100, Math.min(400, rect.bottom - e.clientY));
            setConsoleHeight(newHeight);
          }
        }
      });
    };

    const handleMouseUp = () => {
      dragState.current.type = null;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Preload Pyodide
  useEffect(() => {
    try {
      getPyodideRunner().start();
    } catch { }
  }, []);

  const runActive = useCallback(async () => {
    if (!activeFile || busy) return;
    setBusy(true);
    appendTerminal(`$ run ${activeFile.name}`);

    try {
      if (activeFile.language === "python") {
        const g = guessFromFiles([activeFile]);
        const packages = g.packages.filter((p) => PYODIDE_FRIENDLY.has(p));
        if (packages.length) {
          appendTerminal(`[deps] ${packages.join(", ")}`);
        }
        const ok = await getPyodideRunner().run(activeFile.content, {
          onStdout: (t) => appendTerminal(t),
          onStderr: (t) => appendTerminal(`[err] ${t}`),
          onStatus: (t) => appendTerminal(`[pyodide] ${t}`),
          packages,
          stdin: "",
        });
        appendTerminal(ok ? "✓ done" : "✗ failed");
      } else if (activeFile.language === "javascript") {
        const ok = await runJavaScript(
          activeFile.content,
          (t) => appendTerminal(t),
          (t) => appendTerminal(`[err] ${t}`)
        );
        appendTerminal(ok ? "✓ done" : "✗ failed");
      } else if (activeFile.language === "typescript") {
        appendTerminal(`[tsc] compiling…`);
        const ok = await runTypeScript(
          activeFile.content,
          (t) => appendTerminal(t),
          (t) => appendTerminal(`[err] ${t}`)
        );
        appendTerminal(ok ? "✓ done" : "✗ failed");
      } else {
        appendTerminal(`cannot run: ${activeFile.language}`);
      }
    } finally {
      setBusy(false);
    }
  }, [activeFile, busy, appendTerminal]);

  const onGuess = useCallback(() => {
    const g = guessFromFiles(project.files);
    appendTerminal("$ guess");
    if (!g.packages.length) {
      appendTerminal("no packages");
    } else {
      appendTerminal(`packages: ${g.packages.join(", ")}`);
      appendTerminal(`modules: ${g.modules.join(", ")}`);
    }
  }, [project.files, appendTerminal]);

  const handleAddFile = useCallback(() => {
    if (newName.trim()) {
      addFile(newName.trim());
      setNewName("script.py");
    }
  }, [newName, addFile]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleAddFile();
      }
    },
    [handleAddFile]
  );

  return (
    <main className="w-full h-full flex flex-col bg-[#1a1a1a]">
      {/* Top Bar */}
      <div className="h-12 bg-[#1e1e1e] border-b border-gray-700 flex items-center px-4 gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 truncate">{project.name}</p>
          {activeFile && (
            <p className="text-sm font-medium text-white truncate">{activeFile.name}</p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onGuess}
            className="px-3 py-1.5 text-xs bg-[#2a2a2a] text-gray-200 rounded hover:bg-[#333333] transition"
          >
            Guess
          </button>
          <button
            type="button"
            onClick={runActive}
            disabled={busy}
            className="px-3 py-1.5 text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white rounded font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {busy ? "…" : "▶"}
          </button>
          <button
            type="button"
            onClick={clearTerminal}
            className="px-3 py-1.5 text-xs bg-[#2a2a2a] text-gray-400 rounded hover:bg-[#333333] transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Files Sidebar */}
        <div
          style={{ width: `${leftWidth}px` }}
          className="bg-[#252525] border-r border-gray-700 flex flex-col overflow-hidden"
        >
          <div className="p-4 border-b border-gray-700">
            <p className="text-xs font-semibold text-gray-300 mb-3">FILES</p>
            <div className="flex gap-1">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-2 py-1.5 text-xs bg-[#1a1a1a] text-white rounded border border-gray-600 outline-none focus:border-blue-500"
                placeholder="name.py"
              />
              <button
                type="button"
                onClick={handleAddFile}
                className="px-2 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700"
              >
                +
              </button>
            </div>
          </div>
          <FilesList
            files={project.files}
            activeFileId={activeFile?.id}
            onSelect={setActiveFileId}
            onRemove={removeFile}
          />
        </div>

        {/* Vertical Resizer */}
        <div
          onMouseDown={() => {
            dragState.current.type = "vertical";
          }}
          className="w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition"
        />

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="h-10 bg-[#1e1e1e] border-b border-gray-700 flex items-center px-4 gap-2 overflow-x-auto">
            {activeFile && (
              <div className="flex items-center gap-2 px-3 py-1 bg-[#2a2a2a] rounded text-sm text-white whitespace-nowrap">
                <span className="text-xs text-gray-400">●</span>
                {activeFile.name}
              </div>
            )}
          </div>

          {/* Editor + Console Split */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Code Editor */}
            <div
              style={{ height: `calc(100% - ${consoleHeight}px)` }}
              className="bg-[#1a1a1a] overflow-hidden"
            >
              {activeFile && (
                <textarea
                  value={activeFile.content}
                  onChange={(e) =>
                    updateFileContent(activeFile.id, e.target.value)
                  }
                  spellCheck={false}
                  className="w-full h-full p-4 bg-[#1a1a1a] text-gray-200 font-mono text-sm leading-relaxed outline-none resize-none"
                  style={{ fontFamily: "'SF Mono', Monaco, 'Cascadia Code', monospace" }}
                />
              )}
            </div>

            {/* Horizontal Resizer */}
            <div
              onMouseDown={() => {
                dragState.current.type = "horizontal";
              }}
              className="h-1 bg-gray-700 hover:bg-blue-500 cursor-row-resize transition"
            />

            {/* Console Output */}
            <div
              style={{ height: `${consoleHeight}px` }}
              className="bg-[#0d0d0d] border-t border-gray-700 flex flex-col"
            >
              <div className="px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-300">OUTPUT</p>
                <span className={`text-xs font-semibold ${busy ? "text-yellow-500" : "text-green-500"}`}>
                  {busy ? "● Running" : "● Ready"}
                </span>
              </div>
              <Console lines={terminal} busy={busy} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
