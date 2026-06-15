"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Bot,
  ShieldAlert,
  Wrench,
  FileText,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Volume2,
} from "lucide-react";

export type AssistantPayload = {
  reply: string;
  clarifyingQuestion?: string;
  needsClarification?: boolean;
  probableCause?: string;
  difficulty?: number;
  difficultyLabel?: string;
  safetyWarning?: string;
  spareParts?: { name: string; reason?: string }[];
  citations?: { source: string; page: string; quote?: string }[];
};

type Msg =
  | { id: string; role: "user"; content: string; image?: string }
  | { id: string; role: "assistant"; content: string; payload?: AssistantPayload; pending?: boolean };

function difficultyTone(d?: number) {
  if (!d) return "bg-surface-2 text-muted";
  if (d <= 3) return "bg-green-50 text-green-700";
  if (d <= 6) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-600";
}

export function ChatMessage({ m, onFeedback }: { m: Msg; onFeedback: (v: 1 | -1) => void }) {
  const [fb, setFb] = useState<1 | -1 | 0>(0);

  if (m.role === "user") {
    return (
      <div className="flex flex-col items-end gap-2">
        {m.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.image} alt="upload" className="max-h-48 rounded-2xl border border-border" />
        )}
        {m.content && (
          <div className="w-fit max-w-[80%] rounded-2xl bg-surface-2 px-4 py-2.5 text-[15px]">
            {m.content}
          </div>
        )}
      </div>
    );
  }

  const p = m.payload;

  return (
    <div className="flex items-start gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-white">
        <Bot className="size-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-3">
        {m.pending && !m.content ? (
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.2s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.1s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted" />
            <span className="ml-2">Investigating the manual…</span>
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{m.content}</div>
        )}

        {p?.safetyWarning && (
          <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <ShieldAlert className="size-4 shrink-0" />
            <span>{p.safetyWarning}</span>
          </div>
        )}

        {(p?.difficulty || p?.spareParts?.length) && (
          <div className="flex flex-wrap items-center gap-2">
            {!!p?.difficulty && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                  difficultyTone(p.difficulty)
                )}
              >
                <Wrench className="size-3" /> DIY {p.difficulty}/10
                {p.difficultyLabel ? ` · ${p.difficultyLabel}` : ""}
              </span>
            )}
            {p?.spareParts?.map((sp, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted"
                title={sp.reason}
              >
                <Wrench className="size-3" /> {sp.name}
              </span>
            ))}
          </div>
        )}

        {p?.needsClarification && p?.clarifyingQuestion && (
          <div className="flex gap-2 rounded-xl border border-border bg-cream/60 p-3 text-sm">
            <HelpCircle className="size-4 shrink-0 text-ink" />
            <span>{p.clarifyingQuestion}</span>
          </div>
        )}

        {!!p?.citations?.length && (
          <div className="flex flex-wrap gap-1.5">
            {p.citations.map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1 text-xs text-muted"
                title={c.quote}
              >
                <FileText className="size-3" /> {c.source} · p.{c.page}
              </span>
            ))}
          </div>
        )}

        {!m.pending && m.content && (
          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={() => {
                setFb(1);
                onFeedback(1);
              }}
              className={cn(
                "grid size-7 place-items-center rounded-lg hover:bg-surface-2",
                fb === 1 && "text-green-600"
              )}
              aria-label="This helped"
            >
              <ThumbsUp className="size-4" />
            </button>
            <button
              onClick={() => {
                setFb(-1);
                onFeedback(-1);
              }}
              className={cn(
                "grid size-7 place-items-center rounded-lg hover:bg-surface-2",
                fb === -1 && "text-red-500"
              )}
              aria-label="This didn't help"
            >
              <ThumbsDown className="size-4" />
            </button>
            <button
              onClick={() => {
                const u = new SpeechSynthesisUtterance(m.content);
                speechSynthesis.cancel();
                speechSynthesis.speak(u);
              }}
              className="grid size-7 place-items-center rounded-lg hover:bg-surface-2"
              aria-label="Read aloud"
            >
              <Volume2 className="size-4" />
            </button>
            {fb !== 0 && (
              <span className="ml-1 text-xs text-muted-2">
                {fb === 1 ? "Glad it helped!" : "Thanks, logged for the company."}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
