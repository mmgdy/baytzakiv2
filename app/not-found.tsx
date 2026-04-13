import Link from "next/link";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="pt-[88px] min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-electric/10 border border-electric/20 flex items-center justify-center mx-auto mb-6">
          <Zap className="w-10 h-10 text-electric" />
        </div>
        <p className="font-mono text-electric text-sm mb-2">// Error 404</p>
        <h1 className="font-display text-4xl font-extrabold mb-3">Page Not Found</h1>
        <p className="text-text-secondary mb-8">This page doesn't exist. Maybe it was moved or deleted.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="bg-electric text-midnight font-bold px-6 py-3 rounded-xl hover:shadow-electric transition-all">
            Go Home
          </Link>
          <Link href="/products" className="border border-border-subtle text-text-secondary hover:text-electric hover:border-electric/30 px-6 py-3 rounded-xl transition-all">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
