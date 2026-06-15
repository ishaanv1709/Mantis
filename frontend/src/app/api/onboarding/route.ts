import { NextResponse } from "next/server";
import { completeOnboarding } from "@/lib/auth";

export async function POST(req: Request) {
  const { role, companyName } = await req.json();
  if (role !== "USER" && role !== "COMPANY") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  await completeOnboarding(role, companyName);
  return NextResponse.json({ ok: true });
}
