"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant. Keep responses concise and conversational. You can use bullet points for lists but avoid heavy markdown like headers (###) or bold (**)."
  );
  const [maxTokens, setMaxTokens] = useState(500);
  const [temperature, setTemperature] = useState(0.7);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = [];
      if (systemPrompt) {
        apiMessages.push({ role: "system", content: systemPrompt });
      }
      apiMessages.push(...newMessages);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          max_tokens: maxTokens,
          temperature,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantResponse =
        data.output?.[0]?.choices?.[0]?.tokens?.[0] ||
        data.output?.choices?.[0]?.message?.content ||
        data.choices?.[0]?.message?.content ||
        data.output?.output ||
        data.response;

      if (assistantResponse) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: assistantResponse },
        ]);
      } else {
        throw new Error("No response from model");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-[#738273] hover:text-[#1C2E1E] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 right-6 z-20 bg-white border border-[#F1F3F1] rounded-2xl shadow-xl p-6 w-80"
          >
            <h3 className="text-sm font-medium text-[#1C2E1E] mb-4">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#738273] block mb-1">System Prompt</label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[#F1F3F1] bg-[#FAFBF9] px-3 py-2 text-sm text-[#1C2E1E] focus:outline-none focus:ring-1 focus:ring-[#4D6D47] resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#738273] block mb-1">
                  Max Tokens: {maxTokens}
                </label>
                <input
                  type="range"
                  min={100}
                  max={1024}
                  step={50}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-[#738273] block mb-1">
                  Temperature: {temperature}
                </label>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col pt-20 pb-4">
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-6">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-8 space-y-6">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <h1 className="text-4xl md:text-5xl font-normal tracking-tight text-black mb-4">
                  Chat with AI
                </h1>
                <p className="text-[#738273] text-lg mb-8">
                  Powered by Llama 3.2 on RunPod
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {[
                    "Explain quantum computing",
                    "Write a haiku about coding",
                    "How does WiFi work?",
                    "Give me a recipe for pasta",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                      }}
                      className="px-4 py-2 rounded-full border border-[#F1F3F1] text-sm text-[#738273] hover:text-[#1C2E1E] hover:border-[#1C2E1E] transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-[#1C2E1E] text-white rounded-2xl rounded-br-md px-5 py-3"
                        : "text-[#1C2E1E] px-1 py-1"
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </motion.div>
              ))
            )}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-2 px-1 py-1">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#738273] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-[#738273] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-[#738273] rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#F1F3F1] pt-4">
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-[#F1F3F1] bg-[#FAFBF9] px-4 py-3 text-[15px] text-[#1C2E1E] placeholder-[#A0A8A0] focus:outline-none focus:border-[#1C2E1E] transition-colors"
                placeholder="Ask anything... e.g. 'Explain quantum computing in simple terms'"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1C2E1E] text-white flex items-center justify-center hover:bg-[#2A3F2C] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
