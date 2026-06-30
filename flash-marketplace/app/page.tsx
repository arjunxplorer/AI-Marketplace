"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Custom typewriter hook
function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayed("");
    setDone(false);

    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          setDone(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

// Demo cards data
const demos = [
  {
    title: "Image Generation",
    description: "Generate stunning images from text prompts using Stable Diffusion.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    ),
    href: "/image-gen",
  },
  {
    title: "Chat with AI",
    description: "Have conversations with Llama 3.2 running on vLLM.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    href: "/chat",
  },
  {
    title: "Speech to Text",
    description: "Transcribe audio files using Whisper on RunPod.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    href: "/transcribe",
  },
  {
    title: "OCR",
    description: "Extract text from images with PaddleOCR.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    href: "/ocr",
  },
  {
    title: "Text to Speech",
    description: "Convert text to natural speech using TTS on RunPod.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
    ),
    href: "/tts",
  },
  {
    title: "Embeddings",
    description: "Generate and compare text embeddings with BGE.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
    href: "/embeddings",
  },
];

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { displayed, done } = useTypewriter("we'd love to\nhear from you!", 38, 600);

  // Video scrubbing on desktop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let prevX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return;

      const delta = e.clientX - prevX;
      prevX = e.clientX;

      const targetTime = video.currentTime + (delta / window.innerWidth) * 0.8 * video.duration;
      video.currentTime = Math.max(0, Math.min(targetTime, video.duration));
    };

    const handleSeeked = () => {
      // Smooth tracking frame to frame
    };

    window.addEventListener("mousemove", handleMouseMove);
    video.addEventListener("seeked", handleSeeked);

    // Mobile autoplay
    if (window.innerWidth < 1024) {
      video.autoplay = true;
      video.play().catch(() => {});
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, []);

  return (
    <div className="relative bg-white text-neutral-900 font-sans selection:bg-[#EAECE9] selection:text-[#1C2E1E] antialiased overflow-x-hidden flex flex-col lg:block lg:min-h-screen">
      {/* Background Video */}
      <div className="order-last lg:order-none relative lg:absolute lg:inset-0 lg:z-0 overflow-hidden pointer-events-none w-full aspect-square md:aspect-video lg:aspect-auto lg:h-full bg-neutral-50 lg:bg-transparent">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-right lg:object-right-bottom"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Interactive Navbar */}
      <header className="fixed top-0 inset-x-0 z-10 px-5 sm:px-8 py-4 sm:py-5 flex flex-row justify-between items-center bg-transparent">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-[21px] sm:text-[26px] tracking-tight text-black font-medium select-none">
            AI Marketplace
          </span>
          <span className="text-[25px] sm:text-[30px] text-black select-none tracking-[-0.02em] font-medium leading-none mb-1">
            ✦
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex text-[23px] text-black">
          <Link href="/chat" className="hover:opacity-60 transition-opacity">
            Chat
          </Link>
          <span className="opacity-40">,&nbsp;</span>
          <Link href="/image-gen" className="hover:opacity-60 transition-opacity">
            Image
          </Link>
          <span className="opacity-40">,&nbsp;</span>
          <Link href="/transcribe" className="hover:opacity-60 transition-opacity">
            Voice
          </Link>
          <span className="opacity-40">,&nbsp;</span>
          <Link href="/embeddings" className="hover:opacity-60 transition-opacity">
            Embed
          </Link>
        </div>

        {/* Desktop CTA */}
        <Link
          href="#demos"
          className="hidden md:block text-[23px] text-black underline underline-offset-2 hover:opacity-60 transition-opacity"
        >
          Explore Demos
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex flex-col gap-[5px]"
          aria-label="Toggle menu"
        >
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </button>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 z-[9] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-300 md:hidden ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col items-center gap-8 text-3xl text-black">
          <Link href="/chat" onClick={() => setIsMobileMenuOpen(false)}>
            Chat
          </Link>
          <Link href="/image-gen" onClick={() => setIsMobileMenuOpen(false)}>
            Image
          </Link>
          <Link href="/transcribe" onClick={() => setIsMobileMenuOpen(false)}>
            Voice
          </Link>
          <Link href="/embeddings" onClick={() => setIsMobileMenuOpen(false)}>
            Embed
          </Link>
          <Link href="/ocr" onClick={() => setIsMobileMenuOpen(false)}>
            OCR
          </Link>
        </nav>
      </div>

      {/* Content Layout */}
      <div className="relative z-10 flex flex-col order-first lg:order-none w-full bg-white lg:bg-transparent pb-8 lg:pb-0 lg:min-h-screen">
        <main className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
          {/* Typewriter Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-[76px] font-normal tracking-tight text-black leading-[1.08] mb-8 select-none w-full whitespace-pre-wrap">
              {displayed}
              {!done && (
                <span className="inline-block w-[2px] h-[1.1em] bg-black align-middle ml-[2px] animate-blink" />
              )}
            </h1>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-lg md:text-xl text-[#5A635A] leading-relaxed font-normal mb-14 max-w-2xl">
              Multi-model AI platform powered by RunPod serverless.
              <br />
              Try image generation, chat, transcription, and more.
            </p>
          </motion.div>

          {/* Service Pills - Model Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-2xl font-medium tracking-tight mb-2">
              What do you want to try?
            </p>
            <p className="opacity-85 text-[#738273] mb-8">
              Select a demo to explore
            </p>
          </motion.div>

          {/* Demo Cards Grid */}
          <motion.div
            id="demos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12"
          >
            {demos.map((demo, index) => (
              <Link
                key={demo.title}
                href={demo.href}
                className="group relative rounded-2xl border border-[#F1F3F1] bg-white p-6 hover:bg-[#F1F3F1]/55 hover:border-[#E0E2E0] transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="text-[#1C2E1E] group-hover:text-black transition-colors">
                    {demo.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[#1C2E1E] group-hover:text-black transition-colors">
                      {demo.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#738273]">
                      {demo.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium text-[#4D6D47] opacity-0 group-hover:opacity-100 transition-opacity">
                  Try it →
                </div>
              </Link>
            ))}
          </motion.div>

          {/* Status Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-[#FAFBF9] border border-[#F1F3F1] rounded-2xl p-6 max-w-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#738273] mb-1">Platform Status</p>
                <p className="text-lg font-medium text-[#1C2E1E]">
                  2 Endpoints Active
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-[#4D6D47]">All Systems Operational</span>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-8 text-center">
          <p className="text-sm text-[#738273]">
            Built with Next.js, Tailwind CSS, and RunPod Serverless
          </p>
        </footer>
      </div>
    </div>
  );
}
