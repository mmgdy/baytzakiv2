"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Zap, ShoppingCart, Search, Brain } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const NAV = [
  { href: "/",             label: "Home"      },
  { href: "/products",     label: "Shop"      },
  { href: "/services",     label: "Services"  },
  { href: "/ai-assistant", label: "AI"        },
  { href: "/about",        label: "About"     },
  { href: "/contact",      label: "Contact"   },
];

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal]   = useState("");
  const pathname = usePathname();
  const { count } = useCart();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMobileOpen(false); setSearchOpen(false); }, [pathname]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchVal.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchVal)}`;
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-midnight/90 backdrop-blur-xl border-b border-border-subtle shadow-[0_4px_30px_rgba(0,0,0,0.4)]" : "bg-transparent"}`}>
      {/* Announcement */}
      <div className="bg-electric/10 border-b border-electric/20 text-center py-1.5 px-4">
        <p className="text-xs font-mono text-electric truncate">
          🚀 Free delivery on orders over EGP 1,000 ·{" "}
          <Link href="/contact" className="underline hover:text-white transition-colors">Book Installation</Link>
          {" "}· Cash on Delivery
        </p>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0 mr-4">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-electric rounded-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-8 h-8 bg-navy-card border border-electric/40 rounded-lg flex items-center justify-center group-hover:border-electric transition-all group-hover:shadow-electric-sm">
              <Zap className="w-4 h-4 text-electric" />
            </div>
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            BAYT<span className="text-electric">ZAKI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-0.5 flex-1">
          {NAV.map(({ href, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all ${active ? "text-electric bg-electric/10" : "text-text-secondary hover:text-text-primary hover:bg-navy-light"}`}>
                {active && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-electric" />}
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Search */}
          {searchOpen ? (
            <div className="flex items-center gap-2 glass-card border border-electric/30 rounded-xl px-3 py-1.5">
              <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
              <input autoFocus value={searchVal} onChange={e => setSearchVal(e.target.value)} onKeyDown={handleSearch}
                placeholder="Search..." className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none w-36" />
              <button onClick={() => { setSearchOpen(false); setSearchVal(""); }}><X className="w-4 h-4 text-text-muted hover:text-white" /></button>
            </div>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="hidden md:flex p-2 text-text-secondary hover:text-electric transition-colors rounded-lg hover:bg-electric/10">
              <Search className="w-5 h-5" />
            </button>
          )}

          <Link href="/ai-assistant"
            className="hidden md:flex items-center gap-1.5 bg-electric/10 border border-electric/30 text-electric text-xs font-medium px-3 py-2 rounded-lg hover:bg-electric/20 hover:border-electric/60 transition-all">
            <span className="w-1.5 h-1.5 rounded-full bg-electric status-pulse" />ARIA
          </Link>

          <Link href="/cart"
            className="relative flex items-center gap-1.5 bg-electric text-midnight font-display font-bold px-4 py-2 rounded-lg hover:shadow-electric transition-all hover:-translate-y-0.5 text-sm">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-aurora text-midnight text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-lg leading-none">
                {count > 99 ? "99" : count}
              </span>
            )}
          </Link>

          <button className="lg:hidden p-2 text-text-secondary hover:text-text-primary" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile */}
      {mobileOpen && (
        <div className="lg:hidden bg-navy/95 backdrop-blur-xl border-b border-border-subtle">
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center gap-2 glass-card border border-border-subtle rounded-xl px-3 py-2.5">
              <Search className="w-4 h-4 text-text-muted" />
              <input value={searchVal} onChange={e => setSearchVal(e.target.value)} onKeyDown={handleSearch}
                placeholder="Search products..." className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none" />
            </div>
          </div>
          <div className="flex flex-col px-4 py-2 gap-1">
            {NAV.map(({ href, label }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link key={href} href={href}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? "text-electric bg-electric/10" : "text-text-secondary hover:text-text-primary hover:bg-navy-light"}`}>
                  {label}
                </Link>
              );
            })}
          </div>
          <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
            <Link href="/ai-assistant" className="flex items-center justify-center gap-2 border border-electric/30 text-electric py-3 rounded-xl hover:bg-electric/10 text-sm">
              <Brain className="w-4 h-4" /> ARIA AI Assistant
            </Link>
            <Link href="/cart" className="relative flex items-center justify-center gap-2 bg-electric text-midnight font-display font-bold py-3 rounded-xl text-sm">
              <ShoppingCart className="w-4 h-4" /> Cart{count > 0 ? ` (${count} items)` : ""}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
