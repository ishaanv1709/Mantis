import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/auth";

export async function DELETE(req: Request) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  await prisma.userProduct.deleteMany({ where: { userId: user.id, productId } });
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { productId, serialNumber } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const up = await prisma.userProduct.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    update: { serialNumber },
    create: { userId: user.id, productId, serialNumber },
  });

  // Seed maintenance tasks from the product's schedules
  const schedules = await prisma.maintenanceSchedule.findMany({ where: { productId } });
  for (const s of schedules) {
    const exists = await prisma.maintenanceTask.findFirst({
      where: { userProductId: up.id, scheduleId: s.id },
    });
    if (!exists) {
      await prisma.maintenanceTask.create({
        data: {
          userProductId: up.id,
          scheduleId: s.id,
          title: s.title,
          dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * s.intervalDays),
        },
      });
    }
  }
  return NextResponse.json({ ok: true, id: up.id });
}
