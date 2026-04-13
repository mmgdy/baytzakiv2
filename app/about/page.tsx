import Link from "next/link";
import { Zap, Users, Package, Star, MapPin, ChevronRight } from "lucide-react";

const TEAM = [
  { name: "Mohamed Zakaria", role: "Founder & Smart Home Expert", emoji: "👨‍💻" },
  { name: "Technical Team", role: "Installation & Support Engineers", emoji: "🔧" },
  { name: "ARIA", role: "AI Product Assistant", emoji: "🤖" },
];

const VALUES = [
  { icon: "🎯", title: "Customer First", desc: "Every product recommendation is genuinely what's best for you, not the most expensive option." },
  { icon: "🇪🇬", title: "Made for Egypt", desc: "Real EGP prices, Arabic support, Egyptian electrical standards, nationwide delivery." },
  { icon: "📚", title: "Education", desc: "We believe every Egyptian home can be smart. We teach you how — for free, in Arabic." },
  { icon: "🤝", title: "Honest", desc: "No inflated prices. No fake reviews. Transparent about what each product can and cannot do." },
];

export default function AboutPage() {
  return (
    <div className="pt-[88px]">
      {/* Hero */}
      <section className="relative py-20 border-b border-border-subtle overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-electric/10 border border-electric/30 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-electric" />
          </div>
          <h1 className="font-display text-5xl font-extrabold mb-4">
            About <span className="gradient-text">Baytzaki</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            بيت زكي — "Zaki's Home" in Arabic. We're Egypt's dedicated smart home store,
            making intelligent living accessible to every Egyptian family.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-mono text-electric text-sm mb-3">// Our Story</p>
              <h2 className="font-display text-3xl font-bold mb-5">Why We Started</h2>
              <div className="space-y-4 text-text-secondary leading-relaxed">
                <p>Smart home technology was available in Egypt but scattered — expensive international sites, no Arabic support, no one to help you install or understand what you're buying.</p>
                <p>We started Baytzaki to fix that. One store, real prices in EGP, every product explained in Arabic, with Arabic installation videos and an AI that speaks your language.</p>
                <p>Today we carry 69+ products from the world's best smart home brands — all verified, warranted, and ready to ship to your door anywhere in Egypt.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Package, value: "69+", label: "Products" },
                { icon: Users, value: "500+", label: "Happy Customers" },
                { icon: Star, value: "4.8★", label: "Average Rating" },
                { icon: MapPin, value: "All Egypt", label: "We Ship Here" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="glass-card border border-border-subtle rounded-2xl p-5 text-center">
                  <Icon className="w-6 h-6 text-electric mx-auto mb-2" />
                  <p className="font-display font-bold text-2xl text-electric">{value}</p>
                  <p className="text-text-muted text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-navy/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold text-center mb-10">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ icon, title, desc }) => (
              <div key={title} className="glass-card border border-border-subtle rounded-2xl p-5 hover:border-electric/20 transition-all">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-display font-bold mb-2">{title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold text-center mb-10">The Team</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {TEAM.map(({ name, role, emoji }) => (
              <div key={name} className="glass-card border border-border-subtle rounded-2xl p-6 text-center hover:border-electric/20 transition-all">
                <div className="text-5xl mb-3">{emoji}</div>
                <h3 className="font-display font-bold">{name}</h3>
                <p className="text-text-muted text-sm">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center border-t border-border-subtle">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold mb-4">Ready to start?</h2>
          <div className="flex gap-3 justify-center">
            <Link href="/products" className="flex items-center gap-2 bg-electric text-midnight font-bold px-6 py-3 rounded-xl hover:shadow-electric transition-all">
              Shop Now <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="border border-border-subtle text-text-secondary hover:text-electric hover:border-electric/30 px-6 py-3 rounded-xl transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
