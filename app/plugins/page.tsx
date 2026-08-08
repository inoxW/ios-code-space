"use client";

import { useEffect, useState } from "react";
import {
    getBuiltinPlugins,
    loadCustomPlugins,
    removeCustomPlugin,
    saveCustomPlugin,
    type Plugin,
} from "@/lib/plugins";

const TEMPLATE = `({
  id: "my-plugin",
  name: "My Plugin",
  version: "1.0.0",
  description: "Опис плагіна",
  commands: {
    "hello": {
      description: "Привітання. Usage: hello <name>",
      fn: (args, ctx) => {
        // args — рядок після команди
        // ctx  — { files, activeFile, append, addFile }
        return \`Hello, \${args || "world"}!\`;
      },
    },
  },
})`;

export default function PluginsPage() {
    const builtins = getBuiltinPlugins();
    const [custom, setCustom] = useState<Plugin[]>([]);
    const [code, setCode] = useState(TEMPLATE);
    const [error, setError] = useState("");
    const [showAdd, setShowAdd] = useState(false);

    useEffect(() => { setCustom(loadCustomPlugins()); }, []);

    const install = () => {
        setError("");
        try {
            // eslint-disable-next-line no-new-func
            const plugin = new Function(`"use strict"; return ${code}`)() as Plugin;
            if (!plugin?.id || !plugin?.name) throw new Error("Plugin must export { id, name, commands }");
            if (builtins.some((b) => b.id === plugin.id)) throw new Error(`id "${plugin.id}" is reserved by a built-in plugin`);
            saveCustomPlugin(plugin);
            setCustom(loadCustomPlugins());
            setCode(TEMPLATE);
            setShowAdd(false);
        } catch (e) {
            setError(String(e));
        }
    };

    const uninstall = (id: string) => {
        removeCustomPlugin(id);
        setCustom(loadCustomPlugins());
    };

    return (
        <main className="px-4 py-6 sm:px-5">
            <div className="mx-auto flex max-w-5xl flex-col gap-4">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-accent">plugins</p>
                        <h1 className="text-lg font-semibold text-mist">Plugin Manager</h1>
                        <p className="text-xs text-mist/50">Команди плагінів доступні в Terminal</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAdd((s) => !s)}
                        className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-ink"
                    >
                        + Встановити
                    </button>
                </div>

                {/* Install panel */}
                {showAdd && (
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-3">
                        <p className="text-sm font-semibold text-mist">Встановити плагін</p>
                        <p className="text-xs text-mist/50">
                            Плагін — JS-вираз що повертає об'єкт з полями{" "}
                            <code className="text-accent">id, name, version, description, commands</code>.
                            Команди стають доступними в Terminal одразу після встановлення.
                        </p>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            rows={16}
                            spellCheck={false}
                            className="w-full resize-y rounded-xl border border-white/10 bg-ink p-3 font-mono text-xs text-mist outline-none focus:border-accent/30"
                        />
                        {error && <p className="rounded-lg bg-ember/10 px-3 py-2 text-xs text-ember">{error}</p>}
                        <div className="flex gap-2">
                            <button type="button" onClick={install} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink">
                                Встановити
                            </button>
                            <button type="button" onClick={() => { setShowAdd(false); setError(""); }} className="rounded-lg border border-white/15 px-4 py-2 text-sm text-mist/70">
                                Скасувати
                            </button>
                        </div>
                    </div>
                )}

                {/* Custom plugins */}
                {custom.length > 0 && (
                    <section>
                        <p className="mb-2 text-xs uppercase tracking-wide text-mist/40">Встановлені</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {custom.map((p) => (
                                <PluginCard key={p.id} plugin={p} onRemove={() => uninstall(p.id)} removable />
                            ))}
                        </div>
                    </section>
                )}

                {/* Built-in plugins */}
                <section>
                    <p className="mb-2 text-xs uppercase tracking-wide text-mist/40">Вбудовані</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {builtins.map((p) => <PluginCard key={p.id} plugin={p} />)}
                    </div>
                </section>
            </div>
        </main>
    );
}

function PluginCard({ plugin: p, onRemove, removable }: { plugin: Plugin; onRemove?: () => void; removable?: boolean }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="font-semibold text-mist">{p.name}</p>
                    <p className="text-xs text-mist/50">{p.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-mist/40">v{p.version}</span>
                    {removable && (
                        <button type="button" onClick={onRemove} className="text-xs text-ember hover:underline">
                            Видалити
                        </button>
                    )}
                </div>
            </div>
            <div className="mt-3 space-y-1.5">
                {Object.entries(p.commands).map(([cmd, def]) => (
                    <div key={cmd} className="flex items-baseline gap-2">
                        <code className="rounded bg-accent/10 px-2 py-0.5 text-xs text-accent shrink-0">{cmd}</code>
                        <span className="text-xs text-mist/50">{def.description}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
