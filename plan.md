# AI Playground on RunPod — Implementation Plan

## Overview

Build a multi-model AI Playground that demonstrates RunPod's serverless platform. Each AI capability runs as an independent RunPod endpoint, orchestrated through a thin backend, and exposed via a polished Next.js frontend.

---

## Phase 0: Project Scaffolding

- [ ] Initialize Next.js project with TypeScript, Tailwind CSS, App Router
- [ ] Set up folder structure:
  ```
  flash-marketplace/
  ├── app/                  # Next.js app router pages
  ├── components/           # React components (cards, forms, results)
  ├── lib/                  # Shared utilities, RunPod client
  ├── api/                  # Backend API routes (Next.js API routes or separate FastAPI)
  ├── workers/              # RunPod worker handler scripts (one per model)
  └── public/               # Static assets
  ```
- [ ] Install dependencies: `next`, `react`, `tailwindcss`, `runpod-sdk`, `redis` (optional), `prisma` (optional for DB)
- [ ] Set up `.env` with RunPod API key and endpoint IDs
- [ ] Configure RunPod skills via `npx skills add runpod/skills`

---

## Phase 1: Deploy RunPod Serverless Endpoints

Deploy each model as an independent RunPod serverless endpoint. Models are downloaded directly on RunPod using RunPod skills — no Dockerfiles needed.

### 1A: Image Generation Endpoint (FLUX / SDXL)

- [ ] Create worker handler (`workers/image-gen/handler.py`):
  ```python
  import runpod
  model = load_flux()

  def handler(job):
      prompt = job["input"]["prompt"]
      image = model.generate(prompt)
      return image

  runpod.serverless.start({"handler": handler})
  ```
- [ ] Download model on RunPod (FLUX or SDXL weights)
- [ ] Create serverless endpoint with the handler
- [ ] Configure autoscaling + GPU type (e.g., RTX 4090 or A100)
- [ ] Test endpoint with sample request
- [ ] Record endpoint ID

### 1B: Speech-to-Text Endpoint (Whisper)

- [ ] Create worker handler (`workers/whisper/handler.py`):
  ```python
  import runpod
  model = load_whisper()

  def handler(job):
      audio = job["input"]["audio"]
      return model.transcribe(audio)

  runpod.serverless.start({"handler": handler})
  ```
- [ ] Download Whisper model on RunPod
- [ ] Create endpoint, test, record endpoint ID

### 1C: OCR Endpoint (PaddleOCR / EasyOCR)

- [ ] Worker handler for text extraction from images
- [ ] Download OCR model on RunPod
- [ ] Create endpoint, test, record endpoint ID

### 1D: Embeddings Endpoint (BGE / E5)

- [ ] Worker handler for text embedding generation
- [ ] Download embedding model on RunPod
- [ ] Create endpoint, test, record endpoint ID

### 1E: Document Chat / LLM Endpoint

- [ ] Worker handler for LLM inference (Llama or similar)
- [ ] Download LLM weights on RunPod (largest GPU allocation)
- [ ] Create endpoint, test, record endpoint ID

### 1F: Image Segmentation Endpoint (optional)

- [ ] Worker handler (SAM or similar)
- [ ] Download SAM model on RunPod
- [ ] Create endpoint, test, record endpoint ID

---

## Phase 2: Backend API Layer

Build a thin orchestration layer that proxies requests to RunPod endpoints.

### Option A: Next.js API Routes (simpler, recommended for MVP)

