# AI Playground

> A multi-model AI platform demonstrating RunPod's serverless infrastructure. Each AI capability runs as an independent endpoint, orchestrated through a thin backend, and exposed via a polished Next.js frontend.

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
   └───────┘ └───────┘ └───────┘ └───────┘ └───────┘
                         │
              ┌──────────▼──────────┐
              │   RunPod Serverless │
              └─────────────────────┘
```

## Features

| Feature | Model | Status |
|---------|-------|--------|
| Chat | Qwen 2.5 7B (vLLM) | ✅ Live |
| Image Generation | Stable Diffusion | ✅ Live |
| Text to Speech | TTS | ✅ Live |
| Speech to Text | Whisper | 🔜 |
| OCR | PaddleOCR | 🔜 |
| Embeddings | BGE | 🔜 |

## Quick Start

```bash
cd flash-marketplace
npm install
npm run dev
```


## Tech Stack

- **Frontend**: Next.js 16, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Inference**: RunPod Serverless (vLLM, Automatic1111, TTS)
- **Design**: Inter font, custom color system

## Project Structure

```
flash-marketplace/
├── app/              # Next.js app router
│   ├── api/          # API routes
│   ├── chat/         # Chat page
│   ├── image-gen/    # Image generation
│   ├── tts/          # Text to speech
│   └── ...
├── lib/              # Utilities
└── public/           # Static assets
```

## License

MIT
