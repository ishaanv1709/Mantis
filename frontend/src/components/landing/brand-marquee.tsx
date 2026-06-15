"use client";
import { useState } from "react";

// Brand -> official domain (Brandfetch resolves logos by domain).
const BRANDS: { name: string; domain: string }[] = [
  { name: "Dyson", domain: "dyson.com" },
  { name: "Sony", domain: "sony.com" },
  { name: "Tesla", domain: "tesla.com" },
  { name: "Bosch", domain: "bosch.com" },
  { name: "Samsung", domain: "samsung.com" },
  { name: "LG", domain: "lg.com" },
  { name: "Whirlpool", domain: "whirlpool.com" },
  { name: "Philips", domain: "philips.com" },
  { name: "Panasonic", domain: "panasonic.com" },
  { name: "Honda", domain: "honda.com" },
  { name: "Bajaj", domain: "bajajauto.com" },
  { name: "Daikin", domain: "daikin.com" },
  { name: "Haier", domain: "haier.com" },
  { name: "Makita", domain: "makita.com" },
  { name: "Canon", domain: "canon.com" },
  { name: "DJI", domain: "dji.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "Siemens", domain: "siemens.com" },
];

const CLIENT_ID = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID || "";

function logoUrl(domain: string) {
  const base = `https://cdn.brandfetch.io/${domain}/w/64/h/64/type/icon`;
  return CLIENT_ID ? `${base}?c=${CLIENT_ID}` : base;
}

function BrandTile({ name, domain }: { name: string; domain: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex w-44 shrink-0 items-center gap-3 rounded-full border border-border bg-white px-4 py-2.5 transition-transform hover:scale-105">
      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-white glow-soft">
        {failed ? (
          <span className="text-sm font-extrabold text-ink">{name[0]}</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl(domain)}
            alt={name}
            className="size-7 rounded-full object-contain"
            onError={() => setFailed(true)}
          />
        )}
      </span>
      <span className="font-semibold text-ink">{name}</span>
    </div>
  );
}

export function BrandMarquee() {
  const half = Math.ceil(BRANDS.length / 2);
  const row1 = [...BRANDS.slice(0, half), ...BRANDS.slice(0, half)];
  const row2 = [...BRANDS.slice(half), ...BRANDS.slice(half)];
  return (
    <section className="py-20 bg-surface border-y border-border">
      <div className="container-mantis text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-2">
          Works with the brands you own
        </p>
        <h2 className="display mt-3 text-3xl sm:text-5xl">
          Never run out of <span className="serif-accent text-gradient">answers</span> again.
        </h2>
      </div>
      <div className="mt-12 space-y-4">
        <div className="marquee-mask marquee-pause">
          <div className="marquee-track gap-4 px-2">
            {row1.map((b, i) => (
              <BrandTile key={`a${i}`} {...b} />
            ))}
          </div>
        </div>
        <div className="marquee-mask marquee-pause">
          <div className="marquee-track reverse gap-4 px-2">
            {row2.map((b, i) => (
              <BrandTile key={`b${i}`} {...b} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
