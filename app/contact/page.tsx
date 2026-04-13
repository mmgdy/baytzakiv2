"use client";
import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, Check } from "lucide-react";

const CONTACT_INFO = [
  { icon: Phone,  label: "WhatsApp / Phone",  value: "01098327626",       href: "https://wa.me/201098327626" },
  { icon: Mail,   label: "Email",              value: "info@baytzaki.com",  href: "mailto:info@baytzaki.com" },
  { icon: MapPin, label: "Location",           value: "Cairo, Egypt",       href: "#" },
  { icon: Clock,  label: "Working Hours",      value: "Sat–Thu  9am–9pm",  href: "#" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // Send via WhatsApp
    const text = `New Message from Baytzaki Contact Form\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`;
    window.open(`https://wa.me/201098327626?text=${encodeURIComponent(text)}`, "_blank");
    setTimeout(() => { setSending(false); setSent(true); }, 1000);
  }

  return (
    <div className="pt-[88px]">
      {/* Hero */}
      <section className="relative py-16 border-b border-border-subtle overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <p className="font-mono text-electric text-sm mb-2">// Get in Touch</p>
          <h1 className="font-display text-5xl font-extrabold mb-3">
            Contact <span className="gradient-text">Baytzaki</span>
          </h1>
          <p className="text-text-secondary max-w-lg">
            Have a question about a product? Need a quote? Want to book installation?
            We reply on WhatsApp within minutes.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="glass-card rounded-2xl border border-border-subtle p-8">
            <h2 className="font-display font-bold text-xl mb-6">Send a Message</h2>
            {sent ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-aurora/20 border border-aurora/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-aurora" />
                </div>
                <p className="font-display font-bold text-xl mb-2">Message Sent! 🎉</p>
                <p className="text-text-secondary text-sm">Your message was sent to WhatsApp. We'll reply within the hour.</p>
                <button onClick={() => setSent(false)} className="mt-5 text-electric text-sm hover:underline">Send another</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: "name",    label: "Your Name",   placeholder: "Ahmed Hassan",        required: true },
                    { key: "email",   label: "Email",       placeholder: "you@email.com",        required: false, type: "email" },
                    { key: "phone",   label: "Phone / WhatsApp", placeholder: "01X XXXX XXXX",  required: true },
                    { key: "subject", label: "Subject",     placeholder: "e.g. Smart lock quote",required: true },
                  ].map(({ key, label, placeholder, required, type }) => (
                    <div key={key}>
                      <label className="text-text-muted text-xs font-mono block mb-1.5">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
                      <input
                        type={type || "text"}
                        value={(form as any)[key]}
                        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        required={required}
                        className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-electric/50 transition-colors"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-text-muted text-xs font-mono block mb-1.5">Message<span className="text-red-400 ml-0.5">*</span></label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Tell us what you need — installation, product question, bulk order..."
                    required rows={5}
                    className="w-full bg-navy-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-electric/50 resize-none transition-colors"
                  />
                </div>
                <button type="submit" disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-electric text-midnight font-display font-bold py-3.5 rounded-xl hover:shadow-electric transition-all disabled:opacity-50">
                  <Send className="w-4 h-4" />
                  {sending ? "Sending..." : "Send via WhatsApp"}
                </button>
                <p className="text-text-muted text-xs text-center">Message will open in WhatsApp — the fastest way to reach us.</p>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined}
                  className="flex items-center gap-4 glass-card border border-border-subtle rounded-2xl p-4 hover:border-electric/30 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-electric/10 border border-electric/20 flex items-center justify-center flex-shrink-0 group-hover:bg-electric/20 transition-all">
                    <Icon className="w-5 h-5 text-electric" />
                  </div>
                  <div>
                    <p className="text-text-muted text-xs font-mono">{label}</p>
                    <p className="font-medium text-sm">{value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a href="https://wa.me/201098327626?text=مرحباً! أريد الاستفسار عن منتجات بيت زكي"
              target="_blank" rel="noopener"
              className="flex items-center justify-center gap-3 w-full bg-green-600 hover:bg-green-500 text-white font-display font-bold py-4 rounded-2xl transition-all text-base">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Chat on WhatsApp — We reply in minutes
            </a>

            {/* Map placeholder */}
            <div className="glass-card border border-border-subtle rounded-2xl p-5 text-center">
              <MapPin className="w-8 h-8 text-electric mx-auto mb-2" />
              <p className="font-medium">Cairo, Egypt</p>
              <p className="text-text-muted text-sm mt-1">We serve all of Egypt — nationwide delivery available.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
