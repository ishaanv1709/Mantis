import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { RatingForm } from "@/components/rating-form";
import { OwnButton } from "@/components/own-button";
import { ProductImage } from "@/components/product-image";
import { FileText, Star, ShieldAlert, Wrench, MessageSquare, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      company: true,
      manuals: true,
      recalls: true,
      spareParts: true,
      ratings: { include: { user: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!product) notFound();

  const count = product.ratings.length;
  const avg = count ? product.ratings.reduce((s, r) => s + r.stars, 0) / count : 0;

  return (
    <div className="container-mantis pt-32 pb-20">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: image + meta */}
        <div>
          <div className="card-soft overflow-hidden">
            <div className="aspect-[16/10] bg-surface-2">
              <ProductImage src={product.imageUrl} category={product.category} name={product.name} />
            </div>
          </div>

          {product.recalls.length > 0 && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
              {product.recalls.map((r) => (
                <div key={r.id} className="flex gap-3">
                  <ShieldAlert className="size-5 shrink-0 text-red-600" />
                  <div>
                    <p className="font-bold text-red-700">{r.title}</p>
                    <p className="text-sm text-red-600/90">{r.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-lg font-bold">Documentation</h2>
            <div className="mt-3 space-y-2">
              {product.manuals.map((m) => (
                <div key={m.id} className="flex items-center justify-between card-soft px-4 py-3">
                  <span className="flex items-center gap-2 text-sm">
                    <FileText className="size-4 text-muted" /> {m.title}
                    <Badge variant="accent">{m.kind}</Badge>
                  </span>
                  <span className="text-xs text-muted-2">{m.chunkCount} chunks indexed</span>
                </div>
              ))}
              {product.manuals.length === 0 && (
                <p className="text-sm text-muted">No manuals uploaded yet.</p>
              )}
            </div>
          </div>

          {product.spareParts.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-bold">Spare parts</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {product.spareParts.map((s) => (
                  <div key={s.id} className="flex items-center justify-between card-soft px-4 py-3">
                    <span className="flex items-center gap-2 text-sm">
                      <Wrench className="size-4 text-muted" /> {s.name}
                      {s.partNumber && <span className="text-xs text-muted-2">{s.partNumber}</span>}
                    </span>
                    {s.price != null && <span className="font-semibold">${s.price.toFixed(2)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: details + CTA + ratings */}
        <div>
          <Link href={`/threads/${product.company.slug}`} className="text-sm text-muted hover:text-ink">
            {product.company.name}
          </Link>
          <h1 className="display mt-1 text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <Badge>{product.category}</Badge>
            <span className="inline-flex items-center gap-1 text-sm">
              <Star className="size-4 fill-yellow-pure text-yellow-pure" />
              {avg.toFixed(1)} <span className="text-muted-2">({count} reviews)</span>
            </span>
          </div>
          <p className="mt-4 text-muted">{product.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/chat?product=${product.id}`} className="pill pill-dark h-12 px-6">
              <MessageSquare className="size-4" /> Start diagnostics <ArrowRight className="size-4" />
            </Link>
            <OwnButton productId={product.id} />
          </div>

          <Card className="mt-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold">Rate this product</h2>
              <p className="mb-4 text-sm text-muted">
                Your feedback powers the company&apos;s health insights.
              </p>
              <RatingForm productId={product.id} />
            </CardContent>
          </Card>

          <div className="mt-6 space-y-3">
            {product.ratings.slice(0, 5).map((r) => (
              <div key={r.id} className="card-soft p-4">
                <div className="flex items-center gap-2">
                  <Avatar name={`${r.user.firstName ?? "User"} ${r.user.lastName ?? ""}`} size={28} />
                  <span className="text-sm font-semibold">
                    {r.user.firstName} {r.user.lastName}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i < r.stars ? "size-3.5 fill-yellow-pure text-yellow-pure" : "size-3.5 text-border-strong"
                        }
                      />
                    ))}
                  </span>
                </div>
                {r.body && <p className="mt-2 text-sm text-muted">{r.body}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
