# AI Marketplace

> Multi-model AI platform powered by RunPod serverless. Chat, generate images, convert text to speech, and more — each capability runs as an independent GPU endpoint.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-38bdf8?style=flat-square&logo=tailwindcss)
![RunPod](https://img.shields.io/badge/RunPod-Serverless-7c3aed?style=flat-square)

## Live Endpoints

| Feature | Model | Engine | Status |
|---------|-------|--------|--------|
| Chat | Qwen 2.5 7B | vLLM | ✅ |
| Image Generation | Stable Diffusion | Automatic1111 | ✅ |
| Text to Speech | TTS | RunPod | ✅ |
| OCR | PaddleOCR | — | 🔜 |
| Embeddings | BGE | — | 🔜 |

## Architecture

```
┌─────────────────────────────────────────────┐
│            Next.js Frontend                 │
│         (App Router + Tailwind)             │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│           API Routes (Proxy)                │
└─────┬─────────┬─────────┬─────────┬─────────┘
      │         │         │         │
      ▼         ▼         ▼         ▼
   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
   │vLLM │  │ SD  │  │ TTS │  │ ... │
   └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘
      └────────┴────────┴────────┘
                  │
        ┌─────────▼─────────┐
        │ RunPod Serverless │
        └───────────────────┘
```

## Quick Start

```bash
cd flash-marketplace
npm install
cp .env.example .env.local   # Add your RunPod API key
npm run dev
```


## Environment Variables

```bash
RUNPOD_API_KEY=rpk_xxxxxxxx
RUNPOD_VLLM_ENDPOINT_ID=your_vllm_id
RUNPOD_SD_ENDPOINT_ID=your_sd_id
RUNPOD_TTS_ENDPOINT_ID=your_tts_id
```

## Tech Stack

- **Frontend**: Next.js 16, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Inference**: RunPod Serverless (vLLM, Automatic1111, TTS)
- **Design**: Inter font, custom green color system

## Project Structure

```
flash-marketplace/
├── app/
│   ├── api/          # Proxy routes to RunPod
│   ├── chat/         # Chat UI
│   ├── image-gen/    # Image generation UI
│   ├── tts/          # Text-to-speech UI
│   └── page.tsx      # Homepage
├── lib/
│   ├── runpod-client.ts
│   └── endpoints.ts
└── workers/          # RunPod worker handlers
```

## License

MIT
