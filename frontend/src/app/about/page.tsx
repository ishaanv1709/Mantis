import { Reveal } from "@/components/site/reveal";
import { Zap, FileSearch, ShieldCheck, Boxes } from "lucide-react";

export const metadata = { title: "About, Mantis" };

export default function AboutPage() {
  return (
    <div className="container-mantis pt-32 pb-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-2">About Mantis</p>
        <h1 className="display mt-3 text-4xl sm:text-6xl">
          The information already exists.
          <br />
          <span className="serif-accent">We make it accessible.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          Every product ships with answers buried in lengthy manuals, scattered PDFs and forgotten
          support portals. Mantis turns that trusted, manufacturer-provided knowledge into an expert
          technician that investigates your problem and guides you to a fix, safely.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2">
        {[
          { icon: FileSearch, title: "Grounded, not guessed", desc: "Answers cite the exact manual and page. No hallucinated steps." },
          { icon: Zap, title: "Built on Moss", desc: "Sub-10ms hybrid search runs in-process, so diagnosis feels instant." },
          { icon: ShieldCheck, title: "Safety first", desc: "Risky repairs are scored and flagged, we tell you when to call a pro." },
          { icon: Boxes, title: "End to end", desc: "Marketplace, knowledge repository, diagnostics, maintenance & community." },
        ].map((f, i) => (
          <Reveal key={f.title} delay={(i % 2) * 80}>
            <div className="card-soft h-full p-6">
              <span className="grid size-11 place-items-center rounded-xl border border-border bg-surface-2">
                <f.icon className="size-5" strokeWidth={1.7} />
              </span>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-3xl rounded-[2rem] border border-border bg-surface p-8 text-center">
        <h2 className="display text-2xl sm:text-3xl">How a diagnosis works</h2>
        <ol className="mx-auto mt-6 grid max-w-2xl gap-3 text-left text-sm text-muted sm:grid-cols-2">
          {[
            "Triage, understand symptoms & pick the product index",
            "Retrieve, metadata-filtered Moss queries (procedure, error code, warning)",
            "Reason, form a hypothesis, eliminate causes, ask follow-ups",
            "Resolve, cited steps, a difficulty score and safety warnings",
          ].map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl border border-border bg-white p-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-ink font-mono text-xs text-yellow-pure">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
