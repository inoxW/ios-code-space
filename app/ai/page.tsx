"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useProject } from "@/lib/project-context";

type Message = {
    role: "user" | "assistant";
    content: string;
};

type Provider = {
    id: string;
    name: string;
    badge: string;
    noKey: boolean;
    defaultModel: string;
    keyHint?: string;
    keyLink?: string;
    models: string[];
};

const PROVIDERS: Provider[] = [
    {
        id: "pollinations",
        name: "Pollinations.ai",
        badge: "Без ключа ✓",
        noKey: true,
        defaultModel: "openai",
        models: ["openai", "mistral", "claude", "llama"],
    },
    {
        id: "huggingface",
        name: "HuggingFace",
        badge: "Без ключа ✓",
        noKey: true,
        defaultModel: "mistralai/Mistral-7B-Instruct-v0.3",
        models: [
            "mistralai/Mistral-7B-Instruct-v0.3",
            "microsoft/Phi-3.5-mini-instruct",
            "Qwen/Qwen2.5-Coder-7B-Instruct",
        ],
    },
    {
        id: "groq",
        name: "Groq",
        badge: "Безплатно",
        noKey: false,
        defaultModel: "llama-3.3-70b-versatile",
        keyHint: "gsk_…",
        keyLink: "https://console.groq.com/keys",
        models: ["llama-3.3-70b-versatile", "llama3-8b-8192", "mixtral-8x7b-32768", "gemma2-9b-it"],
    },
    {
        id: "gemini",
        name: "Google Gemini",
        badge: "Безплатно",
        noKey: false,
        defaultModel: "gemini-2.0-flash-lite",
        keyHint: "AIza…",
        keyLink: "https://aistudio.google.com/apikey",
        models: ["gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-1.5-flash-8b"],
    },
    {
        id: "openrouter",
        name: "OpenRouter",
        badge: "Безплатні моделі",
        noKey: false,
        defaultModel: "meta-llama/llama-3.1-8b-instruct:free",
        keyHint: "sk-or-…",
        keyLink: "https://openrouter.ai/keys",
        models: [
            "meta-llama/llama-3.1-8b-instruct:free",
            "google/gemma-3-12b-it:free",
            "mistralai/mistral-7b-instruct:free",
        ],
    },
    {
        id: "openai",
        name: "OpenAI",
        badge: "Платно",
        noKey: false,
        defaultModel: "gpt-4o-mini",
        keyHint: "sk-…",
        keyLink: "https://platform.openai.com/api-keys",
        models: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo"],
    },
];

const SUGGESTIONS = [
    "Оптимізуй цей код і поясни що покращив",
    "Знайди баги та потенційні помилки",
    "Перепиши з кращими практиками",
    "Поясни що робить цей код",
];

