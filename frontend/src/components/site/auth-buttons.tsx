"use client";
import Link from "next/link";
import { CLERK_ENABLED } from "@/lib/config";
import { Avatar } from "@/components/ui/avatar";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export function AuthButtons() {
  if (!CLERK_ENABLED) {
    // Guest mode, no Clerk provider in the tree, so render plain links only.
    return (
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="pill pill-outline text-sm">
          Dashboard
        </Link>
        <Link href="/dashboard" aria-label="Profile" className="flex items-center">
          <Avatar name="Guest User" size={34} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <SignedOut>
        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
          <button className="pill pill-outline text-sm">Log in</button>
        </SignInButton>
        <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
          <button className="pill pill-dark text-sm">Sign up</button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Link href="/dashboard" className="pill pill-outline text-sm">
          Dashboard
        </Link>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </div>
  );
}