- [ ] Create `/lib/runpod-client.ts` — typed RunPod API client:
  ```ts
  const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;

  export async function runSync(endpointId: string, input: object) {
    const res = await fetch(`https://api.runpod.ai/v2/${endpointId}/runsync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, api_key: RUNPOD_API_KEY }),
    });
    return res.json();
  }

  export async function runAsync(endpointId: string, input: object) { ... }
  export async function pollStatus(endpointId: string, jobId: string) { ... }
  ```

- [ ] Create API routes:
  - `POST /api/image` — calls image generation endpoint
  - `POST /api/transcribe` — calls Whisper endpoint
  - `POST /api/ocr` — calls OCR endpoint
  - `POST /api/embed` — calls embeddings endpoint
  - `POST /api/chat` — calls LLM endpoint
  - `GET  /api/job/:id` — polls async job status

### Option B: FastAPI Backend (more flexibility)

- [ ] Set up FastAPI project with CORS
- [ ] Mirror the same routes as above
- [ ] Add Redis for caching repeated requests
- [ ] Add PostgreSQL with Prisma for job history (optional)

---

## Phase 3: Frontend — Demo Cards & UI

### 3A: Layout & Navigation

- [ ] Homepage with hero section: "AI Playground — Powered by RunPod"
- [ ] Grid of demo cards (responsive, Tailwind-styled)
- [ ] Each card: icon, title, short description, "Try it" button
- [ ] Dark mode support

### 3B: Image Generation Page

- [ ] Text input for prompt
- [ ] Model selector dropdown (FLUX, SDXL, Juggernaut)
- [ ] Generate button → loading spinner → display image
- [ ] Show metrics: latency, GPU type, VRAM used
- [ ] Support async job with polling + progress indicator

### 3C: Speech-to-Text Page

- [ ] Audio file upload (drag & drop)
- [ ] Real-time transcription display
- [ ] Show timestamps and confidence scores
- [ ] Support long audio with chunked processing

### 3D: OCR Page

- [ ] Image upload with preview
- [ ] Highlight detected text regions on image
- [ ] Extracted text output (copyable)
- [ ] Support multiple languages

### 3E: Embeddings Explorer Page

- [ ] Text input (single or batch)
- [ ] Visualize embeddings (dimensionality reduction → 2D scatter plot)
- [ ] Similarity search: enter two texts, show cosine similarity
- [ ] Use chart library (e.g., recharts, d3)

### 3F: Document Chat Page

- [ ] PDF upload
- [ ] OCR → chunking → embedding → vector store pipeline
- [ ] Chat interface to ask questions about the document
- [ ] Show source citations (which page/chunk)

### 3G: Image Segmentation Page (optional)

- [ ] Image upload
- [ ] Click-to-select regions
- [ ] Overlay segmentation masks

---

## Phase 4: Async Jobs & Real-Time Updates

- [ ] Implement async job submission (POST returns job ID immediately)
- [ ] Frontend polling or WebSocket for status updates
- [ ] Progress bar / status indicators (queued → running → complete)
- [ ] Job history page (if DB is set up)
- [ ] Error handling: timeout, failed jobs, retry logic

---

## Phase 5: Model Switching

- [ ] Build model registry config:
  ```ts
  const MODEL_MAP = {
    "flux": "runpod-endpoint-id-flux",
    "sdxl": "runpod-endpoint-id-sdxl",
    "juggernaut": "runpod-endpoint-id-juggernaut",
  };
  ```
- [ ] Frontend model selector per demo card
- [ ] Backend routes model to correct endpoint
- [ ] No frontend code change needed when swapping models

---

## Phase 6: Multi-Endpoint Pipelines

### 6A: Document QA Pipeline
```
Upload PDF → OCR Endpoint → Chunk Text → Embedding Endpoint → Vector Store → LLM Endpoint → Answer
```

### 6B: Audio Translation Pipeline
```
Upload Audio → Whisper Endpoint → Translation Endpoint → Text-to-Speech Endpoint → Play Audio
```

- [ ] Build pipeline orchestrator in backend
- [ ] Chain multiple RunPod endpoint calls sequentially
- [ ] Frontend shows pipeline progress (step-by-step indicators)

---

## Phase 7: Observability Dashboard

- [ ] Display per-endpoint metrics:
  - GPU type and VRAM usage
  - Inference latency (p50, p95, p99)
  - Cold start time
  - Queue wait time
  - Request count / error rate
- [ ] Fetch metrics from RunPod API
- [ ] Real-time charts (polling or WebSocket)
- [ ] Optional: integrate with RunPod's built-in monitoring

---

## Phase 8: Polish & Deploy

- [ ] Error boundaries and fallback UI
- [ ] Loading skeletons for all pages
- [ ] Mobile responsive design
- [ ] Rate limiting on API routes
- [ ] Environment variable management (dev vs prod)
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend (Vercel serverless or separate container)
- [ ] Custom domain + SSL
- [ ] README with setup instructions

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend | Next.js API Routes (or FastAPI) |
| Inference | RunPod Serverless Endpoints |
| Models | FLUX, Whisper, PaddleOCR, BGE, Llama |
| Async | RunPod async jobs + polling/WebSockets |
| Database | PostgreSQL + Prisma (optional) |
| Cache | Redis (optional) |
| Deployment | Vercel (frontend), RunPod (inference) |

---

## RunPod Skills

Install RunPod skills for development tooling:
```bash
npx skills add runpod/skills
```

Use RunPod skills for:
- Model downloading directly on RunPod (no Dockerfiles needed)
- Endpoint creation and management
- Worker testing and debugging
- GPU configuration and autoscaling

---

## Recommended Build Order

1. **Phase 0** — Scaffold project (30 min)
2. **Phase 1A** — Deploy image generation endpoint first (it's the most visual)
3. **Phase 2** — Build API layer for image gen
4. **Phase 3A + 3B** — Homepage + image gen page (visible demo fast)
5. **Phase 1B–1E** — Deploy remaining endpoints in parallel
6. **Phase 3C–3F** — Build remaining frontend pages
7. **Phase 4** — Add async jobs
8. **Phase 5** — Model switching
9. **Phase 6** — Pipelines
10. **Phase 7** — Observability
11. **Phase 8** — Polish and deploy

This order gets a working demo visible ASAP, then layers on complexity.
