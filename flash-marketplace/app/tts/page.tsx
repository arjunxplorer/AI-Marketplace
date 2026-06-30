"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TTSPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate speech");
      }

      const audioBase64 = data.output?.audio_base64 || data.audio_base64;

      if (audioBase64) {
        const url = `data:audio/wav;base64,${audioBase64}`;
        setAudioUrl(url);
      } else {
        throw new Error("No audio in response");
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
          <span className="text-lg tracking-tight font-medium">AI Playground</span>
        </Link>
        <span className="text-sm text-[#738273]">Text to Speech</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl text-center"
        >
          <h1 className="text-4xl md:text-5xl font-normal tracking-tight text-black mb-8">
            Text to Speech
          </h1>

          <div className="relative mb-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-[#F1F3F1] bg-[#FAFBF9] px-5 py-4 text-[15px] text-[#1C2E1E] placeholder-[#A0A8A0] focus:outline-none focus:border-[#1C2E1E] transition-colors resize-none"
              placeholder="Enter text to convert to speech..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
          </div>

          {/* Quick Texts */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {[
              "Hello, how are you?",
              "Welcome to AI Playground",
              "The weather is beautiful today",
              "Let me tell you a story",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setText(suggestion)}
                className="px-3 py-1.5 rounded-full border border-[#F1F3F1] text-xs text-[#738273] hover:text-[#1C2E1E] hover:border-[#1C2E1E] transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !text.trim()}
            className="w-full rounded-xl bg-[#1C2E1E] px-6 py-3.5 text-white font-medium hover:bg-[#2A3F2C] transition-colors disabled:opacity-30 disabled:cursor-not-allowed mb-8"
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
              "Generate Speech"
            )}
          </button>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 bg-red-50 border border-red-100 rounded-xl px-4 py-2"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#FAFBF9] border border-[#F1F3F1] rounded-2xl p-6"
            >
              <audio ref={audioRef} src={audioUrl} controls className="w-full mb-4" />
              <a
                href={audioUrl}
                download="speech.wav"
                className="text-sm text-[#4D6D47] hover:text-[#1C2E1E] transition-colors"
              >
                Download Audio
              </a>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
