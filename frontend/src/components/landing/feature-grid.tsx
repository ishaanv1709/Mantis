import { Reveal } from "@/components/site/reveal";
import { Zap, FileSearch, ShieldCheck, MessageSquareText } from "lucide-react";

export function FeatureGrid() {
  return (
    <section className="grain relative overflow-hidden border-y border-border bg-surface py-24">
      <div className="aurora" />
      <div className="container-mantis">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-2">Why Mantis</p>
          <h2 className="display mt-3 max-w-2xl text-3xl sm:text-5xl">
            Not a chatbot. A <span className="text-gradient">diagnostic engine.</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-6">
          {/* Big: Moss speed */}
          <Reveal className="md:col-span-4">
            <div className="shine ring-gradient h-full overflow-hidden p-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-xs font-bold">
                <Zap className="size-3.5" /> Faster than light
              </span>
              <h3 className="mt-4 text-2xl font-bold">Sub-10ms answers, in-process.</h3>
              <p className="mt-2 max-w-md text-muted">
                Moss runs hybrid semantic + keyword search inside the app, no network hop. The
                assistant can run 4–6 retrieval passes per question and still feel instant.
              </p>
              <div className="mt-6 flex items-end gap-2">
                {[40, 70, 55, 90, 65, 100, 80].map((h, i) => (
                  <span
                    key={i}
                    className="w-6 rounded-md bg-gradient-to-t from-[#7c3aed] via-[#db2777] to-[#f59e0b]"
                    style={{ height: h }}
                  />
                ))}
                <span className="ml-2 mb-1 text-sm font-semibold text-muted">~3ms p50</span>
              </div>
            </div>
          </Reveal>

          <Reveal className="md:col-span-2" delay={80}>
            <Feature
              icon={FileSearch}
              title="Always cited"
              desc="Every step traces back to a page in the official manual. Verify, don't guess."
            />
          </Reveal>
          <Reveal className="md:col-span-2" delay={0}>
            <Feature
              icon={ShieldCheck}
              title="Safety-first"
              desc="High-voltage or complex jobs get flagged and routed to a professional."
            />
          </Reveal>
          <Reveal className="md:col-span-4" delay={80}>
            <div className="shine card-soft h-full p-8">
              <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#db2777] text-white">
                <MessageSquareText className="size-5" strokeWidth={1.7} />
              </span>
              <h3 className="mt-4 text-2xl font-bold">It investigates, like a technician.</h3>
              <p className="mt-2 max-w-lg text-muted">
                It asks the right follow-up questions, eliminates unlikely causes, then concludes
                with the most probable fix, voice, photos and any language welcome.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="shine card-soft h-full p-6 transition-transform hover:-translate-y-1">
      <span className="grid size-11 place-items-center rounded-xl border border-border bg-surface-2">
        <Icon className="size-5" strokeWidth={1.7} />
      </span>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted">{desc}</p>
    </div>
  );
}
