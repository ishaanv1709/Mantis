import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { postId, dir } = await req.json();
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });
  const post = await prisma.post.update({
    where: { id: postId },
    data: { upvotes: { increment: dir === -1 ? -1 : 1 } },
  });
  return NextResponse.json({ upvotes: post.upvotes });
}
