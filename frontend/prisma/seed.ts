import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BF = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID || "";
const logo = (domain: string) =>
  `https://cdn.brandfetch.io/${domain}/w/128/h/128/type/icon${BF ? `?c=${BF}` : ""}`;

// Product IDs MUST match backend/app/seed.py so marketplace ↔ Moss indexes align.
type P = { id: string; name: string; category: string; description: string; issues: string[] };

const COMPANIES: {
  slug: string;
  name: string;
  domain: string;
  description: string;
  products: P[];
  threads: { slug: string; title: string; desc: string; subs?: { slug: string; title: string; desc: string }[] }[];
}[] = [
  {
    slug: "dyson",
    name: "Dyson",
    domain: "dyson.com",
    description: "Cord-free vacuums, purifiers and hair care.",
    products: [
      {
        id: "dyson-v15",
        name: "Dyson V15 Detect",
        category: "Vacuums",
        description: "Cordless vacuum with laser dust detection and HEPA filtration.",
        issues: ["Pulsing during use", "Battery won't charge", "Brush bar stopped"],
      },
    ],
    threads: [
      { slug: "vacuums", title: "Vacuums", desc: "V-series help, tips & teardown.", subs: [{ slug: "vacuums-battery", title: "Battery & charging", desc: "Runtime, charging and battery swaps." }] },
      { slug: "general", title: "General", desc: "Anything Dyson." },
    ],
  },
  {
    slug: "sony",
    name: "Sony",
    domain: "sony.com",
    description: "Cameras, audio and electronics.",
    products: [
      {
        id: "sony-a7iv",
        name: "Sony Alpha A7 IV",
        category: "Cameras",
        description: "33MP full-frame hybrid mirrorless camera.",
        issues: ["Overheating in 4K", "Card error", "Autofocus hunting"],
      },
    ],
    threads: [
      { slug: "alpha", title: "Alpha cameras", desc: "Mirrorless bodies, lenses & firmware." },
      { slug: "general", title: "General", desc: "Anything Sony." },
    ],
  },
  {
    slug: "acme",
    name: "Acme Manufacturing",
    domain: "acme.com",
    description: "Appliances and personal mobility.",
    products: [
      {
        id: "acme-washer",
        name: "Acme FrontLoad Washer WX-500",
        category: "Appliances",
        description: "8kg front-load washing machine with EcoSilence drive.",
        issues: ["Won't drain (E20)", "No water (E10)", "Door won't open"],
      },
      {
        id: "zip-scooter",
        name: "Zip Electric Scooter S2",
        category: "Mobility",
        description: "36V commuter e-scooter, 25 km/h, 30km range.",
        issues: ["Horn not working", "Won't power on", "Throttle fault E2"],
      },
    ],
    threads: [
      {
        slug: "washers",
        title: "Washers",
        desc: "Front-load washer help & discussion.",
        subs: [{ slug: "washers-error-codes", title: "Error codes", desc: "Decode E10 / E20 / F08 and more." }],
      },
      { slug: "scooters", title: "Scooters", desc: "S2 commuter scooter community." },
    ],
  },
  {
    slug: "bosch",
    name: "Bosch",
    domain: "bosch.com",
    description: "Power tools and home appliances.",
    products: [],
    threads: [
      { slug: "power-tools", title: "Power tools", desc: "Drills, drivers & batteries." },
      { slug: "appliances", title: "Appliances", desc: "Dishwashers, ovens & more." },
    ],
  },
  {
    slug: "samsung",
    name: "Samsung",
    domain: "samsung.com",
    description: "Phones, TVs and home appliances.",
    products: [],
    threads: [
      { slug: "galaxy", title: "Galaxy", desc: "Phones, tablets & wearables." },
      { slug: "home", title: "Home appliances", desc: "Fridges, washers & TVs." },
    ],
  },
  {
    slug: "tesla",
    name: "Tesla",
    domain: "tesla.com",
    description: "Electric vehicles and energy.",
    products: [],
    threads: [
      { slug: "model-3", title: "Model 3", desc: "Owners helping owners." },
      { slug: "charging", title: "Charging", desc: "Home & Supercharging tips." },
    ],
  },
  {
    slug: "lg",
    name: "LG",
    domain: "lg.com",
    description: "Home entertainment and appliances.",
    products: [],
    threads: [{ slug: "appliances", title: "Appliances", desc: "Washers, fridges & ACs." }],
  },
];

async function ensureUser(email: string, role: "USER" | "COMPANY", first: string, last: string) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, role, firstName: first, lastName: last, onboarded: true },
  });
}

