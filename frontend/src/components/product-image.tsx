"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Wind,
  Camera,
  WashingMachine,
  Bike,
  Refrigerator,
  Tv,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICON: Record<string, LucideIcon> = {
  Vacuums: Wind,
  Cameras: Camera,
  Appliances: WashingMachine,
  Mobility: Bike,
  Refrigeration: Refrigerator,
  Electronics: Tv,
};

const CATEGORY_TINT: Record<string, string> = {
  Vacuums: "from-[#eaf3ff] to-[#dbe9ff]",
  Cameras: "from-[#f3eaff] to-[#e7dcff]",
  Appliances: "from-[#eafff2] to-[#d8f6e6]",
  Mobility: "from-[#fff6e6] to-[#ffeccc]",
  Refrigeration: "from-[#eafaff] to-[#d6f1fb]",
  Electronics: "from-[#fdeaea] to-[#fbdada]",
};

/** Safe product visual: shows a real image if provided, otherwise a tasteful
 *  category gradient + icon tile (never a wrong stock photo). */
export function ProductImage({
  src,
  category,
  name,
  className,
}: {
  src?: string | null;
  category: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const Icon = CATEGORY_ICON[category] ?? Wrench;
  const tint = CATEGORY_TINT[category] ?? "from-surface to-surface-2";

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <div className={cn("relative grid h-full w-full place-items-center bg-gradient-to-br", tint, className)}>
      <Icon className="size-1/3 text-ink/70" strokeWidth={1.25} />
      <span className="absolute bottom-3 left-3 rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-ink backdrop-blur">
        {category}
      </span>
    </div>
  );
}
