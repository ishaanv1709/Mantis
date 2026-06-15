"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImagePlus, Mic, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PostComposer({
  threadId,
  parentId,
  compact,
  onDone,
}: {
  threadId: string;
  parentId?: string;
  compact?: boolean;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function submit() {
    if (!content.trim() && !image && !audio) return;
    setBusy(true);
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId, parentId, title, content, mediaUrl: image, audioUrl: audio }),
    });
    setBusy(false);
    setContent("");
    setTitle("");
    setImage(null);
    setAudio(null);
    onDone?.();
    router.refresh();
  }

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setImage(r.result as string);
    r.readAsDataURL(f);
  }

  async function toggleRec() {
    if (recording) {
      recRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (e) => chunks.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const r = new FileReader();
        r.onload = () => setAudio(r.result as string);
        r.readAsDataURL(blob);
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      alert("Microphone unavailable.");
    }
  }

  return (
    <div className={cn("card-soft p-4", compact && "p-3")}>
      {!compact && !parentId && (
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="mb-2 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-ink"
        />
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "Write a reply…" : "Share a problem, tip, or question…"}
        rows={compact ? 2 : 3}
        className="w-full resize-none rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-ink"
      />
      {(image || audio) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {image && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <button
                onClick={() => setImage(null)}
                className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ink text-white"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
          {audio && <audio controls src={audio} className="h-9" />}
        </div>
      )}
      <div className="mt-2 flex items-center gap-1">
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickImage} />
        <button
          onClick={() => fileRef.current?.click()}
          className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2"
          aria-label="Add image"
        >
          <ImagePlus className="size-5" />
        </button>
        <button
          onClick={toggleRec}
          className={cn(
            "grid size-9 place-items-center rounded-full transition-colors",
            recording ? "bg-red-50 text-red-600" : "text-muted hover:bg-surface-2"
          )}
          aria-label="Record voice note"
        >
          {recording ? <Square className="size-4" /> : <Mic className="size-5" />}
        </button>
        <Button onClick={submit} size="sm" disabled={busy} className="ml-auto">
          {busy ? "Posting…" : parentId ? "Reply" : "Post"}
        </Button>
      </div>
    </div>
  );
}
