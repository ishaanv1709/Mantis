"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

const CATEGORIES = ["Appliances", "Vacuums", "Cameras", "Mobility", "Electronics", "Refrigeration", "General"];

export function AddProductDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Appliances");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setImageUrl(r.result as string);
    r.readAsDataURL(f);
  }

  async function create() {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, description, imageUrl }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Could not create product");
      return;
    }
    setOpen(false);
    setName("");
    setDescription("");
    setImageUrl(null);
    router.refresh();
  }

  return (
    <>
      <button className="pill pill-dark text-sm" onClick={() => setOpen(true)}>
        <Upload className="size-4" /> Add product
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md card-soft p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Add a product</h3>
              <button onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-full hover:bg-surface-2">
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
                className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-ink"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-ink"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-ink"
              />
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border-strong p-3 text-sm hover:bg-surface-2">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="" className="size-12 rounded-lg object-cover" />
                ) : (
                  <span className="grid size-12 place-items-center rounded-lg bg-surface-2 text-muted-2">
                    <Upload className="size-5" />
                  </span>
                )}
                <span className="text-muted">{imageUrl ? "Change product image" : "Upload product image"}</span>
                <input type="file" accept="image/*" hidden onChange={pickImage} />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <p className="text-xs text-muted-2">
                After creating, upload a manual (PDF), video or file to give this product a working
                assistant.
              </p>
              <Button onClick={create} disabled={!name.trim() || saving} className="w-full">
                {saving ? "Creating…" : "Create product"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
