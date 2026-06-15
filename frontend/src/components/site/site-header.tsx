"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AuthButtons } from "./auth-buttons";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/chat", label: "Assistant" },
  { href: "/threads", label: "Threads" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Full-screen app pages (chat) get a slim header instead of floating pill.
  const isApp = pathname?.startsWith("/chat");

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all", isApp ? "py-2" : "py-4")}>
      <div className="container-mantis flex justify-center">
        <nav
          className={cn(
            "flex items-center gap-2 rounded-full border bg-white/85 backdrop-blur-xl transition-all duration-300",
            scrolled || isApp
              ? "border-border-strong shadow-[0_2px_20px_rgba(0,0,0,0.06)] px-3 py-2"
              : "border-border px-4 py-2.5"
          )}
        >
          <Link href="/" className="flex items-center gap-2 pr-2">
            <span className="grid size-8 place-items-center rounded-lg bg-ink text-yellow-pure font-extrabold">
              M
            </span>
            <span className="font-extrabold text-lg tracking-tight">Mantis</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 px-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink hover:bg-surface-2",
                  pathname === n.href && "text-ink bg-surface-2"
                )}
              >
                {n.label}
              </Link>
            ))}
          </div>

          <div className="hidden sm:block pl-1">
            <AuthButtons />
          </div>

          <button
            className="lg:hidden grid size-9 place-items-center rounded-full hover:bg-surface-2"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>
      </div>

      {open && (
        <div className="lg:hidden container-mantis mt-2">
          <div className="card-soft p-2">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-surface-2"
              >
                {n.label}
              </Link>
            ))}
            <div className="p-2">
              <AuthButtons />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
