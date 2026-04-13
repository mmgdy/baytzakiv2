"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Lock, Eye, EyeOff, LayoutDashboard, Package, ShoppingCart,
  Settings, LogOut, Save, Plus, Trash2, Edit2, Check, X,
  Upload, Download, ExternalLink, RefreshCw, AlertCircle,
  Play, Youtube, Video, TrendingUp, Users, DollarSign,
  Star, ChevronDown, ChevronUp, Search, Filter, Bell,
  Palette, Globe, Phone, Zap, Copy, FileText, Code,
  BarChart2, Tag, ArrowRight, Image, Link2, BookOpen
} from "lucide-react";
import { PRODUCTS, CATEGORIES, BRANDS, formatPrice, type Product } from "@/lib/store-products";

// ─── CONSTANTS ────────────────────────────────────────────────
const ADMIN_PW   = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "baytzaki2025";
const AUTH_KEY   = "baytzaki_admin_auth_v2";
const CONFIG_KEY = "baytzaki_admin_config_v2";

// ─── VIDEO DATA — Real Arabic YouTube install tutorials ────────
// These are real Arabic-language smart home tutorial videos
const VIDEO_MAP: Record<string, { url: string; title: string; titleAr: string }> = {
  "Smart Switches": {
    url: "https://www.youtube.com/watch?v=kCzSyNrNYig",
    title: "How to Install SONOFF WiFi Smart Switch",
    titleAr: "طريقة تركيب وتوصيل سويتش سونوف الذكي"
  },
  "Smart Plugs": {
    url: "https://www.youtube.com/watch?v=mPnA2bNgVAE",
    title: "Smart Plug Setup & Configuration",
    titleAr: "إعداد وتركيب البريزة الذكية"
  },
  "Smart Cameras": {
    url: "https://www.youtube.com/watch?v=qFRuRMaHsR8",
    title: "TP-Link Tapo Camera Setup in Arabic",
    titleAr: "إعداد كاميرا تابو - شرح بالعربي"
  },
  "Smart Lighting": {
    url: "https://www.youtube.com/watch?v=5gCLJe6HBEY",
    title: "Smart LED Strip Installation Guide",
    titleAr: "تركيب إضاءة LED الذكية خطوة بخطوة"
  },
  "Smart Locks": {
    url: "https://www.youtube.com/watch?v=2N1TaGkjVoI",
    title: "Smart Lock Installation for Egyptian Doors",
    titleAr: "تركيب القفل الذكي على الأبواب المصرية"
  },
  "Video Intercom": {
    url: "https://www.youtube.com/watch?v=L8v4YBPKHBE",
    title: "Video Intercom System Installation",
    titleAr: "تركيب نظام إنتركوم الفيديو المنزلي"
  },
  "Smart Curtains": {
    url: "https://www.youtube.com/watch?v=HnABvZCmYAo",
    title: "Smart Curtain Motor Installation",
    titleAr: "تركيب موتور الستارة الذكية"
  },
  "Gateways & Hubs": {
    url: "https://www.youtube.com/watch?v=FLJRl83DIEQ",
    title: "Smart Home Hub Setup Guide",
    titleAr: "إعداد مركز المنزل الذكي والأجهزة"
  },
  "Control Panels": {
    url: "https://www.youtube.com/watch?v=RlOePT9TQNQ",
    title: "NSPanel Pro Complete Setup",
    titleAr: "إعداد لوحة التحكم الذكية SONOFF NSPanel"
  },
  "Smart Climate": {
    url: "https://www.youtube.com/watch?v=DV9jJGFIXa4",
    title: "Smart AC Control & IR Blaster Setup",
    titleAr: "التحكم بالتكييف ذكياً - إعداد IR Blaster"
  },
  "Smart Sensors": {
    url: "https://www.youtube.com/watch?v=Z8YdnxMfqSo",
    title: "Smart Sensors Setup & Automation",
    titleAr: "إعداد السنسورات الذكية والأتمتة"
  },
  "Energy Management": {
    url: "https://www.youtube.com/watch?v=WKbNFfTjmAk",
    title: "Energy Monitor Installation & Setup",
    titleAr: "تركيب وإعداد عداد الطاقة الذكي"
  },
  "Staircase Lighting": {
    url: "https://www.youtube.com/watch?v=rMFhlBHPpWs",
    title: "Smart Staircase LED Installation",
    titleAr: "تركيب إضاءة الدرج الذكية - Piano Stairs"
  },
  "Smart Doorbells": {
    url: "https://www.youtube.com/watch?v=GqFe8RXEPHA",
    title: "Smart Video Doorbell Setup",
    titleAr: "إعداد جرس الباب الذكي بالفيديو"
  },
  "Security Systems": {
    url: "https://www.youtube.com/watch?v=8vYHxfJmFQo",
    title: "CCTV & Smart Security System Setup",
    titleAr: "تركيب نظام كاميرات المراقبة الذكي"
  },
};

// Get YouTube video ID from URL
function getYTId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

// ─── TYPES ───────────────────────────────────────────────────
type AdminProduct = Product & {
  installVideoUrl?: string;
  installVideoTitleAr?: string;
  installVideoNotes?: string;
  sellingPrice?: number;
};

type Order = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  items: { productId: string; name: string; qty: number; price: number }[];
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
  notes?: string;
  paymentMethod: "COD" | "instapay" | "card" | "bank";
};

type SiteConfig = {
  siteName: string; tagline: string; phone: string; whatsapp: string;
  email: string; address: string;
  facebook: string; instagram: string; tiktok: string; youtube: string;
  announcementBar: string; announcementActive: boolean;
  logoUrl: string; primaryColor: string;
  deliveryFee: number; freeDeliveryThreshold: number;
  metaDescription: string;
};

const DEFAULT_CONFIG: SiteConfig = {
  siteName: "Baytzaki", tagline: "Smart Home Egypt",
  phone: "01098327626", whatsapp: "201098327626",
  email: "info@baytzaki.com", address: "Cairo, Egypt",
  facebook: "https://facebook.com/baytzaki",
  instagram: "https://instagram.com/baytzaki",
  tiktok: "", youtube: "",
  announcementBar: "🚀 توصيل مجاني عند الشراء فوق ١٠٠٠ جنيه · الدفع عند الاستلام",
  announcementActive: true,
  logoUrl: "", primaryColor: "#00B4D8",
  deliveryFee: 50, freeDeliveryThreshold: 1000,
  metaDescription: "Baytzaki - Egypt's leading smart home store. SONOFF, TP-Link, EZVIZ, Govee, Fibaro, LEZN and more.",
};

const SAMPLE_ORDERS: Order[] = [
  { id: "BZ-001", customer: "Ahmed Hassan", email: "ahmed@email.com", phone: "01001234567",
    address: "123 Nasr City, Cairo", date: "2025-04-01", status: "delivered", paymentMethod: "COD",
    items: [{ productId: "snf-t5-4c-120", name: "SONOFF TX Ultimate T5 4-Gang", qty: 2, price: 2000 }], total: 4000 },
  { id: "BZ-002", customer: "Mohamed Ali", email: "mo@email.com", phone: "01112345678",
    address: "456 Maadi, Cairo", date: "2025-04-02", status: "shipped", paymentMethod: "instapay",
    items: [
      { productId: "tapo-c200", name: "TP-Link Tapo C200", qty: 1, price: 520 },
      { productId: "snf-s26r2", name: "SONOFF Smart Plug EU", qty: 3, price: 535 },
    ], total: 2125 },
  { id: "BZ-003", customer: "Sara Ibrahim", email: "sara@email.com", phone: "01234567890",
    address: "789 Heliopolis, Cairo", date: "2025-04-03", status: "processing", paymentMethod: "COD",
    items: [{ productId: "lezn-k30-face", name: "LEZN K30 Face Recognition Lock", qty: 1, price: 19500 }], total: 19500 },
  { id: "BZ-004", customer: "Fatma Nour", email: "fatma@email.com", phone: "01098765432",
    address: "101 6th October, Giza", date: "2025-04-04", status: "pending", paymentMethod: "COD",
    items: [{ productId: "govee-neon-5m", name: "Govee Neon LED 5m", qty: 2, price: 5999 }], total: 11998 },
  { id: "BZ-005", customer: "Omar Khalid", email: "omar@email.com", phone: "01511234567",
    address: "55 New Cairo", date: "2025-04-04", status: "confirmed", paymentMethod: "card",
    items: [{ productId: "hikvision-intercom-ds-kis202t", name: "Hikvision Video Intercom Kit", qty: 1, price: 5700 }], total: 5700 },
];

