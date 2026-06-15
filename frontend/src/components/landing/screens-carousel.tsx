"use client";
import {
  Bot,
  CalendarClock,
  MessageSquare,
  Mic,
  ShieldCheck,
  Star,
  Home,
  Wrench,
  User,
  Search,
  ArrowBigUp,
  ChevronRight,
  Camera,
  Send,
  Plus,
} from "lucide-react";

function Phone({
  label,
  children,
  tone = "#ffffff",
  active = 0,
}: {
  label: string;
  children: React.ReactNode;
  tone?: string;
  active?: number;
}) {
  const dark = tone === "#0f0f0f";
  const tabs = [Home, MessageSquare, Wrench, User];
  return (
    <div className="w-[214px] shrink-0">
      <p className="mb-2 text-center text-sm font-semibold text-muted">{label}</p>
      <div className="relative rounded-[2rem] border-[6px] border-ink bg-ink p-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)]">
        <div className="relative flex h-[400px] flex-col overflow-hidden rounded-[1.5rem]" style={{ background: tone }}>
          {/* status bar */}
          <div className={`flex items-center justify-between px-4 pt-2 text-[10px] font-semibold ${dark ? "text-white/70" : "text-ink/70"}`}>
            <span>9:41</span>
            <span>▦ ▿ ▮</span>
          </div>
          {/* content */}
          <div className="flex-1 overflow-hidden px-3 pt-2">{children}</div>
          {/* bottom tab bar */}
          <div className={`mt-auto flex items-center justify-around border-t px-2 py-2 ${dark ? "border-white/10" : "border-border"}`}>
            {tabs.map((Icon, i) => (
              <span
                key={i}
                className={`grid size-7 place-items-center rounded-lg ${
                  i === active
                    ? dark
                      ? "bg-white/15 text-yellow-pure"
                      : "bg-ink text-yellow-pure"
                    : dark
                    ? "text-white/40"
                    : "text-muted-2"
                }`}
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 px-1 text-[15px] font-extrabold text-ink">{children}</h3>;
}

const SCREENS = [
  {
    label: "Diagnose",
    active: 1,
    node: (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 pb-2">
          <span className="grid size-6 place-items-center rounded-md bg-ink text-[10px] font-bold text-yellow-pure">M</span>
          <div className="leading-tight">
            <p className="text-[11px] font-bold">Zip Scooter S2</p>
            <p className="text-[9px] text-muted-2">Manual-grounded</p>
          </div>
        </div>
        <div className="flex-1 space-y-2 overflow-hidden text-[11px]">
          <p className="ml-auto w-fit rounded-xl bg-surface-2 px-2.5 py-1.5">Horn isn&apos;t working</p>
          <div className="flex items-start gap-1.5">
            <span className="grid size-5 shrink-0 place-items-center rounded-full border border-border"><Bot className="size-3" /></span>
            <div className="space-y-1">
              <p>Does the headlight work too?</p>
            </div>
          </div>
          <p className="ml-auto w-fit rounded-xl bg-surface-2 px-2.5 py-1.5">No, that&apos;s dead as well</p>
          <div className="flex items-start gap-1.5">
            <span className="grid size-5 shrink-0 place-items-center rounded-full border border-border"><Bot className="size-3" /></span>
            <div className="space-y-1">
              <p>Likely a blown main fuse.</p>
              <span className="inline-block rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold">Check Fuse F3 · p.12</span>
              <div className="flex gap-1 pt-0.5">
                <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[9px] font-semibold text-green-700">DIY 2/10</span>
                <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[9px] text-muted">Part F3-10A</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 text-[10px] text-muted-2">
          <Camera className="size-3" /> Ask anything…
          <span className="ml-auto grid size-5 place-items-center rounded-full bg-ink text-white"><Send className="size-2.5" /></span>
        </div>
      </div>
    ),
  },
  {
    label: "Voice",
    tone: "#0f0f0f",
    active: 1,
    node: (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-white">
        <p className="text-[11px] text-white/60">Hands-free troubleshooting</p>
        <span className="grid size-16 place-items-center rounded-full bg-white/10"><Mic className="size-7 text-yellow-pure" /></span>
        <div className="flex items-end gap-1">
          {[10, 22, 14, 30, 18, 26, 12, 20].map((h, i) => (
            <span key={i} className="w-1.5 rounded-full bg-yellow-pure" style={{ height: h }} />
          ))}
        </div>
        <p className="text-[11px] text-white/70">“The filter light is on…”</p>
        <div className="mt-2 w-full space-y-1.5 px-1 text-[10px] text-white/80">
          <div className="rounded-lg bg-white/10 p-2">Step 1 · Twist the bin off counter-clockwise</div>
          <div className="rounded-lg bg-white/5 p-2">Step 2 · Rinse the purple filter</div>
        </div>
      </div>
    ),
  },
  {
    label: "Maintenance",
    active: 2,
    node: (
      <div className="flex h-full flex-col">
        <ScreenTitle>Upcoming</ScreenTitle>
        <div className="space-y-1.5 text-[11px]">
          {[
            ["Clean drain filter", "Overdue", true],
            ["Inspect door seal", "in 12d", false],
            ["Replace HEPA filter", "in 40d", false],
            ["Tyre pressure check", "in 55d", false],
          ].map(([t, due, over]) => (
            <div key={t as string} className="flex items-center gap-2 rounded-lg border border-border p-2">
              <CalendarClock className="size-3.5 text-muted" />
              <span className="flex-1">{t}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${over ? "bg-red-50 text-red-600" : "bg-surface-2 text-muted"}`}>{due}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-cream p-2.5 text-[10px]">
          <p className="font-semibold">2 products tracked</p>
          <p className="text-muted">Washer · Scooter</p>
        </div>
        <button className="mt-auto flex items-center justify-center gap-1 rounded-full bg-ink py-1.5 text-[10px] font-semibold text-white">
          <Plus className="size-3" /> Add product
        </button>
      </div>
    ),
  },
  {
    label: "Threads",
    active: 1,
    node: (
      <div className="flex h-full flex-col">
        <div className="mb-2 flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 text-[10px] text-muted-2">
          <Search className="size-3" /> Search r/washers
        </div>
        <div className="space-y-1.5 text-[11px]">
          {[
            ["E20 on my washer?", 24, true],
            ["Best detergent for eco mode?", 11, false],
            ["Door stuck after wash", 7, false],
          ].map(([t, v, off]) => (
            <div key={t as string} className="flex gap-2 rounded-lg border border-border p-2">
              <div className="flex flex-col items-center">
                <ArrowBigUp className="size-3.5 text-muted" />
                <span className="text-[9px] font-bold">{v as number}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold leading-tight">{t}</p>
                <div className="mt-0.5 flex items-center gap-1 text-[9px] text-muted-2">
                  <MessageSquare className="size-2.5" /> replies
                  {off ? <span className="rounded-full bg-ink px-1.5 text-white">Official</span> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 rounded-lg bg-surface-2 p-2 text-[10px] text-muted">Cleared the filter, fixed! 🙌</div>
      </div>
    ),
  },
  {
    label: "Health score",
    active: 3,
    node: (
      <div className="flex h-full flex-col">
        <ScreenTitle>WX-500 insights</ScreenTitle>
        <div className="flex items-center gap-3">
          <span className="grid size-16 shrink-0 place-items-center rounded-full text-base font-extrabold" style={{ background: "conic-gradient(#16a34a 280deg, var(--surface-2) 0)" }}>
            <span className="grid size-11 place-items-center rounded-full bg-white">78</span>
          </span>
          <div className="text-[10px]">
            <p className="font-bold">Health score</p>
            <p className="text-muted">★ 4.3 · 132 sessions</p>
          </div>
        </div>
        <p className="mt-3 px-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-2">Top problems</p>
        <div className="mt-1.5 space-y-1.5 text-[10px]">
          {[["Won't drain", 90], ["No water", 60], ["Door stuck", 35]].map(([t, w]) => (
            <div key={t as string} className="flex items-center gap-1.5">
              <span className="w-16 truncate">{t}</span>
              <span className="h-2 flex-1 rounded-full bg-surface-2">
                <span className="block h-full rounded-full bg-yellow-pure" style={{ width: `${w}%` }} />
              </span>
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-1.5 rounded-lg bg-cream p-2 text-[10px]">
          💡 Fix drainage in v2
        </div>
      </div>
    ),
  },
  {
    label: "Warranty",
    active: 3,
    node: (
      <div className="flex h-full flex-col">
        <ScreenTitle>My coverage</ScreenTitle>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-700">
            <ShieldCheck className="size-4" />
            <div className="leading-tight">
              <p className="font-semibold">Scooter S2</p>
              <p className="text-[10px]">Expires in 20 days</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border p-2">
            <ShieldCheck className="size-4 text-muted" />
            <div className="leading-tight">
              <p className="font-semibold">Washer WX-500</p>
              <p className="text-[10px] text-muted-2">Covered · 200 days</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2 text-red-600">
            ⚠ Safety notice · door seal
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-border p-2 text-[11px]">
          <span className="flex items-center gap-1"><Star className="size-3.5 fill-yellow-pure text-yellow-pure" /> Rate product</span>
          <ChevronRight className="size-3.5 text-muted-2" />
        </div>
      </div>
    ),
  },
];

export function ScreensCarousel() {
  const items = [...SCREENS, ...SCREENS];
  return (
    <section className="overflow-hidden py-24 bg-surface border-y border-border">
      <div className="container-mantis text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-2">One app, everything</p>
        <h2 className="display mt-3 text-3xl sm:text-5xl">
          Find answers in <span className="serif-accent text-gradient">seconds.</span>
        </h2>
      </div>
      <div className="marquee-mask marquee-pause mt-14">
        <div className="marquee-track gap-6 px-4">
          {items.map((s, i) => (
            <Phone key={i} label={s.label} tone={s.tone} active={s.active}>
              {s.node}
            </Phone>
          ))}
        </div>
      </div>
    </section>
  );
}
