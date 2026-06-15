import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { CLERK_ENABLED } from "@/lib/config";

export default function SignUpPage() {
  if (CLERK_ENABLED) {
    return (
      <div className="grid min-h-[80vh] place-items-center pt-20">
        <SignUp forceRedirectUrl="/onboarding" signInUrl="/sign-in" />
      </div>
    );
  }
  return (
    <div className="container-mantis grid min-h-[70vh] place-items-center pt-20 text-center">
      <div className="card-soft max-w-md p-8">
        <h1 className="display text-2xl">Guest mode is on</h1>
        <p className="mt-3 text-muted">
          Add your Clerk keys to enable real sign up. You can explore everything as a guest for now.
        </p>
        <Link href="/dashboard" className="pill pill-dark mt-6">
          Continue as guest
        </Link>
      </div>
    </div>
  );
}
