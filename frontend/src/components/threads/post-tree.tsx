"use client";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PostComposer } from "./post-composer";
import { timeAgo } from "@/lib/utils";
import { ArrowBigUp, MessageSquare, BadgeCheck } from "lucide-react";

export type PostNode = {
  id: string;
  title: string | null;
  content: string;
  mediaUrl: string | null;
  audioUrl: string | null;
  isOfficial: boolean;
  upvotes: number;
  createdAt: string;
  authorName: string;
  authorAvatar: string | null;
  replies: PostNode[];
};

export function PostTree({
  node,
  threadId,
  depth,
}: {
  node: PostNode;
  threadId: string;
  depth: number;
}) {
  const [votes, setVotes] = useState(node.upvotes);
  const [voted, setVoted] = useState(false);
  const [replying, setReplying] = useState(false);

  async function vote() {
    if (voted) return;
    setVoted(true);
    setVotes((v) => v + 1);
    await fetch("/api/posts/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: node.id, dir: 1 }),
    });
  }

  return (
    <div className={depth > 0 ? "ml-4 border-l border-border pl-4" : ""}>
      <div className="card-soft p-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={vote}
              className={`grid size-7 place-items-center rounded-lg hover:bg-surface-2 ${
                voted ? "text-ink" : "text-muted"
              }`}
              aria-label="Upvote"
            >
              <ArrowBigUp className="size-5" />
            </button>
            <span className="text-sm font-bold">{votes}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-2">
              <Avatar name={node.authorName} src={node.authorAvatar} size={22} />
              <span className="font-semibold text-ink">{node.authorName}</span>
              {node.isOfficial && (
                <Badge variant="dark" className="gap-1">
                  <BadgeCheck className="size-3" /> Official
                </Badge>
              )}
              <span>· {timeAgo(node.createdAt)}</span>
            </div>

            {node.title && <h3 className="mt-1.5 text-lg font-bold">{node.title}</h3>}
            {node.content && <p className="mt-1 whitespace-pre-wrap text-[15px]">{node.content}</p>}

            {node.mediaUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={node.mediaUrl}
                alt=""
                className="mt-3 max-h-72 rounded-xl border border-border object-cover"
              />
            )}
            {node.audioUrl && <audio controls src={node.audioUrl} className="mt-3 h-9" />}

            <div className="mt-3 flex items-center gap-3 text-xs text-muted">
              <button
                onClick={() => setReplying((r) => !r)}
                className="inline-flex items-center gap-1 hover:text-ink"
              >
                <MessageSquare className="size-3.5" /> Reply
              </button>
              {node.replies.length > 0 && <span>{node.replies.length} replies</span>}
            </div>

            {replying && (
              <div className="mt-3">
                <PostComposer
                  threadId={threadId}
                  parentId={node.id}
                  compact
                  onDone={() => setReplying(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {node.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {node.replies.map((r) => (
            <PostTree key={r.id} node={r} threadId={threadId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
