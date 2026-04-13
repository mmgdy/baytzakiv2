"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ShoppingCart, Plus, Minus, Check, Star, Shield, Truck, RotateCcw,
  ChevronRight, Zap, Wifi, Package, ArrowLeft, Heart, Share2,
  ChevronLeft, Info, Wrench, Award
} from "lucide-react";
import { getProduct, getRelatedProducts, getBadgeStyle, formatPrice, type Product } from "@/lib/store-products";
import { useCart } from "@/lib/cart-context";

function ImageGallery({ images, name }: { images: Product["images"]; name: string }) {
  const [active, setActive] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const fallback = (i: number) => `https://placehold.co/600x600/0D1B2A/00B4D8?text=${encodeURIComponent(name.slice(0, 20))}&font=montserrat`;

  const src = (i: number) => imgErrors[i] || !images[i]?.src ? fallback(i) : images[i].src;

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-navy-light border border-border-subtle">
        <img src={src(active)} alt={images[active]?.alt || name}
          className="w-full h-full object-cover"
          onError={() => setImgErrors(prev => ({ ...prev, [active]: true }))} />

        {images.length > 1 && (
          <>
            <button onClick={() => setActive(p => (p - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-midnight/70 border border-border-subtle text-white flex items-center justify-center hover:bg-midnight transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setActive(p => (p + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-midnight/70 border border-border-subtle text-white flex items-center justify-center hover:bg-midnight transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${active === i ? "border-electric" : "border-border-subtle hover:border-electric/40"}`}>
              <img src={imgErrors[i] ? fallback(i) : img.src} alt={img.alt}
                className="w-full h-full object-cover"
                onError={() => setImgErrors(prev => ({ ...prev, [i]: true }))} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CompatibilityBadge({ name }: { name: string }) {
  const colors: Record<string, string> = {
    "Alexa": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Google Home": "bg-green-500/20 text-green-400 border-green-500/30",
    "Apple HomeKit": "bg-gray-400/20 text-gray-300 border-gray-400/30",
    "Home Assistant": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "eWeLink": "bg-electric/20 text-electric border-electric/30",
    "Tuya": "bg-red-500/20 text-red-400 border-red-500/30",
    "SmartThings": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "IFTTT": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    "Matter": "bg-aurora/20 text-aurora border-aurora/30",
  };
  const cls = colors[name] || "bg-plasma/20 text-plasma border-plasma/30";
  return <span className={`text-xs font-medium px-3 py-1 rounded-full border ${cls}`}>{name}</span>;
}

function RelatedCard({ product }: { product: Product }) {
  const { addItem, isInCart } = useCart();
  const [imgError, setImgError] = useState(false);
  const inCart = isInCart(product.id);
  const imgSrc = imgError || !product.images?.[0]?.src
    ? `https://placehold.co/300x300/0D1B2A/00B4D8?text=${encodeURIComponent(product.brand)}`
    : product.images[0].src;

  return (
    <Link href={`/products/${product.id}`}
      className="glass-card rounded-2xl border border-border-subtle hover:border-electric/30 transition-all group hover:-translate-y-0.5 overflow-hidden">
      <div className="relative h-36 bg-navy-light overflow-hidden">
        <img src={imgSrc} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImgError(true)} />
      </div>
      <div className="p-3">
        <p className="text-text-muted text-xs font-mono">{product.brand}</p>
        <p className="font-display font-bold text-sm line-clamp-2 leading-snug mt-0.5">{product.name}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="font-bold text-electric text-sm">{formatPrice(product.priceEGP)}</p>
          <button onClick={e => { e.preventDefault(); addItem(product, 1); }}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all ${inCart ? "bg-aurora/10 text-aurora" : "bg-electric text-midnight hover:shadow-electric-sm"}`}>
            {inCart ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const product = getProduct(params.id as string);
  if (!product) return notFound();

  const related = getRelatedProducts(product, 4);
  const { addItem, isInCart, items } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"features" | "specs" | "compatibility" | "shipping">("features");

  const inCart = isInCart(product.id);
  const cartItem = items.find(i => i.product.id === product.id);
  const discount = product.originalPriceEGP ? Math.round((1 - product.priceEGP / product.originalPriceEGP) * 100) : 0;

  const handleAdd = useCallback(() => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [addItem, product, qty]);

  const whatsappOrder = () => {
    const msg = encodeURIComponent(`🛒 Order from Baytzaki\n\nProduct: ${product.name}\nSKU: ${product.sku}\nQty: ${qty}\nPrice: ${formatPrice(product.priceEGP * qty)}\n\nPlease confirm availability and shipping details.`);
    window.open(`https://wa.me/201098327626?text=${msg}`, "_blank");
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-text-muted mb-6 font-mono">
          <Link href="/" className="hover:text-electric transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-electric transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-electric transition-colors">{product.category}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-secondary line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          {/* LEFT: Gallery */}
          <ImageGallery images={product.images} name={product.name} />

          {/* RIGHT: Product Info */}
          <div>
            {/* Brand + badges */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-electric text-sm font-mono font-medium">{product.brand}</span>
              {product.badge && <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${getBadgeStyle(product.badgeColor)}`}>{product.badge}</span>}
              {product.isNew && <span className="text-xs font-mono bg-ember/20 text-ember border border-ember/30 px-2 py-0.5 rounded-full">NEW</span>}
              {discount >= 10 && <span className="text-xs font-mono bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">-{discount}%</span>}
            </div>

            <h1 className="font-display text-3xl font-extrabold leading-tight mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.floor(product.rating) ? "text-amber-400 fill-amber-400" : "text-gray-600"}`} />
                ))}
                <span className="text-sm font-medium ml-1">{product.rating}</span>
              </div>
              <span className="text-text-muted text-sm">({product.reviewCount} reviews)</span>
              <span className="text-text-muted text-xs font-mono">SKU: {product.sku}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-display text-4xl font-extrabold text-electric">{formatPrice(product.priceEGP)}</span>
              {product.originalPriceEGP && (
                <span className="text-xl text-text-muted line-through">{formatPrice(product.originalPriceEGP)}</span>
              )}
            </div>
            {discount >= 10 && <p className="text-aurora text-sm font-medium mb-4">You save {formatPrice(product.originalPriceEGP! - product.priceEGP)} ({discount}% off)</p>}

            {/* Short desc */}
            <p className="text-text-secondary leading-relaxed mb-5 text-sm">{product.shortDesc}</p>

            {/* Protocol chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              {product.protocol.map(p => (
                <span key={p} className="flex items-center gap-1 text-xs bg-electric/10 text-electric border border-electric/20 px-3 py-1 rounded-full">
                  <Wifi className="w-3 h-3" /> {p}
                </span>
              ))}
              <span className={`text-xs px-3 py-1 rounded-full border ${product.inStock ? "bg-aurora/10 text-aurora border-aurora/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                {product.inStock ? `✓ In Stock (${product.stockQty} left)` : "Out of Stock"}
              </span>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-text-muted text-sm w-20">Quantity:</span>
                <div className="flex items-center border border-border-subtle rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2.5 text-text-secondary hover:text-electric hover:bg-electric/10 transition-all">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 py-2.5 font-display font-bold text-white border-x border-border-subtle min-w-[48px] text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stockQty, q + 1))} className="px-3 py-2.5 text-text-secondary hover:text-electric hover:bg-electric/10 transition-all">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-text-muted text-sm">{formatPrice(product.priceEGP * qty)} total</span>
              </div>

              <div className="flex gap-3">
                <button onClick={handleAdd} disabled={!product.inStock}
                  className={`flex-1 flex items-center justify-center gap-2 font-display font-bold py-4 rounded-xl transition-all text-base ${
                    added
                      ? "bg-aurora text-midnight"
                      : "bg-electric text-midnight hover:shadow-electric hover:-translate-y-0.5"
                  } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0`}>
                  {added
                    ? <><Check className="w-5 h-5" /> Added to Cart!</>
                    : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                  }
                </button>
                <button onClick={whatsappOrder} disabled={!product.inStock}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-display font-bold px-5 rounded-xl transition-all disabled:opacity-40">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Order on WhatsApp
                </button>
              </div>

              {inCart && (
                <div className="flex items-center justify-between bg-aurora/10 border border-aurora/20 rounded-xl px-4 py-2.5">
                  <p className="text-aurora text-sm">✓ {cartItem?.quantity} unit(s) in your cart</p>
                  <Link href="/cart" className="text-aurora text-xs font-mono hover:underline">View Cart →</Link>
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: Truck, text: "Free Delivery Over EGP 1,000" },
                { icon: RotateCcw, text: "14-Day Free Returns" },
                { icon: Shield, text: `${product.warranty} Warranty` },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 p-3 bg-navy-light rounded-xl border border-border-subtle text-center">
                  <Icon className="w-5 h-5 text-electric" />
                  <p className="text-text-muted text-xs leading-tight">{text}</p>
                </div>
              ))}
            </div>

            {/* Installation */}
            <div className="flex items-center gap-2 text-sm text-text-secondary bg-navy-light rounded-xl px-4 py-3 border border-border-subtle">
              <Wrench className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Installation: <span className="text-white font-medium">{product.installation}</span></span>
              {product.installation !== "DIY" && (
                <Link href="/contact" className="ml-auto text-electric text-xs hover:underline">Book installer →</Link>
              )}
            </div>
          </div>
        </div>

        {/* TABS: Features / Specs / Compatibility / Shipping */}
        <div className="mb-12">
          <div className="flex gap-1 border-b border-border-subtle mb-6 overflow-x-auto">
            {(["features", "specs", "compatibility", "shipping"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap capitalize border-b-2 transition-all -mb-px ${
                  activeTab === tab ? "border-electric text-electric" : "border-transparent text-text-secondary hover:text-text-primary"
                }`}>
                {tab === "compatibility" ? "Works With" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "features" && (
            <div>
              <p className="text-text-secondary leading-relaxed mb-6">{product.longDesc}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {product.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-navy-light rounded-xl border border-border-subtle">
                    <div className="w-5 h-5 rounded-full bg-electric/20 border border-electric/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-electric" />
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed">{f}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="glass-card rounded-2xl border border-border-subtle overflow-hidden">
              <table className="w-full">
                <tbody>
                  {product.specs.map((spec, i) => (
                    <tr key={i} className={`border-b border-border-subtle last:border-0 ${i % 2 === 0 ? "" : "bg-navy-light/30"}`}>
                      <td className="px-5 py-3 text-sm text-text-muted font-medium w-40">{spec.label}</td>
                      <td className="px-5 py-3 text-sm text-text-primary">{spec.value}</td>
                    </tr>
                  ))}
                  {product.weight && (
                    <tr className="border-b border-border-subtle"><td className="px-5 py-3 text-sm text-text-muted font-medium">Weight</td><td className="px-5 py-3 text-sm text-text-primary">{product.weight}</td></tr>
                  )}
                  {product.dimensions && (
                    <tr className="border-b border-border-subtle"><td className="px-5 py-3 text-sm text-text-muted font-medium">Dimensions</td><td className="px-5 py-3 text-sm text-text-primary">{product.dimensions}</td></tr>
                  )}
                  {product.color && (
                    <tr><td className="px-5 py-3 text-sm text-text-muted font-medium">Color</td><td className="px-5 py-3 text-sm text-text-primary">{product.color}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "compatibility" && (
            <div>
              <div className="flex flex-wrap gap-2 mb-6">
                {product.compatibility.map(c => <CompatibilityBadge key={c} name={c} />)}
              </div>
              <div className="glass-card rounded-2xl border border-border-subtle p-5">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-electric flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm mb-1">Setup Notes</p>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      This product connects via {product.protocol.join(" and ")}. {product.protocol.includes("Zigbee") && "A Zigbee-compatible hub is required (e.g. SONOFF Zigbee Bridge Pro, Aqara Hub M2, Amazon Echo Plus, or Home Assistant with a USB dongle). "}
                      {product.installation === "DIY" && "Installation is DIY-friendly and can be completed without an electrician."}
                      {product.installation === "Electrician" && "Installation requires a qualified electrician to wire into your electrical system."}
                      {product.installation === "Technician" && "Professional installation by a smart home technician is recommended."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Truck, title: "Cairo & Giza", time: "1–2 business days", price: "EGP 50 (Free over EGP 1,000)" },
                { icon: Truck, title: "Alex & Delta", time: "2–3 business days", price: "EGP 70 (Free over EGP 1,500)" },
                { icon: Truck, title: "Upper Egypt", time: "3–5 business days", price: "EGP 100 (Free over EGP 2,000)" },
                { icon: Package, title: "Bulky Items", time: "Scheduled delivery", price: "Contact us for quote" },
                { icon: RotateCcw, title: "Returns Policy", time: "14 days", price: "Free returns on defective items" },
                { icon: Shield, title: "Warranty", time: product.warranty, price: "Manufacturer warranty included" },
              ].map(({ icon: Icon, title, time, price }) => (
                <div key={title} className="flex items-start gap-3 glass-card rounded-xl border border-border-subtle p-4">
                  <Icon className="w-5 h-5 text-electric flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{title}</p>
                    <p className="text-electric text-xs font-mono">{time}</p>
                    <p className="text-text-muted text-xs mt-0.5">{price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl font-bold">You Might Also Like</h2>
              <Link href="/products" className="flex items-center gap-1 text-electric text-sm hover:gap-2 transition-all">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map(p => <RelatedCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
