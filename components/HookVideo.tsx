"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { X, ChevronRight, Volume2, VolumeX, Play, Zap } from "lucide-react";

const HOOK_KEY = "baytzaki_hook_seen_v1";
const HOOK_CONFIG_KEY = "baytzaki_hook_config";

type HookConfig = {
  enabled: boolean;
  videoType: "youtube" | "direct" | "none";
  videoUrl: string;
  headline: string;
  headlineAr: string;
  subtext: string;
  ctaText: string;
  ctaLink: string;
  showOnEveryVisit: boolean;
  autoplay: boolean;
  delay: number; // seconds before showing
};

const DEFAULT_HOOK: HookConfig = {
  enabled: true,
  videoType: "youtube",
  videoUrl: "https://www.youtube.com/watch?v=kCzSyNrNYig",
  headline: "Welcome to Baytzaki",
  headlineAr: "أهلاً بيك في بيت زكي",
  subtext: "Egypt's smartest home products — SONOFF, Govee, LEZN, Fibaro and more. Real EGP prices. Ships nationwide.",
  ctaText: "Shop Now",
  ctaLink: "/products",
  showOnEveryVisit: false,
  autoplay: true,
  delay: 1,
};

function getYTId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

export function loadHookConfig(): HookConfig {
  if (typeof window === "undefined") return DEFAULT_HOOK;
  try {
    const stored = localStorage.getItem(HOOK_CONFIG_KEY);
    return stored ? { ...DEFAULT_HOOK, ...JSON.parse(stored) } : DEFAULT_HOOK;
  } catch { return DEFAULT_HOOK; }
}

export function saveHookConfig(config: HookConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HOOK_CONFIG_KEY, JSON.stringify(config));
}

export default function HookVideo() {
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(true);
  const [config, setConfig] = useState<HookConfig>(DEFAULT_HOOK);
  const [playing, setPlaying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const cfg = loadHookConfig();
    setConfig(cfg);

    if (!cfg.enabled || cfg.videoType === "none") return;

    const alreadySeen = !cfg.showOnEveryVisit && sessionStorage.getItem(HOOK_KEY) === "1";
    if (alreadySeen) return;

    const t = setTimeout(() => {
      setVisible(true);
      setPlaying(true);
      sessionStorage.setItem(HOOK_KEY, "1");
    }, cfg.delay * 1000);

    return () => clearTimeout(t);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    if (videoRef.current) videoRef.current.pause();
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // ESC to close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [close]);

  if (!visible) return null;

  const ytId = config.videoType === "youtube" ? getYTId(config.videoUrl) : null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-midnight/95 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 animate-in fade-in zoom-in duration-500">
        {/* Close button */}
        <button
          onClick={close}
          className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-navy border border-border-subtle flex items-center justify-center text-text-muted hover:text-white hover:border-electric/40 transition-all shadow-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="glass-card rounded-2xl border border-electric/20 overflow-hidden shadow-[0_0_80px_rgba(0,212,255,0.1)]">
          {/* Video area */}
          <div className="relative bg-midnight">
            {config.videoType === "youtube" && ytId ? (
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=${config.autoplay ? 1 : 0}&mute=1&rel=0&modestbranding=1&controls=1&showinfo=0`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={config.headline}
                />
              </div>
            ) : config.videoType === "direct" && config.videoUrl ? (
              <div className="relative aspect-video w-full bg-midnight">
                <video
                  ref={videoRef}
                  src={config.videoUrl}
                  className="w-full h-full object-cover"
                  autoPlay={config.autoplay}
                  muted={muted}
                  playsInline
                  loop={false}
                  onEnded={close}
                />
                {/* Video controls overlay */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={() => { setMuted(!muted); if (videoRef.current) videoRef.current.muted = !muted; }}
                    className="w-9 h-9 rounded-full bg-midnight/70 border border-white/20 flex items-center justify-center text-white hover:bg-midnight transition-all"
                  >
                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              /* Fallback — animated hero if no video */
              <div className="relative aspect-video w-full bg-midnight overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-electric/10 blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-plasma/10 blur-3xl" />
                <div className="relative text-center px-8">
                  <div className="w-20 h-20 rounded-2xl bg-electric/10 border border-electric/30 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-10 h-10 text-electric" />
                  </div>
                  <p className="font-display text-5xl font-extrabold gradient-text mb-2">BAYTZAKI</p>
                  <p className="text-text-secondary text-lg">بيت زكي</p>
                </div>
              </div>
            )}

            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-navy to-transparent pointer-events-none" />
          </div>

          {/* Content footer */}
          <div className="px-8 py-6 bg-navy">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {/* Arabic headline */}
                <p className="font-display text-xl font-extrabold text-electric mb-0.5" dir="rtl">
                  {config.headlineAr}
                </p>
                <p className="font-display text-lg font-bold text-white">
                  {config.headline}
                </p>
                <p className="text-text-secondary text-sm mt-1 max-w-lg">
                  {config.subtext}
                </p>
              </div>

              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={close}
                  className="border border-border-subtle text-text-secondary px-5 py-2.5 rounded-xl hover:border-electric/40 hover:text-electric transition-all text-sm"
                >
                  Skip
                </button>
                <Link
                  href={config.ctaLink}
                  onClick={close}
                  className="flex items-center gap-2 bg-electric text-midnight font-display font-bold px-6 py-2.5 rounded-xl hover:shadow-electric transition-all text-sm"
                >
                  {config.ctaText}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Trust bar */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border-subtle text-xs text-text-muted font-mono">
              <span>✓ SONOFF Official</span>
              <span>✓ Cash on Delivery</span>
              <span>✓ توصيل لكل مصر</span>
              <span>✓ ضمان على جميع المنتجات</span>
              <span className="ml-auto flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-electric status-pulse" />
                ARIA AI Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
