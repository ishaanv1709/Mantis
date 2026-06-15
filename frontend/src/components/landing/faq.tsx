import { Badge } from "@/components/ui/badge";

const FAQS = [
  {
    q: "Where do the answers come from?",
    a: "Every answer is grounded in the manufacturer's official manuals and support docs, indexed with Moss. The assistant cites the exact source and page so you can verify it.",
  },
  {
    q: "Is it safe to follow the repair steps?",
    a: "Each fix gets a DIY confidence score from 1–10. High-voltage or complex disassembly is flagged with a safety warning and the assistant tells you when to call a professional instead.",
  },
  {
    q: "Can I use voice or photos?",
    a: "Yes. Speak your problem hands-free and the assistant transcribes it, or upload a photo of an error screen, warning light or damaged part for image-based diagnosis. You can also ask in your own language.",
  },
  {
    q: "How do companies add their products?",
    a: "Companies register, create product listings, and upload PDFs, docs, images, videos or links. Manuals are parsed, chunked and indexed automatically, each product gets its own assistant.",
  },
  {
    q: "Will it remind me about maintenance and warranty?",
    a: "Add products to your inventory and Mantis tracks maintenance schedules (upcoming & overdue), warranty expiry, and any recalls or safety notices for what you own.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-24">
      <div className="container-mantis">
        <div className="text-center">
          <Badge variant="accent" className="mx-auto">FAQ</Badge>
          <h2 className="display mt-4 text-3xl sm:text-5xl">Common questions.</h2>
        </div>
        <div className="mx-auto mt-12 max-w-2xl">
          {FAQS.map((f, i) => (
            <div key={i} className="mb-7 flex gap-4">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-ink font-mono text-xs font-bold text-yellow-pure">
                {i + 1}
              </span>
              <div>
                <h3 className="font-bold text-ink">{f.q}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
