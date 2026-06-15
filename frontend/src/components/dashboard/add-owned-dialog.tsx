"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/product-image";
import { Plus, X, Search, Check } from "lucide-react";

type Opt = { id: string; name: string; category: string };

export function AddOwnedDialog({
  products,
  ownedIds,
}: {
  products: Opt[];
  ownedIds: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [added, setAdded] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const owned = useMemo(() => new Set([...ownedIds, ...added]), [ownedIds, added]);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  async function add(productId: string) {
    setBusy(productId);
    await fetch("/api/own", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setBusy(null);
    setAdded((a) => [...a, productId]);
    router.refresh();
  }

  return (
    <>
      <button className="pill pill-dark text-sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Add a product I own
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col card-soft p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Add a product you own</h3>
              <button onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-full hover:bg-surface-2">
                <X className="size-4" />
              </button>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search the marketplace…"
                className="w-full rounded-xl border border-border bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-ink"
              />
            </div>
            <div className="mt-3 flex-1 space-y-2 overflow-y-auto">
              {filtered.length === 0 && <p className="text-sm text-muted">No products found.</p>}
              {filtered.map((p) => {
                const isOwned = owned.has(p.id);
                return (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                    <span className="size-10 overflow-hidden rounded-lg bg-surface-2">
                      <ProductImage src={null} category={p.category} name={p.name} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-2">{p.category}</p>
                    </div>
                    <button
                      disabled={isOwned || busy === p.id}
                      onClick={() => add(p.id)}
                      className="pill pill-outline text-xs disabled:opacity-60"
                    >
                      {isOwned ? (
                        <>
                          <Check className="size-3.5 text-green-600" /> Added
                        </>
                      ) : busy === p.id ? (
                        "Adding…"
                      ) : (
                        "Add"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
