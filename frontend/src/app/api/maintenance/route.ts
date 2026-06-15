import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { taskId, done } = await req.json();
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });
  const task = await prisma.maintenanceTask.update({
    where: { id: taskId },
    data: { completedAt: done === false ? null : new Date() },
  });
  return NextResponse.json({ task });
}
