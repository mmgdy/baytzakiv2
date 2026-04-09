"use client";
import { useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Search, Brain, Upload, Download, X, Check, AlertCircle,
  Grid, List, ShoppingCart, Plus, Eye, SlidersHorizontal, Zap, Package
} from "lucide-react";
import { PRODUCTS, CATEGORIES, BRANDS, getBadgeStyle, formatPrice, type Product } from "@/lib/store-products";
import { useCart } from "@/lib/cart-context";

type SortKey = "featured" | "price-asc" | "price-desc" | "newest" | "name" | "rating";
type ViewMode = "grid" | "list";

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under EGP 1,000", min: 0, max: 999 },
  { label: "EGP 1,000–5,000", min: 1000, max: 5000 },
  { label: "EGP 5,000–15,000", min: 5001, max: 15000 },
  { label: "Over EGP 15,000", min: 15001, max: Infinity },
];
const PROTOCOLS = ["All", "WiFi", "Zigbee", "Z-Wave", "Matter", "Bluetooth", "Wired/PoE", "HDL Bus"];

// ── Toast ──────────────────────────────────────────────────────
function Toast({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] message-in flex items-center gap-3 bg-navy border border-aurora/40 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl">
      <div className="w-7 h-7 rounded-full bg-aurora/20 flex items-center justify-center">
        <Check className="w-4 h-4 text-aurora" />
      </div>
      <div>
        <p className="text-white text-sm font-medium">Added to cart!</p>
        <p className="text-text-muted text-xs truncate max-w-[180px]">{name}</p>
      </div>
      <Link href="/cart" onClick={onClose} className="text-aurora text-xs font-mono hover:underline whitespace-nowrap">
        View Cart →
      </Link>
    </div>
  );
}