export default function AIPage() {
    const { activeFile } = useProject();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [includeCode, setIncludeCode] = useState(true);
    const [providerId, setProviderId] = useState("groq");
    const [apiKey, setApiKey] = useState("");
    const [model, setModel] = useState(PROVIDERS[0].defaultModel);
    const [showSettings, setShowSettings] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const provider = PROVIDERS.find((p) => p.id === providerId) ?? PROVIDERS[0];

    useEffect(() => {
        const savedId = localStorage.getItem("ai:provider") ?? "groq";
        const savedProvider = PROVIDERS.find((p) => p.id === savedId) ?? PROVIDERS[0];
        setProviderId(savedId);
        setApiKey(localStorage.getItem(`ai:key:${savedId}`) ?? "");
        setModel(localStorage.getItem(`ai:model:${savedId}`) ?? savedProvider.defaultModel);
    }, []);

    const switchProvider = (id: string) => {
        const p = PROVIDERS.find((pr) => pr.id === id) ?? PROVIDERS[0];
        setProviderId(id);
        setApiKey(localStorage.getItem(`ai:key:${id}`) ?? "");
        setModel(localStorage.getItem(`ai:model:${id}`) ?? p.defaultModel);
        localStorage.setItem("ai:provider", id);
    };

    const saveKey = (k: string) => {
        setApiKey(k);
        localStorage.setItem(`ai:key:${providerId}`, k);
    };

    const saveModel = (m: string) => {
        setModel(m);
        localStorage.setItem(`ai:model:${providerId}`, m);
    };

    const send = useCallback(
        async (overrideInput?: string) => {
            const text = (overrideInput ?? input).trim();
            if (!text || busy) return;
            setInput("");

            const codeContext =
                includeCode && activeFile
                    ? `\n\nПоточний файл: ${activeFile.name} (${activeFile.language})\n\`\`\`${activeFile.language}\n${activeFile.content}\n\`\`\``
                    : "";

            const next: Message[] = [
                ...messages,
                { role: "user", content: text + codeContext },
            ];
            setMessages(next);
            setBusy(true);

            try {
                const res = await fetch("/api/ai", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messages: next, apiKey, model, provider: providerId }),
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({ error: res.statusText }));
                    setMessages((p) => [
                        ...p,
                        { role: "assistant", content: `⚠ ${err.error ?? "Помилка API"}` },
                    ]);
                    return;
                }

                const reader = res.body?.getReader();
                if (!reader) return;

                let accumulated = "";
                setMessages((p) => [...p, { role: "assistant", content: "" }]);

                const decoder = new TextDecoder();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    for (const line of chunk.split("\n")) {
                        if (!line.startsWith("data: ")) continue;
                        const raw = line.slice(6).trim();
                        if (raw === "[DONE]") break;
                        try {
                            const delta =
                                JSON.parse(raw).choices?.[0]?.delta?.content ?? "";
                            accumulated += delta;
                            setMessages((p) => {
                                const copy = [...p];
                                copy[copy.length - 1] = {
                                    role: "assistant",
                                    content: accumulated,
                                };
                                return copy;
                            });
                        } catch {
                            /* ignore JSON parse errors in stream */
                        }
                    }
                }
            } catch (e) {
                setMessages((p) => [
                    ...p,
                    { role: "assistant", content: `⚠ ${String(e)}` },
                ]);
            } finally {
                setBusy(false);
                setTimeout(
                    () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
                    50
                );
            }
        },
        [input, busy, messages, activeFile, includeCode, apiKey, model, providerId]
    );

    return (
        <main className="px-4 py-6 sm:px-5">
            <div className="mx-auto flex max-w-4xl flex-col gap-4">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-accent">
                            ai assistant
                        </p>
                        <h1 className="text-lg font-semibold text-mist">
                            Code Optimizer
                            {activeFile ? (
                                <span className="text-mist/50"> / {activeFile.name}</span>
                            ) : null}
                        </h1>
                        <p className="text-xs text-mist/40">
                            {provider.name} · {model}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {messages.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setMessages([])}
                                className="rounded-lg border border-white/15 px-3 py-2 text-sm text-mist/60 hover:text-ember"
                            >
                                Очистити
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setShowSettings((s) => !s)}
                            className="rounded-lg border border-white/15 px-3 py-2 text-sm text-mist/70 hover:border-accent/50"
                        >
                            ⚙ Налаштування
                        </button>
                    </div>
                </div>

                {/* Settings panel */}
                {showSettings && (
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-5">
                        {/* Provider cards */}
                        <div>
                            <p className="mb-2 text-xs uppercase tracking-wide text-mist/50">Провайдер</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {PROVIDERS.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => switchProvider(p.id)}
                                        className={`rounded-xl border px-4 py-3 text-left transition ${providerId === p.id
                                            ? "border-accent/60 bg-accent/10"
                                            : "border-white/10 bg-black/20 hover:border-white/20"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-mist text-sm">{p.name}</span>
                                            <span className={`rounded-full px-2 py-0.5 text-xs ${p.badge === "Платно"
                                                ? "bg-ember/20 text-ember"
                                                : "bg-accent/20 text-accent"
                                                }`}>
                                                {p.badge}
                                            </span>
                                        </div>
                                        <a
                                            href={p.keyLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="mt-1 block text-xs text-accent/60 underline hover:text-accent"
                                        >
                                            Отримати безплатний ключ →
                                        </a>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* API Key */}
                        <div>
                            <label className="mb-1 block text-xs uppercase tracking-wide text-mist/50">
                                API Key — {provider.name}
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => saveKey(e.target.value)}
                                placeholder={provider.keyHint}
                                className="w-full rounded-xl border border-white/10 bg-ink px-3 py-2 font-mono text-sm text-mist outline-none focus:border-accent/50"
                            />
                            <p className="mt-1 text-xs text-mist/40">
                                Зберігається в localStorage локально у браузері.
                            </p>
                        </div>

                        {/* Model */}
                        <div>
                            <label className="mb-1 block text-xs uppercase tracking-wide text-mist/50">
                                Модель
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {provider.models.map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => saveModel(m)}
                                        className={`rounded-lg border px-3 py-1.5 text-xs font-mono transition ${model === m
                                            ? "border-accent/60 bg-accent/10 text-accent"
                                            : "border-white/10 text-mist/60 hover:border-white/20"
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                            <input
                                value={model}
                                onChange={(e) => saveModel(e.target.value)}
                                placeholder="Або введи свою модель"
                                className="w-full rounded-xl border border-white/10 bg-ink px-3 py-2 font-mono text-sm text-mist outline-none focus:border-accent/50"
                            />
                        </div>
                    </div>
                )}

                {/* Suggestions */}
                {messages.length === 0 && (
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTIONS.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => send(s)}
                                disabled={busy}
                                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-mist/70 transition hover:border-accent/40 hover:text-mist disabled:opacity-40"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Chat window */}
                <div className="min-h-[360px] space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4">
                    {messages.length === 0 && (
                        <p className="text-sm text-mist/30">
                            Запитай AI про свій код — оптимізація, рефакторинг, пояснення…
                        </p>
                    )}
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${m.role === "user"
                                    ? "bg-accent/20 text-mist"
                                    : "border border-white/10 bg-black/50 text-mist/90"
                                    }`}
                            >
                                <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                                    {m.content || (busy && i === messages.length - 1 ? "▋" : "")}
                                </pre>
                            </div>
                        </div>
                    ))}
                    {busy && messages[messages.length - 1]?.role !== "assistant" && (
                        <div className="flex justify-start">
                            <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-accent/60">
                                ▋
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="mb-3 flex items-center gap-4 text-sm text-mist/60">
                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                type="checkbox"
                                checked={includeCode}
                                onChange={(e) => setIncludeCode(e.target.checked)}
                                className="accent-accent"
                            />
                            Включити поточний файл
                            {activeFile ? (
                                <span className="text-accent/70">({activeFile.name})</span>
                            ) : (
                                <span className="text-mist/30">(немає)</span>
                            )}
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    send();
                                }
                            }}
                            disabled={busy}
                            rows={3}
                            placeholder="Оптимізуй… / Знайди баги… / Поясни… (Enter — надіслати, Shift+Enter — новий рядок)"
                            className="flex-1 resize-none rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm text-mist outline-none focus:border-accent/50 disabled:opacity-50"
                        />
                        <button
                            type="button"
                            onClick={() => send()}
                            disabled={busy || !input.trim()}
                            className="rounded-xl bg-accent px-4 py-2 font-semibold text-ink disabled:opacity-40"
                        >
                            {busy ? "…" : "▶"}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
