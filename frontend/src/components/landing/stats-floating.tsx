"use client";
import { useState } from "react";
import { brandLogo } from "@/lib/brand";

const FLOATERS: { domain: string; name: string; cls: string; anim: string }[] = [
  { domain: "dyson.com", name: "Dyson", cls: "left-[6%] top-[14%]", anim: "floaty" },
  { domain: "sony.com", name: "Sony", cls: "left-[16%] top-[52%]", anim: "floaty-2" },
  { domain: "bosch.com", name: "Bosch", cls: "left-[9%] bottom-[12%]", anim: "floaty-3" },
  { domain: "samsung.com", name: "Samsung", cls: "left-[28%] top-[24%]", anim: "floaty-2" },
  { domain: "tesla.com", name: "Tesla", cls: "right-[8%] top-[16%]", anim: "floaty" },
  { domain: "lg.com", name: "LG", cls: "right-[18%] top-[54%]", anim: "floaty-3" },
  { domain: "philips.com", name: "Philips", cls: "right-[7%] bottom-[14%]", anim: "floaty-2" },
  { domain: "canon.com", name: "Canon", cls: "right-[27%] top-[26%]", anim: "floaty" },
];

function Floater({ domain, name, cls, anim }: (typeof FLOATERS)[number]) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`absolute ${cls} ${anim} hidden lg:block`}>
      <div className="grid size-[68px] place-items-center rounded-full border border-border bg-white glow-soft transition-transform hover:scale-110">
        {failed ? (
          <span className="text-lg font-extrabold text-ink">{name[0]}</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brandLogo(domain, 96)}
            alt={name}
            className="size-9 rounded-full object-contain"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  );
}

export function StatsFloating() {
  return (
    <section className="relative overflow-hidden py-28">
      <div className="aurora" />
      {FLOATERS.map((f) => (
        <Floater key={f.domain} {...f} />
      ))}
      <div className="container-mantis text-center">
        <p className="text-lg font-semibold text-muted">A growing library of</p>
        <div className="mt-4 space-y-1">
          <p className="display text-5xl sm:text-7xl">
            <span className="text-gradient">120+</span> manuals
          </p>
          <p className="display text-5xl text-muted-2 sm:text-7xl">8,400+ diagnoses</p>
          <p className="display text-5xl sm:text-7xl">
            <span className="text-gradient">30+</span> <span className="serif-accent text-ink">brands</span>
          </p>
        </div>
        <p className="mx-auto mt-8 max-w-md text-muted">
          Every manual becomes an expert. Every diagnosis makes the next one smarter.
        </p>
      </div>
    </section>
  );
}
