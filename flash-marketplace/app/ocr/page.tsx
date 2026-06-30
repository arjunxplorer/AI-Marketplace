"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function OCRPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    text: string;
    regions: Array<{
      text: string;
      confidence: number;
      bbox: number[][];
    }>;
    region_count: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setResult(null);
      setError(null);

      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleOCR = async () => {
    if (!imageFile) return;

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
        reader.readAsArrayBuffer(imageFile);
      });

      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to extract text");
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

  const copyToClipboard = () => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
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
        <span className="text-sm text-[#738273]">OCR</span>
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
              <div className="text-5xl font-bold text-[#1C2E1E] mb-2">
                {result.region_count}
              </div>
              <p className="text-[#738273]">Text regions detected</p>
            </div>

            <div className="bg-[#FAFBF9] border border-[#F1F3F1] rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[#738273]">Extracted Text</h3>
                <button
                  onClick={copyToClipboard}
                  className="text-xs text-[#4D6D47] hover:text-[#1C2E1E] transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="text-[#1C2E1E] text-[15px] leading-relaxed whitespace-pre-wrap">
                {result.text}
              </p>
            </div>

            {result.regions.length > 0 && (
              <div className="bg-[#FAFBF9] border border-[#F1F3F1] rounded-2xl p-6 mb-6">
                <h3 className="text-sm font-medium text-[#738273] mb-3">Details</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {result.regions.map((region, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-white rounded-lg p-2">
                      <span className="text-[#1C2E1E] truncate mr-2">{region.text}</span>
                      <span className="flex-shrink-0 text-xs text-[#738273]">
                        {(region.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setResult(null);
                setImageFile(null);
                setImagePreview(null);
              }}
              className="w-full rounded-xl border border-[#F1F3F1] px-6 py-3 text-[#1C2E1E] text-sm font-medium hover:bg-[#FAFBF9] transition-colors"
            >
              Extract Another
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
              Extract Text
            </h1>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-[#F1F3F1] p-12 mb-6 transition-colors hover:border-[#1C2E1E] hover:bg-[#FAFBF9]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mx-auto max-h-48 rounded-xl object-contain"
                />
              ) : (
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 text-[#738273]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                  <p className="text-[#738273]">
                    Drop an image or click to browse
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleOCR}
              disabled={loading || !imageFile}
              className="w-full rounded-xl bg-[#1C2E1E] px-6 py-3.5 text-white font-medium hover:bg-[#2A3F2C] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Extracting...
                </span>
              ) : (
                "Extract Text"
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
