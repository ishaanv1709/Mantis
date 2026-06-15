import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const { threadId, title, content, parentId, mediaUrl, audioUrl } = await req.json();
  if (!threadId || (!content && !mediaUrl && !audioUrl)) {
    return NextResponse.json({ error: "threadId and content required" }, { status: 400 });
  }
  // Company owners answering in their own thread get the Official badge.
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: { company: true },
  });
  const isOfficial = thread?.company.userId === user.id;

  const post = await prisma.post.create({
    data: {
      threadId,
      authorId: user.id,
      title: title || null,
      content: content || "",
      parentId: parentId || null,
      mediaUrl: mediaUrl || null,
      audioUrl: audioUrl || null,
      isOfficial,
    },
  });
  return NextResponse.json({ post });
}
