"use client";
import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2, Plus, Minus, ChevronRight, ArrowLeft, Package, Truck, Shield, Check, Tag, X, Zap } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/store-products";

const PROMO_CODES: Record<string, number> = {
  BAYTZAKI10: 0.10,
  SMART15: 0.15,
  SONOFF20: 0.20,
  WELCOME5: 0.05,
};

function CartItemRow({ item }: { item: { product: { id: string; name: string; brand: string; sku: string; priceEGP: number; originalPriceEGP?: number; images: { src: string; alt: string }[]; stockQty: number; inStock: boolean; warranty: string; installation: string }; quantity: number } }) {
  const { updateQty, removeItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const { product, quantity } = item;
  const imgSrc = imgError || !product.images?.[0]?.src
    ? `https://placehold.co/100x100/0D1B2A/00B4D8?text=${encodeURIComponent(product.brand)}`
    : product.images[0].src;

  return (
    <div className="flex items-start gap-4 py-5 border-b border-border-subtle last:border-0">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="flex-shrink-0">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-navy-light border border-border-subtle">
          <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-text-muted text-xs font-mono">{product.brand} · {product.sku}</p>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-display font-bold text-sm leading-snug hover:text-electric transition-colors line-clamp-2">{product.name}</h3>
        </Link>
        <p className="text-text-muted text-xs mt-1">{product.warranty} warranty · {product.installation} install</p>

        {/* Mobile price */}
        <div className="flex items-center justify-between mt-2 sm:hidden">
          <div className="flex items-center gap-2 bg-navy-light border border-border-subtle rounded-xl overflow-hidden">
            <button onClick={() => updateQty(product.id, quantity - 1)} className="px-3 py-2 text-text-secondary hover:text-electric hover:bg-electric/10 transition-all">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold text-white px-2 text-sm">{quantity}</span>
            <button onClick={() => updateQty(product.id, Math.min(product.stockQty, quantity + 1))} className="px-3 py-2 text-text-secondary hover:text-electric hover:bg-electric/10 transition-all">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="font-display font-bold text-electric">{formatPrice(product.priceEGP * quantity)}</p>
        </div>
      </div>

      {/* Desktop: Qty + Price + Remove */}
      <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-2 bg-navy-light border border-border-subtle rounded-xl overflow-hidden">
          <button onClick={() => updateQty(product.id, quantity - 1)} className="px-3 py-2 text-text-secondary hover:text-electric hover:bg-electric/10 transition-all">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-display font-bold text-white px-3 py-2 text-sm min-w-[40px] text-center">{quantity}</span>
          <button onClick={() => updateQty(product.id, Math.min(product.stockQty, quantity + 1))} className="px-3 py-2 text-text-secondary hover:text-electric hover:bg-electric/10 transition-all">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-right min-w-[100px]">
          {product.originalPriceEGP && (
            <p className="text-text-muted text-xs line-through">{formatPrice(product.originalPriceEGP * quantity)}</p>
          )}
          <p className="font-display font-bold text-electric text-lg">{formatPrice(product.priceEGP * quantity)}</p>
          <p className="text-text-muted text-xs">{formatPrice(product.priceEGP)} each</p>
        </div>

        <button onClick={() => removeItem(product.id)}
          className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile remove */}
      <button onClick={() => removeItem(product.id)} className="sm:hidden p-1.5 text-text-muted hover:text-red-400 transition-colors flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function CartPage() {
  const { items, count, subtotal, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const discount = appliedPromo ? Math.round(subtotal * appliedPromo.discount) : 0;
  const shipping = subtotal >= 1000 ? 0 : subtotal > 0 ? 50 : 0;
  const total = subtotal - discount + shipping;

  function applyPromo() {
    const code = promoCode.toUpperCase().trim();
    const discountRate = PROMO_CODES[code];
    if (!discountRate) { setPromoError("Invalid promo code"); setPromoSuccess(""); return; }
    if (appliedPromo?.code === code) { setPromoError("Code already applied"); return; }
    setAppliedPromo({ code, discount: discountRate });
    setPromoSuccess(`✓ ${code} applied! ${Math.round(discountRate * 100)}% off`);
    setPromoError("");
    setPromoCode("");
  }

  function placeOrderWhatsApp() {
    const lines = [
      "🛒 *New Order from Baytzaki*",
      "",
      "*Order Summary:*",
      ...items.map(i => `• ${i.product.name} × ${i.quantity} = ${formatPrice(i.product.priceEGP * i.quantity)}`),
      "",
      `Subtotal: ${formatPrice(subtotal)}`,
      discount > 0 ? `Discount (${appliedPromo?.code}): -${formatPrice(discount)}` : null,
      shipping > 0 ? `Shipping: ${formatPrice(shipping)}` : "Shipping: FREE",
      `*Total: ${formatPrice(total)}*`,
      "",
      "Please confirm and share delivery details 📦",
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/201098327626?text=${encodeURIComponent(lines)}`, "_blank");
  }

  function downloadInvoice() {
    const lines = [
      "BAYTZAKI Smart Home Store",
      "baytzaki.com | hello@baytzaki.com",
      "─".repeat(50),
      `Date: ${new Date().toLocaleDateString("en-EG")}`,
      `Invoice #: BZ-${Date.now().toString().slice(-6)}`,
      "─".repeat(50),
      "ITEM                              QTY    PRICE",
      ...items.map(i => `${i.product.name.slice(0, 32).padEnd(32)}  ${String(i.quantity).padStart(3)}  ${formatPrice(i.product.priceEGP * i.quantity)}`),
      "─".repeat(50),
      `Subtotal: ${formatPrice(subtotal).padStart(35)}`,
      discount > 0 ? `Discount: -${formatPrice(discount).padStart(34)}` : null,
      `Shipping: ${(shipping === 0 ? "FREE" : formatPrice(shipping)).padStart(34)}`,
      `TOTAL: ${formatPrice(total).padStart(37)}`,
      "─".repeat(50),
      "Thank you for shopping at Baytzaki!",
    ].filter(Boolean).join("\n");

    const blob = new Blob([lines], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `baytzaki-invoice-${Date.now().toString().slice(-6)}.txt`;
    a.click();
  }

  if (orderPlaced) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-full bg-aurora/20 border border-aurora/30 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-aurora" />
          </div>
          <h1 className="font-display text-3xl font-extrabold mb-3">Order Confirmed! 🎉</h1>
          <p className="text-text-secondary mb-6">Your order has been sent via WhatsApp. Our team will contact you to confirm delivery details and payment.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/products" className="bg-electric text-midnight font-display font-bold px-6 py-3 rounded-xl hover:shadow-electric transition-all">
              Continue Shopping
            </Link>
            <button onClick={() => { clearCart(); setOrderPlaced(false); }} className="border border-border-subtle text-text-secondary px-6 py-3 rounded-xl hover:border-electric/40 transition-all">
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-electric/10 border border-electric/20 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-electric" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-3">Your cart is empty</h1>
          <p className="text-text-secondary mb-6">Discover Egypt's best smart home products and start building your intelligent home.</p>
          <Link href="/products" className="flex items-center justify-center gap-2 bg-electric text-midnight font-display font-bold px-8 py-3.5 rounded-xl hover:shadow-electric transition-all">
            Browse Products <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/products" className="flex items-center gap-2 text-text-muted hover:text-electric text-sm transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
            <h1 className="font-display text-3xl font-extrabold">
              Shopping Cart
              <span className="text-electric ml-2 text-xl">({count} items)</span>
            </h1>
          </div>
          <button onClick={clearCart} className="text-red-400/70 hover:text-red-400 text-sm flex items-center gap-1.5 transition-colors">
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl border border-border-subtle p-6">
              {items.map(item => <CartItemRow key={item.product.id} item={item} />)}
            </div>

            {/* Promo code */}
            <div className="mt-4 glass-card rounded-2xl border border-border-subtle p-5">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-electric" />
                <p className="font-medium text-sm">Promo Code</p>
              </div>
              <div className="flex gap-3">
                <input value={promoCode} onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(""); }}
                  onKeyDown={e => e.key === "Enter" && applyPromo()}
                  placeholder="Enter promo code (e.g. BAYTZAKI10)"
                  className="flex-1 bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-electric/50 transition-colors uppercase" />
                <button onClick={applyPromo} className="bg-electric/10 border border-electric/30 text-electric font-medium px-5 rounded-xl hover:bg-electric/20 transition-all text-sm">
                  Apply
                </button>
              </div>
              {promoError && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><X className="w-3 h-3" />{promoError}</p>}
              {promoSuccess && <p className="text-aurora text-xs mt-1.5 flex items-center gap-1"><Check className="w-3 h-3" />{promoSuccess}</p>}
              {appliedPromo && (
                <div className="mt-2 flex items-center justify-between bg-aurora/10 border border-aurora/20 rounded-lg px-3 py-1.5">
                  <p className="text-aurora text-xs font-mono">{appliedPromo.code} · {Math.round(appliedPromo.discount * 100)}% OFF</p>
                  <button onClick={() => { setAppliedPromo(null); setPromoSuccess(""); }} className="text-aurora hover:text-white text-xs">Remove</button>
                </div>
              )}
              <p className="text-text-muted text-xs mt-2">Try: BAYTZAKI10 · SMART15 · SONOFF20 · WELCOME5</p>
            </div>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="glass-card rounded-2xl border border-border-subtle p-6 sticky top-24">
              <h2 className="font-display font-bold text-lg mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Subtotal ({count} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-aurora">
                    <span>Promo ({appliedPromo?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Shipping</span>
                  <span className={shipping === 0 ? "text-aurora" : ""}>{shipping === 0 ? "FREE 🎉" : formatPrice(shipping)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-text-muted text-xs">Free shipping on orders over EGP 1,000</p>
                )}
                <div className="border-t border-border-subtle pt-3 flex justify-between font-display font-extrabold text-xl">
                  <span>Total</span>
                  <span className="text-electric">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Payment + checkout */}
              <div className="space-y-3">
                <button onClick={() => { placeOrderWhatsApp(); setOrderPlaced(true); }}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-display font-bold py-4 rounded-xl transition-all text-base hover:-translate-y-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Order via WhatsApp
                </button>

                <button onClick={downloadInvoice}
                  className="w-full flex items-center justify-center gap-2 border border-border-subtle text-text-secondary hover:border-electric/40 hover:text-electric font-medium py-3 rounded-xl transition-all text-sm">
                  <Package className="w-4 h-4" /> Download Invoice
                </button>

                <Link href="/contact"
                  className="w-full flex items-center justify-center gap-2 border border-electric/30 text-electric hover:bg-electric/10 font-medium py-3 rounded-xl transition-all text-sm">
                  <Zap className="w-4 h-4" /> Request Custom Quote
                </Link>
              </div>

              {/* Trust */}
              <div className="mt-5 pt-4 border-t border-border-subtle space-y-2">
                {[
                  { icon: Truck, text: "Cash on Delivery available" },
                  { icon: Shield, text: "All products with warranty" },
                  { icon: Package, text: "Professional installation option" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-text-muted text-xs">
                    <Icon className="w-3.5 h-3.5 text-electric flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
