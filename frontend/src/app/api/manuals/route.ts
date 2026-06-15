import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/auth";

export const runtime = "nodejs";

/** Records a manual/resource after the file has been uploaded straight to the
 *  AI backend by the client. Takes JSON (no multipart) to avoid the Next
 *  route-handler formData parsing bug in production. */
export async function POST(req: Request) {
  try {
    const user = await getOptionalUser();
    if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    if (user.role !== "COMPANY") {
      return NextResponse.json({ error: "Only company accounts can upload manuals." }, { status: 403 });
    }
    const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
    if (!company) return NextResponse.json({ error: "No company profile." }, { status: 400 });

    const { productId, title, kind, chunks } = await req.json();
    if (!productId || !title) {
      return NextResponse.json({ error: "productId and title required." }, { status: 400 });
    }
    const product = await prisma.product.findFirst({ where: { id: productId, companyId: company.id } });
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

    const manual = await prisma.manual.create({
      data: {
        productId,
        title: String(title),
        kind: kind || "file",
        chunkCount: Number(chunks) || 0,
      },
    });
    return NextResponse.json({ manual });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to record manual." },
      { status: 500 }
    );
  }
}
