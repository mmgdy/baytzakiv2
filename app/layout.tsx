import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HookVideo from "@/components/HookVideo";
import { CartProvider } from "@/lib/cart-context";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: { default: "Baytzaki — Smart Home Store Egypt", template: "%s | Baytzaki" },
  description: "Buy smart home products in Egypt — SONOFF, Govee, TP-Link, EZVIZ, LEZN, Fibaro, and more. Free delivery. Real EGP prices.",
  keywords: ["smart home egypt", "sonoff egypt", "TP-Link tapo egypt", "smart switch egypt", "home automation"],
  openGraph: { title: "Baytzaki Smart Home Store", description: "Egypt's leading smart home products store.", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="en" className="dark">
      <body className="bg-midnight text-text-primary font-body antialiased">
        <CartProvider>
          {!isAdmin && <HookVideo />}
          {!isAdmin && <Navbar />}
          <main>{children}</main>
          {!isAdmin && <Footer />}
        </CartProvider>
      </body>
    </html>
  );
}
