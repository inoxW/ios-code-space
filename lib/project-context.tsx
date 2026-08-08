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
    const [terminal, setTerminal] = useState<string[]>([]);
    const [hydrated, setHydrated] = useState(false);

    // Load from localStorage once on mount
    useEffect(() => {
        setProject(loadProject());
        setTerminal(loadTerminalLines());
        setHydrated(true);
    }, []);

    // Save project (debounced)
    useEffect(() => {
        if (!hydrated) return;
        const timeout = setTimeout(() => saveProject(project), 300);
        return () => clearTimeout(timeout);
    }, [project, hydrated]);

    // Save terminal (less frequently)
    useEffect(() => {
        if (!hydrated) return;
        const timeout = setTimeout(() => saveTerminalLines(terminal), 500);
        return () => clearTimeout(timeout);
    }, [terminal, hydrated]);

    const setActiveFileId = useCallback((id: string) => {
        setProject((p) => (p.activeFileId === id ? p : { ...p, activeFileId: id }));
    }, []);

    const updateFileContent = useCallback((id: string, content: string) => {
        setProject((p) => ({
            ...p,
            files: p.files.map((f) => (f.id === id && f.content !== content ? { ...f, content } : f)),
            updatedAt: Date.now(),
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
            const activeFileId = p.activeFileId === id ? files[0].id : p.activeFileId;
            return { ...p, files, activeFileId };
        });
    }, []);

    const appendTerminal = useCallback((line: string) => {
        setTerminal((prev) => [...prev.slice(-150), line]);
    }, []);

    const clearTerminal = useCallback(() => {
        setTerminal([]);
    }, []);

    const renameProject = useCallback((name: string) => {
        setProject((p) => (p.name === name ? p : { ...p, name }));
    }, []);

    const resetProject = useCallback(() => {
        setProject(defaultProject);
        setTerminal([]);
    }, []);

    const activeFile = useMemo(
        () => project.files.find((f) => f.id === project.activeFileId) ?? project.files[0],
        [project.files, project.activeFileId]
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

    if (!hydrated) {
        return <>{children}</>;
    }

    return (
        <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
    );
}

export function useProject() {
    const ctx = useContext(ProjectContext);
    if (!ctx) throw new Error("useProject must be used within ProjectProvider");
    return ctx;
}
