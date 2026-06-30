"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function EmbeddingsPage() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    embeddings: number[][];
    dimensions: number;
    similarities?: Array<{
      text_a: string;
      text_b: string;
      similarity: number;
    }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!textA.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: [textA],
          compare_texts: textB.trim() ? [textB] : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate embeddings");
      }

      if (data.output?.status === "success") {
        setResult(data.output);
      } else {
        throw new Error(data.output?.error || "Unknown error");
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
        <span className="text-sm text-[#738273]">Embeddings</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-8">
        {result ? (
          /* Result View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-xl"
          >
            {/* Similarity Score */}
            {result.similarities && result.similarities.length > 0 && (
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-[#1C2E1E] mb-2">
                  {(result.similarities[0].similarity * 100).toFixed(1)}%
                </div>
                <p className="text-[#738273]">Cosine Similarity</p>
                <div className="mt-4 h-2 w-full max-w-xs mx-auto overflow-hidden rounded-full bg-[#EAECE9]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.similarities[0].similarity * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`h-full rounded-full ${
                      result.similarities[0].similarity > 0.8
                        ? "bg-green-500"
                        : result.similarities[0].similarity > 0.5
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Details */}
            <div className="bg-[#FAFBF9] border border-[#F1F3F1] rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#1C2E1E]">{result.dimensions}</p>
                  <p className="text-xs text-[#738273]">Dimensions</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#1C2E1E]">{result.embeddings.length}</p>
                  <p className="text-xs text-[#738273]">Vectors</p>
                </div>
              </div>
              {result.embeddings[0] && (
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {result.embeddings[0].slice(0, 8).map((val, i) => (
                    <span
                      key={i}
                      className="rounded bg-white border border-[#F1F3F1] px-2 py-1 font-mono text-[11px] text-[#738273]"
                    >
                      {val.toFixed(3)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setResult(null);
                setTextA("");
                setTextB("");
              }}
              className="w-full rounded-xl border border-[#F1F3F1] px-6 py-3 text-[#1C2E1E] text-sm font-medium hover:bg-[#FAFBF9] transition-colors"
            >
              Compare New Texts
            </button>
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
              Compare Texts
            </h1>

            <div className="space-y-4 mb-6 text-left">
              <textarea
                value={textA}
                onChange={(e) => setTextA(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-[#F1F3F1] bg-[#FAFBF9] px-5 py-4 text-[15px] text-[#1C2E1E] placeholder-[#A0A8A0] focus:outline-none focus:border-[#1C2E1E] transition-colors resize-none"
                placeholder="First text..."
              />
              <textarea
                value={textB}
                onChange={(e) => setTextB(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-[#F1F3F1] bg-[#FAFBF9] px-5 py-4 text-[15px] text-[#1C2E1E] placeholder-[#A0A8A0] focus:outline-none focus:border-[#1C2E1E] transition-colors resize-none"
                placeholder="Second text to compare..."
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !textA.trim()}
              className="w-full rounded-xl bg-[#1C2E1E] px-6 py-3.5 text-white font-medium hover:bg-[#2A3F2C] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Computing...
                </span>
              ) : (
                "Compare"
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