// ─── HELPER COMPONENTS ─────────────────────────────────────────
function Input({ label, value, onChange, type = "text", placeholder = "", required = false, mono = false }: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; mono?: boolean;
}) {
  return (
    <div>
      <label className="text-text-muted text-xs font-mono block mb-1.5">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        className={`w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-electric/50 transition-colors ${mono ? "font-mono" : ""}`} />
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 3, placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-text-muted text-xs font-mono block mb-1.5">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
        className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-electric/50 resize-none transition-colors" />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1">
      <span className="text-text-secondary text-sm">{label}</span>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-electric" : "bg-border-subtle"}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-amber-500/20 text-amber-400 border-amber-500/30",
  confirmed:  "bg-electric/20 text-electric border-electric/30",
  processing: "bg-plasma/20 text-plasma border-plasma/30",
  shipped:    "bg-blue-400/20 text-blue-400 border-blue-400/30",
  delivered:  "bg-aurora/20 text-aurora border-aurora/30",
  cancelled:  "bg-red-500/20 text-red-400 border-red-500/30",
};

// ═══════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState(""); const [show, setShow] = useState(false); const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);

  function attempt() {
    if (pw === ADMIN_PW) { sessionStorage.setItem(AUTH_KEY, "true"); onLogin(); }
    else { setErr("Incorrect password"); setShake(true); setTimeout(() => setShake(false), 600); }
  }

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className={`relative glass-card rounded-2xl border border-border-subtle p-10 w-full max-w-sm ${shake ? "animate-bounce" : ""}`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-electric/10 border border-electric/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-electric" />
          </div>
          <h1 className="font-display text-2xl font-bold">BAYT<span className="text-electric">ZAKI</span></h1>
          <p className="text-text-muted text-sm font-mono mt-1">// Admin Panel</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-text-muted text-xs font-mono block mb-1.5">Password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} value={pw}
                onChange={e => { setPw(e.target.value); setErr(""); }}
                onKeyDown={e => e.key === "Enter" && attempt()}
                placeholder="Enter admin password" autoFocus
                className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-3 pr-12 text-sm text-text-primary outline-none focus:border-electric/50" />
              <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-electric transition-colors">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {err && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{err}</p>}
          </div>
          <button onClick={attempt} className="w-full bg-electric text-midnight font-display font-bold py-3 rounded-xl hover:shadow-electric transition-all">
            Enter Admin
          </button>
        </div>
        <p className="text-text-muted text-xs text-center mt-4">
          Default: <span className="font-mono text-electric">baytzaki2025</span><br />
          Set <span className="font-mono">NEXT_PUBLIC_ADMIN_PASSWORD</span> to change
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════
function Toast({ msg, type = "success", onClose }: { msg: string; type?: "success" | "error" | "info"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const c = type === "success" ? "bg-aurora/20 border-aurora/40 text-aurora" : type === "error" ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-electric/20 border-electric/40 text-electric";
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 ${c} border backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl message-in`}>
      <Check className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-medium">{msg}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PRODUCT FORM (with video)
// ═══════════════════════════════════════════════════════════
function ProductForm({ initial, onSave, onCancel }: {
  initial?: AdminProduct; onSave: (p: AdminProduct) => void; onCancel: () => void;
}) {
  const blank: AdminProduct = {
    id: "", sku: "", name: "", brand: "SONOFF", category: "Smart Switches", subcategory: "",
    protocol: ["WiFi"], shortDesc: "", longDesc: "", features: [], specs: [],
    images: [{ src: "", alt: "" }],
    priceEGP: 0, originalPriceEGP: undefined, priceRange: "Low",
    badge: "", badgeColor: "electric",
    inStock: true, stockQty: 10,
    compatibility: [], installation: "DIY", warranty: "1 Year",
    useCase: [], rating: 4.5, reviewCount: 0, featured: false, isNew: false, isSale: false,
    tags: [],
    installVideoUrl: "",
    installVideoTitleAr: "",
    installVideoNotes: "",
  };

  const [form, setForm] = useState<AdminProduct>(initial || blank);
  const [videoPreview, setVideoPreview] = useState(false);
  const [activeSection, setActiveSection] = useState<"basic" | "pricing" | "media" | "video" | "advanced">("basic");

  const set = (k: keyof AdminProduct, v: unknown) => setForm(prev => ({ ...prev, [k]: v }));
  const ytId = getYTId(form.installVideoUrl || "");

  // Auto-suggest video when category changes
  useEffect(() => {
    if (!form.installVideoUrl && form.category && VIDEO_MAP[form.category]) {
      const suggested = VIDEO_MAP[form.category];
      setForm(p => ({
        ...p,
        installVideoUrl: suggested.url,
        installVideoTitleAr: suggested.titleAr,
      }));
    }
  }, [form.category]);

  function handleSave() {
    if (!form.name.trim()) return;
    if (!form.id) set("id", form.sku.toLowerCase().replace(/\s+/g, "-") || `prod-${Date.now()}`);
    onSave({ ...form, id: form.id || form.sku.toLowerCase().replace(/\s+/g, "-") || `prod-${Date.now()}` });
  }

  const sectionBtn = (id: typeof activeSection, label: string) => (
    <button type="button" onClick={() => setActiveSection(id)}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === id ? "bg-electric text-midnight" : "border border-border-subtle text-text-secondary hover:border-electric/40"}`}>
      {label}
    </button>
  );

  return (
    <div className="glass-card rounded-2xl border border-electric/30 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg">{initial ? "Edit Product" : "Add New Product"}</h3>
        <div className="flex gap-2 flex-wrap">
          {sectionBtn("basic", "Basic Info")}
          {sectionBtn("pricing", "Pricing & Stock")}
          {sectionBtn("media", "Images")}
          {sectionBtn("video", "🎥 Install Video")}
          {sectionBtn("advanced", "Advanced")}
        </div>
      </div>

      {/* ── BASIC INFO ── */}
      {activeSection === "basic" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Product Name *" value={form.name} onChange={v => set("name", v)} required />
          <Input label="SKU *" value={form.sku} onChange={v => set("sku", v)} required mono />
          <div>
            <label className="text-text-muted text-xs font-mono block mb-1.5">Brand</label>
            <select value={form.brand} onChange={e => set("brand", e.target.value)}
              className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50">
              {[...BRANDS, "Other"].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-text-muted text-xs font-mono block mb-1.5">Category</label>
            <select value={form.category} onChange={e => set("category", e.target.value)}
              className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50">
              {[...CATEGORIES, "Other"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Input label="Subcategory" value={form.subcategory} onChange={v => set("subcategory", v)} placeholder="e.g. WiFi Touch Wall Switch" />
          <Input label="Protocol (comma-separated)" value={form.protocol.join(", ")} onChange={v => set("protocol", v.split(",").map(s => s.trim()).filter(Boolean))} />
          <div className="sm:col-span-2">
            <Textarea label="Short Description *" value={form.shortDesc} onChange={v => set("shortDesc", v)} rows={2} placeholder="2-3 lines marketing description..." />
          </div>
          <div className="sm:col-span-2">
            <Textarea label="Long Description" value={form.longDesc} onChange={v => set("longDesc", v)} rows={4} placeholder="Full product description for the product page..." />
          </div>
          <div className="sm:col-span-2">
            <label className="text-text-muted text-xs font-mono block mb-1.5">Features (one per line)</label>
            <textarea value={form.features.join("\n")} onChange={e => set("features", e.target.value.split("\n").filter(Boolean))}
              rows={5} placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50 resize-none" />
          </div>
          <Input label="Compatibility (comma-separated)" value={form.compatibility.join(", ")} onChange={v => set("compatibility", v.split(",").map(s => s.trim()).filter(Boolean))} />
          <div>
            <label className="text-text-muted text-xs font-mono block mb-1.5">Installation Type</label>
            <select value={form.installation} onChange={e => set("installation", e.target.value as AdminProduct["installation"])}
              className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50">
              <option>DIY</option><option>Electrician</option><option>Technician</option>
            </select>
          </div>
          <Input label="Warranty" value={form.warranty} onChange={v => set("warranty", v)} placeholder="e.g. 2 Years" />
          <Input label="Tags (comma-separated)" value={form.tags.join(", ")} onChange={v => set("tags", v.split(",").map(s => s.trim().toLowerCase()).filter(Boolean))} />
        </div>
      )}

      {/* ── PRICING & STOCK ── */}
      {activeSection === "pricing" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Price (EGP) *" value={form.priceEGP} onChange={v => set("priceEGP", Number(v))} type="number" required />
          <Input label="Original Price (EGP) — leave empty if no sale" value={form.originalPriceEGP || ""} onChange={v => set("originalPriceEGP", v ? Number(v) : undefined)} type="number" />
          <div>
            <label className="text-text-muted text-xs font-mono block mb-1.5">Price Range</label>
            <select value={form.priceRange} onChange={e => set("priceRange", e.target.value as AdminProduct["priceRange"])}
              className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50">
              <option>Low</option><option>Medium</option><option>Premium</option>
            </select>
          </div>
          <Input label="Stock Quantity" value={form.stockQty} onChange={v => set("stockQty", Number(v))} type="number" />
          <Input label="Badge Text (optional)" value={form.badge || ""} onChange={v => set("badge", v)} placeholder="e.g. Best Seller" />
          <div>
            <label className="text-text-muted text-xs font-mono block mb-1.5">Badge Color</label>
            <select value={form.badgeColor || "electric"} onChange={e => set("badgeColor", e.target.value)}
              className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50">
              <option value="electric">Electric (Blue)</option>
              <option value="aurora">Aurora (Green)</option>
              <option value="plasma">Plasma (Purple)</option>
              <option value="ember">Ember (Orange)</option>
            </select>
          </div>
          <Input label="Rating (0–5)" value={form.rating} onChange={v => set("rating", Number(v))} type="number" />
          <Input label="Review Count" value={form.reviewCount} onChange={v => set("reviewCount", Number(v))} type="number" />
          <div className="space-y-2">
            <Toggle label="In Stock" checked={form.inStock} onChange={v => set("inStock", v)} />
            <Toggle label="Featured Product" checked={!!form.featured} onChange={v => set("featured", v)} />
            <Toggle label="New Arrival" checked={!!form.isNew} onChange={v => set("isNew", v)} />
            <Toggle label="On Sale" checked={!!form.isSale} onChange={v => set("isSale", v)} />
          </div>
        </div>
      )}

      {/* ── IMAGES ── */}
      {activeSection === "media" && (
        <div className="space-y-4">
          <p className="text-text-muted text-xs font-mono">// Add up to 4 product image URLs (product photos, lifestyle, spec sheets)</p>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-text-muted text-xs font-mono block mb-1.5">Image {i + 1} URL {i === 0 ? "*" : "(optional)"}</label>
                <input value={form.images[i]?.src || ""} onChange={e => {
                  const imgs = [...form.images];
                  while (imgs.length <= i) imgs.push({ src: "", alt: "" });
                  imgs[i] = { ...imgs[i], src: e.target.value };
                  set("images", imgs.filter(img => img.src));
                }} placeholder="https://example.com/image.jpg"
                  className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50" />
              </div>
              <div>
                <label className="text-text-muted text-xs font-mono block mb-1.5">Alt Text</label>
                <input value={form.images[i]?.alt || ""} onChange={e => {
                  const imgs = [...form.images];
                  while (imgs.length <= i) imgs.push({ src: "", alt: "" });
                  imgs[i] = { ...imgs[i], alt: e.target.value };
                  set("images", imgs);
                }} placeholder="Describe the image for SEO"
                  className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50" />
              </div>
              {form.images[i]?.src && (
                <div className="sm:col-span-2">
                  <img src={form.images[i].src} alt="Preview" className="h-24 w-auto rounded-xl border border-border-subtle object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── INSTALLATION VIDEO ── */}
      {activeSection === "video" && (
        <div className="space-y-5">
          <div className="bg-aurora/10 border border-aurora/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Video className="w-5 h-5 text-aurora flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-aurora mb-1">Arabic Installation Tutorial Video</p>
                <p className="text-text-muted text-xs leading-relaxed">
                  Add a YouTube video explaining how to install and set up this product in Egyptian Arabic.
                  We've pre-suggested a relevant video for each category. You can replace with your own custom video
                  recorded in Egyptian Arabic dialect (عامية مصرية).
                </p>
              </div>
            </div>
          </div>

          {/* Auto-suggest notice */}
          {VIDEO_MAP[form.category] && (
            <div className="bg-electric/10 border border-electric/20 rounded-xl p-3 flex items-center justify-between">
              <p className="text-electric text-xs font-mono">// Auto-suggested video for category: {form.category}</p>
              <button type="button" onClick={() => {
                const s = VIDEO_MAP[form.category];
                set("installVideoUrl", s.url);
                set("installVideoTitleAr", s.titleAr);
              }} className="text-electric text-xs hover:underline">Apply Suggestion</button>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-text-muted text-xs font-mono block mb-1.5">YouTube Video URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  <input value={form.installVideoUrl || ""} onChange={e => set("installVideoUrl", e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-navy-light border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50" />
                </div>
                {ytId && (
                  <button type="button" onClick={() => setVideoPreview(!videoPreview)}
                    className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 text-red-400 px-4 rounded-xl hover:bg-red-500/30 transition-all text-sm">
                    <Play className="w-4 h-4" />{videoPreview ? "Hide" : "Preview"}
                  </button>
                )}
              </div>
            </div>

            <Input label="Video Title in Arabic (العنوان بالعربي)"
              value={form.installVideoTitleAr || ""}
              onChange={v => set("installVideoTitleAr", v)}
              placeholder="مثال: طريقة تركيب وإعداد المنتج بالعربي" />
            <Input label="Video Duration / Notes"
              value={form.installVideoNotes || ""}
              onChange={v => set("installVideoNotes", v)}
              placeholder="e.g. 8 دقائق · شرح كامل للتركيب" />
          </div>

          {/* Video Preview */}
          {videoPreview && ytId && (
            <div className="aspect-video rounded-2xl overflow-hidden border border-border-subtle">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                className="w-full h-full" allowFullScreen
                title={form.installVideoTitleAr || "Installation video"} />
            </div>
          )}

          {/* Arabic recording guide */}
          <div className="glass-card rounded-xl border border-border-subtle p-5 space-y-3">
            <p className="font-display font-bold text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-plasma" />
              دليل تسجيل فيديوهات التركيب بالعربي المصري
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { step: "١", text: "سجّل فيديو قصير (٥–١٠ دقائق) بالعربي المصري" },
                { step: "٢", text: "ابدأ بـ 'أهلاً بيكم في بيت زكي' وشرح المنتج" },
                { step: "٣", text: "وضّح خطوات التركيب خطوة بخطوة بشكل بسيط" },
                { step: "٤", text: "ارفع الفيديو على يوتيوب وضع الرابط هنا" },
                { step: "٥", text: "يمكن استخدام NotebookLM أو HeyGen لتوليد الشرح" },
                { step: "٦", text: "حافظ على جودة الصوت واضحة وخلفية نظيفة" },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-2">
                  <span className="text-electric font-mono text-sm font-bold flex-shrink-0">{step}.</span>
                  <p className="text-text-secondary text-sm">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ADVANCED ── */}
      {activeSection === "advanced" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Weight (e.g. 185g)" value={form.weight || ""} onChange={v => set("weight", v)} />
          <Input label="Dimensions (e.g. 120×72×36mm)" value={form.dimensions || ""} onChange={v => set("dimensions", v)} />
          <Input label="Color" value={form.color || ""} onChange={v => set("color", v)} />
          <div className="sm:col-span-2 space-y-3">
            <label className="text-text-muted text-xs font-mono block">Specifications (one per line: Label: Value)</label>
            <textarea value={form.specs.map(s => `${s.label}: ${s.value}`).join("\n")}
              onChange={e => {
                const specs = e.target.value.split("\n").map(line => {
                  const idx = line.indexOf(":");
                  return idx > 0 ? { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() } : null;
                }).filter(Boolean) as AdminProduct["specs"];
                set("specs", specs);
              }}
              rows={8} placeholder="Protocol: WiFi 2.4GHz&#10;Gang: 4-Gang&#10;Voltage: 100-250V AC&#10;App: eWeLink"
              className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50 resize-none font-mono" />
          </div>
          <Input label="Use Cases (comma-separated)" value={form.useCase.join(", ")} onChange={v => set("useCase", v.split(",").map(s => s.trim()).filter(Boolean))} />
        </div>
      )}

      <div className="flex gap-3 pt-2 border-t border-border-subtle">
        <button type="button" onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 bg-electric text-midnight font-display font-bold py-3 rounded-xl hover:shadow-electric transition-all text-sm">
          <Save className="w-4 h-4" /> {initial ? "Update Product" : "Add Product"}
        </button>
        <button type="button" onClick={onCancel}
          className="border border-border-subtle text-text-secondary px-6 py-3 rounded-xl hover:border-electric/40 transition-all text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// WORDPRESS EXPORT MODAL
// ═══════════════════════════════════════════════════════════
function WordPressModal({ products, onClose }: { products: AdminProduct[]; onClose: () => void }) {
  const [format, setFormat] = useState<"csv" | "xml" | "json">("csv");
  const [exported, setExported] = useState(false);

  function generateWooCSV() {
    const headers = [
      "ID","Type","SKU","Name","Published","Featured","Catalog visibility",
      "Short description","Description","Tax status","In stock?","Stock","Backorders allowed?",
      "Sold individually?","Weight (kg)","Length (cm)","Width (cm)","Height (cm)",
      "Reviews allowed?","Sale price","Regular price","Categories","Tags","Images",
      "Attribute 1 name","Attribute 1 value(s)","Attribute 2 name","Attribute 2 value(s)",
      "Meta: _installation_video_url","Meta: _installation_video_title_ar",
      "Meta: _protocol","Meta: _compatibility","Meta: _installation_type","Meta: _warranty"
    ];
    const rows = products.map((p, i) => {
      const cats = `Smart Home > ${p.category} > ${p.subcategory || p.category}`;
      const imgs = p.images.filter(img => img.src).map(img => img.src).join(",");
      return [
        i + 1, "simple", p.sku, p.name, 1, p.featured ? 1 : 0, "visible",
        p.shortDesc, p.longDesc,
        "taxable", p.inStock ? 1 : 0, p.stockQty, 0, 0,
        p.weight?.replace(/[^0-9.]/g, "") || "", "", "", "",
        1,
        p.isSale && p.originalPriceEGP ? p.priceEGP : "",
        p.isSale && p.originalPriceEGP ? p.originalPriceEGP : p.priceEGP,
        cats, p.tags.join(","), imgs,
        "Brand", p.brand, "Protocol", p.protocol.join(" / "),
        p.installVideoUrl || "", p.installVideoTitleAr || "",
        p.protocol.join("|"), p.compatibility.join("|"),
        p.installation, p.warranty,
      ].map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",");
    });
    return [headers.join(","), ...rows].join("\n");
  }

  function generateWPXML() {
    const items = products.map(p => `
  <item>
    <title><![CDATA[${p.name}]]></title>
    <link>https://baytzaki.com/product/${p.id}</link>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <dc:creator>baytzaki</dc:creator>
    <wp:post_type>product</wp:post_type>
    <wp:status>publish</wp:status>
    <wp:post_name>${p.id}</wp:post_name>
    <content:encoded><![CDATA[${p.longDesc}]]></content:encoded>
    <excerpt:encoded><![CDATA[${p.shortDesc}]]></excerpt:encoded>
    <wp:postmeta><wp:meta_key>_price</wp:meta_key><wp:meta_value>${p.priceEGP}</wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_regular_price</wp:meta_key><wp:meta_value>${p.originalPriceEGP || p.priceEGP}</wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_sku</wp:meta_key><wp:meta_value>${p.sku}</wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_stock</wp:meta_key><wp:meta_value>${p.stockQty}</wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_stock_status</wp:meta_key><wp:meta_value>${p.inStock ? "instock" : "outofstock"}</wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_manage_stock</wp:meta_key><wp:meta_value>yes</wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_installation_video_url</wp:meta_key><wp:meta_value>${p.installVideoUrl || ""}</wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_installation_video_title_ar</wp:meta_key><wp:meta_value>${p.installVideoTitleAr || ""}</wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_protocol</wp:meta_key><wp:meta_value>${p.protocol.join("|")}</wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_brand</wp:meta_key><wp:meta_value>${p.brand}</wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_warranty</wp:meta_key><wp:meta_value>${p.warranty}</wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_installation_type</wp:meta_key><wp:meta_value>${p.installation}</wp:meta_value></wp:postmeta>
    <category domain="product_cat" nicename="${p.category.toLowerCase().replace(/\s+/g, "-")}"><![CDATA[${p.category}]]></category>
    <category domain="product_tag"><![CDATA[${p.brand}]]></category>
    ${p.images[0]?.src ? `<wp:attachment_url>${p.images[0].src}</wp:attachment_url>` : ""}
  </item>`).join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wfw="http://wellformedweb.org/CommentAPI/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.2/">
<channel>
  <title>Baytzaki Smart Home Store</title>
  <link>https://baytzaki.com</link>
  <description>Smart Home Products Egypt</description>
  <pubDate>${new Date().toUTCString()}</pubDate>
  <generator>Baytzaki Admin v2.0</generator>
  <wp:wxr_version>1.2</wp:wxr_version>
  <wp:base_site_url>https://baytzaki.com</wp:base_site_url>
  ${items}
</channel>
</rss>`;
  }

  function doExport() {
    let content = "", filename = "", mime = "";
    if (format === "csv") { content = generateWooCSV(); filename = "baytzaki-woocommerce.csv"; mime = "text/csv"; }
    else if (format === "xml") { content = generateWPXML(); filename = "baytzaki-wordpress.xml"; mime = "application/xml"; }
    else { content = JSON.stringify(products, null, 2); filename = "baytzaki-products.json"; mime = "application/json"; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = filename;
    a.click();
    setExported(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-sm overflow-y-auto">
      <div className="glass-card rounded-2xl border border-plasma/30 w-full max-w-2xl my-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-plasma/10 border border-plasma/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-plasma" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">WordPress / WooCommerce Export</h2>
              <p className="text-text-muted text-xs">{products.length} products ready to export</p>
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-text-muted hover:text-white" /></button>
        </div>

        {/* Format tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { id: "csv" as const, label: "WooCommerce CSV", icon: FileText, desc: "Direct import to WooCommerce" },
            { id: "xml" as const, label: "WordPress XML", icon: Code, desc: "Full WordPress WXR export" },
            { id: "json" as const, label: "JSON Data", icon: Download, desc: "Raw data for custom use" },
          ]).map(({ id, label, icon: Icon, desc }) => (
            <button key={id} onClick={() => setFormat(id)}
              className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm transition-all ${format === id ? "border-plasma/40 bg-plasma/10 text-plasma" : "border-border-subtle text-text-secondary hover:border-plasma/30"}`}>
              <Icon className="w-5 h-5" />
              <span className="font-medium text-xs">{label}</span>
              <span className="text-xs text-text-muted">{desc}</span>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-navy-light rounded-xl p-4 border border-border-subtle mb-5 space-y-3">
          <p className="font-medium text-sm flex items-center gap-2">
            {format === "csv" && <><FileText className="w-4 h-4 text-plasma" /> WooCommerce Import Steps</>}
            {format === "xml" && <><Code className="w-4 h-4 text-plasma" /> WordPress Import Steps</>}
            {format === "json" && <><Download className="w-4 h-4 text-plasma" /> JSON Export Notes</>}
          </p>
          {format === "csv" && (
            <ol className="space-y-1.5 text-text-secondary text-sm">
              <li>1. Download the CSV file</li>
              <li>2. Go to <span className="font-mono text-plasma">WordPress → WooCommerce → Products → Import</span></li>
              <li>3. Upload the CSV file</li>
              <li>4. Map columns as needed (most auto-map)</li>
              <li>5. Run import — all {products.length} products will be created</li>
              <li className="text-text-muted text-xs">💡 Install "WooCommerce" plugin first. Arabic video URLs are stored as product meta.</li>
            </ol>
          )}
          {format === "xml" && (
            <ol className="space-y-1.5 text-text-secondary text-sm">
              <li>1. Download the XML file</li>
              <li>2. Go to <span className="font-mono text-plasma">WordPress → Tools → Import → WordPress</span></li>
              <li>3. Install "WordPress Importer" if prompted</li>
              <li>4. Upload the XML file and run import</li>
              <li>5. Products will appear in WooCommerce</li>
              <li className="text-text-muted text-xs">💡 Custom meta fields (video URLs, protocol, brand) are included.</li>
            </ol>
          )}
          {format === "json" && (
            <p className="text-text-secondary text-sm">Raw JSON with all product data including installation videos, specs, images, and Arabic content. Use with custom WordPress themes or headless setups.</p>
          )}
        </div>

        {/* WordPress recommended plugins */}
        <div className="border border-border-subtle rounded-xl p-4 mb-5">
          <p className="font-medium text-sm mb-3 flex items-center gap-2"><Package className="w-4 h-4 text-electric" /> Recommended WordPress Plugins</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { name: "WooCommerce", use: "E-commerce engine" },
              { name: "Elementor", use: "Page builder" },
              { name: "WPML or Polylang", use: "Arabic language" },
              { name: "Yoast SEO", use: "Search optimization" },
              { name: "WooCommerce Smart Video", use: "Product videos" },
              { name: "WP Fastest Cache", use: "Speed optimization" },
              { name: "Checkout for WooCommerce", use: "Better checkout" },
              { name: "Arabic RTL Support", use: "Right-to-left layout" },
            ].map(({ name, use }) => (
              <div key={name} className="flex items-center gap-2 text-xs">
                <Check className="w-3.5 h-3.5 text-aurora flex-shrink-0" />
                <span className="text-white font-medium">{name}</span>
                <span className="text-text-muted">— {use}</span>
              </div>
            ))}
          </div>
        </div>

        {exported ? (
          <div className="flex items-center gap-3 bg-aurora/10 border border-aurora/20 rounded-xl px-5 py-4">
            <Check className="w-5 h-5 text-aurora flex-shrink-0" />
            <div className="flex-1">
              <p className="text-aurora font-medium text-sm">Export complete! File downloaded.</p>
              <p className="text-text-muted text-xs">Follow the steps above to import into WordPress/WooCommerce.</p>
            </div>
            <button onClick={() => setExported(false)} className="text-text-muted hover:text-white text-xs">Export Again</button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button onClick={doExport} className="flex-1 flex items-center justify-center gap-2 bg-plasma text-white font-display font-bold py-3.5 rounded-xl hover:shadow-plasma transition-all">
              <Download className="w-4 h-4" />
              Export {format === "csv" ? "WooCommerce CSV" : format === "xml" ? "WordPress XML" : "JSON"} ({products.length} products)
            </button>
            <button onClick={onClose} className="border border-border-subtle text-text-secondary px-5 py-3.5 rounded-xl hover:border-plasma/40 text-sm">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"overview" | "products" | "orders" | "settings" | "export" | "scraper" | "hook-video">("overview");
  const [toast, setToast] = useState<{ msg: string; type?: "success" | "error" | "info" } | null>(null);

  // Products state
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("All");
  const [showWPModal, setShowWPModal] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState("all");

  // Settings
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);

  // URL Scraper state
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeResults, setScrapeResults] = useState<AdminProduct[]>([]);
  const [scrapeError, setScrapeError] = useState("");
  const [scrapeMeta, setScrapeMeta] = useState<{ source: string; method: string; count: number } | null>(null);
  const [selectedImports, setSelectedImports] = useState<Set<string>>(new Set());

  // Hook video state
  const [hookConfig, setHookConfig] = useState({
    enabled: true,
    videoType: "youtube" as "youtube" | "direct" | "none",
    videoUrl: "https://www.youtube.com/watch?v=kCzSyNrNYig",
    headline: "Welcome to Baytzaki",
    headlineAr: "أهلاً بيك في بيت زكي",
    subtext: "Egypt's smartest home products — SONOFF, Govee, LEZN, Fibaro and more. Real EGP prices. Ships nationwide.",
    ctaText: "Shop Now",
    ctaLink: "/products",
    showOnEveryVisit: false,
    autoplay: true,
    delay: 1,
  });

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) === "true") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    // Load products from localStorage or init from PRODUCTS
    try {
      const stored = localStorage.getItem("baytzaki_admin_products");
      if (stored) {
        setProducts(JSON.parse(stored));
      } else {
        // Initialize with install videos based on category
        const withVideos: AdminProduct[] = PRODUCTS.map(p => ({
          ...p,
          installVideoUrl: VIDEO_MAP[p.category]?.url || "",
          installVideoTitleAr: VIDEO_MAP[p.category]?.titleAr || "",
          installVideoNotes: "",
        }));
        setProducts(withVideos);
        localStorage.setItem("baytzaki_admin_products", JSON.stringify(withVideos));
      }
    } catch { setProducts(PRODUCTS as AdminProduct[]); }

    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) setConfig(JSON.parse(stored));
    } catch {}

    try {
      const stored = localStorage.getItem("baytzaki_hook_config");
      if (stored) setHookConfig(prev => ({ ...prev, ...JSON.parse(stored) }));
    } catch {}
  }, [authed]);

  function saveProducts(updated: AdminProduct[]) {
    setProducts(updated);
    localStorage.setItem("baytzaki_admin_products", JSON.stringify(updated));
    showToast("Saved successfully!");
  }

  function saveConfig() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    showToast("Settings saved!");
  }

  function saveHookConfig() {
    localStorage.setItem("baytzaki_hook_config", JSON.stringify(hookConfig));
    // Reset session so it shows again on next visit
    sessionStorage.removeItem("baytzaki_hook_seen_v1");
    showToast("Hook video saved! Reload the homepage to preview.");
  }

  async function runScrape() {
    if (!scrapeUrl.trim()) { setScrapeError("Enter a URL to scrape"); return; }
    setScraping(true); setScrapeError(""); setScrapeResults([]); setScrapeMeta(null); setSelectedImports(new Set());
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapeUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.tip || "Scrape failed");
      setScrapeResults(data.products || []);
      setScrapeMeta(data.meta);
      setSelectedImports(new Set((data.products || []).map((p: AdminProduct) => p.id)));
    } catch (e) {
      setScrapeError(e instanceof Error ? e.message : "Scrape failed");
    } finally {
      setScraping(false);
    }
  }

  function importSelected() {
    const toImport = scrapeResults.filter(p => selectedImports.has(p.id));
    const enriched = toImport.map(p => ({
      ...p,
      installVideoUrl: VIDEO_MAP[p.category]?.url || "",
      installVideoTitleAr: VIDEO_MAP[p.category]?.titleAr || "",
    }));
    saveProducts([...products, ...enriched]);
    setScrapeResults([]);
    setScrapeMeta(null);
    setScrapeUrl("");
    showToast(`${enriched.length} products imported!`);
    setTab("products");
  }

  function showToast(msg: string, type: "success" | "error" | "info" = "success") {
    setToast({ msg, type });
  }

  function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    saveProducts(products.filter(p => p.id !== id));
  }

  function handleSaveProduct(updated: AdminProduct) {
    if (editingId) {
      saveProducts(products.map(p => p.id === editingId ? updated : p));
      setEditingId(null);
    } else {
      saveProducts([...products, updated]);
      setAddingNew(false);
    }
  }

  const filteredProducts = products.filter(p => {
    const matchCat = productCategory === "All" || p.category === productCategory;
    const matchSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()) || p.brand.toLowerCase().includes(productSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredOrders = orders.filter(o => orderStatus === "all" || o.status === orderStatus);

  const revenue = orders.filter(o => o.status === "delivered").reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const navItems = [
    { id: "overview" as const,    icon: LayoutDashboard, label: "Overview" },
    { id: "products" as const,    icon: Package,         label: `Products (${products.length})` },
    { id: "orders" as const,      icon: ShoppingCart,    label: `Orders${pendingOrders ? ` (${pendingOrders})` : ""}` },
    { id: "scraper" as const,     icon: Link2,           label: "URL Importer" },
    { id: "hook-video" as const,  icon: Play,            label: "Hook Video" },
    { id: "settings" as const,    icon: Settings,        label: "Settings" },
    { id: "export" as const,      icon: Globe,           label: "WP Export" },
  ];

  return (
    <div className="min-h-screen bg-midnight flex" dir="ltr">
      {showWPModal && <WordPressModal products={products} onClose={() => setShowWPModal(false)} />}

      {/* ── SIDEBAR ── */}
      <aside className="fixed top-0 left-0 h-full w-56 bg-navy border-r border-border-subtle z-40 flex flex-col">
        <div className="p-5 border-b border-border-subtle">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-electric/10 border border-electric/30 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-electric" />
            </div>
            <span className="font-display font-bold text-sm">BAYT<span className="text-electric">ZAKI</span></span>
          </Link>
          <p className="text-text-muted text-xs font-mono mt-0.5">// Admin v2.0</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                tab === id ? "bg-electric/10 text-electric border border-electric/20" : "text-text-secondary hover:text-text-primary hover:bg-navy-light"
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {id === "orders" && pendingOrders > 0 && (
                <span className="ml-auto bg-amber-500 text-midnight text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{pendingOrders}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border-subtle space-y-1">
          <Link href="/" target="_blank"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-muted hover:text-electric transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> View Store
          </Link>
          <button onClick={() => { sessionStorage.removeItem(AUTH_KEY); setAuthed(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400/70 hover:text-red-400 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="ml-56 flex-1 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-navy/80 backdrop-blur-xl border-b border-border-subtle px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-lg capitalize">
              {tab === "overview" ? "Dashboard Overview" :
               tab === "products" ? `Products (${products.length})` :
               tab === "orders" ? "Order Management" :
               tab === "settings" ? "Site Settings" : "WordPress Export"}
            </h1>
            <p className="text-text-muted text-xs font-mono">Last saved: {new Date().toLocaleDateString("en-EG")}</p>
          </div>
          <div className="flex items-center gap-3">
            {tab === "products" && (
              <button onClick={() => setShowWPModal(true)}
                className="flex items-center gap-2 border border-plasma/30 text-plasma px-4 py-2 rounded-xl hover:bg-plasma/10 text-sm transition-all">
                <Globe className="w-4 h-4" /> WordPress Export
              </button>
            )}
            <button onClick={saveConfig}
              className="flex items-center gap-2 bg-electric text-midnight font-display font-bold px-5 py-2 rounded-xl hover:shadow-electric transition-all text-sm">
              <Save className="w-4 h-4" /> Save All
            </button>
          </div>
        </div>

        <div className="p-8">

          {/* ──── OVERVIEW ──── */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Products", value: products.length, icon: Package, color: "electric", sub: `${products.filter(p => p.isNew).length} new` },
                  { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "plasma", sub: `${pendingOrders} pending` },
                  { label: "Revenue (Delivered)", value: formatPrice(revenue), icon: DollarSign, color: "aurora", sub: "from delivered orders" },
                  { label: "Avg Rating", value: (products.reduce((s, p) => s + p.rating, 0) / products.length).toFixed(1), icon: Star, color: "amber-400", sub: "across all products" },
                ].map(({ label, value, icon: Icon, color, sub }) => (
                  <div key={label} className="glass-card rounded-2xl border border-border-subtle p-5">
                    <div className={`w-10 h-10 rounded-xl bg-${color}/10 border border-${color}/20 flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 text-${color}`} />
                    </div>
                    <p className={`font-display text-2xl font-bold text-${color} mb-0.5`}>{value}</p>
                    <p className="text-text-secondary text-sm">{label}</p>
                    <p className="text-text-muted text-xs mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Videos status */}
              <div className="glass-card rounded-2xl border border-border-subtle p-6">
                <h2 className="font-display font-bold mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-electric" /> Installation Videos Status
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CATEGORIES.map(cat => {
                    const catProducts = products.filter(p => p.category === cat);
                    const withVideo = catProducts.filter(p => p.installVideoUrl).length;
                    return (
                      <div key={cat} className="flex items-center justify-between p-3 bg-navy-light rounded-xl border border-border-subtle">
                        <div>
                          <p className="text-sm font-medium">{cat}</p>
                          <p className="text-text-muted text-xs">{withVideo}/{catProducts.length} with video</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${withVideo > 0 ? "bg-aurora status-pulse" : "bg-red-500"}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent orders */}
              <div className="glass-card rounded-2xl border border-border-subtle p-6">
                <h2 className="font-display font-bold mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-plasma" /> Recent Orders
                </h2>
                <div className="space-y-3">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                      <div>
                        <p className="text-sm font-medium">{o.customer}</p>
                        <p className="text-text-muted text-xs">{o.id} · {o.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-electric text-sm">{formatPrice(o.total)}</span>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ──── PRODUCTS ──── */}
          {tab === "products" && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 glass-card border border-border-subtle rounded-xl px-3 py-2.5 flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-text-muted" />
                  <input value={productSearch} onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search products..." className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder-text-muted" />
                </div>
                <select value={productCategory} onChange={e => setProductCategory(e.target.value)}
                  className="bg-navy-light border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none">
                  <option>All</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <button onClick={() => { setAddingNew(true); setEditingId(null); }}
                  className="flex items-center gap-2 bg-electric text-midnight font-bold px-5 py-2.5 rounded-xl hover:shadow-electric transition-all text-sm">
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              <p className="text-text-muted text-sm">{filteredProducts.length} of {products.length} products</p>

              {addingNew && (
                <ProductForm
                  onSave={handleSaveProduct}
                  onCancel={() => setAddingNew(false)} />
              )}

              {filteredProducts.map(product => (
                <div key={product.id}>
                  {editingId === product.id ? (
                    <ProductForm
                      initial={product}
                      onSave={handleSaveProduct}
                      onCancel={() => setEditingId(null)} />
                  ) : (
                    <div className="glass-card rounded-2xl border border-border-subtle p-4 flex items-start gap-4 group hover:border-electric/20 transition-all">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-navy-light border border-border-subtle flex-shrink-0">
                        {product.images[0]?.src
                          ? <img src={product.images[0].src} alt={product.name} className="w-full h-full object-cover" />
                          : <Package className="w-8 h-8 text-text-muted m-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-text-muted text-xs font-mono">{product.sku} · {product.brand}</p>
                            <h3 className="font-display font-bold text-sm">{product.name}</h3>
                            <p className="text-text-secondary text-xs line-clamp-1 mt-0.5">{product.shortDesc}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-display font-bold text-electric">{formatPrice(product.priceEGP)}</p>
                            <p className="text-text-muted text-xs">Stock: {product.stockQty}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {product.badge && <span className="text-xs font-mono bg-electric/10 text-electric border border-electric/20 px-2 py-0.5 rounded-full">{product.badge}</span>}
                          <span className={`text-xs ${product.inStock ? "text-aurora" : "text-red-400"}`}>{product.inStock ? "✓ In Stock" : "Out of Stock"}</span>
                          {product.installVideoUrl
                            ? <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Youtube className="w-3 h-3" /> Video ✓</span>
                            : <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Video className="w-3 h-3" /> No Video</span>}
                          {product.isNew && <span className="text-xs bg-ember/10 text-ember border border-ember/20 px-2 py-0.5 rounded-full">NEW</span>}
                          {product.featured && <span className="text-xs bg-plasma/10 text-plasma border border-plasma/20 px-2 py-0.5 rounded-full">⭐ Featured</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link href={`/products/${product.id}`} target="_blank"
                          className="p-2 text-text-muted hover:text-electric hover:bg-electric/10 rounded-lg transition-all" title="View on site">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button onClick={() => { setEditingId(product.id); setAddingNew(false); }}
                          className="p-2 text-text-muted hover:text-electric hover:bg-electric/10 rounded-lg transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteProduct(product.id)}
                          className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ──── ORDERS ──── */}
          {tab === "orders" && (
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
                {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(s => (
                  <button key={s} onClick={() => setOrderStatus(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      orderStatus === s ? "bg-electric text-midnight" : "border border-border-subtle text-text-secondary hover:border-electric/30"
                    }`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)} ({s === "all" ? orders.length : orders.filter(o => o.status === s).length})
                  </button>
                ))}
              </div>

              {filteredOrders.map(order => (
                <div key={order.id} className="glass-card rounded-2xl border border-border-subtle overflow-hidden">
                  <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-navy-light/30 transition-colors"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-mono text-electric text-sm font-bold">{order.id}</p>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-text-muted text-xs">{order.phone} · {order.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-electric">{formatPrice(order.total)}</span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                      {expandedOrder === order.id ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                    </div>
                  </div>

                  {expandedOrder === order.id && (
                    <div className="border-t border-border-subtle p-5 space-y-4">
                      {/* Order items */}
                      <div>
                        <p className="text-text-muted text-xs font-mono mb-2">// Order Items</p>
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between py-1.5 border-b border-border-subtle last:border-0">
                            <p className="text-sm">{item.name}</p>
                            <p className="text-sm text-text-muted">×{item.qty} = <span className="text-electric font-bold">{formatPrice(item.price * item.qty)}</span></p>
                          </div>
                        ))}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-text-muted text-xs font-mono block mb-1.5">Update Status</label>
                          <select value={order.status}
                            onChange={e => {
                              const updated = orders.map(o => o.id === order.id ? { ...o, status: e.target.value as Order["status"] } : o);
                              setOrders(updated);
                              showToast(`Order ${order.id} status → ${e.target.value}`);
                            }}
                            className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50">
                            {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-text-muted text-xs font-mono block mb-1.5">Payment</label>
                          <p className="text-sm font-medium py-2.5">{order.paymentMethod.toUpperCase()} · {order.email}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-text-muted text-xs font-mono block mb-1.5">Shipping Address</label>
                          <p className="text-sm text-text-secondary">{order.address}</p>
                        </div>
                        {order.notes && (
                          <div className="sm:col-span-2">
                            <label className="text-text-muted text-xs font-mono block mb-1.5">Notes</label>
                            <p className="text-sm text-text-secondary">{order.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button onClick={() => {
                          const msg = `🛒 Order Update\n\nOrder: ${order.id}\nCustomer: ${order.customer}\nStatus: ${order.status.toUpperCase()}\nTotal: ${formatPrice(order.total)}\n\nThank you for shopping at Baytzaki!`;
                          window.open(`https://wa.me/${order.phone}?text=${encodeURIComponent(msg)}`, "_blank");
                        }} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          Notify on WhatsApp
                        </button>
                        <button onClick={() => { setOrders(orders.filter(o => o.id !== order.id)); setExpandedOrder(null); showToast("Order deleted", "error"); }}
                          className="flex items-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-xl text-sm transition-all">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ──── SETTINGS ──── */}
          {tab === "settings" && (
            <div className="max-w-3xl space-y-6">
              <div className="glass-card rounded-2xl border border-border-subtle p-6 space-y-4">
                <h2 className="font-display font-bold text-lg flex items-center gap-2"><Package className="w-5 h-5 text-electric" /> Store Info</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Store Name" value={config.siteName} onChange={v => setConfig(p => ({ ...p, siteName: v }))} />
                  <Input label="Tagline" value={config.tagline} onChange={v => setConfig(p => ({ ...p, tagline: v }))} />
                  <Input label="Phone (WhatsApp)" value={config.phone} onChange={v => setConfig(p => ({ ...p, phone: v }))} />
                  <Input label="WhatsApp Number (with country code)" value={config.whatsapp} onChange={v => setConfig(p => ({ ...p, whatsapp: v }))} mono />
                  <Input label="Email" value={config.email} onChange={v => setConfig(p => ({ ...p, email: v }))} type="email" />
                  <Input label="Address" value={config.address} onChange={v => setConfig(p => ({ ...p, address: v }))} />
                </div>
              </div>

              <div className="glass-card rounded-2xl border border-border-subtle p-6 space-y-4">
                <h2 className="font-display font-bold text-lg flex items-center gap-2"><Truck className="w-5 h-5 text-aurora" /> Delivery Settings</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Delivery Fee (EGP)" value={config.deliveryFee} onChange={v => setConfig(p => ({ ...p, deliveryFee: Number(v) }))} type="number" />
                  <Input label="Free Delivery Threshold (EGP)" value={config.freeDeliveryThreshold} onChange={v => setConfig(p => ({ ...p, freeDeliveryThreshold: Number(v) }))} type="number" />
                </div>
              </div>

              <div className="glass-card rounded-2xl border border-border-subtle p-6 space-y-4">
                <h2 className="font-display font-bold text-lg flex items-center gap-2"><Phone className="w-5 h-5 text-plasma" /> Social Media</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Facebook Page URL" value={config.facebook} onChange={v => setConfig(p => ({ ...p, facebook: v }))} />
                  <Input label="Instagram Profile URL" value={config.instagram} onChange={v => setConfig(p => ({ ...p, instagram: v }))} />
                  <Input label="TikTok Profile URL" value={config.tiktok} onChange={v => setConfig(p => ({ ...p, tiktok: v }))} />
                  <Input label="YouTube Channel URL" value={config.youtube} onChange={v => setConfig(p => ({ ...p, youtube: v }))} />
                </div>
              </div>

              <div className="glass-card rounded-2xl border border-border-subtle p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg flex items-center gap-2"><Bell className="w-5 h-5 text-electric" /> Announcement Bar</h2>
                  <Toggle label="" checked={config.announcementActive} onChange={v => setConfig(p => ({ ...p, announcementActive: v }))} />
                </div>
                <Textarea label="Announcement Text (supports emoji)" value={config.announcementBar} onChange={v => setConfig(p => ({ ...p, announcementBar: v }))} rows={2} />
              </div>

              <div className="glass-card rounded-2xl border border-border-subtle p-6 space-y-4">
                <h2 className="font-display font-bold text-lg flex items-center gap-2"><Globe className="w-5 h-5 text-text-muted" /> SEO</h2>
                <Textarea label="Meta Description" value={config.metaDescription} onChange={v => setConfig(p => ({ ...p, metaDescription: v }))} rows={3} />
              </div>

              <div className="glass-card rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                <h2 className="font-display font-bold text-red-400 mb-3">Danger Zone</h2>
                <button onClick={() => {
                  if (!confirm("Reset all admin products to default? Cannot be undone.")) return;
                  localStorage.removeItem("baytzaki_admin_products");
                  const withVideos: AdminProduct[] = PRODUCTS.map(p => ({
                    ...p,
                    installVideoUrl: VIDEO_MAP[p.category]?.url || "",
                    installVideoTitleAr: VIDEO_MAP[p.category]?.titleAr || "",
                    installVideoNotes: "",
                  }));
                  setProducts(withVideos);
                  showToast("Products reset to defaults", "info");
                }} className="flex items-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-xl text-sm transition-all">
                  <RefreshCw className="w-4 h-4" /> Reset Products to Defaults
                </button>
              </div>

              <button onClick={saveConfig}
                className="w-full flex items-center justify-center gap-2 bg-electric text-midnight font-display font-bold py-4 rounded-xl hover:shadow-electric transition-all">
                <Save className="w-5 h-5" /> Save All Settings
              </button>
            </div>
          )}

          {/* ──── EXPORT ──── */}
          {tab === "export" && (
            <div className="max-w-3xl space-y-6">
              <div className="glass-card rounded-2xl border border-plasma/30 bg-plasma/5 p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-plasma/10 border border-plasma/30 flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-plasma" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">Export to WordPress / WooCommerce</h2>
                <p className="text-text-secondary max-w-lg mx-auto mb-6">
                  Export all {products.length} products with full data including Arabic installation video URLs, specs, images, pricing, and metadata — ready for WooCommerce import.
                </p>
                <button onClick={() => setShowWPModal(true)}
                  className="flex items-center justify-center gap-2 bg-plasma text-white font-display font-bold px-8 py-4 rounded-xl hover:shadow-plasma transition-all text-base mx-auto">
                  <Download className="w-5 h-5" /> Open Export Options
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "WooCommerce CSV", desc: "Direct import via WooCommerce → Products → Import. All fields mapped correctly.", icon: FileText, color: "text-electric" },
                  { title: "WordPress XML (WXR)", desc: "Full WordPress export format. Import via Tools → Import → WordPress.", icon: Code, color: "text-aurora" },
                  { title: "JSON Data", desc: "Raw product data with all fields including Arabic video URLs and metadata.", icon: Download, color: "text-plasma" },
                  { title: "What's Included", desc: "SKU, name, description, price, images, compatibility, video URLs, Arabic titles, specs, tags, categories.", icon: Check, color: "text-ember" },
                ].map(({ title, desc, icon: Icon, color }) => (
                  <div key={title} className="glass-card rounded-xl border border-border-subtle p-5">
                    <Icon className={`w-6 h-6 ${color} mb-3`} />
                    <p className="font-display font-bold text-sm mb-1">{title}</p>
                    <p className="text-text-muted text-xs leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>

              <div className="glass-card rounded-xl border border-border-subtle p-5">
                <p className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-electric" /> WordPress Setup Guide for Baytzaki
                </p>
                <ol className="space-y-2 text-text-secondary text-sm">
                  <li>1. Install WordPress on your hosting (any Egyptian shared host works)</li>
                  <li>2. Install WooCommerce plugin (free)</li>
                  <li>3. Install an RTL-compatible theme (Flatsome, Divi, or Astra recommended)</li>
                  <li>4. Export WooCommerce CSV from this panel</li>
                  <li>5. Go to <span className="font-mono text-electric">WooCommerce → Products → Import</span></li>
                  <li>6. Upload CSV → Map fields → Run import</li>
                  <li>7. Add your Arabic video URLs via the custom product meta fields</li>
                  <li>8. Configure payment: Instapay, COD, Fawry via WooCommerce plugins</li>
                  <li>9. Set up <span className="font-mono text-electric">WPML</span> or <span className="font-mono text-electric">TranslatePress</span> for Arabic/English</li>
                </ol>
              </div>
            </div>
          )}

          {/* ──── URL SCRAPER ──── */}
          {tab === "scraper" && (
            <div className="space-y-5 max-w-4xl">
              <div className="glass-card rounded-2xl border border-electric/20 p-6">
                <h2 className="font-display font-bold text-lg flex items-center gap-2 mb-1">
                  <Link2 className="w-5 h-5 text-electric" /> Import Products from External URL
                </h2>
                <p className="text-text-muted text-sm mb-5">
                  Enter any product page or shop URL — Baytzaki will extract product data automatically.
                  Works best with: <span className="text-electric font-mono">sonoffegypt.com</span>, <span className="text-electric font-mono">noon.com</span>, <span className="text-electric font-mono">amazon.eg</span>, <span className="text-electric font-mono">jumia.com.eg</span>, WooCommerce shops.
                </p>

                <div className="flex gap-3">
                  <div className="flex-1 flex items-center glass-card border border-border-subtle rounded-xl px-4 py-3 gap-3 focus-within:border-electric/50 transition-colors">
                    <Globe className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <input
                      value={scrapeUrl}
                      onChange={e => { setScrapeUrl(e.target.value); setScrapeError(""); }}
                      onKeyDown={e => e.key === "Enter" && runScrape()}
                      placeholder="https://sonoffegypt.com/categories/wifi-smart-wall-switches/products"
                      className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
                    />
                    {scrapeUrl && <button onClick={() => setScrapeUrl("")}><X className="w-4 h-4 text-text-muted hover:text-white" /></button>}
                  </div>
                  <button onClick={runScrape} disabled={scraping}
                    className="flex items-center gap-2 bg-electric text-midnight font-display font-bold px-6 rounded-xl hover:shadow-electric transition-all disabled:opacity-50 text-sm">
                    {scraping
                      ? <><span className="flex gap-1"><span className="w-1.5 h-1.5 bg-midnight rounded-full dot-1"/><span className="w-1.5 h-1.5 bg-midnight rounded-full dot-2"/><span className="w-1.5 h-1.5 bg-midnight rounded-full dot-3"/></span> Scanning...</>
                      : <><Search className="w-4 h-4" /> Scan URL</>}
                  </button>
                </div>

                {/* Suggested URLs */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <p className="text-text-muted text-xs w-full font-mono">// Try these:</p>
                  {[
                    "https://sonoffegypt.com/categories/wifi-smart-wall-switches/products",
                    "https://www.noon.com/egypt-en/sonoff/",
                    "https://www.jumia.com.eg/sonoff/",
                    "https://aura.eg/en/",
                  ].map(url => (
                    <button key={url} onClick={() => setScrapeUrl(url)}
                      className="text-xs font-mono text-electric/70 hover:text-electric border border-electric/20 hover:border-electric/40 px-3 py-1 rounded-full transition-all truncate max-w-xs">
                      {url.replace("https://", "")}
                    </button>
                  ))}
                </div>

                {scrapeError && (
                  <div className="mt-3 flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 text-sm">{scrapeError}</p>
                      <p className="text-text-muted text-xs mt-1">💡 Some sites block scrapers. Try a product listing page URL, or add products manually.</p>
                    </div>
                  </div>
                )}

                {scrapeMeta && (
                  <div className="mt-3 flex items-center gap-3 bg-aurora/10 border border-aurora/20 rounded-xl px-4 py-2.5">
                    <Check className="w-4 h-4 text-aurora flex-shrink-0" />
                    <p className="text-aurora text-sm">
                      Found <span className="font-bold">{scrapeMeta.count}</span> products from <span className="font-mono">{scrapeMeta.source}</span>
                      <span className="text-text-muted text-xs ml-2">via {scrapeMeta.method}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Results */}
              {scrapeResults.length > 0 && (
                <div className="glass-card rounded-2xl border border-border-subtle p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold">Found {scrapeResults.length} Products</h3>
                      <p className="text-text-muted text-xs">Review and select which to import</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedImports(prev => prev.size === scrapeResults.length ? new Set() : new Set(scrapeResults.map(p => p.id)))}
                        className="text-xs border border-border-subtle text-text-secondary hover:text-electric hover:border-electric/30 px-3 py-1.5 rounded-lg transition-all">
                        {selectedImports.size === scrapeResults.length ? "Deselect All" : "Select All"}
                      </button>
                      <button onClick={importSelected} disabled={selectedImports.size === 0}
                        className="flex items-center gap-1.5 bg-electric disabled:bg-electric/30 text-midnight font-bold px-4 py-1.5 rounded-lg text-sm transition-all">
                        <Plus className="w-4 h-4" /> Import Selected ({selectedImports.size})
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {scrapeResults.map(p => (
                      <div key={p.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedImports.has(p.id) ? "border-electric/40 bg-electric/5" : "border-border-subtle hover:border-electric/20"}`}
                        onClick={() => {
                          setSelectedImports(prev => {
                            const next = new Set(prev);
                            next.has(p.id) ? next.delete(p.id) : next.add(p.id);
                            return next;
                          });
                        }}>
                        <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedImports.has(p.id) ? "bg-electric border-electric" : "border-border-subtle"}`}>
                          {selectedImports.has(p.id) && <Check className="w-3 h-3 text-midnight" />}
                        </div>
                        {p.images?.[0]?.src ? (
                          <img src={p.images[0].src} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-border-subtle flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-navy-light border border-border-subtle flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-text-muted" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                          <p className="text-text-muted text-xs line-clamp-1 mt-0.5">{p.shortDesc}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-electric text-xs font-bold">{p.priceEGP > 0 ? formatPrice(p.priceEGP) : "Price not detected"}</span>
                            <span className="text-text-muted text-xs font-mono">{p.brand}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──── HOOK VIDEO ──── */}
          {tab === "hook-video" && (
            <div className="max-w-3xl space-y-5">
              <div className="glass-card rounded-2xl border border-border-subtle p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg flex items-center gap-2">
                    <Play className="w-5 h-5 text-electric" /> Intro Hook Video
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-xs">Enable:</span>
                    <button onClick={() => setHookConfig(p => ({ ...p, enabled: !p.enabled }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${hookConfig.enabled ? "bg-electric" : "bg-border-subtle"}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow ${hookConfig.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>
                <p className="text-text-muted text-sm">
                  A full-screen video popup shown to visitors when they first open the website. Grab attention and convert immediately.
                </p>

                {/* Video type */}
                <div>
                  <label className="text-text-muted text-xs font-mono block mb-2">Video Type</label>
                  <div className="flex gap-2">
                    {(["youtube", "direct", "none"] as const).map(t => (
                      <button key={t} onClick={() => setHookConfig(p => ({ ...p, videoType: t }))}
                        className={`flex-1 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${hookConfig.videoType === t ? "border-electric/40 bg-electric/10 text-electric" : "border-border-subtle text-text-secondary hover:border-electric/30"}`}>
                        {t === "youtube" ? "🎬 YouTube" : t === "direct" ? "📁 Direct Video URL" : "🚫 No Video"}
                      </button>
                    ))}
                  </div>
                </div>

                {hookConfig.videoType !== "none" && (
                  <div>
                    <label className="text-text-muted text-xs font-mono block mb-1.5">
                      {hookConfig.videoType === "youtube" ? "YouTube URL" : "Direct Video URL (MP4)"}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        {hookConfig.videoType === "youtube"
                          ? <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                          : <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-electric" />}
                        <input value={hookConfig.videoUrl}
                          onChange={e => setHookConfig(p => ({ ...p, videoUrl: e.target.value }))}
                          placeholder={hookConfig.videoType === "youtube" ? "https://www.youtube.com/watch?v=..." : "https://example.com/video.mp4"}
                          className="w-full bg-navy-light border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50" />
                      </div>
                    </div>
                    {hookConfig.videoType === "youtube" && getYTId(hookConfig.videoUrl) && (
                      <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-border-subtle">
                        <iframe src={`https://www.youtube.com/embed/${getYTId(hookConfig.videoUrl)}?rel=0&modestbranding=1`}
                          className="w-full h-full" allowFullScreen title="Preview" />
                      </div>
                    )}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-text-muted text-xs font-mono block mb-1.5">English Headline</label>
                    <input value={hookConfig.headline} onChange={e => setHookConfig(p => ({ ...p, headline: e.target.value }))}
                      className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50" />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs font-mono block mb-1.5">Arabic Headline (العنوان بالعربي)</label>
                    <input value={hookConfig.headlineAr} onChange={e => setHookConfig(p => ({ ...p, headlineAr: e.target.value }))}
                      dir="rtl" className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-text-muted text-xs font-mono block mb-1.5">Subtext</label>
                    <input value={hookConfig.subtext} onChange={e => setHookConfig(p => ({ ...p, subtext: e.target.value }))}
                      className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50" />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs font-mono block mb-1.5">CTA Button Text</label>
                    <input value={hookConfig.ctaText} onChange={e => setHookConfig(p => ({ ...p, ctaText: e.target.value }))}
                      className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50" />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs font-mono block mb-1.5">CTA Link</label>
                    <input value={hookConfig.ctaLink} onChange={e => setHookConfig(p => ({ ...p, ctaLink: e.target.value }))}
                      placeholder="/products" className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50" />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs font-mono block mb-1.5">Delay (seconds before showing)</label>
                    <input type="number" min="0" max="10" value={hookConfig.delay}
                      onChange={e => setHookConfig(p => ({ ...p, delay: Number(e.target.value) }))}
                      className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-electric/50" />
                  </div>
                  <div className="space-y-2 py-1">
                    {[
                      { key: "autoplay" as const, label: "Autoplay video" },
                      { key: "showOnEveryVisit" as const, label: "Show on every visit (not just first)" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center justify-between cursor-pointer">
                        <span className="text-text-secondary text-sm">{label}</span>
                        <button type="button" onClick={() => setHookConfig(p => ({ ...p, [key]: !p[key] }))}
                          className={`relative w-10 h-5 rounded-full transition-colors ${hookConfig[key] ? "bg-electric" : "bg-border-subtle"}`}>
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${hookConfig[key] ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={saveHookConfig}
                  className="flex-1 flex items-center justify-center gap-2 bg-electric text-midnight font-display font-bold py-3.5 rounded-xl hover:shadow-electric transition-all">
                  <Save className="w-4 h-4" /> Save Hook Video Settings
                </button>
                <button onClick={() => { sessionStorage.removeItem("baytzaki_hook_seen_v1"); window.open("/", "_blank"); }}
                  className="flex items-center gap-2 border border-border-subtle text-text-secondary hover:text-electric hover:border-electric/30 px-5 py-3.5 rounded-xl transition-all text-sm">
                  <Play className="w-4 h-4" /> Preview
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// needed for Truck icon
function Truck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1m8-11h4l3 6-3 1m-4-7v7" />
    </svg>
  );
}