// ── Import Modal ───────────────────────────────────────────────
function ImportModal({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const template = `id,sku,name,brand,category,shortDesc,priceEGP,inStock,stockQty,rating,reviewCount,installation,warranty\n"prod-001","SKU-001","Smart Switch Pro","SONOFF","Smart Switches","A great switch",1200,true,50,4.5,120,"Electrician","1 Year"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-sm">
      <div className="glass-card rounded-2xl border border-electric/30 w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-electric/10 border border-electric/20 flex items-center justify-center">
              <Upload className="w-5 h-5 text-electric" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">Import Products</h2>
              <p className="text-text-muted text-xs">Bulk-add products via CSV</p>
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-text-muted hover:text-white" /></button>
        </div>

        <div className="bg-navy-light rounded-xl p-3 border border-border-subtle mb-4 font-mono text-xs text-text-muted">
          Required: id, sku, name, brand, category, shortDesc, priceEGP, inStock, stockQty, rating, reviewCount
        </div>

        <div className="flex gap-2 mb-3">
          <button onClick={() => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([template], { type: "text/csv" })); a.download = "template.csv"; a.click(); }}
            className="flex items-center gap-1.5 border border-border-subtle text-text-muted hover:text-electric text-xs px-3 py-2 rounded-lg transition-all">
            <Download className="w-3.5 h-3.5" /> Template
          </button>
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 border border-border-subtle text-text-muted hover:text-electric text-xs px-3 py-2 rounded-lg transition-all">
            <Upload className="w-3.5 h-3.5" /> Upload File
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => setText(ev.target?.result as string); r.readAsText(f); }}} className="hidden" />
        </div>

        <textarea value={text} onChange={e => { setText(e.target.value); setMsg(null); }}
          placeholder="Paste CSV content here, or upload a file above..."
          className="w-full h-36 bg-navy-light border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none resize-none font-mono focus:border-electric/50 mb-4" />

        {msg && (
          <div className={`flex gap-2 rounded-xl px-4 py-2.5 mb-4 ${msg.type === "error" ? "bg-red-500/10 border border-red-500/20" : "bg-aurora/10 border border-aurora/20"}`}>
            {msg.type === "error" ? <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" /> : <Check className="w-4 h-4 text-aurora flex-shrink-0" />}
            <p className={`text-sm ${msg.type === "error" ? "text-red-400" : "text-aurora"}`}>{msg.text}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => {
            try {
              const lines = text.trim().split("\n").filter(Boolean);
              if (lines.length < 2) throw new Error("Need header row + at least one data row");
              setMsg({ type: "success", text: `✓ ${lines.length - 1} products validated. Connect a database/API to persist imported products.` });
            } catch (e) { setMsg({ type: "error", text: e instanceof Error ? e.message : "Import failed" }); }
          }} disabled={!text.trim()}
            className="flex-1 bg-electric disabled:bg-electric/30 text-midnight font-bold py-3 rounded-xl hover:shadow-electric transition-all text-sm">
            Validate & Import
          </button>
          <button onClick={onClose} className="border border-border-subtle text-text-secondary px-6 py-3 rounded-xl hover:border-electric/40 text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Product Card ───────────────────────────────────────────────
function ProductCard({ product, view }: { product: Product; view: ViewMode }) {
  const { addItem, isInCart } = useCart();
  const [toast, setToast] = useState(false);
  const [imgError, setImgError] = useState(false);
  const inCart = isInCart(product.id);

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    addItem(product, 1);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }, [addItem, product]);

  const imgSrc = imgError || !product.images?.[0]?.src
    ? `https://placehold.co/600x600/0D1B2A/00B4D8?text=${encodeURIComponent(product.brand)}&font=montserrat`
    : product.images[0].src;

  const discount = product.originalPriceEGP ? Math.round((1 - product.priceEGP / product.originalPriceEGP) * 100) : 0;

  if (view === "list") {
    return (
      <>
        {toast && <Toast name={product.name} onClose={() => setToast(false)} />}
        <Link href={`/products/${product.id}`}
          className="glass-card rounded-2xl border border-border-subtle hover:border-electric/30 transition-all p-4 flex items-center gap-4 group hover:shadow-card-hover">
          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-navy-light">
            <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-text-muted text-xs font-mono">{product.brand} · {product.subcategory}</p>
            <h3 className="font-display font-bold text-sm line-clamp-1 mt-0.5">{product.name}</h3>
            <p className="text-text-secondary text-xs line-clamp-1 mt-0.5">{product.shortDesc}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {product.badge && <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${getBadgeStyle(product.badgeColor)}`}>{product.badge}</span>}
              <span className={`text-xs ${product.inStock ? "text-aurora" : "text-red-400"}`}>{product.inStock ? "✓ In Stock" : "Out of Stock"}</span>
              <span className="text-amber-400 text-xs">{"★".repeat(Math.floor(product.rating))} {product.rating} ({product.reviewCount})</span>
              <span className="text-text-muted text-xs font-mono">{product.protocol.join(" / ")}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              {product.originalPriceEGP && <p className="text-text-muted text-xs line-through">{formatPrice(product.originalPriceEGP)}</p>}
              <p className="font-display font-extrabold text-electric text-xl">{formatPrice(product.priceEGP)}</p>
            </div>
            <button onClick={handleAdd} disabled={!product.inStock}
              className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl transition-all ${
                inCart ? "bg-aurora/10 border border-aurora/30 text-aurora" : "bg-electric text-midnight hover:shadow-electric"
              } disabled:opacity-40`}>
              {inCart ? <><Check className="w-4 h-4" /> In Cart</> : <><Plus className="w-4 h-4" /> Add</>}
            </button>
          </div>
        </Link>
      </>
    );
  }

  return (
    <>
      {toast && <Toast name={product.name} onClose={() => setToast(false)} />}
      <Link href={`/products/${product.id}`}
        className="glass-card rounded-2xl border border-border-subtle hover:border-electric/30 transition-all duration-300 group hover:-translate-y-1 hover:shadow-card-hover overflow-hidden flex flex-col">
        {/* Image */}
        <div className="relative h-52 bg-navy-light overflow-hidden">
          <img src={imgSrc} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)} />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount >= 10 && <span className="text-xs font-mono bg-red-500 text-white px-2 py-0.5 rounded-full shadow-lg">-{discount}%</span>}
            {product.isNew && <span className="text-xs font-mono bg-ember text-white px-2 py-0.5 rounded-full shadow-lg">NEW</span>}
            {product.badge && !product.isNew && !discount && (
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full shadow-lg ${getBadgeStyle(product.badgeColor)}`}>{product.badge}</span>
            )}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-midnight/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs px-3 py-1.5 rounded-full">
              <Eye className="w-3.5 h-3.5" /> View Details
            </span>
          </div>

          {!product.inStock && (
            <div className="absolute inset-0 bg-midnight/70 flex items-center justify-center">
              <span className="bg-red-500/90 text-white text-sm font-bold px-4 py-1.5 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-text-muted text-xs font-mono mb-0.5">{product.brand}</p>
          <h3 className="font-display font-bold text-sm leading-snug line-clamp-2 mb-1">{product.name}</h3>
          <p className="text-text-secondary text-xs line-clamp-2 mb-3 flex-1 leading-relaxed">{product.shortDesc}</p>

          {/* Protocol chips */}
          <div className="flex flex-wrap gap-1 mb-2">
            {product.protocol.slice(0, 2).map(p => (
              <span key={p} className="text-xs bg-navy-light text-text-muted px-2 py-0.5 rounded-full border border-border-subtle">{p}</span>
            ))}
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-3">
            <span className="text-amber-400 text-xs">{"★".repeat(Math.floor(product.rating))}{"☆".repeat(5 - Math.floor(product.rating))}</span>
            <span className="text-text-muted text-xs">({product.reviewCount})</span>
          </div>

          {/* Price + Cart */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-border-subtle">
            <div>
              {product.originalPriceEGP && (
                <p className="text-text-muted text-xs line-through leading-none">{formatPrice(product.originalPriceEGP)}</p>
              )}
              <p className="font-display font-extrabold text-electric text-lg leading-tight">{formatPrice(product.priceEGP)}</p>
            </div>
            <button onClick={handleAdd} disabled={!product.inStock}
              className={`flex items-center gap-1.5 text-xs font-display font-bold px-3 py-2 rounded-xl transition-all ${
                inCart
                  ? "bg-aurora/10 border border-aurora/30 text-aurora"
                  : "bg-electric text-midnight hover:shadow-electric hover:-translate-y-0.5"
              } disabled:opacity-40 disabled:cursor-not-allowed`}>
              {inCart ? <><Check className="w-3.5 h-3.5" /> In Cart</> : <><Plus className="w-3.5 h-3.5" /> Add</>}
            </button>
          </div>
        </div>
      </Link>
    </>
  );
}

// ── AI BLOCK ───────────────────────────────────────────────────
type RecResult = { summary: string; recommendations: { id: string; name: string; category: string; price: string; description: string; priority: string }[]; totalEstimate: string; tip: string };

function AIBlock() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecResult | null>(null);
  const [error, setError] = useState("");
  const { addItem } = useCart();

  async function ask() {
    if (input.trim().length < 10) { setError("Describe your needs (10+ chars)"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ needs: input }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : "AI failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="border-b border-border-subtle bg-navy/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-plasma" />
          <span className="font-display font-bold text-sm">AI Product Finder</span>
          <span className="text-xs font-mono bg-plasma/10 text-plasma border border-plasma/20 px-2 py-0.5 rounded-full">Claude → Gemini → Groq</span>
        </div>
        <div className="flex gap-3 max-w-4xl">
          <input value={input} onChange={e => { setInput(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && ask()}
            placeholder="e.g. I need smart staircase lighting for 15 steps + video intercom for a villa, budget 20,000 EGP..."
            className="flex-1 glass-card border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-plasma/50 transition-colors" />
          <button onClick={ask} disabled={loading}
            className="bg-plasma text-white font-bold px-6 rounded-xl hover:shadow-plasma transition-all disabled:opacity-50 text-sm min-w-[110px] flex items-center justify-center">
            {loading ? <span className="flex gap-1"><span className="w-1.5 h-1.5 bg-white rounded-full dot-1" /><span className="w-1.5 h-1.5 bg-white rounded-full dot-2" /><span className="w-1.5 h-1.5 bg-white rounded-full dot-3" /></span> : "Get AI Picks"}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-1.5">{error}</p>}
        {result && (
          <div className="mt-4 glass-card border border-plasma/20 rounded-2xl p-5">
            <p className="text-plasma text-sm font-medium mb-1">ARIA recommends:</p>
            <p className="text-text-secondary text-sm mb-4">{result.summary}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.recommendations?.map(r => {
                const found = PRODUCTS.find(p => p.name.toLowerCase().includes(r.name.toLowerCase().split(" ")[0]));
                return (
                  <div key={r.id} className="bg-navy-card rounded-xl p-3 border border-border-subtle">
                    <div className="flex justify-between mb-1">
                      <p className="font-display font-bold text-sm line-clamp-1">{r.name}</p>
                      <span className="text-electric font-bold text-sm ml-2">{r.price}</span>
                    </div>
                    <p className="text-text-secondary text-xs mb-2 line-clamp-2">{r.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${r.priority === "essential" ? "bg-aurora/20 text-aurora" : "bg-electric/20 text-electric"}`}>{r.priority}</span>
                      {found && <button onClick={() => addItem(found)} className="text-xs text-plasma hover:text-electric font-medium transition-colors">+ Add</button>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle">
              {result.tip && <p className="text-text-muted text-xs flex items-start gap-1.5 flex-1"><Zap className="w-3.5 h-3.5 text-electric flex-shrink-0 mt-0.5" />{result.tip}</p>}
              {result.totalEstimate && <p className="text-electric font-bold text-sm whitespace-nowrap ml-4">{result.totalEstimate}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────
export default function ProductsPage() {
  const { count: cartCount } = useCart();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");
  const [protocol, setProtocol] = useState("All");
  const [priceLabel, setPriceLabel] = useState("All Prices");
  const [sort, setSort] = useState<SortKey>("featured");
  const [view, setView] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [stockOnly, setStockOnly] = useState(false);

  const priceObj = PRICE_RANGES.find(p => p.label === priceLabel) || PRICE_RANGES[0];

  const filtered = useMemo(() => {
    let r = PRODUCTS.filter(p => {
      if (category !== "All" && p.category !== category) return false;
      if (brand !== "All" && p.brand !== brand) return false;
      if (protocol !== "All" && !p.protocol.some(pr => pr.includes(protocol))) return false;
      if (p.priceEGP < priceObj.min || p.priceEGP > priceObj.max) return false;
      if (stockOnly && !p.inStock) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) ||
          p.shortDesc.toLowerCase().includes(q) || p.tags.some(t => t.includes(q)) ||
          p.category.toLowerCase().includes(q) || p.subcategory.toLowerCase().includes(q);
      }
      return true;
    });
    switch (sort) {
      case "price-asc":  return [...r].sort((a, b) => a.priceEGP - b.priceEGP);
      case "price-desc": return [...r].sort((a, b) => b.priceEGP - a.priceEGP);
      case "newest":     return [...r].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      case "name":       return [...r].sort((a, b) => a.name.localeCompare(b.name));
      case "rating":     return [...r].sort((a, b) => b.rating - a.rating);
      default:           return [...r].sort((a, b) => ((b.featured ? 2 : 0) + (b.isNew ? 1 : 0)) - ((a.featured ? 2 : 0) + (a.isNew ? 1 : 0)));
    }
  }, [search, category, brand, protocol, priceLabel, sort, stockOnly, priceObj]);

  const hasFilters = category !== "All" || brand !== "All" || protocol !== "All" || priceLabel !== "All Prices" || stockOnly;
  const clearFilters = () => { setCategory("All"); setBrand("All"); setProtocol("All"); setPriceLabel("All Prices"); setStockOnly(false); setSearch(""); };

  return (
    <div className="pt-24 min-h-screen">
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}

      {/* HERO */}
      <section className="relative py-12 border-b border-border-subtle overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-7">
            <div>
              <p className="font-mono text-electric text-sm mb-2">// Baytzaki Smart Home Store — Egypt 2025</p>
              <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight">
                {PRODUCTS.length} Smart Home Products<br />
                <span className="gradient-text">Sold Directly in Egypt</span>
              </h1>
              <p className="text-text-secondary mt-2 text-sm max-w-2xl">
                SONOFF · LEZN · Govee · Fibaro · HDL · Aqara · Hikvision · Commax · TP-Link Tapo · EZVIZ · Tuya — Real EGP prices. Cash on Delivery. Ships nationwide.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              <button onClick={() => setShowImport(true)} className="flex items-center gap-2 border border-electric/30 text-electric px-4 py-2.5 rounded-xl hover:bg-electric/10 transition-all text-sm">
                <Upload className="w-4 h-4" /> Import
              </button>
              <button onClick={() => {
                const csv = ["id,sku,name,brand,category,priceEGP,inStock,rating", ...PRODUCTS.map(p => `"${p.id}","${p.sku}","${p.name}","${p.brand}","${p.category}",${p.priceEGP},${p.inStock},${p.rating}`)].join("\n");
                const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "baytzaki-products.csv"; a.click();
              }} className="flex items-center gap-2 border border-border-subtle text-text-secondary hover:text-electric hover:border-electric/30 px-4 py-2.5 rounded-xl transition-all text-sm">
                <Download className="w-4 h-4" /> Export
              </button>
              <Link href="/cart" className="relative flex items-center gap-2 bg-electric text-midnight font-display font-bold px-5 py-2.5 rounded-xl hover:shadow-electric transition-all text-sm">
                <ShoppingCart className="w-4 h-4" /> Cart
                {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-aurora text-midnight text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-3">
            <div className="flex-1 flex items-center glass-card border border-border-subtle rounded-xl px-4 py-3 gap-3 focus-within:border-electric/50 transition-colors">
              <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${PRODUCTS.length} products — SONOFF, Govee, LEZN, Smart Stairs, Video Intercom...`}
                className="flex-1 bg-transparent text-text-primary placeholder-text-muted outline-none text-sm" />
              {search && <button onClick={() => setSearch("")} className="text-text-muted hover:text-electric text-xs">✕</button>}
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 border rounded-xl px-4 text-sm transition-all ${showFilters || hasFilters ? "border-electric/40 text-electric bg-electric/10" : "border-border-subtle text-text-secondary hover:border-electric/30"}`}>
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasFilters && <span className="w-2 h-2 rounded-full bg-electric" />}
            </button>
            <div className="flex border border-border-subtle rounded-xl overflow-hidden">
              <button onClick={() => setView("grid")} className={`px-3 py-3 transition-colors ${view === "grid" ? "bg-electric/10 text-electric" : "text-text-muted hover:text-electric"}`}><Grid className="w-4 h-4" /></button>
              <button onClick={() => setView("list")} className={`px-3 py-3 transition-colors ${view === "list" ? "bg-electric/10 text-electric" : "text-text-muted hover:text-electric"}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      {showFilters && (
        <section className="border-b border-border-subtle bg-navy/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "Category", value: category, set: setCategory, options: ["All", ...CATEGORIES] },
                { label: "Brand", value: brand, set: setBrand, options: ["All", ...BRANDS] },
                { label: "Protocol", value: protocol, set: setProtocol, options: PROTOCOLS },
                { label: "Price Range", value: priceLabel, set: setPriceLabel, options: PRICE_RANGES.map(p => p.label) },
              ].map(({ label, value, set, options }) => (
                <div key={label}>
                  <label className="text-text-muted text-xs font-mono block mb-1.5">{label}</label>
                  <select value={value} onChange={e => set(e.target.value)}
                    className="w-full bg-navy-light border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50">
                    {options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="text-text-muted text-xs font-mono block mb-1.5">Availability</label>
                <button onClick={() => setStockOnly(!stockOnly)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all ${stockOnly ? "border-aurora/40 bg-aurora/10 text-aurora" : "border-border-subtle text-text-secondary hover:border-aurora/30"}`}>
                  In Stock Only
                  <div className={`w-9 h-5 rounded-full transition-colors relative ${stockOnly ? "bg-aurora" : "bg-border-subtle"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${stockOnly ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-text-muted text-sm">{filtered.length} of {PRODUCTS.length} products</p>
              {hasFilters && <button onClick={clearFilters} className="flex items-center gap-1.5 text-electric text-sm hover:underline"><X className="w-3.5 h-3.5" /> Clear all</button>}
            </div>
          </div>
        </section>
      )}

      <AIBlock />

      {/* CATEGORY PILLS */}
      <div className="border-b border-border-subtle bg-navy/20 sticky top-[72px] z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {["All", ...CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  category === cat ? "bg-electric text-midnight" : "border border-border-subtle text-text-secondary hover:border-electric/30 hover:text-electric"
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCTS */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-text-muted text-sm">
              <span className="text-text-primary font-medium">{filtered.length}</span> products{search && <span> for "{search}"</span>}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-text-muted text-xs hidden sm:block">Sort:</span>
              <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
                className="bg-navy-light border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none">
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="rating">Top Rated</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
              <p className="text-text-muted text-lg mb-2">No products found</p>
              <button onClick={clearFilters} className="text-electric text-sm hover:underline">Clear all filters</button>
            </div>
          ) : (
            <div className={view === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" : "flex flex-col gap-4"}>
              {filtered.map(p => <ProductCard key={p.id} product={p} view={view} />)}
            </div>
          )}

          {filtered.length > 0 && (
            <p className="text-center text-text-muted text-xs font-mono mt-12">
              // {PRODUCTS.length} products · {BRANDS.length} brands · Cash on Delivery · Ships all Egypt
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
