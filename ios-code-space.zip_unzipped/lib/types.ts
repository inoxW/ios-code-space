export type FileLanguage = "python" | "javascript" | "typescript" | "json" | "text";

export type FileEntry = {
  id: string;
  name: string;
  language: FileLanguage;
  content: string;
};

export type Project = {
  id: string;
  name: string;
  files: FileEntry[];
  activeFileId: string;
  updatedAt: number;
};

export type TerminalLine = {
  id: string;
  text: string;
  kind?: "out" | "err" | "sys" | "cmd";
};

export function languageFromName(name: string): FileLanguage {
  const lower = name.toLowerCase();
  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "typescript";
  if (lower.endsWith(".js") || lower.endsWith(".jsx")) return "javascript";
  if (lower.endsWith(".json")) return "json";
  return "text";
}

export function createFile(name: string, content = ""): FileEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    language: languageFromName(name),
    content,
  };
}

export function defaultProject(): Project {
  const main = createFile(
    "main.py",
    `def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("Code Space"))
print(2 + 2)
`
  );
  const app = createFile(
    "app.js",
    `// Browser JS runner (simple)
const msg = "Hello from JS";
console.log(msg);
console.log([1, 2, 3].map((n) => n * 2));
`
  );
  return {
    id: "default",
    name: "Demo workspace",
    files: [main, app],
    activeFileId: main.id,
    updatedAt: Date.now(),
  };
}
