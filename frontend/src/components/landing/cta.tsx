import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-10">
      <div className="container-mantis">
        <div className="grain relative overflow-hidden rounded-[2.5rem] bg-ink px-6 py-20 text-center text-white">
          <div className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-[#7c3aed]/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 size-80 rounded-full bg-[#f59e0b]/30 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto size-72 -translate-y-1/2 rounded-full bg-[#db2777]/25 blur-3xl" />
          <h2 className="display relative mx-auto max-w-2xl text-3xl text-white sm:text-6xl">
            Stop reading <span className="text-gradient">200-page manuals.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Start a diagnosis in seconds, or list your product and give every customer an expert.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/chat"
              className="pill h-12 bg-white px-6 text-base text-ink hover:-translate-y-0.5"
            >
              Try the Assistant <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/dashboard"
              className="pill h-12 border border-white/25 px-6 text-base text-white hover:border-white/60"
            >
              List your product
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
