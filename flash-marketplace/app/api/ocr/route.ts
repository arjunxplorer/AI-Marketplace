import { NextRequest, NextResponse } from "next/server";
import { runSync, runAsync } from "@/lib/runpod-client";
import { ENDPOINTS } from "@/lib/endpoints";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, language, async: isAsync } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    const endpointId = ENDPOINTS.ocr.endpointId;
    if (!endpointId) {
      return NextResponse.json(
        { error: "OCR endpoint not configured" },
        { status: 503 }
      );
    }

    const input = {
      image,
      language: language || "en",
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
    console.error("OCR error:", error);
    return NextResponse.json(
      { error: "Failed to extract text", details: String(error) },
      { status: 500 }
    );
  }
}
