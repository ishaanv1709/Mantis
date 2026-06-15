"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Wrench, Building2 } from "lucide-react";

export function OnboardingForm() {
  const [role, setRole] = useState<"USER" | "COMPANY" | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!role) return;
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, companyName }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Setup failed");
      // Hard navigation guarantees a fresh dashboard load (no stuck RSC transition).
      window.location.href = "/dashboard";
    } catch (e) {
      setPending(false);
      setError(e instanceof Error ? e.message : "Setup failed");
    }
  }

  return (
    <div className="mt-10">
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setRole("USER")}
          className={cn(
            "card-soft p-6 text-left transition-all hover:-translate-y-1",
            role === "USER" && "ring-2 ring-ink"
          )}
        >
          <span className="grid size-12 place-items-center rounded-xl bg-surface-2">
            <Wrench className="size-6" strokeWidth={1.7} />
          </span>
          <h3 className="mt-4 text-lg font-bold">I own products</h3>
          <p className="mt-1 text-sm text-muted">
            Diagnose &amp; fix things you own, track maintenance, warranties and parts.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setRole("COMPANY")}
          className={cn(
            "card-soft p-6 text-left transition-all hover:-translate-y-1",
            role === "COMPANY" && "ring-2 ring-ink"
          )}
        >
          <span className="grid size-12 place-items-center rounded-xl bg-surface-2">
            <Building2 className="size-6" strokeWidth={1.7} />
          </span>
          <h3 className="mt-4 text-lg font-bold">I&apos;m a company</h3>
          <p className="mt-1 text-sm text-muted">
            List products, upload manuals, run community threads and see health insights.
          </p>
        </button>
      </div>

      {role === "COMPANY" && (
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company name"
          className="mt-4 w-full rounded-xl border border-border bg-white px-4 py-3 text-center outline-none focus:border-ink"
        />
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <Button
        className="mt-6 h-12 px-8"
        disabled={!role || pending || (role === "COMPANY" && !companyName.trim())}
        onClick={submit}
      >
        {pending ? "Setting up…" : "Continue"}
      </Button>
    </div>
  );
}
