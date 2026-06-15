"use client";
import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, timeAgo } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/product-image";
import { AddProductDialog } from "@/components/dashboard/add-product-dialog";
import { ManualUpload } from "@/components/dashboard/manual-upload";
import { AddOwnedDialog } from "@/components/dashboard/add-owned-dialog";

type Opt = { id: string; name: string; category: string };
import {
  Package,
  CalendarClock,
  ShieldCheck,
  Star,
  Activity,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Circle,
  Upload,
  FileText,
  Trash2,
} from "lucide-react";

type UserData = {
  products: {
    id: string;
    name: string;
    category: string;
    image: string | null;
    serial: string | null;
    warrantyExpires: string | null;
    recalls: { title: string; severity: string }[];
    tasks: { id: string; title: string; dueAt: string; completed: boolean }[];
  }[];
  ratings: { id: string; product: string; stars: number; body: string | null }[];
};

type CompanyData = {
  name: string;
  products: {
    id: string;
    name: string;
    category: string;
    image: string | null;
    manuals: number;
    avg: number;
    count: number;
    dist: number[];
    topIssues: { tag: string; n: number }[];
    resolveRate: number;
    health: number;
    sessions: number;
    reviews: { id: string; stars: number; title: string | null; body: string; author: string; date: string }[];
  }[];
} | null;

export function DashboardClient({
  userName,
  userAvatar,
  role,
  allowToggle = false,
  userData,
  companyData,
  allProducts = [],
}: {
  userName: string;
  userAvatar: string | null;
  role: string;
  allowToggle?: boolean;
  userData: UserData;
  companyData: CompanyData;
  allProducts?: Opt[];
}) {
  const [tab, setTab] = useState<"user" | "company">(role === "COMPANY" ? "company" : "user");

  return (
    <div className="container-mantis pt-28 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={userName} src={userAvatar} size={48} />
          <div>
            <h1 className="text-2xl font-extrabold">{userName || "Guest User"}</h1>
            <p className="text-sm text-muted-2">
              {role === "COMPANY" ? "Company account" : "Personal account"}
            </p>
          </div>
        </div>
        {allowToggle ? (
          <div className="flex items-center gap-1 rounded-full border border-border bg-white p-1">
            {(["user", "company"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                  tab === t ? "bg-ink text-white" : "text-muted hover:text-ink"
                )}
              >
                {t === "user" ? "My space" : "Company workspace"}
              </button>
            ))}
          </div>
        ) : (
          <span className="rounded-full border border-border bg-white px-4 py-1.5 text-sm font-semibold">
            {role === "COMPANY" ? "Company workspace" : "My space"}
          </span>
        )}
      </div>

      <div className="mt-8">
        {(allowToggle ? tab === "company" : role === "COMPANY") ? (
          <CompanyView data={companyData} />
        ) : (
          <UserView data={userData} allProducts={allProducts} />
        )}
      </div>
    </div>
  );
}

/* ----------------------------- USER VIEW ----------------------------- */

