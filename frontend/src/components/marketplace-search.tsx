"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function MarketplaceSearch({
  categories,
  initialQuery,
  initialCat,
}: {
  categories: string[];
  initialQuery?: string;
  initialCat?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery ?? "");
  const [cat, setCat] = useState(initialCat ?? "All");

  function go(nextCat = cat, nextQ = q) {
    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextCat && nextCat !== "All") params.set("cat", nextCat);
    router.push(`/marketplace?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go();
        }}
        className="relative max-w-xl"
      >
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-2" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products or issues…"
          className="w-full rounded-full border border-border bg-white py-3 pl-12 pr-4 text-[15px] outline-none focus:border-ink"
        />
      </form>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCat(c);
              go(c);
            }}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              cat === c
                ? "border-ink bg-ink text-white"
                : "border-border bg-white text-muted hover:border-border-strong hover:text-ink"
            )}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
