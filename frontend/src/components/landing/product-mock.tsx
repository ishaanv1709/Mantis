"use client";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Bot, FileText, ShieldAlert, Wrench, PackageSearch, CalendarClock, Search } from "lucide-react";

export function ProductMock() {
  return (
    <section className="-mt-10 lg:-mt-24">
      <ContainerScroll
        titleComponent={
          <div className="mb-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-2">See it work</p>
            <h2 className="display mt-2 text-3xl sm:text-5xl">A technician in every product page.</h2>
            <div className="mt-5 inline-flex gap-1 rounded-full border border-border bg-white p-1 text-sm">
              {["Diagnose", "Maintenance", "Parts"].map((t, i) => (
                <span
                  key={t}
                  className={`rounded-full px-4 py-1.5 font-medium ${i === 0 ? "bg-ink text-white" : "text-muted"}`}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        }
      >
        <div className="grid h-full w-full grid-cols-1 bg-white text-left md:grid-cols-[1fr_240px]">
          {/* main chat */}
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 border-b border-border px-5 py-3">
              <span className="grid size-8 place-items-center rounded-lg bg-ink text-yellow-pure font-bold">M</span>
              <div>
                <p className="text-sm font-semibold text-ink">Acme Washer WX-500 · Assistant</p>
                <p className="text-xs text-muted-2">Grounded in the official service manual</p>
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-hidden p-5">
              <div className="ml-auto w-fit max-w-[75%] rounded-2xl bg-surface-2 px-4 py-2.5 text-sm">
                My washing machine won&apos;t drain and shows E20.
              </div>
              <div className="flex items-start gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-border"><Bot className="size-4" /></span>
                <div className="max-w-[85%] space-y-3 text-sm">
                  <p>
                    E20 means the <b>drain pump filter is clogged</b>. Let&apos;s clear it, this is a safe DIY fix.
                  </p>
                  <ol className="ml-4 list-decimal space-y-1 text-muted">
                    <li>Turn off power and open the lower access panel.</li>
                    <li>Place a towel, unscrew the filter counter-clockwise, remove debris.</li>
                    <li>Refit and run a rinse cycle to confirm draining.</li>
                  </ol>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700"><Wrench className="size-3" /> DIY 3/10</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600"><ShieldAlert className="size-3" /> Unplug first</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted"><PackageSearch className="size-3" /> Part WX5-FILT · $24.99</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2 rounded-2xl border border-border px-3 py-2 text-sm text-muted-2">
                <Search className="size-4" /> Ask anything…
              </div>
            </div>
          </div>

          {/* sources / context panel */}
          <aside className="hidden flex-col gap-3 border-l border-border bg-surface p-4 md:flex">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-2">Sources</p>
            {[
              { t: "Drain & errors", p: "p.1" },
              { t: "Safety warnings", p: "p.2" },
              { t: "Spare parts", p: "p.4" },
            ].map((s) => (
              <div key={s.t} className="flex items-center gap-2 rounded-xl border border-border bg-white p-2.5 text-xs">
                <FileText className="size-3.5 text-muted" />
                <span className="flex-1 font-medium">{s.t}</span>
                <span className="text-muted-2">{s.p}</span>
              </div>
            ))}
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-cream p-2.5 text-xs">
              <CalendarClock className="size-3.5" /> Next service in 180 days
            </div>
          </aside>
        </div>
      </ContainerScroll>
    </section>
  );
}
