import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import { MarketplaceSearch } from "@/components/marketplace-search";

export const dynamic = "force-dynamic";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q, cat } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      AND: [
        q
          ? { OR: [{ name: { contains: q } }, { description: { contains: q } }] }
          : {},
        cat && cat !== "All" ? { category: cat } : {},
      ],
    },
    include: { company: true, ratings: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = ["All", ...Array.from(new Set((await prisma.product.findMany({ select: { category: true } })).map((p) => p.category)))];

  const cards = products.map((p) => {
    const count = p.ratings.length;
    const avg = count ? p.ratings.reduce((s, r) => s + r.stars, 0) / count : 0;
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      imageUrl: p.imageUrl,
      companyName: p.company.name,
      avgStars: avg,
      ratingCount: count,
    };
  });

  return (
    <div className="container-mantis pt-32 pb-20">
      <div className="max-w-2xl">
        <h1 className="display text-4xl sm:text-5xl">Product marketplace</h1>
        <p className="mt-3 text-muted">
          Browse products and get an official, manual-grounded assistant for each one.
        </p>
      </div>

      <div className="mt-8">
        <MarketplaceSearch categories={categories} initialQuery={q} initialCat={cat} />
      </div>

      {cards.length === 0 ? (
        <div className="mt-16 card-soft p-12 text-center text-muted">
          No products match your search.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
