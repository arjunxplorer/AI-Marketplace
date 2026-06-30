import { NextRequest, NextResponse } from "next/server";
import { runSync, runAsync } from "@/lib/runpod-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      prompt,
      system_prompt,
      max_tokens,
      temperature,
      async: isAsync,
    } = body;

    const endpointId = process.env.RUNPOD_VLLM_ENDPOINT_ID;
    if (!endpointId) {
      return NextResponse.json(
        { error: "vLLM endpoint not configured" },
        { status: 503 }
      );
    }

    // Build messages array for OpenAI-compatible format
    let chatMessages = messages;
    if (!chatMessages && prompt) {
      chatMessages = [];
      if (system_prompt) {
        chatMessages.push({ role: "system", content: system_prompt });
      }
      chatMessages.push({ role: "user", content: prompt });
    }

    if (!chatMessages || chatMessages.length === 0) {
      return NextResponse.json(
        { error: "Messages or prompt is required" },
        { status: 400 }
      );
    }

    // vLLM OpenAI-compatible input format
    const input = {
      messages: chatMessages,
      max_tokens: max_tokens || 256,
      temperature: temperature || 0.7,
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
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate response", details: String(error) },
      { status: 500 }
    );
  }
}
