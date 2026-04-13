import Link from "next/link";
import { Zap } from "lucide-react";

const FOOTER_LINKS = [
  { label: "Smart Switches",    href: "/products?category=Smart+Switches" },
  { label: "Smart Cameras",     href: "/products?category=Smart+Cameras" },
  { label: "Smart Locks",       href: "/products?category=Smart+Locks" },
  { label: "Video Intercom",    href: "/products?category=Video+Intercom" },
  { label: "Staircase Lighting",href: "/products?category=Staircase+Lighting" },
  { label: "Smart Plugs",       href: "/products?category=Smart+Plugs" },
];

export default function Footer() {
  return (
    <footer className="bg-navy border-t border-border-subtle mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-electric/10 border border-electric/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-electric" />
              </div>
              <span className="font-display font-bold text-lg">BAYT<span className="text-electric">ZAKI</span></span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              Egypt's smartest home products store. SONOFF, Govee, LEZN, Fibaro and more — real EGP prices, ships nationwide.
            </p>
            <p className="text-text-muted text-sm mt-1" dir="rtl">
              متجر المنزل الذكي في مصر · دفع عند الاستلام
            </p>
            <div className="flex gap-2 mt-4">
              {["F","I","T","W"].map(s => (
                <div key={s} className="w-9 h-9 rounded-xl bg-navy-light border border-border-subtle flex items-center justify-center text-xs font-bold text-text-muted hover:text-electric hover:border-electric/30 transition-all cursor-pointer">
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-display font-bold text-sm mb-3">Categories</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-text-muted text-sm hover:text-electric transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-sm mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <a href="https://wa.me/201098327626" target="_blank" rel="noopener" className="text-green-400 hover:text-green-300 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  01098327626
                </a>
              </li>
              <li><a href="mailto:info@baytzaki.com" className="hover:text-electric transition-colors">info@baytzaki.com</a></li>
              <li>Cairo, Egypt</li>
            </ul>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {["✓ Cash on Delivery","✓ Free Returns","✓ Warranty"].map(b => (
                <span key={b} className="text-xs font-mono bg-aurora/10 border border-aurora/20 text-aurora px-2 py-0.5 rounded-full">{b}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} Baytzaki Smart Home. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-electric">Privacy</Link>
            <Link href="/terms" className="hover:text-electric">Terms</Link>
            <Link href="/returns" className="hover:text-electric">Returns</Link>
          </div>
          <p className="font-mono">Powered by Baytzaki ⚡</p>
        </div>
      </div>
    </footer>
  );
}