async function main() {
  const guest = await ensureUser("guest@mantis.local", "USER", "Guest", "User");
  const helpers = await Promise.all(
    [1, 2, 3, 4].map((i) => ensureUser(`user${i}@mantis.local`, "USER", "User", `${i}`))
  );

  for (const c of COMPANIES) {
    const owner = await ensureUser(`${c.slug}@mantis.local`, "COMPANY", c.name, "Team");
    const company = await prisma.companyProfile.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, logoUrl: logo(c.domain) },
      create: {
        userId: owner.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        logoUrl: logo(c.domain),
      },
    });

    // Products
    for (const p of c.products) {
      const product = await prisma.product.upsert({
        where: { id: p.id },
        update: {
          companyId: company.id,
          name: p.name,
          category: p.category,
          description: p.description,
          imageUrl: `/products/${p.id}.jpg`,
          mossIndexId: `product-${p.id}`,
        },
        create: {
          id: p.id,
          companyId: company.id,
          name: p.name,
          category: p.category,
          description: p.description,
          imageUrl: `/products/${p.id}.jpg`,
          mossIndexId: `product-${p.id}`,
        },
      });

      await prisma.manual.deleteMany({ where: { productId: product.id } });
      await prisma.manual.create({
        data: { productId: product.id, title: `${p.name} Service Manual`, kind: "pdf", chunkCount: 12 },
      });

      await prisma.maintenanceSchedule.deleteMany({ where: { productId: product.id } });
      await prisma.maintenanceSchedule.create({
        data: { productId: product.id, title: "Routine service", description: "Clean/replace filters and inspect for wear.", intervalDays: 180 },
      });

      await prisma.sparePart.deleteMany({ where: { productId: product.id } });
      await prisma.sparePart.createMany({
        data: [
          { productId: product.id, name: "Replacement filter", partNumber: `${p.id}-FILT`, price: 24.99, forSymptom: "noise" },
          { productId: product.id, name: "Service kit", partNumber: `${p.id}-KIT`, price: 49.0 },
        ],
      });

      if (p.id === "acme-washer") {
        await prisma.recall.deleteMany({ where: { productId: product.id } });
        await prisma.recall.create({
          data: {
            productId: product.id,
            title: "Safety notice: door seal inspection",
            severity: "safety",
            body: "Units manufactured before 2025 should have the door seal inspected for premature wear.",
          },
        });
      }

      await prisma.rating.deleteMany({ where: { productId: product.id } });
      for (let i = 0; i < 5; i++) {
        await prisma.rating.create({
          data: {
            productId: product.id,
            userId: i === 0 ? guest.id : helpers[i % helpers.length].id,
            stars: 3 + (i % 3),
            title: i % 2 ? "Solid" : "Great with Mantis",
            body: "Mantis helped me sort this out quickly.",
            issueTag: p.issues[i % p.issues.length],
          },
        });
      }

      await prisma.diagnosticSession.deleteMany({ where: { productId: product.id } });
      for (let i = 0; i < 9; i++) {
        await prisma.diagnosticSession.create({
          data: {
            productId: product.id,
            userId: guest.id,
            issueTag: p.issues[i % p.issues.length],
            resolved: i % 3 !== 0,
            rating: 3 + (i % 3),
            endedAt: new Date(),
          },
        });
      }
    }

    // Threads + sub-threads
    for (const t of c.threads) {
      const thread = await prisma.thread.upsert({
        where: { companyId_slug: { companyId: company.id, slug: t.slug } },
        update: { title: t.title, description: t.desc },
        create: { companyId: company.id, slug: t.slug, title: t.title, description: t.desc },
      });
      for (const sub of t.subs ?? []) {
        await prisma.thread.upsert({
          where: { companyId_slug: { companyId: company.id, slug: sub.slug } },
          update: { title: sub.title, description: sub.desc, parentId: thread.id },
          create: { companyId: company.id, slug: sub.slug, title: sub.title, description: sub.desc, parentId: thread.id },
        });
      }
    }
  }

  // Owned products + maintenance + warranty for the guest
  for (const pid of ["acme-washer", "zip-scooter"]) {
    const up = await prisma.userProduct.upsert({
      where: { userId_productId: { userId: guest.id, productId: pid } },
      update: {},
      create: { userId: guest.id, productId: pid, serialNumber: `SN-${pid.toUpperCase()}-001` },
    });
    await prisma.warranty.upsert({
      where: { userProductId: up.id },
      update: {},
      create: {
        userProductId: up.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * (pid === "zip-scooter" ? 20 : 200)),
        provider: "Care+",
      },
    });
    await prisma.maintenanceTask.deleteMany({ where: { userProductId: up.id } });
    await prisma.maintenanceTask.createMany({
      data: [
        { userProductId: up.id, title: "Clean drain filter", dueAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
        { userProductId: up.id, title: "Inspect seals", dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12) },
      ],
    });
  }

  // Seed a sample discussion in Acme washers
  const acme = await prisma.companyProfile.findUnique({ where: { slug: "acme" } });
  if (acme) {
    const washers = await prisma.thread.findUnique({
      where: { companyId_slug: { companyId: acme.id, slug: "washers" } },
    });
    const owner = await prisma.user.findUnique({ where: { email: "acme@mantis.local" } });
    if (washers && owner) {
      await prisma.post.deleteMany({ where: { threadId: washers.id } });
      const post = await prisma.post.create({
        data: {
          threadId: washers.id,
          authorId: guest.id,
          title: "WX-500 won't drain, shows E20 — pulsating too",
          content: "Mid-cycle it stops and beeps with E20. Anyone seen this? Is it a big job?",
          upvotes: 24,
        },
      });
      const reply = await prisma.post.create({
        data: {
          threadId: washers.id,
          authorId: owner.id,
          parentId: post.id,
          isOfficial: true,
          upvotes: 18,
          content:
            "E20 = clogged drain pump filter. Unplug first, open the lower panel, unscrew the filter and clear debris. 3/10 difficulty. If it persists the pump may need replacing (call a pro).",
        },
      });
      await prisma.post.create({
        data: {
          threadId: washers.id,
          authorId: guest.id,
          parentId: reply.id,
          upvotes: 9,
          content: "That fixed it — there was a coin stuck in the filter. Thank you!",
        },
      });
    }
  }

  console.log("✅ Seed complete");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
