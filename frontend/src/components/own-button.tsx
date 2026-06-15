"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export function OwnButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [owned, setOwned] = useState(false);
  const [loading, setLoading] = useState(false);

  async function add() {
    setLoading(true);
    await fetch("/api/own", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setLoading(false);
    setOwned(true);
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={add} disabled={loading || owned} className="h-12">
      {owned ? <Check className="size-4" /> : <Plus className="size-4" />}
      {owned ? "In your products" : "I own this"}
    </Button>
  );
}
