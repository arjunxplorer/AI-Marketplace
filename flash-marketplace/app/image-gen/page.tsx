"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ImageGenPage() {
  const [prompt, setPrompt] = useState("A cinematic shot of a futuristic city at sunset, with flying cars and neon lights reflecting off glass buildings, ultra detailed, 8k");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [steps, setSteps] = useState(28);
  const [cfgScale, setCfgScale] = useState(7);
  const [metrics, setMetrics] = useState<{
    latency: number;
    steps: number;
    size: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setImage(null);
    setMetrics(null);

    const startTime = Date.now();

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          negative_prompt: negativePrompt,
          width,
          height,
          num_inference_steps: steps,
          guidance_scale: cfgScale,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      const imageBase64 =
        data.output?.images?.[0] ||
        data.images?.[0] ||
        data.output?.image;

      if (imageBase64) {
        setImage(`data:image/png;base64,${imageBase64}`);
        setMetrics({
          latency: Date.now() - startTime,
          steps,
          size: `${width}x${height}`,
        });
      } else {
        throw new Error("No image in response");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal Header */}
      <header className="fixed top-0 inset-x-0 z-10 px-6 py-5 flex justify-between items-center bg-white/80 backdrop-blur-xl">
        <Link
          href="/"
          className="flex items-center gap-3 text-black hover:opacity-60 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="text-lg tracking-tight font-medium">AI Marketplace</span>
        </Link>
        <span className="text-sm text-[#738273]">Image Generation</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-8">
        {image ? (
          /* Result View */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
          >
            <div className="mb-6">
              <img
                src={image}
                alt="Generated"
                className="w-full rounded-2xl shadow-lg"
              />
            </div>

            {metrics && (
              <div className="flex items-center justify-center gap-6 mb-6">
                <span className="text-sm text-[#738273]">
                  {(metrics.latency / 1000).toFixed(1)}s
                </span>
                <span className="text-[#EAECE9]">·</span>
                <span className="text-sm text-[#738273]">
                  {metrics.steps} steps
                </span>
                <span className="text-[#EAECE9]">·</span>
                <span className="text-sm text-[#738273]">
                  {metrics.size}
                </span>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setImage(null);
                  setMetrics(null);
                }}
                className="px-6 py-2.5 rounded-xl border border-[#F1F3F1] text-[#1C2E1E] text-sm font-medium hover:bg-[#FAFBF9] transition-colors"
              >
                New Image
              </button>
              <a
                href={image}
                download="generated-image.png"
                className="px-6 py-2.5 rounded-xl bg-[#1C2E1E] text-white text-sm font-medium hover:bg-[#2A3F2C] transition-colors"
              >
                Download
              </a>
            </div>
          </motion.div>
        ) : (
          /* Input View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-xl text-center"
          >
            <h1 className="text-4xl md:text-5xl font-normal tracking-tight text-black mb-8">
              Generate Image
            </h1>

            <div className="relative mb-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-[#F1F3F1] bg-[#FAFBF9] px-5 py-4 text-[15px] text-[#1C2E1E] placeholder-[#A0A8A0] focus:outline-none focus:border-[#1C2E1E] transition-colors resize-none"
                placeholder="Describe the image you want to create..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {[
                "A cat astronaut in space",
                "Cyberpunk Tokyo street",
                "Watercolor mountain lake",
                "Steampunk robot reading",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  className="px-3 py-1.5 rounded-full border border-[#F1F3F1] text-xs text-[#738273] hover:text-[#1C2E1E] hover:border-[#1C2E1E] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Advanced Settings Toggle */}
            <div className="mb-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-[#738273] hover:text-[#1C2E1E] transition-colors flex items-center gap-1 mx-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
                Advanced Settings
              </button>
            </div>

            {/* Advanced Settings Panel */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="bg-[#FAFBF9] border border-[#F1F3F1] rounded-2xl p-6 text-left">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-xs text-[#738273] block mb-1">Width</label>
                        <select
                          value={width}
                          onChange={(e) => setWidth(Number(e.target.value))}
                          className="w-full rounded-lg border border-[#F1F3F1] bg-white px-3 py-2 text-sm text-[#1C2E1E] focus:outline-none focus:ring-1 focus:ring-[#4D6D47]"
                        >
                          <option value={256}>256</option>
                          <option value={384}>384</option>
                          <option value={512}>512</option>
                          <option value={768}>768</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-[#738273] block mb-1">Height</label>
                        <select
                          value={height}
                          onChange={(e) => setHeight(Number(e.target.value))}
                          className="w-full rounded-lg border border-[#F1F3F1] bg-white px-3 py-2 text-sm text-[#1C2E1E] focus:outline-none focus:ring-1 focus:ring-[#4D6D47]"
                        >
                          <option value={256}>256</option>
                          <option value={384}>384</option>
                          <option value={512}>512</option>
                          <option value={768}>768</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="text-xs text-[#738273] block mb-1">
                        Steps: {steps}
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={50}
                        value={steps}
                        onChange={(e) => setSteps(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#738273] block mb-1">
                        CFG Scale: {cfgScale}
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={20}
                        step={0.5}
                        value={cfgScale}
                        onChange={(e) => setCfgScale(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full rounded-xl bg-[#1C2E1E] px-6 py-3.5 text-white font-medium hover:bg-[#2A3F2C] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate"
              )}
            </button>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-2"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
