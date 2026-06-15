"use client";
import Link from "next/link";
import { ArrowRight, Sparkles, Bot, ShieldAlert, Wrench, FileText, Mic, Star } from "lucide-react";

export function Hero() {
  return (
    <section className="grain relative overflow-hidden pt-36 pb-24 lg:pt-44">
      {/* living color blobs */}
      <span className="blob left-[4%] top-16 size-80 bg-[#ffd86b]" />
      <span className="blob b2 right-[2%] top-28 size-96 bg-[#e3b8ff]" />
      <span className="blob b3 left-1/2 top-[55%] size-80 -translate-x-1/2 bg-[#a8f0cd]" />
      <span className="blob b2 right-[20%] top-[60%] size-72 bg-[#b9d4ff]" />

      <div className="container-mantis grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left: copy */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3.5 py-1.5 text-sm text-muted backdrop-blur">
            <Sparkles className="size-4 text-ink" />
            Your products, diagnosed in seconds
          </div>

          <h1 className="display mx-auto mt-6 max-w-2xl text-[2.7rem] leading-[1.03] sm:text-6xl lg:mx-0 lg:text-[4.4rem]">
            Fix anything you own,
            <br />
            like a <span className="text-gradient">real technician.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted lg:mx-0">
            Mantis turns any manufacturer&apos;s manuals into a 24/7 expert that diagnoses your
            problem step by step, with voice, photos and{" "}
            <span className="serif-accent text-ink">safety-first</span> guidance.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link href="/chat" className="pill pill-dark h-12 px-6 text-base">
              Try the Assistant <ArrowRight className="size-4" />
            </Link>
            <Link href="/marketplace" className="pill pill-outline h-12 px-6 text-base">
              Browse products
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-2 lg:justify-start">
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-4 fill-yellow-pure text-yellow-pure" /> Grounded in official docs
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Cited, every time</span>
          </div>
        </div>

        {/* Right: floating live assistant preview */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="floaty card-soft glow-ring relative z-10 overflow-hidden p-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="grid size-7 place-items-center rounded-lg bg-ink text-yellow-pure font-bold">M</span>
              <div>
                <p className="text-sm font-semibold leading-none">Washer · Assistant</p>
                <p className="mt-0.5 text-[11px] text-muted-2">Grounded in the service manual</p>
              </div>
            </div>
            <div className="space-y-3 pt-4 text-sm">
              <p className="ml-auto w-fit max-w-[80%] rounded-2xl bg-surface-2 px-3.5 py-2">
                It won&apos;t drain and shows E20.
              </p>
              <div className="flex items-start gap-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-border">
                  <Bot className="size-3.5" />
                </span>
                <div className="space-y-2">
                  <p>
                    E20 means the <b>drain pump filter is clogged</b>. Safe DIY fix:
                  </p>
                  <ol className="ml-4 list-decimal space-y-0.5 text-muted">
                    <li>Unplug &amp; open the lower panel.</li>
                    <li>Unscrew the filter, clear debris.</li>
                    <li>Run a rinse to confirm.</li>
                  </ol>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                      <Wrench className="size-3" /> 3/10
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                      <ShieldAlert className="size-3" /> Unplug
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
                      <FileText className="size-3" /> p.4
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* floating chips, kept clear of the card content */}
          <div className="floaty-2 absolute -bottom-5 -left-5 z-20 hidden rounded-2xl border border-border bg-white px-3 py-2 text-xs font-semibold shadow-lg sm:flex sm:items-center sm:gap-2">
            <Mic className="size-4 text-ink" /> Voice diagnosis
          </div>
          <div className="floaty-3 absolute -right-5 -top-5 z-20 hidden rounded-2xl border border-border bg-white px-3 py-2 text-xs font-semibold shadow-lg sm:flex sm:items-center sm:gap-2">
            <Sparkles className="size-4 text-ink" /> 3ms retrieval
          </div>
          <div className="floaty absolute -bottom-8 right-10 z-0 size-24 rounded-3xl bg-cream" />
        </div>
      </div>
    </section>
  );
}
