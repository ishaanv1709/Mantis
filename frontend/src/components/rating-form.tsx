"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function RatingForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!stars) return;
    setSaving(true);
    await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, stars, body }),
    });
    setSaving(false);
    setDone(true);
    router.refresh();
  }

  if (done) return <p className="text-sm font-medium text-green-700">Thanks for your rating! ★</p>;

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            onMouseEnter={() => setHover(i + 1)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setStars(i + 1)}
            aria-label={`${i + 1} stars`}
          >
            <Star
              className={cn(
                "size-7 transition-colors",
                (hover || stars) > i ? "fill-yellow-pure text-yellow-pure" : "text-border-strong"
              )}
            />
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share what happened (optional)…"
        className="w-full rounded-xl border border-border bg-white p-3 text-sm outline-none focus:border-ink"
        rows={2}
      />
      <Button onClick={submit} disabled={!stars || saving} size="sm">
        {saving ? "Saving…" : "Submit rating"}
      </Button>
    </div>
  );
}
