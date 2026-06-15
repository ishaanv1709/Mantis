import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CompanyThreads({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company } = await params;
  const cp = await prisma.companyProfile.findUnique({
    where: { slug: company },
    include: { threads: { where: { parentId: null }, take: 1 } },
  });
  if (!cp) notFound();
  if (cp.threads[0]) redirect(`/threads/${company}/${cp.threads[0].slug}`);
  redirect("/threads");
}
