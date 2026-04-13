import Link from "next/link";
import { Wrench, Wifi, Video, Zap, ChevronRight, Check, Phone } from "lucide-react";

const SERVICES = [
  {
    icon: Wrench,
    title: "Smart Switch Installation",
    titleAr: "تركيب المفاتيح الذكية",
    desc: "Professional installation of SONOFF and smart switches in your home. Includes wiring, app setup, and Alexa/Google integration.",
    price: "From EGP 500",
    features: ["On-site wiring","App configuration","Voice control setup","2-year support"],
    color: "electric",
  },
  {
    icon: Video,
    title: "Camera & Security System",
    titleAr: "كاميرات المراقبة والأمان",
    desc: "Full CCTV and smart camera installation — indoor, outdoor, NVR setup, remote viewing, and motion alerts.",
    price: "From EGP 1,200",
    features: ["Camera mounting","NVR/hub setup","Remote viewing","Night vision testing"],
    color: "plasma",
  },
  {
    icon: Zap,
    title: "Full Smart Home Package",
    titleAr: "باقة المنزل الذكي الكاملة",
    desc: "Transform your entire home — switches, plugs, curtains, cameras, sensors, smart locks, and more. Complete Baytzaki smart home experience.",
    price: "From EGP 8,000",
    features: ["Free consultation","All products included","Professional installation","1-year tech support","Arabic video tutorials"],
    color: "aurora",
    featured: true,
  },
  {
    icon: Wifi,
    title: "Smart Lock & Intercom",
    titleAr: "الأقفال الذكية والإنتركوم",
    desc: "Installation of smart locks (face recognition, fingerprint) and video intercom systems for villas and apartments.",
    price: "From EGP 800",
    features: ["Door fitting","App setup","Multiple user codes","Video intercom wiring"],
    color: "ember",
  },
];

const PROCESS = [
  { step: "01", title: "Consult", desc: "WhatsApp or call us — we assess your home and needs" },
  { step: "02", title: "Quote", desc: "Get a free detailed quote within 24 hours" },
  { step: "03", title: "Install", desc: "Our certified technician installs everything" },
  { step: "04", title: "Train", desc: "We walk you through all apps and voice commands" },
];

export default function ServicesPage() {
  return (
    <div className="pt-[88px]">
      {/* Hero */}
      <section className="relative py-16 border-b border-border-subtle overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-mono text-electric text-sm mb-3">// Smart Home Services Egypt</p>
          <h1 className="font-display text-5xl font-extrabold mb-4">
            Professional <span className="gradient-text">Installation</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            Buy from Baytzaki and let our certified technicians install everything.
            We cover Cairo, Giza, Alexandria, and all major cities.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {SERVICES.map(({ icon: Icon, title, titleAr, desc, price, features, color, featured }) => (
              <div key={title}
                className={`glass-card rounded-2xl border p-6 transition-all relative ${
                  featured ? "border-aurora/40 bg-aurora/5" : "border-border-subtle hover:border-electric/20"
                }`}>
                {featured && (
                  <span className="absolute top-4 right-4 text-xs font-mono bg-aurora/20 text-aurora border border-aurora/30 px-2 py-0.5 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className={`w-12 h-12 rounded-2xl bg-${color}/10 border border-${color}/20 flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 text-${color}`} />
                </div>
                <h3 className="font-display font-bold text-xl mb-0.5">{title}</h3>
                <p className="text-text-muted text-sm font-mono mb-3" dir="rtl">{titleAr}</p>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">{desc}</p>
                <ul className="space-y-1.5 mb-5">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                      <Check className="w-3.5 h-3.5 text-aurora flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between">
                  <span className={`font-display font-bold text-xl text-${color}`}>{price}</span>
                  <Link href="/contact"
                    className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all ${
                      featured ? "bg-aurora text-midnight hover:shadow-[0_0_20px_rgba(0,255,179,0.3)]" : "border border-border-subtle hover:border-electric/40 hover:text-electric"
                    }`}>
                    Book Now <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-navy/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid sm:grid-cols-4 gap-6">
            {PROCESS.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-electric/10 border border-electric/20 flex items-center justify-center mx-auto mb-3">
                  <span className="font-mono font-bold text-electric text-sm">{step}</span>
                </div>
                <h3 className="font-display font-bold mb-1">{title}</h3>
                <p className="text-text-muted text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to Book?</h2>
          <p className="text-text-secondary mb-6">WhatsApp us now and we'll get back to you within the hour.</p>
          <div className="flex gap-3 justify-center">
            <a href="https://wa.me/201098327626?text=I'd like to book a smart home installation service"
              target="_blank" rel="noopener"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl transition-all">
              <Phone className="w-4 h-4" /> WhatsApp Us
            </a>
            <Link href="/contact" className="border border-border-subtle text-text-secondary hover:text-electric hover:border-electric/30 px-6 py-3 rounded-xl transition-all">
              Contact Form
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
