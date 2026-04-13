"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Zap, ChevronRight, Star, Shield, Truck, RotateCcw,
  Play, Brain, ShoppingCart, ArrowRight, Check, Wifi
} from "lucide-react";
import { getFeaturedProducts, CATEGORIES, formatPrice } from "@/lib/store-products";
import { useCart } from "@/lib/cart-context";

const BRANDS = [
  "SONOFF","TP-Link Tapo","EZVIZ","Govee","Fibaro",
  "HDL","LEZN","Aqara","Hikvision","Commax","Tuya","Shelly"
];

const STATS = [
  { value: "69+", label: "Smart Products" },
  { value: "12+", label: "Top Brands" },
  { value: "15+", label: "Categories" },
  { value: "5★", label: "Customer Rating" },
];

const WHY = [
  { icon: "⚡", title: "Real EGP Prices", desc: "No hidden fees. All prices in Egyptian Pounds, VAT included." },
  { icon: "🚚", title: "Ships All Egypt", desc: "Cairo, Alex, Delta, Upper Egypt — free delivery over EGP 1,000." },
  { icon: "🎥", title: "Arabic Tutorials", desc: "Every product has an Egyptian Arabic installation video guide." },
  { icon: "🤖", title: "AI Product Finder", desc: "ARIA AI helps you build your perfect smart home setup." },
  { icon: "🛡️", title: "Official Warranty", desc: "All products come with manufacturer warranty and support." },
  { icon: "💳", title: "Cash on Delivery", desc: "Pay when you receive. No online payment required." },
];

