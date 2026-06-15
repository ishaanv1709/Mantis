import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const { productId, stars, title, body, issueTag } = await req.json();
  if (!productId || !stars) {
    return NextResponse.json({ error: "productId and stars required" }, { status: 400 });
  }
  const rating = await prisma.rating.upsert({
    where: { productId_userId: { productId, userId: user.id } },
    update: { stars, title, body, issueTag },
    create: { productId, userId: user.id, stars, title, body, issueTag },
  });
  return NextResponse.json({ rating });
}
