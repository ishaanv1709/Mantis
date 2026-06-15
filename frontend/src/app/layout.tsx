import type { Metadata, Viewport } from "next";
import { Figtree, EB_Garamond } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { CLERK_ENABLED } from "@/lib/config";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PwaRegister } from "@/components/site/pwa-register";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mantis, Diagnose, maintain & fix anything you own",
  description:
    "Mantis turns any manufacturer's manuals into a 24/7 expert technician. Sub-10ms answers grounded in official docs, guided troubleshooting, voice & image diagnosis, and community threads.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Mantis", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const inner = (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <PwaRegister />
    </>
  );

  return (
    <html lang="en" className={`${figtree.variable} ${garamond.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-ground text-ink">
        {CLERK_ENABLED ? <ClerkProvider dynamic>{inner}</ClerkProvider> : inner}
      </body>
    </html>
  );
}
