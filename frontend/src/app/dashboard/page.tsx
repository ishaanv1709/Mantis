import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { CLERK_ENABLED } from "@/lib/config";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Real accounts must pick a type first; a person and a company stay separate.
  if (CLERK_ENABLED && !user.onboarded) redirect("/onboarding");

  // ---- User-side data ----
  const owned = await prisma.userProduct.findMany({
    where: { userId: user.id },
    include: {
      product: { include: { recalls: true } },
      warranty: true,
      tasks: { orderBy: { dueAt: "asc" } },
    },
  });
  const myRatings = await prisma.rating.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  const marketplace = await prisma.product.findMany({
    select: { id: true, name: true, category: true },
    orderBy: { name: "asc" },
  });

  const userData = {
    products: owned.map((o) => ({
      id: o.product.id,
      name: o.product.name,
      category: o.product.category,
      image: o.product.imageUrl,
      serial: o.serialNumber,
      warrantyExpires: o.warranty?.expiresAt.toISOString() ?? null,
      recalls: o.product.recalls.map((r) => ({ title: r.title, severity: r.severity })),
      tasks: o.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        dueAt: t.dueAt.toISOString(),
        completed: !!t.completedAt,
      })),
    })),
    ratings: myRatings.map((r) => ({ id: r.id, product: r.product.name, stars: r.stars, body: r.body })),
  };

  // ---- Company-side data ----
  // Only fetch the (heavy) company workspace when it will actually be shown:
  // a real COMPANY account, or guest-demo mode where the toggle exists.
  const needCompany = user.role === "COMPANY" || !CLERK_ENABLED;
  const company = needCompany
    ? await prisma.companyProfile.findFirst({
        where: user.role === "COMPANY" ? { userId: user.id } : {},
        include: {
          products: {
            include: {
              ratings: { include: { user: true }, orderBy: { createdAt: "desc" } },
              sessions: true,
              manuals: true,
            },
          },
        },
      })
    : null;

  const companyData = company
    ? {
        name: company.name,
        products: company.products.map((p) => {
          const category = p.category;
          const count = p.ratings.length;
          const avg = count ? p.ratings.reduce((s, r) => s + r.stars, 0) / count : 0;
          const dist = [1, 2, 3, 4, 5].map((s) => p.ratings.filter((r) => r.stars === s).length);
          const issueCount: Record<string, number> = {};
          [...p.ratings.map((r) => r.issueTag), ...p.sessions.map((s) => s.issueTag)].forEach((t) => {
            if (t) issueCount[t] = (issueCount[t] ?? 0) + 1;
          });
          const topIssues = Object.entries(issueCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([tag, n]) => ({ tag, n }));
          const resolved = p.sessions.filter((s) => s.resolved).length;
          const resolveRate = p.sessions.length ? resolved / p.sessions.length : 0;
          const health = Math.round((avg / 5) * 60 + resolveRate * 40);
          // Top reviews: written reviews, highest-rated first.
          const reviews = p.ratings
            .filter((r) => r.body && r.body.trim())
            .sort((a, b) => b.stars - a.stars || +b.createdAt - +a.createdAt)
            .slice(0, 4)
            .map((r) => ({
              id: r.id,
              stars: r.stars,
              title: r.title,
              body: r.body!,
              author: `${r.user.firstName ?? "User"} ${r.user.lastName ?? ""}`.trim(),
              date: r.createdAt.toISOString(),
            }));
          return { id: p.id, name: p.name, category, image: p.imageUrl, manuals: p.manuals.length, avg, count, dist, topIssues, resolveRate, health, sessions: p.sessions.length, reviews };
        }),
      }
    : null;

  return (
    <DashboardClient
      userName={`${user.firstName ?? "Guest"} ${user.lastName ?? ""}`.trim()}
      userAvatar={user.avatarUrl}
      role={user.role}
      allowToggle={!CLERK_ENABLED}
      userData={userData}
      companyData={companyData}
      allProducts={marketplace}
    />
  );
}
