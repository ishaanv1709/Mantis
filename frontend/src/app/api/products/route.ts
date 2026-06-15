import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (user.role !== "COMPANY") {
    return NextResponse.json({ error: "Only company accounts can add products" }, { status: 403 });
  }
  const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
  if (!company) return NextResponse.json({ error: "No company profile" }, { status: 400 });

  const { name, category, description, imageUrl } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const product = await prisma.product.create({
    data: {
      companyId: company.id,
      name: name.trim(),
      category: category?.trim() || "General",
      description: description?.trim() || null,
      imageUrl: typeof imageUrl === "string" && imageUrl ? imageUrl : null,
    },
  });
  // mossIndexId follows the backend convention product-<id>
  await prisma.product.update({
    where: { id: product.id },
    data: { mossIndexId: `product-${product.id}` },
  });

  // default maintenance schedule
  await prisma.maintenanceSchedule.create({
    data: { productId: product.id, title: "Routine service", intervalDays: 180 },
  });

  return NextResponse.json({ product });
}
