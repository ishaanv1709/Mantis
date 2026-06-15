import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { CLERK_ENABLED } from "./config";

const GUEST_EMAIL = "guest@mantis.local";

export type SessionUser = {
  id: string;
  email: string;
  role: "USER" | "COMPANY";
  onboarded: boolean;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

/** Current account. With Clerk: syncs Clerk -> Prisma (new accounts start
 *  un-onboarded so they must pick User or Company). Guest mode returns a
 *  persistent demo USER account. */
export async function getCurrentUser(): Promise<SessionUser> {
  if (CLERK_ENABLED) {
    const { currentUser } = await import("@clerk/nextjs/server");
    const cu = await currentUser();
    if (cu) {
      const email = cu.emailAddresses[0]?.emailAddress ?? `${cu.id}@clerk.local`;
      const user = await prisma.user.upsert({
        where: { clerkId: cu.id },
        update: { email, firstName: cu.firstName, lastName: cu.lastName, avatarUrl: cu.imageUrl },
        create: {
          clerkId: cu.id,
          email,
          firstName: cu.firstName,
          lastName: cu.lastName,
          avatarUrl: cu.imageUrl,
          onboarded: false,
        },
      });
      return user as SessionUser;
    }
    // Clerk is on but no session: require sign-in. NEVER fall back to the demo
    // guest here, or a real account would render seeded guest data.
    redirect("/sign-in");
  }
  // Guest mode only applies when Clerk is fully disabled (no keys).
  const guest = await prisma.user.upsert({
    where: { email: GUEST_EMAIL },
    update: {},
    create: { email: GUEST_EMAIL, firstName: "Guest", lastName: "User", role: "USER", onboarded: true },
  });
  return guest as SessionUser;
}

/** Like getCurrentUser but returns null instead of redirecting — for API
 *  routes, which should answer with JSON (401) rather than a redirect. */
export async function getOptionalUser(): Promise<SessionUser | null> {
  if (CLERK_ENABLED) {
    const { currentUser } = await import("@clerk/nextjs/server");
    const cu = await currentUser();
    if (!cu) return null;
    const email = cu.emailAddresses[0]?.emailAddress ?? `${cu.id}@clerk.local`;
    const user = await prisma.user.upsert({
      where: { clerkId: cu.id },
      update: { email, firstName: cu.firstName, lastName: cu.lastName, avatarUrl: cu.imageUrl },
      create: {
        clerkId: cu.id,
        email,
        firstName: cu.firstName,
        lastName: cu.lastName,
        avatarUrl: cu.imageUrl,
        onboarded: false,
      },
    });
    return user as SessionUser;
  }
  const guest = await prisma.user.upsert({
    where: { email: GUEST_EMAIL },
    update: {},
    create: { email: GUEST_EMAIL, firstName: "Guest", lastName: "User", role: "USER", onboarded: true },
  });
  return guest as SessionUser;
}

/** Set the account type once, during onboarding. Creates a CompanyProfile for
 *  company accounts. A single account is either a USER or a COMPANY, never both. */
export async function completeOnboarding(role: "USER" | "COMPANY", companyName?: string) {
  const user = await getCurrentUser();
  await prisma.user.update({ where: { id: user.id }, data: { role, onboarded: true } });

  if (role === "COMPANY") {
    const existing = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
    if (!existing) {
      const base = (companyName || `${user.firstName ?? "My"} Company`).trim();
      let slug = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "company";
      // ensure unique slug
      let n = 1;
      while (await prisma.companyProfile.findUnique({ where: { slug } })) {
        slug = `${slug}-${n++}`;
      }
      await prisma.companyProfile.create({
        data: { userId: user.id, name: base, slug, description: `${base} on Mantis.` },
      });
    }
  }
  return role;
}
