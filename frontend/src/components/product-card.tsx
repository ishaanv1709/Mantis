import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { ProductImage } from "@/components/product-image";

export type ProductCardData = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  imageUrl: string | null;
  companyName?: string;
  avgStars?: number;
  ratingCount?: number;
};

export function ProductCard({ p }: { p: ProductCardData }) {
  return (
    <Link
      href={`/product/${p.id}`}
      className="group card-soft overflow-hidden transition-all hover:-translate-y-1 hover:border-border-strong"
    >
      <div className="aspect-[4/3] overflow-hidden bg-surface-2">
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
          <ProductImage src={p.imageUrl} category={p.category} name={p.name} />
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <Badge>{p.category}</Badge>
          {typeof p.avgStars === "number" && (
            <span className="inline-flex items-center gap-1 text-sm text-muted">
              <Star className="size-3.5 fill-yellow-pure text-yellow-pure" />
              {p.avgStars.toFixed(1)}
              {p.ratingCount ? <span className="text-muted-2">({p.ratingCount})</span> : null}
            </span>
          )}
        </div>
        <h3 className="mt-3 text-lg font-bold leading-snug">{p.name}</h3>
        {p.companyName && <p className="text-xs text-muted-2">{p.companyName}</p>}
        <p className="mt-2 line-clamp-2 text-sm text-muted">{p.description}</p>
      </div>
    </Link>
  );
}
