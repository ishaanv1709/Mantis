"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { AI_BACKEND_URL } from "@/lib/config";
import { cn } from "@/lib/utils";
import { ChatMessage, type AssistantPayload } from "./message";
import {
  Send,
  Mic,
  Paperclip,
  Square,
  Loader2,
  ChevronDown,
  Wrench,
} from "lucide-react";

type Product = { id: string; name: string; category: string; imageUrl: string | null };

type Msg =
  | { id: string; role: "user"; content: string; image?: string }
  | { id: string; role: "assistant"; content: string; payload?: AssistantPayload; pending?: boolean };

const STARTERS: Record<string, string[]> = {
  default: [
    "What's the most common problem?",
    "How do I clean it?",
    "It won't turn on",
  ],
  "acme-washer": ["It won't drain and shows E20", "What does error E10 mean?", "The door won't open"],
  "zip-scooter": ["The horn isn't working", "It won't power on", "Throttle fault E2"],
  "dyson-v15": ["It keeps pulsing on and off", "The battery won't charge", "Brush bar stopped spinning"],
  "sony-a7iv": ["It overheats during 4K recording", "I get a card error", "Autofocus keeps hunting"],
  __all__: ["Which products overheat?", "How do I fix a draining issue?", "Find error code E20"],
};

const ALL_OPTION: Product = { id: "__all__", name: "All products", category: "All", imageUrl: null };

