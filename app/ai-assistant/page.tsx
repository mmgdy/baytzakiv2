"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Brain, Send, X, ChevronRight, Zap, ShoppingCart, Check } from "lucide-react";
import { PRODUCTS, formatPrice } from "@/lib/store-products";
import { useCart } from "@/lib/cart-context";

type Message = {
  role: "user" | "assistant";
  content: string;
  provider?: string;
  products?: typeof PRODUCTS;
};

const SUGGESTIONS = [
  "I want to make my apartment fully smart for under 10,000 EGP",
  "What's the best video intercom for a villa?",
  "Explain the difference between Zigbee and WiFi switches",
  "Piano staircase LED lighting for 15 steps",
  "Smart lock with face recognition for Egyptian doors",
  "Best outdoor cameras for a compound villa",
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: `أهلاً! 👋 I'm **ARIA** — Baytzaki's AI smart home expert.\n\nI can help you:\n- Find the perfect smart home products for your budget\n- Compare brands (SONOFF, Govee, Fibaro, LEZN, and more)\n- Explain WiFi vs Zigbee vs Z-Wave\n- Design a complete smart home setup\n- Recommend Arabic installation videos\n\nWhat are you trying to do with your home? 🏠`,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState("Claude");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addItem, isInCart } = useCart();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      let full = "";
      let prov = "Claude";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "text") {
                full += data.text;
                setMessages(prev => {
                  const msgs = [...prev];
                  msgs[msgs.length - 1] = { role: "assistant", content: full };
                  return msgs;
                });
              }
              if (data.type === "provider") prov = data.provider;
            } catch {}
          }
        }
      }
      setProvider(prov);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, ARIA is temporarily unavailable. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  function renderContent(content: string) {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  }

  return (
    <div className="pt-[88px] min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-border-subtle bg-navy/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-plasma/10 border border-plasma/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-plasma" />
            </div>
            <div>
              <h1 className="font-display font-bold">ARIA — AI Smart Home Expert</h1>
              <p className="text-text-muted text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-aurora status-pulse" />
                {provider} · Online
              </p>
            </div>
          </div>
          <Link href="/products" className="flex items-center gap-1.5 border border-border-subtle text-text-secondary hover:text-electric hover:border-electric/30 text-sm px-4 py-2 rounded-xl transition-all">
            <ShoppingCart className="w-4 h-4" /> Shop
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 ${
                msg.role === "assistant" ? "bg-plasma/10 border border-plasma/30" : "bg-electric/10 border border-electric/20"
              }`}>
                {msg.role === "assistant" ? <Brain className="w-4 h-4 text-plasma" /> : <span className="text-xs font-bold text-electric">ME</span>}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "assistant"
                  ? "glass-card border border-border-subtle"
                  : "bg-electric/10 border border-electric/20 text-electric"
              }`}>
                {msg.role === "assistant"
                  ? <span dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                  : msg.content}
                {loading && i === messages.length - 1 && !msg.content && (
                  <span className="flex gap-1 mt-1">
                    <span className="w-1.5 h-1.5 bg-plasma rounded-full dot-1" />
                    <span className="w-1.5 h-1.5 bg-plasma rounded-full dot-2" />
                    <span className="w-1.5 h-1.5 bg-plasma rounded-full dot-3" />
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Product suggestions (quick add) */}
          {messages.length === 1 && (
            <div className="ml-11">
              <p className="text-text-muted text-xs font-mono mb-3">// Quick questions:</p>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="text-left text-sm border border-border-subtle hover:border-electric/30 hover:text-electric text-text-secondary px-4 py-2.5 rounded-xl transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border-subtle bg-navy/80 backdrop-blur-xl sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask ARIA about smart home products... (English or Arabic)"
              className="flex-1 glass-card border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-plasma/50 transition-colors"
              disabled={loading}
            />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              className="bg-plasma text-white font-bold px-5 rounded-xl hover:shadow-plasma transition-all disabled:opacity-40 flex items-center gap-2">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-text-muted text-xs mt-2 text-center font-mono">
            ARIA uses OpenAI GPT-4o · Responses are suggestions only
          </p>
        </div>
      </div>
    </div>
  );
}
