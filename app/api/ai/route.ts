import { NextResponse } from "next/server";

const PROVIDERS: Record<string, { url: string; envKey: string }> = {
    groq: {
        url: "https://api.groq.com/openai/v1/chat/completions",
        envKey: "GROQ_API_KEY",
    },
    gemini: {
        url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        envKey: "GEMINI_API_KEY",
    },
    openrouter: {
        url: "https://openrouter.ai/api/v1/chat/completions",
        envKey: "OPENROUTER_API_KEY",
    },
    openai: {
        url: "https://api.openai.com/v1/chat/completions",
        envKey: "OPENAI_API_KEY",
    },
};

const SYSTEM_PROMPT = `You are an expert code optimizer embedded in ios-code-space — a browser-based coding workspace.
Your job:
- Optimize Python and JavaScript/TypeScript code for performance, readability, and best practices
- Find bugs, edge cases, and potential runtime errors
- Suggest idiomatic rewrites with clear explanations
- Explain code concisely when asked
- Keep responses focused and practical

When you show improved code, always explain what changed and why.
Respond in the same language the user writes in (Ukrainian or English).`;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            messages,
            model = "llama-3.3-70b-versatile",
            provider = "groq",
        } = body as {
            messages: { role: string; content: string }[];
            apiKey?: string;
            model?: string;
            provider?: string;
        };

        const providerCfg = PROVIDERS[provider];
        if (!providerCfg) {
            return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
        }

        // Prefer server env var for the chosen provider, fall back to client key
        const apiKey: string =
            (process.env[providerCfg.envKey] as string | undefined) ??
            (body.apiKey as string) ?? "";

        if (!apiKey) {
            return NextResponse.json(
                { error: `API key required for ${provider}. Enter it in ⚙ Налаштування.` },
                { status: 400 }
            );
        }

        if (!Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: "messages[] required" }, { status: 400 });
        }

        const upstream = await fetch(providerCfg.url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
                stream: true,
                max_tokens: 2048,
                temperature: 0.3,
            }),
        });

        if (!upstream.ok) {
            const err = await upstream.json().catch(() => ({}));
            return NextResponse.json(
                { error: (err as { error?: { message?: string } }).error?.message ?? `Upstream ${upstream.status}` },
                { status: upstream.status }
            );
        }

        // Stream the SSE response directly to the client
        return new Response(upstream.body, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-store",
                "X-Accel-Buffering": "no",
            },
        });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
