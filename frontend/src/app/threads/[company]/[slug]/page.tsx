import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PostComposer } from "@/components/threads/post-composer";
import { PostTree, type PostNode } from "@/components/threads/post-tree";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ThreadView({
  params,
}: {
  params: Promise<{ company: string; slug: string }>;
}) {
  const { company, slug } = await params;
  const companyProfile = await prisma.companyProfile.findUnique({ where: { slug: company } });
  if (!companyProfile) notFound();

  const thread = await prisma.thread.findUnique({
    where: { companyId_slug: { companyId: companyProfile.id, slug } },
    include: {
      children: true,
      parent: true,
      posts: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!thread) notFound();

  // Build a tree from the flat post list
  const map = new Map<string, PostNode>();
  thread.posts.forEach((p) => {
    map.set(p.id, {
      id: p.id,
      title: p.title,
      content: p.content,
      mediaUrl: p.mediaUrl,
      audioUrl: p.audioUrl,
      isOfficial: p.isOfficial,
      upvotes: p.upvotes,
      createdAt: p.createdAt.toISOString(),
      authorName: `${p.author.firstName ?? "User"} ${p.author.lastName ?? ""}`.trim(),
      authorAvatar: p.author.avatarUrl,
      replies: [],
    });
  });
  const roots: PostNode[] = [];
  thread.posts.forEach((p) => {
    const node = map.get(p.id)!;
    if (p.parentId && map.has(p.parentId)) map.get(p.parentId)!.replies.push(node);
    else roots.push(node);
  });

  return (
    <div className="container-mantis pt-28 pb-20">
      <Link href="/threads" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> All threads
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="card-soft p-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold">r/{thread.slug}</h1>
              <Badge variant="dark">{companyProfile.name}</Badge>
            </div>
            {thread.parent && (
              <p className="mt-1 text-xs text-muted-2">
                sub-thread of{" "}
                <Link href={`/threads/${company}/${thread.parent.slug}`} className="underline">
                  r/{thread.parent.slug}
                </Link>
              </p>
            )}
            <p className="mt-2 text-muted">{thread.description}</p>
          </div>

          <div className="mt-5">
            <PostComposer threadId={thread.id} />
          </div>

          <div className="mt-6 space-y-4">
            {roots.length === 0 ? (
              <div className="card-soft p-10 text-center text-muted">
                No posts yet, start the conversation.
              </div>
            ) : (
              roots.map((p) => <PostTree key={p.id} node={p} threadId={thread.id} depth={0} />)
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card-soft p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-2">Sub-threads</h3>
            <div className="mt-3 space-y-1.5">
              {thread.children.length ? (
                thread.children.map((c) => (
                  <Link
                    key={c.id}
                    href={`/threads/${company}/${c.slug}`}
                    className="block rounded-xl px-3 py-2 text-sm hover:bg-surface-2"
                  >
                    r/{c.slug}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted">None yet.</p>
              )}
            </div>
          </div>
          <div className="card-soft p-5 text-sm text-muted">
            <p className="font-semibold text-ink">Community rules</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Be kind and specific.</li>
              <li>Verified company reps are marked Official.</li>
              <li>Share photos or voice notes to get faster help.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
