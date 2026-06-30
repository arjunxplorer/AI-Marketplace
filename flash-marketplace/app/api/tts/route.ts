import { NextRequest, NextResponse } from "next/server";
import { runSync } from "@/lib/runpod-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const endpointId = process.env.RUNPOD_TTS_ENDPOINT_ID;
    if (!endpointId) {
      return NextResponse.json(
        { error: "TTS endpoint not configured" },
        { status: 503 }
      );
    }

    const result = await runSync(endpointId, { text });

    return NextResponse.json(result);
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech", details: String(error) },
      { status: 500 }
    );
  }
}
