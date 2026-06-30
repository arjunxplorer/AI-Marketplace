import { NextRequest, NextResponse } from "next/server";
import { runSync } from "@/lib/runpod-client";
import { ENDPOINTS } from "@/lib/endpoints";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { texts, compare_texts } = body;

    if (!texts || (Array.isArray(texts) && texts.length === 0)) {
      return NextResponse.json(
        { error: "Text input is required" },
        { status: 400 }
      );
    }

    const endpointId = ENDPOINTS.embeddings.endpointId;
    if (!endpointId) {
      return NextResponse.json(
        { error: "Embeddings endpoint not configured" },
        { status: 503 }
      );
    }

    const input: Record<string, unknown> = {
      texts: Array.isArray(texts) ? texts : [texts],
    };

    if (compare_texts) {
      input.compare_texts = Array.isArray(compare_texts)
        ? compare_texts
        : [compare_texts];
    }

    const result = await runSync(endpointId, input);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Embeddings error:", error);
    return NextResponse.json(
      { error: "Failed to generate embeddings", details: String(error) },
      { status: 500 }
    );
  }
}
