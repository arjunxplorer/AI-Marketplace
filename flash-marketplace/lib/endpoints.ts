/**
 * RunPod Endpoint Configuration
 * Maps model capabilities to their serverless endpoint IDs.
 */
export const ENDPOINTS = {
  // Existing endpoints
  vllm: {
    endpointId: process.env.RUNPOD_VLLM_ENDPOINT_ID || "",
  },
  sd: {
    endpointId: process.env.RUNPOD_SD_ENDPOINT_ID || "",
  },
  // Optional additional endpoints
  whisper: {
    endpointId: process.env.RUNPOD_WHISPER_ENDPOINT_ID || "",
  },
  ocr: {
    endpointId: process.env.RUNPOD_OCR_ENDPOINT_ID || "",
  },
  embeddings: {
    endpointId: process.env.RUNPOD_EMBED_ENDPOINT_ID || "",
  },
} as const;

export type EndpointType = keyof typeof ENDPOINTS;
