import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { CLERK_ENABLED } from "@/lib/config";

export default function SignInPage() {
  if (CLERK_ENABLED) {
    return (
      <div className="grid min-h-[80vh] place-items-center pt-20">
        <SignIn forceRedirectUrl="/dashboard" signUpUrl="/sign-up" />
      </div>
    );
  }
  return (
    <div className="container-mantis grid min-h-[70vh] place-items-center pt-20 text-center">
      <div className="card-soft max-w-md p-8">
        <h1 className="display text-2xl">Guest mode is on</h1>
        <p className="mt-3 text-muted">
          Add your Clerk keys to <code className="rounded bg-surface-2 px-1">frontend/.env</code> to
          enable real sign in. Meanwhile you can explore everything as a guest.
        </p>
        <Link href="/dashboard" className="pill pill-dark mt-6">
          Continue as guest
        </Link>
      </div>
    </div>
  );
}
