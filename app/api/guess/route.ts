import { NextResponse } from "next/server";
import { guessFromFiles } from "@/lib/deps/guess";
import type { FileEntry } from "@/lib/types";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const files = (body?.files || []) as FileEntry[];
        if (!Array.isArray(files)) {
            return NextResponse.json({ error: "files[] required" }, { status: 400 });
        }
        const result = guessFromFiles(files);
        return NextResponse.json(result);
    } catch (e) {
        return NextResponse.json(
            { error: String(e) },
            { status: 500 }
        );
    }
}