export function ChatApp({
  products,
  initialProductId,
}: {
  products: Product[];
  initialProductId: string;
}) {
  const [productId, setProductId] = useState(initialProductId);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const options = [ALL_OPTION, ...products];
  const product = options.find((p) => p.id === productId) ?? ALL_OPTION;
  const productName =
    productId === "__all__" ? "all listed products in the marketplace" : product?.name ?? "this product";
  const starters = STARTERS[productId] ?? STARTERS.default;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---- Smart symptom autocomplete (Moss sub-10ms) ----
  useEffect(() => {
    if (input.trim().length < 4 || busy) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`${AI_BACKEND_URL}/api/autocomplete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productId, partial: input }),
        });
        const data = await r.json();
        setSuggestions((data.suggestions || []).slice(0, 4));
      } catch {
        setSuggestions([]);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [input, productId, busy]);

  const send = useCallback(
    async (text: string, image?: string | null) => {
      const msg = text.trim();
      if ((!msg && !image) || busy) return;
      setSuggestions([]);
      setInput("");
      setPendingImage(null);

      const history = messages
        .filter((m) => m.content)
        .map((m) => ({ role: m.role, content: m.content }));

      const userMsg: Msg = {
        id: crypto.randomUUID(),
        role: "user",
        content: msg,
        image: image ?? undefined,
      };
      const assistantId = crypto.randomUUID();
      setMessages((m) => [
        ...m,
        userMsg,
        { id: assistantId, role: "assistant", content: "", pending: true },
      ]);
      setBusy(true);

      let finalText = msg;
      try {
        // If there's an image, describe it first (vision) and fold into the question.
        if (image) {
          const v = await fetch(`${AI_BACKEND_URL}/api/vision`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image_data_url: image,
              product_name: productName,
              note: msg,
            }),
          });
          const vj = await v.json();
          if (vj.description) finalText = `${msg}\n\n[Image shows]: ${vj.description}`;
        }

        const res = await fetch(`${AI_BACKEND_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: finalText,
            product_id: productId,
            product_name: productName,
            history,
          }),
        });

        if (!res.body) throw new Error("no stream");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const parts = buf.split("\n\n");
          buf = parts.pop() ?? "";
          for (const part of parts) {
            const line = part.replace(/^data: /, "").trim();
            if (!line) continue;
            const evt = JSON.parse(line);
            if (evt.type === "status") {
              setMessages((m) =>
                m.map((x) =>
                  x.id === assistantId ? { ...x, content: "", pending: true } : x
                )
              );
            } else if (evt.type === "answer") {
              const payload: AssistantPayload = {
                reply: evt.reply,
                clarifyingQuestion: evt.clarifying_question,
                needsClarification: evt.needs_clarification,
                probableCause: evt.probable_cause,
                difficulty: evt.difficulty,
                difficultyLabel: evt.difficulty_label,
                safetyWarning: evt.safety_warning,
                spareParts: evt.spare_parts ?? [],
                citations: evt.citations ?? [],
              };
              setMessages((m) =>
                m.map((x) =>
                  x.id === assistantId
                    ? { ...x, content: evt.reply || "", payload, pending: false }
                    : x
                )
              );
            }
          }
        }
      } catch {
        setMessages((m) =>
          m.map((x) =>
            x.id === assistantId
              ? {
                  ...x,
                  pending: false,
                  content:
                    "I couldn't reach the diagnostic engine. Make sure the AI backend is running on " +
                    AI_BACKEND_URL +
                    ".",
                }
              : x
          )
        );
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, product, productId]
  );

  // ---- Voice (record -> Whisper on the backend) ----
  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const fd = new FormData();
        fd.append("file", blob, "voice.webm");
        try {
          const r = await fetch(`${AI_BACKEND_URL}/api/transcribe`, { method: "POST", body: fd });
          const j = await r.json();
          if (j.text) setInput((prev) => (prev ? prev + " " : "") + j.text);
        } catch {
          /* ignore */
        }
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      alert("Microphone access denied or unavailable.");
    }
  }

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  const empty = messages.length === 0;

  return (
    <div className="mx-auto flex h-[100dvh] max-w-3xl flex-col px-4 pt-20 pb-3">
      {/* product selector */}
      <div className="relative mx-auto mb-2">
        <button
          onClick={() => setPickerOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold hover:border-border-strong"
        >
          <Wrench className="size-4 text-muted" />
          {product?.name ?? "Select a product"}
          <ChevronDown className="size-4 text-muted" />
        </button>
        {pickerOpen && (
          <div className="absolute left-1/2 z-20 mt-2 max-h-80 w-72 -translate-x-1/2 overflow-y-auto card-soft p-1 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            {options.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setProductId(p.id);
                  setMessages([]);
                  setPickerOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-surface-2",
                  p.id === productId && "bg-surface-2",
                  p.id === "__all__" && "border-b border-border"
                )}
              >
                <span className="text-muted-2 text-xs">{p.category}</span>
                <span className="font-medium">{p.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-ink text-2xl font-extrabold text-yellow-pure">
              M
            </span>
            <h1 className="display mt-6 text-3xl sm:text-4xl">What can I help with?</h1>
            <p className="mt-2 max-w-sm text-muted">
              {productId === "__all__"
                ? "Ask about any product in the marketplace, by text, voice or a photo."
                : `Describe the problem with your ${product?.name ?? "product"}, by text, voice or a photo.`}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {starters.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink transition-colors hover:border-border-strong hover:bg-surface-2"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {messages.map((m) => (
              <ChatMessage key={m.id} m={m} onFeedback={() => {}} />
            ))}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* input */}
      <div className="pt-3">
        {suggestions.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="rounded-full border border-border bg-cream px-3 py-1.5 text-xs text-ink hover:border-border-strong"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {pendingImage && (
          <div className="mb-2 inline-flex items-center gap-2 rounded-xl border border-border bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pendingImage} alt="attached" className="h-12 w-12 rounded-lg object-cover" />
            <button onClick={() => setPendingImage(null)} className="text-xs text-muted hover:text-ink">
              Remove
            </button>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input, pendingImage);
          }}
          className="flex items-end gap-2 rounded-3xl border border-border bg-white p-2 focus-within:border-border-strong"
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="grid size-10 place-items-center rounded-full text-muted hover:bg-surface-2"
            aria-label="Attach photo"
          >
            <Paperclip className="size-5" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input, pendingImage);
              }
            }}
            rows={1}
            placeholder="Ask anything…"
            className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 outline-none"
          />
          <button
            type="button"
            onClick={toggleRecording}
            className={cn(
              "grid size-10 place-items-center rounded-full transition-colors",
              recording ? "bg-red-50 text-red-600" : "text-muted hover:bg-surface-2"
            )}
            aria-label="Record voice"
          >
            {recording ? <Square className="size-4" /> : <Mic className="size-5" />}
          </button>
          <button
            type="submit"
            disabled={busy || (!input.trim() && !pendingImage)}
            className="grid size-10 place-items-center rounded-2xl bg-ink text-white disabled:opacity-40"
            aria-label="Send"
          >
            {busy ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
          </button>
        </form>
        <p className="mt-2 text-center text-xs text-muted-2">
          Mantis can make mistakes. Always follow official safety guidance before repairs.
        </p>
      </div>
    </div>
  );
}