function ProductCard({ product }: { product: ReturnType<typeof getFeaturedProducts>[number] }) {
  const { addItem, isInCart } = useCart();
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const inCart = isInCart(product.id);
  const imgSrc = imgError || !product.images?.[0]?.src
    ? `https://placehold.co/400x400/0F1A2E/00D4FF?text=${encodeURIComponent(product.brand)}&font=montserrat`
    : product.images[0].src;

  return (
    <Link href={`/products/${product.id}`}
      className="glass-card rounded-2xl border border-border-subtle hover:border-electric/30 transition-all duration-300 group hover:-translate-y-1 overflow-hidden flex flex-col"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
      <div className="relative h-48 bg-navy-light overflow-hidden">
        <img src={imgSrc} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgError(true)} />
        {product.badge && (
          <span className="absolute top-3 left-3 text-xs font-mono bg-electric/20 text-electric border border-electric/30 px-2 py-0.5 rounded-full">
            {product.badge}
          </span>
        )}
        {product.isNew && (
          <span className="absolute top-3 right-3 text-xs font-mono bg-ember text-white px-2 py-0.5 rounded-full">NEW</span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-electric text-xs font-mono mb-0.5">{product.brand}</p>
        <h3 className="font-display font-bold text-sm leading-snug line-clamp-2 mb-2">{product.name}</h3>
        <p className="text-text-secondary text-xs line-clamp-2 flex-1 mb-3">{product.shortDesc}</p>
        <div className="flex items-center gap-1 mb-3">
          <span className="text-amber-400 text-xs">{"★".repeat(Math.floor(product.rating))}</span>
          <span className="text-text-muted text-xs">({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-subtle">
          <p className="font-display font-extrabold text-electric text-lg">{formatPrice(product.priceEGP)}</p>
          <button
            onClick={e => { e.preventDefault(); addItem(product, 1); setAdded(true); setTimeout(() => setAdded(false), 1500); }}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl transition-all ${
              added || inCart ? "bg-aurora/10 border border-aurora/30 text-aurora" : "bg-electric text-midnight hover:shadow-electric"
            }`}>
            {added || inCart ? <><Check className="w-3.5 h-3.5" />Added</> : <><ShoppingCart className="w-3.5 h-3.5" />Add</>}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const featured = getFeaturedProducts().slice(0, 8);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="pt-[88px]">

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-electric/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-plasma/5 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="font-mono text-electric text-sm mb-4 tracking-wider">
            // Egypt Smart Home Store · بيت زكي للمنازل الذكية
          </p>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-none mb-6">
            Make Your Home<br />
            <span className="gradient-text">Smart Today</span>
          </h1>
          <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Egypt's largest smart home store. SONOFF, Govee, LEZN, Fibaro, HDL & more.
            Real EGP prices · Cash on Delivery · Ships nationwide · Arabic support.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-14">
            <Link href="/products"
              className="flex items-center gap-2 bg-electric text-midnight font-display font-bold px-8 py-4 rounded-2xl hover:shadow-electric transition-all hover:-translate-y-0.5 text-base">
              Shop Now <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/ai-assistant"
              className="flex items-center gap-2 border border-electric/30 text-electric px-8 py-4 rounded-2xl hover:bg-electric/10 transition-all text-base">
              <Brain className="w-5 h-5" /> Ask ARIA AI
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map(({ value, label }) => (
              <div key={label} className="glass-card border border-border-subtle rounded-2xl p-4">
                <p className="font-display font-extrabold text-3xl text-electric">{value}</p>
                <p className="text-text-muted text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRANDS TICKER ── */}
      <div className="border-y border-border-subtle bg-navy/50 overflow-hidden py-4">
        <div className="flex gap-8 items-center" style={{
          width: "max-content",
          transform: `translateX(-${(tick % BRANDS.length) * (100 / BRANDS.length)}%)`,
          transition: "transform 0.5s ease"
        }}>
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span key={i} className="font-mono text-sm text-text-muted whitespace-nowrap px-6 py-1 border border-border-subtle rounded-full">
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-mono text-electric text-sm mb-2">// Top Picks</p>
              <h2 className="font-display text-4xl font-extrabold">Featured Products</h2>
            </div>
            <Link href="/products" className="flex items-center gap-1 text-electric text-sm hover:gap-2 transition-all">
              View all {"->"} 
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-16 bg-navy/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="font-mono text-electric text-sm mb-2">// Browse by Category</p>
            <h2 className="font-display text-4xl font-extrabold">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CATEGORIES.slice(0, 10).map(cat => (
              <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}`}
                className="glass-card border border-border-subtle hover:border-electric/30 rounded-2xl p-4 text-center group transition-all hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-xl bg-electric/10 border border-electric/20 flex items-center justify-center mx-auto mb-2 group-hover:bg-electric/20 transition-all">
                  <Wifi className="w-5 h-5 text-electric" />
                </div>
                <p className="text-xs font-medium leading-tight">{cat}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY BAYTZAKI ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="font-mono text-electric text-sm mb-2">// Why Choose Us</p>
            <h2 className="font-display text-4xl font-extrabold">Why Baytzaki?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY.map(({ icon, title, desc }) => (
              <div key={title} className="glass-card border border-border-subtle rounded-2xl p-6 hover:border-electric/20 transition-all">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-display font-bold text-base mb-2">{title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOOK VIDEO PROMO ── */}
      <section className="py-16 bg-navy/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-mono text-electric text-sm mb-3">// Arabic Installation Guides</p>
          <h2 className="font-display text-3xl font-extrabold mb-4">
            فيديوهات تركيب بالعربي لكل منتج
          </h2>
          <p className="text-text-secondary mb-8 max-w-xl mx-auto">
            Every product comes with a step-by-step Arabic installation tutorial.
            No electrician needed for most products — install it yourself in minutes.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {["Smart Switches","Smart Cameras","Smart Locks","Staircase Lighting","Video Intercom"].map(c => (
              <Link key={c} href={`/products?category=${encodeURIComponent(c)}`}
                className="flex items-center gap-1.5 border border-electric/20 text-electric text-sm px-4 py-2 rounded-full hover:bg-electric/10 transition-all">
                <Play className="w-3.5 h-3.5" /> {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-5xl font-extrabold mb-4">
            Ready to go <span className="gradient-text">Smart?</span>
          </h2>
          <p className="text-text-secondary text-lg mb-8">
            Talk to ARIA — our AI assistant that recommends the perfect smart home setup for your budget and home.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/ai-assistant"
              className="flex items-center gap-2 bg-plasma text-white font-display font-bold px-8 py-4 rounded-2xl hover:shadow-plasma transition-all">
              <Brain className="w-5 h-5" /> Chat with ARIA AI
            </Link>
            <Link href="/products"
              className="flex items-center gap-2 bg-electric text-midnight font-display font-bold px-8 py-4 rounded-2xl hover:shadow-electric transition-all">
              <ShoppingCart className="w-5 h-5" /> Browse All Products
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-text-muted font-mono">
            {["✓ 69+ Smart Products","✓ Cash on Delivery","✓ Free Delivery over 1,000 EGP","✓ Official Warranty"].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
