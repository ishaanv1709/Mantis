import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ThreadsHome() {
  const companies = await prisma.companyProfile.findMany({
    include: {
      threads: {
        where: { parentId: null },
        include: { _count: { select: { posts: true, children: true } } },
      },
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="container-mantis pt-32 pb-20">
      <div className="max-w-2xl">
        <h1 className="display text-4xl sm:text-5xl">Community threads</h1>
        <p className="mt-3 text-muted">
          Reddit-style spaces run by manufacturers. Ask, discuss, share photos &amp; voice notes,           and get answers from verified company reps.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        {companies.map((c) => (
          <section key={c.id}>
            <div className="flex items-center gap-3">
              <Avatar name={c.name} src={c.logoUrl} size={40} />
              <div>
                <h2 className="text-xl font-bold">{c.name}</h2>
                <p className="text-xs text-muted-2">
                  {c._count.products} products · {c.threads.length} communities
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {c.threads.map((t) => (
                <Link
                  key={t.id}
                  href={`/threads/${c.slug}/${t.slug}`}
                  className="card-soft p-5 transition-all hover:-translate-y-1 hover:border-border-strong"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">r/{t.slug}</span>
                    {t._count.children > 0 && <Badge variant="accent">{t._count.children} sub</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted line-clamp-2">{t.description}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-2">
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="size-3.5" /> {t._count.posts} posts
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3.5" /> Active
                    </span>
                  </div>
                </Link>
              ))}
              {c.threads.length === 0 && (
                <p className="text-sm text-muted">No communities yet.</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
