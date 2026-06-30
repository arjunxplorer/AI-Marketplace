"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TranscribePage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    text: string;
    language: string;
    segments: Array<{ start: number; end: number; text: string }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [language, setLanguage] = useState("auto");
  const [task, setTask] = useState("transcribe");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setResult(null);
      setError(null);
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          const bytes = new Uint8Array(arrayBuffer);
          let binary = "";
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          resolve(btoa(binary));
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(audioFile);
      });

      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio: base64,
          language: language === "auto" ? null : language,
          task,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to transcribe");
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
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
        <span className="text-sm text-[#738273]">Speech to Text</span>
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
            <div className="text-center mb-6">
              {result.language && (
                <span className="inline-block rounded-full bg-[#EAECE9] px-4 py-1 text-sm text-[#1C2E1E] mb-4">
                  {result.language}
                </span>
              )}
              <p className="text-[#1C2E1E] text-lg leading-relaxed">
                {result.text}
              </p>
            </div>

            {result.segments && result.segments.length > 0 && (
              <div className="bg-[#FAFBF9] border border-[#F1F3F1] rounded-2xl p-6 mb-6">
                <h3 className="text-sm font-medium text-[#738273] mb-3">Timestamps</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {result.segments.map((seg, i) => (
                    <div key={i} className="flex gap-3 text-sm bg-white rounded-lg p-2">
                      <span className="font-mono text-[#4D6D47] shrink-0 text-xs">
                        {formatTime(seg.start)}
                      </span>
                      <span className="text-[#1C2E1E]">{seg.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setResult(null);
                setAudioFile(null);
              }}
              className="w-full rounded-xl border border-[#F1F3F1] px-6 py-3 text-[#1C2E1E] text-sm font-medium hover:bg-[#FAFBF9] transition-colors"
            >
              Transcribe Another
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
              Transcribe Audio
            </h1>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-[#F1F3F1] p-12 mb-6 transition-colors hover:border-[#1C2E1E] hover:bg-[#FAFBF9]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {audioFile ? (
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 text-[#4D6D47]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                  <p className="text-[#1C2E1E] font-medium mb-1">{audioFile.name}</p>
                  <p className="text-sm text-[#738273]">
                    {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 text-[#738273]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-[#738273]">
                    Drop audio file or click to browse
                  </p>
                </div>
              )}
            </div>

            {/* Options Toggle */}
            <div className="mb-4">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="text-sm text-[#738273] hover:text-[#1C2E1E] transition-colors"
              >
                {showOptions ? "Hide" : "Show"} Options
              </button>
            </div>

            {showOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="grid grid-cols-2 gap-3 mb-4 text-left"
              >
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-lg border border-[#F1F3F1] bg-[#FAFBF9] px-3 py-2 text-sm text-[#1C2E1E] focus:outline-none focus:ring-1 focus:ring-[#4D6D47]"
                >
                  <option value="auto">Auto-detect</option>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
                <select
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  className="rounded-lg border border-[#F1F3F1] bg-[#FAFBF9] px-3 py-2 text-sm text-[#1C2E1E] focus:outline-none focus:ring-1 focus:ring-[#4D6D47]"
                >
                  <option value="transcribe">Transcribe</option>
                  <option value="translate">Translate to English</option>
                </select>
              </motion.div>
            )}

            <button
              onClick={handleTranscribe}
              disabled={loading || !audioFile}
              className="w-full rounded-xl bg-[#1C2E1E] px-6 py-3.5 text-white font-medium hover:bg-[#2A3F2C] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Transcribing...
                </span>
              ) : (
                "Transcribe"
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
