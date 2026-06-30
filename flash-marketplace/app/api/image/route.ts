import { NextRequest, NextResponse } from "next/server";
import { runSync, runAsync } from "@/lib/runpod-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      negative_prompt,
      width,
      height,
      num_inference_steps,
      guidance_scale,
      seed,
      async: isAsync,
    } = body;

    const endpointId = process.env.RUNPOD_SD_ENDPOINT_ID;
    if (!endpointId) {
      return NextResponse.json(
        { error: "Stable Diffusion endpoint not configured" },
        { status: 503 }
      );
    }

    // Automatic1111 input format
    const input = {
      prompt: prompt || "A beautiful landscape",
      negative_prompt: negative_prompt || "",
      width: width || 512,
      height: height || 512,
      steps: num_inference_steps || 28,
      cfg_scale: guidance_scale || 7,
      seed: seed || -1,
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
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image", details: String(error) },
      { status: 500 }
    );
  }
}
