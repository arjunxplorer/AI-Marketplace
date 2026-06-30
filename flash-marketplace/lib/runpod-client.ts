const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const RUNPOD_BASE_URL = "https://api.runpod.ai/v2";

interface RunPodInput {
  [key: string]: unknown;
}

interface RunPodResponse {
  id: string;
  status: string;
  output?: unknown;
  error?: string;
}

/**
 * Send a synchronous request to a RunPod endpoint.
 * Use for fast operations (< 10s). Blocks until complete.
 */
export async function runSync(
  endpointId: string,
  input: RunPodInput
): Promise<RunPodResponse> {
  const res = await fetch(`${RUNPOD_BASE_URL}/${endpointId}/runsync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RUNPOD_API_KEY}`,
    },
    body: JSON.stringify({ input }),
  });

  if (!res.ok) {
    throw new Error(`RunPod API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Send an asynchronous request to a RunPod endpoint.
 * Returns immediately with a job ID for polling.
 */
export async function runAsync(
  endpointId: string,
  input: RunPodInput
): Promise<RunPodResponse> {
  const res = await fetch(`${RUNPOD_BASE_URL}/${endpointId}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RUNPOD_API_KEY}`,
    },
    body: JSON.stringify({ input }),
  });

  if (!res.ok) {
    throw new Error(`RunPod API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Poll the status of an async job.
 */
export async function pollStatus(
  endpointId: string,
  jobId: string
): Promise<RunPodResponse> {
  const res = await fetch(
    `${RUNPOD_BASE_URL}/${endpointId}/status/${jobId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${RUNPOD_API_KEY}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`RunPod API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Cancel a running async job.
 */
export async function cancelJob(
  endpointId: string,
  jobId: string
): Promise<RunPodResponse> {
  const res = await fetch(
    `${RUNPOD_BASE_URL}/${endpointId}/cancel/${jobId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RUNPOD_API_KEY}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`RunPod API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
