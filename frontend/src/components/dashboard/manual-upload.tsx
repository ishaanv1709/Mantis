"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, Check } from "lucide-react";
import { AI_BACKEND_URL } from "@/lib/config";

export function ManualUpload({ productId }: { productId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setState("uploading");
    setMsg("");

    const name = file.name.toLowerCase();
    const isText = name.endsWith(".pdf") || name.endsWith(".txt") || name.endsWith(".md");
    const isVideo = /\.(mp4|mov|webm|avi|mkv)$/.test(name);
    const kind = name.endsWith(".pdf") ? "pdf" : isVideo ? "video" : isText ? "doc" : "file";

    try {
      let chunks = 0;
      let indexed = false;
      let note = "";

      // 1) Text/PDF -> straight to the AI backend (handles multipart) for Moss indexing.
      if (isText) {
        const fd = new FormData();
        fd.append("file", file, file.name);
        fd.append("product_id", productId);
        try {
          const r = await fetch(`${AI_BACKEND_URL}/api/upload_manual`, { method: "POST", body: fd });
          const raw = await r.text();
          if (r.ok) {
            chunks = JSON.parse(raw).chunks ?? 0;
            indexed = true;
          } else {
            note = `Indexing skipped (backend ${r.status}). Manual still saved.`;
          }
        } catch {
          note = `AI backend unreachable at ${AI_BACKEND_URL}. Manual saved but not indexed.`;
        }
      }

      // 2) Record the manual/resource (JSON, auth-protected, verifies ownership).
      const rec = await fetch("/api/manuals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, title: file.name, kind, chunks }),
      });
      const data = await rec.json().catch(() => ({}));
      if (!rec.ok) throw new Error(data.error || `Could not save (${rec.status}).`);

      setState("done");
      setMsg(note || (indexed ? `Indexed ${chunks} chunks into Moss` : `${kind} added as a resource`));
      router.refresh();
      setTimeout(() => setState("idle"), 3200);
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.md,.mp4,.mov,.webm,.avi,.mkv,.doc,.docx"
        hidden
        onChange={onPick}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={state === "uploading"}
        className="pill pill-outline text-xs"
      >
        {state === "uploading" ? (
          <>
            <Loader2 className="size-3.5 animate-spin" /> Uploading…
          </>
        ) : state === "done" ? (
          <>
            <Check className="size-3.5 text-green-600" /> Done
          </>
        ) : (
          <>
            <Upload className="size-3.5" /> Manual / video / file
          </>
        )}
      </button>
      {msg && (
        <span className={`ml-2 text-xs ${state === "error" ? "text-red-600" : "text-muted-2"}`}>{msg}</span>
      )}
    </>
  );
}
