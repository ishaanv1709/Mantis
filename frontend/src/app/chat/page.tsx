import { prisma } from "@/lib/prisma";
import { ChatApp } from "@/components/chat/chat-app";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;
  const products = await prisma.product.findMany({
    select: { id: true, name: true, category: true, imageUrl: true },
    orderBy: { name: "asc" },
  });
  // Default to "All products" unless a specific product was requested.
  const initial = products.find((p) => p.id === product)?.id ?? "__all__";
  return <ChatApp products={products} initialProductId={initial} />;
}
