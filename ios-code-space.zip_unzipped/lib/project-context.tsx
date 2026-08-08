"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createFile,
  defaultProject,
  type FileEntry,
  type Project,
} from "./types";
import { loadProject, loadTerminalLines, saveProject, saveTerminalLines } from "./storage";

type Ctx = {
  project: Project;
  activeFile: FileEntry | undefined;
  terminal: string[];
  setActiveFileId: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  addFile: (name: string, content?: string) => void;
  removeFile: (id: string) => void;
  appendTerminal: (line: string) => void;
  clearTerminal: () => void;
  renameProject: (name: string) => void;
  resetProject: () => void;
};

const ProjectContext = createContext<Ctx | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project>(defaultProject);
  const [terminal, setTerminal] = useState<string[]>([
    "code-space ready",
    "type help in Console or press Run in Editor",
  ]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProject(loadProject());
    const lines = loadTerminalLines();
    if (lines.length) setTerminal(lines);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveProject(project);
  }, [project, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveTerminalLines(terminal);
  }, [terminal, hydrated]);

  const setActiveFileId = useCallback((id: string) => {
    setProject((p) => ({ ...p, activeFileId: id }));
  }, []);

  const updateFileContent = useCallback((id: string, content: string) => {
    setProject((p) => ({
      ...p,
      files: p.files.map((f) => (f.id === id ? { ...f, content } : f)),
    }));
  }, []);

  const addFile = useCallback((name: string, content = "") => {
    const file = createFile(name, content || `# ${name}\n`);
    setProject((p) => ({
      ...p,
      files: [...p.files, file],
      activeFileId: file.id,
    }));
  }, []);

  const removeFile = useCallback((id: string) => {
    setProject((p) => {
      const files = p.files.filter((f) => f.id !== id);
      if (!files.length) return p;
      const activeFileId =
        p.activeFileId === id ? files[0].id : p.activeFileId;
      return { ...p, files, activeFileId };
    });
  }, []);

  const appendTerminal = useCallback((line: string) => {
    setTerminal((prev) => [...prev.slice(-300), line]);
  }, []);

  const clearTerminal = useCallback(() => {
    setTerminal(["code-space ready"]);
  }, []);

  const renameProject = useCallback((name: string) => {
    setProject((p) => ({ ...p, name }));
  }, []);

  const resetProject = useCallback(() => {
    const d = defaultProject();
    setProject(d);
    setTerminal(["workspace reset"]);
  }, []);

  const activeFile = useMemo(
    () => project.files.find((f) => f.id === project.activeFileId) ?? project.files[0],
    [project]
  );

  const value: Ctx = {
    project,
    activeFile,
    terminal,
    setActiveFileId,
    updateFileContent,
    addFile,
    removeFile,
    appendTerminal,
    clearTerminal,
    renameProject,
    resetProject,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}
