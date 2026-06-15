"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { initials, avatarGradient } from "@/lib/utils";

export function Avatar({
  name,
  src,
  size = 36,
  className,
}: {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const label = name || "User";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full text-white font-semibold select-none",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: src ? undefined : avatarGradient(label),
      }}
      title={label}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label} className="h-full w-full object-cover" />
      ) : (
        initials(label)
      )}
    </span>
  );
}
