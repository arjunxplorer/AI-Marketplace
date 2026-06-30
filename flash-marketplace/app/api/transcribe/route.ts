import { NextRequest, NextResponse } from "next/server";
import { runSync, runAsync } from "@/lib/runpod-client";
import { ENDPOINTS } from "@/lib/endpoints";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audio, language, task, async: isAsync } = body;

    if (!audio) {
      return NextResponse.json(
        { error: "Audio data is required" },
        { status: 400 }
      );
    }

    const endpointId = ENDPOINTS.whisper.endpointId;
    if (!endpointId) {
      return NextResponse.json(
        { error: "Whisper endpoint not configured" },
        { status: 503 }
      );
    }

    const input = {
      audio,
      language: language || null,
      task: task || "transcribe",
    };

    if (isAsync) {
      const result = await runAsync(endpointId, input);
      return NextResponse.json({
        jobId: result.id,
        status: result.status,
      });
    }

    const result = await runSync(endpointId, input);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio", details: String(error) },
      { status: 500 }
    );
  }
}