function UserView({ data, allProducts }: { data: UserData; allProducts: Opt[] }) {
  const allTasks = data.products.flatMap((p) => p.tasks.map((t) => ({ ...t, product: p.name })));
  const overdue = allTasks.filter((t) => !t.completed && new Date(t.dueAt) < new Date());
  const upcoming = allTasks.filter((t) => !t.completed && new Date(t.dueAt) >= new Date());
  const expiringWarranties = data.products.filter(
    (p) => p.warrantyExpires && new Date(p.warrantyExpires).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 30
  );
  const recalls = data.products.flatMap((p) => p.recalls.map((r) => ({ ...r, product: p.name })));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Package} label="Products owned" value={data.products.length} />
        <Stat icon={CalendarClock} label="Overdue tasks" value={overdue.length} tone={overdue.length ? "warn" : "ok"} />
        <Stat icon={ShieldCheck} label="Warranties expiring" value={expiringWarranties.length} tone={expiringWarranties.length ? "warn" : "ok"} />
        <Stat icon={AlertTriangle} label="Active recalls" value={recalls.length} tone={recalls.length ? "warn" : "ok"} />
      </div>

      {(recalls.length > 0 || expiringWarranties.length > 0) && (
        <div className="space-y-2">
          {recalls.map((r, i) => (
            <Alert key={`r${i}`} tone="warn">
              <b>{r.product}:</b> {r.title}
            </Alert>
          ))}
          {expiringWarranties.map((p) => (
            <Alert key={p.id} tone="info">
              <b>{p.name}</b> warranty expires {timeAgo(p.warrantyExpires!)}, renew to stay covered.
            </Alert>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold">My products</h2>
              <AddOwnedDialog products={allProducts} ownedIds={data.products.map((p) => p.id)} />
            </div>
            <div className="mt-4 space-y-3">
              {data.products.length === 0 && (
                <p className="text-sm text-muted">
                  No products yet.{" "}
                  <Link href="/marketplace" className="underline">
                    Browse the marketplace
                  </Link>{" "}
                  and add what you own.
                </p>
              )}
              {data.products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <span className="size-12 overflow-hidden rounded-lg bg-surface-2">
                    <ProductImage src={p.image} category={p.category} name={p.name} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-2">{p.serial}</p>
                  </div>
                  <Link href={`/chat?product=${p.id}`} className="pill pill-outline text-xs">
                    Diagnose
                  </Link>
                  <RemoveOwnedButton productId={p.id} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold">Maintenance</h2>
            <div className="mt-4 space-y-2">
              {[...overdue, ...upcoming].length === 0 && (
                <p className="text-sm text-muted">No scheduled tasks.</p>
              )}
              {[...overdue, ...upcoming].map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-bold">My ratings &amp; reviews</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.ratings.length === 0 && <p className="text-sm text-muted">You haven&apos;t rated anything yet.</p>}
            {data.ratings.map((r) => (
              <div key={r.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{r.product}</span>
                  <Stars n={r.stars} />
                </div>
                {r.body && <p className="mt-1 text-sm text-muted">{r.body}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskRow({ task }: { task: { id: string; title: string; dueAt: string; completed: boolean; product: string } }) {
  const router = useRouter();
  const [done, setDone] = useState(task.completed);
  const overdue = !done && new Date(task.dueAt) < new Date();
  async function toggle() {
    setDone((d) => !d);
    await fetch("/api/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: task.id, done: !done }),
    });
    router.refresh();
  }
  return (
    <button
      onClick={toggle}
      className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left hover:bg-surface-2"
    >
      {done ? <CheckCircle2 className="size-5 text-green-600" /> : <Circle className="size-5 text-muted-2" />}
      <div className="flex-1">
        <p className={cn("text-sm font-medium", done && "text-muted-2 line-through")}>{task.title}</p>
        <p className="text-xs text-muted-2">{task.product}</p>
      </div>
      {!done && (
        <Badge variant={overdue ? "warning" : "default"}>
          {overdue ? "Overdue" : "Due " + timeAgo(task.dueAt)}
        </Badge>
      )}
    </button>
  );
}

/* --------------------------- COMPANY VIEW --------------------------- */

function CompanyView({ data }: { data: CompanyData }) {
  if (!data) return <p className="text-muted">No company workspace found.</p>;
  const totalSessions = data.products.reduce((s, p) => s + p.sessions, 0);
  const avgHealth = Math.round(data.products.reduce((s, p) => s + p.health, 0) / Math.max(data.products.length, 1));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Package} label="Listed products" value={data.products.length} />
        <Stat icon={Activity} label="Diagnostic sessions" value={totalSessions} />
        <Stat icon={Star} label="Avg health score" value={avgHealth} />
        <Stat icon={FileText} label="Manuals indexed" value={data.products.reduce((s, p) => s + p.manuals, 0)} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Products &amp; insights</h2>
        <AddProductDialog />
      </div>

      {data.products.length === 0 && (
        <div className="card-soft p-12 text-center">
          <p className="font-semibold">No products yet</p>
          <p className="mt-1 text-sm text-muted">
            Add your first product, then upload its manual to give it a working assistant.
          </p>
          <div className="mt-5 flex justify-center">
            <AddProductDialog />
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {data.products.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <span className="size-14 overflow-hidden rounded-xl bg-surface-2">
                  <ProductImage src={p.image} category={p.category} name={p.name} />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{p.name}</h3>
                    <HealthRing value={p.health} />
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                    <Stars n={Math.round(p.avg)} /> {p.avg.toFixed(1)} ({p.count})
                  </div>
                </div>
              </div>

              {/* star distribution */}
              <div className="mt-4 space-y-1">
                {[5, 4, 3, 2, 1].map((s) => {
                  const n = p.dist[s - 1];
                  const pct = p.count ? (n / p.count) * 100 : 0;
                  return (
                    <div key={s} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-muted-2">{s}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                        <span className="block h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="w-5 text-right text-muted-2">{n}</span>
                    </div>
                  );
                })}
              </div>

              {/* top issues */}
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-2">
                  Most common problems
                </p>
                <div className="mt-2 space-y-1.5">
                  {p.topIssues.length === 0 && <p className="text-sm text-muted">No data yet.</p>}
                  {p.topIssues.map((it) => {
                    const max = p.topIssues[0]?.n || 1;
                    return (
                      <div key={it.tag} className="flex items-center gap-2 text-sm">
                        <span className="w-32 truncate capitalize">{it.tag.replace(/_/g, " ")}</span>
                        <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                          <span
                            className="block h-full rounded-full bg-yellow-pure"
                            style={{ width: `${(it.n / max) * 100}%` }}
                          />
                        </span>
                        <span className="w-6 text-right text-muted-2">{it.n}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* top customer reviews */}
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-2">
                  Top customer reviews
                </p>
                <div className="mt-2 space-y-2">
                  {p.reviews.length === 0 && (
                    <p className="text-sm text-muted">No written reviews yet.</p>
                  )}
                  {p.reviews.map((r) => (
                    <div key={r.id} className="rounded-xl border border-border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{r.author}</span>
                        <Stars n={r.stars} />
                      </div>
                      {r.title && <p className="mt-0.5 text-sm font-medium">{r.title}</p>}
                      <p className="mt-0.5 text-sm text-muted">{r.body}</p>
                      <p className="mt-1 text-xs text-muted-2">{timeAgo(r.date)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* recommendations */}
              {p.topIssues.length > 0 && (
                <div className="mt-5 flex gap-2 rounded-xl border border-[#e4e4d0] bg-cream p-3 text-sm">
                  <Lightbulb className="size-4 shrink-0 text-ink" />
                  <span>
                    <b>Next-release recommendation:</b> address{" "}
                    <span className="capitalize">{p.topIssues[0].tag.replace(/_/g, " ")}</span>, your
                    most reported issue ({Math.round(p.resolveRate * 100)}% self-resolved via Mantis).
                  </span>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <ManualUpload productId={p.id} />
                <Link href={`/product/${p.id}`} className="pill pill-outline text-xs">
                  View page
                </Link>
                {p.manuals === 0 && (
                  <span className="text-xs text-amber-600">No manual yet, assistant limited</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RemoveOwnedButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function remove() {
    setBusy(true);
    await fetch("/api/own", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setBusy(false);
    router.refresh();
  }
  return (
    <button
      onClick={remove}
      disabled={busy}
      title="Remove from my products"
      className="grid size-8 place-items-center rounded-full text-muted-2 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 className="size-4" />
    </button>
  );
}

/* ----------------------------- SHARED ----------------------------- */

function Stat({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  tone?: "default" | "ok" | "warn";
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <span
          className={cn(
            "grid size-11 place-items-center rounded-xl border",
            tone === "warn" ? "border-red-200 bg-red-50 text-red-600" : "border-border bg-surface-2 text-ink"
          )}
        >
          <Icon className="size-5" strokeWidth={1.7} />
        </span>
        <div>
          <p className="text-2xl font-extrabold leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted-2">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Alert({ children, tone }: { children: React.ReactNode; tone: "warn" | "info" }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border p-3 text-sm",
        tone === "warn" ? "border-red-200 bg-red-50 text-red-700" : "border-blue-200 bg-blue-50 text-blue-700"
      )}
    >
      <AlertTriangle className="size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < n ? "size-3.5 fill-yellow-pure text-yellow-pure" : "size-3.5 text-border-strong"}
        />
      ))}
    </span>
  );
}

function HealthRing({ value }: { value: number }) {
  const tone = value >= 75 ? "#16a34a" : value >= 50 ? "#d97706" : "#dc2626";
  return (
    <span
      className="grid size-12 shrink-0 place-items-center rounded-full text-xs font-extrabold"
      style={{ background: `conic-gradient(${tone} ${value * 3.6}deg, var(--surface-2) 0)` }}
    >
      <span className="grid size-9 place-items-center rounded-full bg-white">{value}</span>
    </span>
  );
}
