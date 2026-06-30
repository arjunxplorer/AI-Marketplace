# AI Playground

> A multi-model AI platform demonstrating RunPod's serverless infrastructure. Each AI capability runs as an independent endpoint, orchestrated through a thin backend, and exposed via a polished Next.js frontend.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-3.0-38bdf8?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/RunPod-Serverless-7c3aed?style=flat-square" />
  <img src="https://img.shields.io/badge/vLLM-2.22-green?style=flat-square" />
</p>

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Frontend                       │
│               (App Router + Tailwind CSS)                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                     API Routes Layer                        │
│              (Thin orchestration proxy)                      │
└──────┬──────────┬──────────┬──────────┬──────────┬──────────┘
       │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼
   ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
   │ vLLM  │ │  SD   │ │  TTS  │ │  OCR  │ │ Embed │
   │ Llama │ │Auto1111│ │       │ │Paddle │ │ BGE   │
   └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘
       │         │         │         │         │
       └─────────┴─────────┴─────────┴─────────┘
                         │
              ┌──────────▼──────────┐
              │   RunPod Serverless │
              │   GPU Workers       │
              └─────────────────────┘
```

## Features

| Feature | Model | Endpoint | Status |
|---------|-------|----------|--------|
| **Chat** | Qwen 2.5 7B (vLLM) | `b90biyvlta1vok` | ✅ Live |
| **Image Generation** | Stable Diffusion (A1111) | `ga09ntffdqf7bo` | ✅ Live |
| **Text to Speech** | TTS | `cp1b4y98mj8cms` | ✅ Live |
| **Speech to Text** | Whisper | — | 🔜 |
| **OCR** | PaddleOCR | — | 🔜 |
| **Embeddings** | BGE | — | 🔜 |

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Homepage | `/` | Hero section with typewriter animation, demo cards |
| Chat | `/chat` | Conversational AI with Llama via vLLM |
| Image Gen | `/image-gen` | Text-to-image with Stable Diffusion |
| Text to Speech | `/tts` | Convert text to natural speech |
| OCR | `/ocr` | Extract text from images |
| Embeddings | `/embeddings` | Compare text similarity |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React, Tailwind CSS |
| Animations | Framer Motion |
| Typography | Inter (Google Fonts) |
| Backend | Next.js API Routes |
| Inference | RunPod Serverless |
| LLM Engine | vLLM |
| Image Gen | Automatic1111 Stable Diffusion |

## Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd flash-marketplace

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Add your RunPod API key and endpoint IDs

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```bash
# Required
RUNPOD_API_KEY=rpk_xxxxxxxx

# Endpoint IDs
RUNPOD_VLLM_ENDPOINT_ID=b90biyvlta1vok
RUNPOD_SD_ENDPOINT_ID=ga09ntffdqf7bo
RUNPOD_TTS_ENDPOINT_ID=cp1b4y98mj8cms
```

## Project Structure

```
flash-marketplace/
├── app/
│   ├── api/              # API routes (proxy to RunPod)
│   │   ├── chat/         # vLLM chat endpoint
│   │   ├── image/        # SD image generation
│   │   ├── tts/          # Text-to-speech
│   │   ├── ocr/          # OCR extraction
│   │   └── embed/        # Text embeddings
│   ├── chat/             # Chat page
│   ├── image-gen/        # Image generation page
│   ├── tts/              # Text-to-speech page
│   ├── ocr/              # OCR page
│   ├── embeddings/       # Embeddings page
│   ├── layout.tsx        # Root layout (Inter font)
│   ├── page.tsx          # Homepage
│   └── globals.css       # Global styles + animations
├── lib/
│   ├── runpod-client.ts  # RunPod API client
│   └── endpoints.ts      # Endpoint configuration
└── public/               # Static assets
```

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#1C2E1E` | Text, buttons |
| Accent | `#4D6D47` | Links, highlights |
| Secondary | `#738273` | Labels, placeholders |
| Surface | `#FAFBF9` | Card backgrounds |
| Border | `#F1F3F1` | Borders, dividers |

## API Reference

### Chat
```bash
POST /api/chat
{
  "messages": [{"role": "user", "content": "Hello"}],
  "max_tokens": 300,
  "temperature": 0.7
}
```

### Image Generation
```bash
POST /api/image
{
  "prompt": "A cat in space",
  "width": 512,
  "height": 512,
  "steps": 28
}
```

### Text to Speech
```bash
POST /api/tts
{
  "text": "Hello, how are you?"
}
```

## Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy
```

## License

MIT
