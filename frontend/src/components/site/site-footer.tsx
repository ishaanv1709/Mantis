import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface mt-24">
      <div className="container-mantis py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-ink text-yellow-pure font-extrabold">
                M
              </span>
              <span className="font-extrabold text-lg">Mantis</span>
            </div>
            <p className="mt-3 text-sm text-muted max-w-xs">
              The assistant for your products. Diagnose, maintain and fix anything you own,               grounded in official manuals.
            </p>
          </div>
          <FooterCol
            title="Platform"
            links={[
              ["Marketplace", "/marketplace"],
              ["Assistant", "/chat"],
              ["Threads", "/threads"],
              ["Dashboard", "/dashboard"],
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              ["About", "/about"],
              ["FAQ", "/faq"],
            ]}
          />
          <FooterCol
            title="Powered by"
            links={[
              ["Moss, sub-10ms search", "https://moss.dev"],
              ["Groq, Llama 3.3 70B", "https://groq.com"],
            ]}
          />
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted-2 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Mantis. Built for PClub × MOSS.</p>
          <p className="serif-accent text-ink">Information already exists. We make it accessible.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-2">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-sm text-muted hover:text-ink transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
