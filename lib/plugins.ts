"use client";

import type { FileEntry } from "./types";

export type PluginContext = {
    files: FileEntry[];
    activeFile?: FileEntry;
    append: (line: string) => void;
    addFile: (name: string, content?: string) => void;
};

export type PluginCommand = {
    description: string;
    fn: (args: string, ctx: PluginContext) => string | string[] | Promise<string | string[]>;
};

export type Plugin = {
    id: string;
    name: string;
    version: string;
    description: string;
    commands: Record<string, PluginCommand>;
};

const BUILTIN: Plugin[] = [
    {
        id: "json",
        name: "JSON Tools",
        version: "1.0.0",
        description: "Format, minify, validate JSON",
        commands: {
            "json-fmt": {
                description: "Pretty-print active file as JSON",
                fn: (_, ctx) => {
                    if (!ctx.activeFile) return "no active file";
                    try {
                        return JSON.stringify(JSON.parse(ctx.activeFile.content), null, 2);
                    } catch (e) {
                        return `invalid JSON: ${String(e)}`;
                    }
                },
            },
            "json-min": {
                description: "Minify active JSON file",
                fn: (_, ctx) => {
                    if (!ctx.activeFile) return "no active file";
                    try {
                        return JSON.stringify(JSON.parse(ctx.activeFile.content));
                    } catch (e) {
                        return `invalid JSON: ${String(e)}`;
                    }
                },
            },
        },
    },
    {
        id: "base64",
        name: "Base64",
        version: "1.0.0",
        description: "Encode / decode Base64",
        commands: {
            "b64": {
                description: "Encode text. Usage: b64 <text>",
                fn: (args) => args ? btoa(unescape(encodeURIComponent(args))) : "usage: b64 <text>",
            },
            "b64d": {
                description: "Decode Base64. Usage: b64d <encoded>",
                fn: (args) => {
                    if (!args) return "usage: b64d <encoded>";
                    try { return decodeURIComponent(escape(atob(args))); }
                    catch { return "invalid base64"; }
                },
            },
        },
    },
    {
        id: "calc",
        name: "Calculator",
        version: "1.0.0",
        description: "Evaluate math expressions",
        commands: {
            "calc": {
                description: "Evaluate expression. Usage: calc 2**10 + Math.PI",
                fn: (args) => {
                    if (!args) return "usage: calc <expr>";
                    try {
                        // Only Math and numbers; no DOM/fetch access
                        const result = new Function("Math", `"use strict"; return (${args})`)(Math);
                        return `= ${result}`;
                    } catch {
                        return "invalid expression";
                    }
                },
            },
        },
    },
    {
        id: "stats",
        name: "Code Stats",
        version: "1.0.0",
        description: "Line / word / char counts",
        commands: {
            "stats": {
                description: "Show stats for active file",
                fn: (_, ctx) => {
                    if (!ctx.activeFile) return "no active file";
                    const lines = ctx.activeFile.content.split("\n");
                    const chars = ctx.activeFile.content.length;
                    const words = ctx.activeFile.content.split(/\s+/).filter(Boolean).length;
                    return [
                        `${ctx.activeFile.name}`,
                        `  lines: ${lines.length} (non-empty: ${lines.filter((l) => l.trim()).length})`,
                        `  words: ${words}`,
                        `  chars: ${chars}`,
                    ];
                },
            },
        },
    },
    {
        id: "hash",
        name: "Hash",
        version: "1.0.0",
        description: "SHA-256 digest",
        commands: {
            "sha256": {
                description: "SHA-256 of text. Usage: sha256 <text>",
                fn: async (args) => {
                    if (!args) return "usage: sha256 <text>";
                    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(args));
                    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
                },
            },
        },
    },
];

const CUSTOM_KEY = "plugins:custom:v1";

export const getBuiltinPlugins = (): Plugin[] => BUILTIN;

export function loadCustomPlugins(): Plugin[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(CUSTOM_KEY);
        return raw ? (JSON.parse(raw) as Plugin[]) : [];
    } catch { return []; }
}

export function saveCustomPlugin(plugin: Plugin): void {
    if (typeof window === "undefined") return;
    const existing = loadCustomPlugins().filter((p) => p.id !== plugin.id);
    localStorage.setItem(CUSTOM_KEY, JSON.stringify([...existing, plugin]));
}

export function removeCustomPlugin(id: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(loadCustomPlugins().filter((p) => p.id !== id)));
}

export function getAllPlugins(): Plugin[] {
    return [...BUILTIN, ...loadCustomPlugins()];
}

export function getPluginCommands(): Record<string, PluginCommand & { pluginId: string }> {
    const map: Record<string, PluginCommand & { pluginId: string }> = {};
    for (const plugin of getAllPlugins()) {
        for (const [cmd, def] of Object.entries(plugin.commands)) {
            map[cmd] = { ...def, pluginId: plugin.id };
        }
    }
    return map;
}
