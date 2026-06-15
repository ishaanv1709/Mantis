import { Avatar } from "@/components/ui/avatar";
import { Reveal } from "@/components/site/reveal";

const ITEMS = [
  { name: "Sebastian Speier", role: "Dyson V15 owner", quote: "It found the exact blockage fix in seconds and told me it was a 3/10 job. Saved a $90 service call." },
  { name: "Haerin Song", role: "Acme Washer owner", quote: "Spoke my problem out loud while my hands were wet under the machine. It walked me through draining it step by step." },
  { name: "Marco Cornacchia", role: "Service manager", quote: "We uploaded our manuals once. Now every customer gets a technician that actually cites our docs, not made-up steps." },
  { name: "Daryl Ginn", role: "Sony A7 IV owner", quote: "Snapped a photo of the thermal warning and it knew exactly which setting to change. Felt like magic." },
  { name: "Oykun Yilmaz", role: "Scooter owner", quote: "Horn died, it asked about the headlight, then pointed me straight to Fuse F3. Fixed in five minutes." },
  { name: "Meng To", role: "Product lead", quote: "The health dashboard shows us the top problems people self-fix. It's literally our next-release backlog." },
];

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="container-mantis">
        <h2 className="display text-center text-3xl sm:text-5xl">
          What people are <span className="serif-accent text-gradient">saying.</span>
        </h2>
        <div className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {ITEMS.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 80} className="mb-5 break-inside-avoid">
              <figure className="card-soft p-6">
                <figcaption className="mb-4 flex items-center gap-3">
                  <Avatar name={t.name} size={40} />
                  <div>
                    <p className="font-semibold text-ink">{t.name}</p>
                    <p className="text-xs text-muted-2">{t.role}</p>
                  </div>
                </figcaption>
                <blockquote className="text-[15px] leading-relaxed text-muted">
                  “{t.quote}”
                </blockquote>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
