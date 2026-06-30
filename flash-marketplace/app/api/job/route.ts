import { NextRequest, NextResponse } from "next/server";
import { pollStatus, cancelJob } from "@/lib/runpod-client";
import { ENDPOINTS } from "@/lib/endpoints";

type EndpointType = keyof typeof ENDPOINTS;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const endpoint = searchParams.get("endpoint") as EndpointType;

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId parameter is required" },
        { status: 400 }
      );
    }

    if (!endpoint || !ENDPOINTS[endpoint]) {
      return NextResponse.json(
        { error: "Valid endpoint parameter is required" },
        { status: 400 }
      );
    }

    const endpointId = ENDPOINTS[endpoint].endpointId;
    if (!endpointId) {
      return NextResponse.json(
        { error: `Endpoint ${endpoint} not configured` },
        { status: 503 }
      );
    }

    const result = await pollStatus(endpointId, jobId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Job status error:", error);
    return NextResponse.json(
      { error: "Failed to get job status", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const endpoint = searchParams.get("endpoint") as EndpointType;

    if (!jobId || !endpoint) {
      return NextResponse.json(
        { error: "jobId and endpoint parameters are required" },
        { status: 400 }
      );
    }

    const endpointId = ENDPOINTS[endpoint]?.endpointId;
    if (!endpointId) {
      return NextResponse.json(
        { error: `Endpoint ${endpoint} not configured` },
        { status: 503 }
      );
    }

    const result = await cancelJob(endpointId, jobId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Job cancel error:", error);
    return NextResponse.json(
      { error: "Failed to cancel job", details: String(error) },
      { status: 500 }
    );
  }
}
